console.log("SCRIPT RUNNING")

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM LOADED")

    document.body.style.opacity = "0"
    document.body.style.visibility = "hidden"
    document.body.style.transition = "all 150ms ease-in"
    document.body.style.transitionDelay = "50ms"

    var script = document.createElement("script")
    script.src = "/_static/js/translate.js"

    document.head.appendChild(script)

    script.onload = function () {
        console.log(`SCRIPT LOADED`)
    }
})

window.addEventListener("load", function () {
    console.log("WINDOW LOADED")
    document.body.style.visibility = "visible"
    document.body.style.opacity = "1"
})
