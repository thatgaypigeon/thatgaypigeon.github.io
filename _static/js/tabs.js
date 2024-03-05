window.addEventListener("load", function () {
    const tabGroups = Array.from(document.getElementsByClassName("tabs"))

    tabGroups.forEach(function (tabGroup) {
        const tabLabelGroup = tabGroup.querySelector(".tabs-labels")
        if (tabLabelGroup.parentElement.classList.contains("tabs")) {
            const tabLabels = Array.from(tabLabelGroup.children)
            tabLabels.forEach(function (label) {
                label.addEventListener("click", function () {
                    const tabs = Array.from(label.parentElement.parentElement.querySelector(".tabs-content").children)
                    const labels = Array.from(label.parentElement.parentElement.querySelector(".tabs-labels ").children)

                    labels.forEach(function (tab) {
                        tab.removeAttribute("active")
                    })

                    tabs.forEach(function (tab) {
                        tab.removeAttribute("open")
                    })

                    label.setAttribute("active", "")

                    document.getElementById(label.id.replace(/^tab-/g, "")).setAttribute("open", "")
                })
            })
        }
    })
})
