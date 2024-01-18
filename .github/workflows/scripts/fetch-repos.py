import json
import os
import string
from datetime import datetime as dt
from typing import Any

from requests import Response, Session

import requests


print(f"Fetching token from https://api.github.com/...")

os.environ["WIKI_BOT_USERNAME"] = "thatgaypigeon@PigeonBot"

USERNAME: str = os.environ["WIKI_BOT_USERNAME"]
PASSWORD: str = os.environ["WIKI_BOT_PASSWORD"]

session = Session()

response: Response = session.get("https://api.github.com/users/thatgaypigeon/repos")

repos: str = response.json()["query"]["tokens"]["logintoken"]


data = []
for repo in repos:
    updated_at = dt.strptime(repo["updated_at"], "%Y-%m-%dT%H:%M:%SZ")
    pushed_at = dt.strptime(repo["pushed_at"], "%Y-%m-%dT%H:%M:%SZ")

    date = max(updated_at, pushed_at).strftime("%d-%m-%Y")
    lang = repo["language"]

    if repo.get("language", None):
        lang = {repo["language"]: 0}
        print(repo["name"], lang)

    data.append(
        {
            "name": repo["name"],
            "desc": repo.get("description", ""),
            "date": date,
            "link": repo["html_url"],
            "imag": None,
            "icon": ["ph", "ph-github-logo"],
            "type": "gh",
            "tags": [],
            "lang": lang,
            "code": True,
        }
    )

# with open("_static/json/search/github.json", "w", encoding="utf-8") as f:
#     f.write(json.dumps(data, indent=2, ensure_ascii=False))
