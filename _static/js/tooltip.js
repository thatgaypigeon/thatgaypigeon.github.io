window.addEventListener("load", () => {
    const startTime = performance.now()

    const tooltips = document.querySelectorAll("[tooltip]")

    const TOOLTIP_MAX_WIDTH =
        parseFloat(getComputedStyle(root).getPropertyValue("--tooltip-max-width-numeric")) *
        fontSizeToNumber(getFontSize())

    const TOOLTIP_OFFSET_FROM_EDGE = parseFloat(getComputedStyle(root).getPropertyValue("--tooltip-gap-from-edge")) || 8 // px

    const TOOLTIP_AUTO_DELAY_DEFAULT =
        parseFloat(getComputedStyle(root).getPropertyValue("--tooltip-auto-delay")) || 1000 // ms
    const TOOLTIP_AUTO_DURATION_DEFAULT =
        parseFloat(getComputedStyle(root).getPropertyValue("--tooltip-auto-duration")) || 5000 // ms

    const LENIENCY = 2 // px - extra for "padding" (more forgiving hitbox)

    var closableTooltips = []

    class tooltipData {
        constructor(tooltip) {
            this.self = tooltip
            this.style = window.getComputedStyle(this.self, "::before")
            this.rect = this.self.getBoundingClientRect()
            this.centreX = this.rect.left + this.rect.width / 2
            this.centreY = this.rect.bottom + this.rect.height / 2
            this.width = Number(this.style.width.substring(0, this.style.width.length - 2))
            this.height = Number(this.style.height.substring(0, this.style.height.length - 2))
            this.left = this.centreX - this.width / 2
            this.right = this.centreX + this.width / 2
            this.top = this.centreY - this.height / 2
            this.bottom = this.centreY + this.height / 2
            this.offsetY = unitsToPixels(this.style.getPropertyValue("--tooltip-offset") || "0")
            this.correctionX = unitsToPixels(this.style.getPropertyValue("--posX") || "0")
        }
    }

    function positionTooltip(tooltip) {
        const tooltipInfo = new tooltipData(tooltip)
        if (tooltipInfo.right > window.innerWidth - TOOLTIP_OFFSET_FROM_EDGE) {
            const correctionX = -Math.abs(window.innerWidth - tooltipInfo.right - TOOLTIP_OFFSET_FROM_EDGE)
            tooltip.style.setProperty("--posX", correctionX.toString() + "px")
        } else if (tooltipInfo.left < TOOLTIP_OFFSET_FROM_EDGE) {
            const correctionX = Math.abs(tooltipInfo.left + TOOLTIP_OFFSET_FROM_EDGE)
            tooltip.style.setProperty("--posX", correctionX.toString() + "px")
        }
    }

    function getTooltipTypes(tooltip) {
        return tooltip.hasAttribute("tooltip-type") ? tooltip.getAttribute("tooltip-type").split(" ") : []
    }

    function addTooltipType(tooltip, type) {
        const tooltipTypes = getTooltipTypes(tooltip)
        if (!tooltipTypes.includes(type)) {
            tooltip.setAttribute("tooltip-type", [...tooltipTypes, type].join(" "))
        }
    }

    function removeTooltipType(tooltip, type) {
        const tooltipTypes = getTooltipTypes(tooltip)
        if (tooltipTypes.includes(type)) {
            tooltipTypes.includes(type) && tooltipTypes.splice(tooltipTypes.indexOf(type), 1)
            tooltip.setAttribute("tooltip-type", tooltipTypes.join(" "))
        }
    }

    tooltips.forEach((tooltip) => {
        const tooltipTypes = getTooltipTypes(tooltip)

        // Shared tooltip messages
        if (
            tooltip.parentElement.classList.contains("no-cookies-warning") &&
            (tooltip.getAttribute("tooltip") || "") === ""
        ) {
            tooltip.setAttribute(
                "tooltip",
                "You have disabled cookies. This means your preferences will not be saved if you re-open the page."
            )
        }

        // Detect closable tooltips
        if (tooltipTypes.includes("auto") || tooltipTypes.includes("closable")) {
            closableTooltips.push(tooltip)
        }

        // Detect "big" tooltips
        if (new tooltipData(tooltip).width >= TOOLTIP_MAX_WIDTH.toPrecision(1)) {
            addTooltipType(tooltip, "big")
        } else {
            removeTooltipType(tooltip, "big")
        }

        // Correct positions
        if (tooltipTypes.includes("auto")) {
            positionTooltip(tooltip)
        } else {
            tooltip.addEventListener("mouseover", () => {
                positionTooltip(tooltip)
            })
        }
    })

    const intervalId = setInterval(() => {
        closableTooltips.forEach((tooltip) => {
            const tooltipTypes = getTooltipTypes(tooltip)

            if (!tooltipTypes.includes("closed")) {
                const time = performance.now() - startTime
                const animationTimes = getComputedStyle(tooltip, "::before").animationDelay.split(",")
                const start = stringToMilliseconds(animationTimes[0]) || TOOLTIP_AUTO_DELAY_DEFAULT
                const end = stringToMilliseconds(animationTimes[1]) || start + TOOLTIP_AUTO_DURATION_DEFAULT

                if (time > end) {
                    addTooltipType(tooltip, "closed")
                    clearInterval(intervalId)
                }
            }
        })
    }, 100)

    document.addEventListener("click", (event) => {
        closableTooltips.forEach((tooltip) => {
            const tooltipInfo = new tooltipData(tooltip)
            const tooltipTypes = getTooltipTypes(tooltip)

            if (!tooltipTypes.includes("closed")) {
                const mouseX = event.clientX
                const mouseY = event.clientY

                let top

                // FINALLY THIS IS RIGHT
                if (tooltipTypes.includes("bottom")) {
                    top = tooltipInfo.rect.bottom + tooltipInfo.offsetY
                } else {
                    top = tooltipInfo.rect.top - tooltipInfo.height - tooltipInfo.offsetY
                }

                top -= LENIENCY

                const bottom = top + tooltipInfo.height + 2 * LENIENCY
                const left = tooltipInfo.left + tooltipInfo.correctionX - LENIENCY
                const right = left + tooltipInfo.width + 2 * LENIENCY

                const height = bottom - top

                // JUST THE ICON
                const closeButtonLeft = right - height

                // Bounds check
                if (closeButtonLeft < mouseX && mouseX < right && top < mouseY && mouseY < bottom) {
                    addTooltipType(tooltip, "closed")
                }
            }
        })
    })
})
