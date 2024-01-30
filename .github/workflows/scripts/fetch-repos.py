import json
import os
from datetime import datetime as dt

from requests import Response, Session

REPO_IMAGES: dict[str, str] = {
    "thatgaypigeon.github.io": "/_static/img/banner/banner-square.png"
}

TOKEN: str = os.environ["GH_PAT_TOKEN"]
HEADERS: dict[str, str] = {"Authorization": "token " + TOKEN}

session = Session()

response: Response = session.get(
    "https://api.github.com/users/thatgaypigeon/repos",
    headers=HEADERS,
)

repos: str = response.json()

data: list = []
for repo in repos:
    updated_at: dt = dt.strptime(repo["updated_at"], "%Y-%m-%dT%H:%M:%SZ")
    pushed_at: dt = dt.strptime(repo["pushed_at"], "%Y-%m-%dT%H:%M:%SZ")

    date: str = max(updated_at, pushed_at).strftime("%d-%m-%Y")
    code_lang: str = repo["language"]

    repo_data = {
        "name": repo["name"],
        "desc": repo.get("description", ""),
        "date": date,
        "link": repo["html_url"],
        "icon": ["ph", "ph-github-logo"],
        "type": "gh",
        "lang": "en-GB",
        "lcns": repo["license"],
        "arch": repo["archived"],
        "star": repo["stargazers_count"],
    }

    if repo.get("name", None) in REPO_IMAGES.keys():
        repo_data["imag"] = REPO_IMAGES[repo.get("name")]

    if repo.get("language", None):
        repo_data["code"] = session.get(
            repo["languages_url"],
            headers=HEADERS,
        ).json()

    data.append(repo_data)

with open("/_static/searchindex/github.json", "w", encoding="utf-8") as f:
    f.write(json.dumps(data, indent=2, ensure_ascii=False))
