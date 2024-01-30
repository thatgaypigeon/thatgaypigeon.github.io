import json
import os
import string
from datetime import datetime as dt
from typing import Any, LiteralString

from requests import Response, Session

NO_INCLUDE_CATEGORIES: set[str] = {"Redirect", "Disambiguation"}


def strip_unprintable(s) -> LiteralString:
    printable: LiteralString = (
        string.ascii_letters + string.digits + string.punctuation + " "
    )
    return "".join(c for c in s if c in printable)


def get_token(session: Session) -> str:
    print(f"Fetching token from {WIKI_URL}...")

    token_params: dict[str, str] = {
        "action": "query",
        "format": "json",
        "meta": "tokens",
        "type": "login",
    }

    token_response: Response = session.get(WIKI_API_URL, params=token_params)

    token: str = token_response.json()["query"]["tokens"]["logintoken"]

    if not token:
        # TODO: should also include error code + msg
        raise Exception("❌ ERROR FETCHING TOKEN")

    print("✅ TOKEN RETRIEVED")
    return token


def login(session: Session, token: str) -> None:
    print("Logging in...")

    login_params: dict[str, str] = {
        "action": "login",
        "format": "json",
        "lgname": USERNAME,
        "lgpassword": PASSWORD,
        "lgtoken": token,
    }

    login_response: Response = session.post(WIKI_API_URL, data=login_params)

    if login_response.json()["login"]["result"] != "Success":
        # TODO: should also include error code + msg
        raise Exception("❌ ERROR LOGGING IN")

    print("✅ LOGIN SUCCESSFUL")


def get_site_info(session: Session) -> dict[str, Any]:
    print("Fetching site data...")

    site_info_params: dict[str, str] = {
        "action": "query",
        "format": "json",
        "meta": "siteinfo",
        "list": "recentchanges",
    }

    site_info_response: Response = session.get(WIKI_API_URL, params=site_info_params)

    data: Any = site_info_response.json()["query"]

    if not data:
        # TODO: should also include error code + msg
        raise Exception("❌ ERROR FETCHING SITE DATA")

    print("✅ DATA RETRIEVED")

    raw_timestamp: str = data["recentchanges"][0]["timestamp"]
    datetime_timestamp: dt = dt.strptime(raw_timestamp, ISO_DATE_FORMAT)
    timestamp: str = datetime_timestamp.strftime(DATE_FORMAT)

    return {
        "name": data["general"]["sitename"],
        "desc": "🌐 My personal wiki, home to information about my niche interests, passions, and creative projects",
        "date": timestamp,
        "link": data["general"]["base"],
        # "imag": "https://upload.wikimedia.org/wikipedia/commons/c/c6/MediaWiki-2020-small-icon.svg",
        "imag": data["general"]["logo"],
        # "icon": "",
        "type": "mw",
        "tags": ["pj"],
        "lang": "en",
    }


def get_pages(session: Session) -> list[dict[str, Any]]:
    print("Retrieving page data...")

    pages_params: dict[str, str] = {
        "action": "query",
        "format": "json",
        "generator": "allpages",
        "gaplimit": "max",  # retrieve ALL pages
        "gapnamespace": "0",  # ensure only (main) namespace; though this is already the default
        "prop": "extracts|info|pageimages|revisions|categories",  # extract short description, date edited, images, and revisions (for date)
        "exintro": "true",  # extract only the first section (short description)
        "explaintext": "true",  # do not parse text extract as HTML
        "piprop": "original",  # extract only thumbnail image
    }

    pages_response: Response = session.get(WIKI_API_URL, params=pages_params)

    data: dict = pages_response.json().get("query")

    if not data:
        # TODO: should also include error code + msg
        raise Exception("❌ ERROR FETCHING PAGE DATA")

    print("✅ PAGES RETRIEVED")
    print("Parsing pages...")

    pages: dict = data.get("pages")

    def format_date(date: str) -> str | None:
        return date and dt.strptime(date, ISO_DATE_FORMAT).strftime(DATE_FORMAT) or None

    def get_latest_revision(revisions: list) -> str | None:
        if not revisions:
            return None
        return next(rev["timestamp"] for rev in reversed(revisions) if "revid" in rev)

    def format_image_src(image: str) -> str | None:
        return image and image.replace(STATIC_WIKI_IMG_URL, WIKI_IMG_AUTH_URL) or None

    try:
        page_data: list[dict[str, Any]] = [
            {
                "name": "Lowercase title"
                in {item["title"] for item in page.get("categories", {})}
                and page.get("title").lower()
                or page.get("title"),
                "desc": page.get("extract", "").split("==")[0].strip(),
                "date": format_date(get_latest_revision(page.get("revisions", [])))
                or page.get("touched"),
                "link": WIKI_WIKI_URL + "/" + page["title"].replace(" ", "_"),
                "imag": format_image_src(page.get("original", {}).get("source", None)),
                "icon": None,
                "type": "wiki",
                "tags": ["wiki"],
                "lang": page.get("pagelanguage", "en"),
            }
            for page in pages.values()
            if page.get("ns") == 0
            and page.get("contentmodel") == "wikitext"
            and "redirect" not in page
            and not bool(
                NO_INCLUDE_CATEGORIES
                & {item["title"] for item in page.get("categories", {})}
            )
        ]

        print("✅ PAGES PARSED SUCCESSFULLY")

        return page_data

    except Exception:
        raise Exception("❌ ERROR PARSING PAGE DATA")


with open("_static/config.json", "r") as f:
    shared_json: dict = json.load(f)

    ISO_DATE_FORMAT: str = shared_json.get("iso_date_format")
    DATE_FORMAT: str = shared_json.get("date_format")

    WIKI_URL: str = shared_json.get("wiki_url")
    WIKI_WIKI_URL: str = WIKI_URL + shared_json.get("wiki_wiki_url")
    WIKI_API_URL: str = WIKI_URL + shared_json.get("wiki_api_url")
    WIKI_IMG_AUTH_URL: str = WIKI_URL + shared_json.get("wiki_img_auth_url")
    WIKI_DB_NAME: str = shared_json.get("wiki_db_name")
    STATIC_WIKI_IMG_URL: str = (
        shared_json.get("static_wiki_img_url") + "/" + WIKI_DB_NAME
    )

USERNAME: str = os.environ["WIKI_BOT_USERNAME"]
PASSWORD: str = os.environ["WIKI_BOT_PASSWORD"]

session = Session()

token: str = get_token(session)
login(session, token)


with open("_static/searchindex/other.json", "r", encoding="utf-8") as f:
    site_info: list[dict[str, Any]] = get_site_info(session)

    data = json.loads(f.read().encode("utf-16", "surrogatepass").decode("utf-16"))

    print(json.dumps(data, indent=2, ensure_ascii=False))

    f.seek(f.tell())

    found = False
    for index, value in enumerate(data):
        if value["name"] == site_info["name"]:
            data[index] = site_info
            found = True
            break

    if not found:
        data.append(site_info)

    print(json.dumps(data, indent=2, ensure_ascii=False))

with open("_static/searchindex/other.json", "w", encoding="utf-8") as f:
    print("Writing site data...")
    f.write(json.dumps(data, indent=2, ensure_ascii=False))


with open("_static/searchindex/wiki.json", "w", encoding="utf-8") as f:
    pages: list[dict[str, Any]] = get_pages(session)
    print("Writing page data...")
    f.write(json.dumps(pages, indent=2, ensure_ascii=False))


print("✅ DONE")
