window.addEventListener("load", () => {
    document.querySelectorAll(".menu-button").forEach((button) => {
        button.addEventListener("click", () => {
            button.parentElement.toggleAttribute("open")
        })
    })

    document.addEventListener("click", (event) => {
        document.querySelectorAll(".menu").forEach((menu) => {
            if (
                (menu !== event.target && !menu.contains(event.target)) ||
                (menu === event.target && menu.id === "search-menu")
            ) {
                menu.removeAttribute("open")
            } else {
                // If menu is already open (like #search on desktop)
                menu.setAttribute("open", "")
            }
        })
    })
})
