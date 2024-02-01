window.addEventListener("DOMContentLoaded", function () {
    fetch("/_static/config.json")
        .then((response) => response.json())
        .then((data) => {
            WIKI_URL = data.wiki_url
        })

    fetch(window.location.href).then((response) => {
        if (response.status === 404) {
            if (window.location.pathname.startsWith("/wiki")) {
                window.location.replace(WIKI_URL + window.location.pathname)
            }
        }
    })
})
