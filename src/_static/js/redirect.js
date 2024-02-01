window.addEventListener("DOMContentLoaded", function () {
    fetch(window.location.href).then((response) => {
        if (response.status === 404) {
            if (window.location.pathname.startsWith("/wiki")) {
                window.location.replace("https://pigeon.miraheze.org" + window.location.pathname)
            }
        }
    })
})
