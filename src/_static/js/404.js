window.addEventListener("DOMContentLoaded", function () {
    fetch("/_static/config.json")
        .then((response) => response.json())
        .then((data) => {
            WIKI_URL = data.wiki_url

            if (window.location.pathname.startsWith("/wiki")) {
                window.location.replace(WIKI_URL + window.location.pathname)
            }
        })
})
