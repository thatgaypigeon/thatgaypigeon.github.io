const root = document.documentElement

const TOOLTIP_TYPES = ["info", "warning", "error", "issue", "good"]

// Pass
const pass = null

// RNG
/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

// Round
/**
 * @param {number} num
 * @param {number} precision
 * @returns {number}
 */
function round(num, precision) {
    var multiplier = Math.pow(10, precision || 0)
    return Math.round(num * multiplier) / multiplier
}

// Convert number to ordinal
/**
 * @param {number} num
 * @returns {string}
 */
function toOrdinal(num) {
    return num.toString() + (["st", "nd", "rd"][((((num + 90) % 100) - 10) % 10) - 1] || "th")
}

// Escape unsafe HTML
/**
 * @param {string} string
 * @returns {string}
 */
function escapeHtml(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

// Disable input
/**
 * @param {HTMLElement} element
 * @param {string | null} tooltip
 * @param {string | null} type
 */
function disable(element, tooltip = "🚫 This action is not allowed", type = "error") {
    element.setAttribute("disabled", "")
    element.setAttribute("tooltip", tooltip)
    element.setAttribute(
        "tooltip-type",
        element.getAttribute("tooltip-type").includes(type)
            ? element.getAttribute("tooltip-type").replace(type, "-").replace("  ", " ")
            : str + " " + type
    )
}

// Enable input
/**
 * @param {HTMLElement} element
 * @param {string | null} tooltip
 * @param {string | null} type
 */
function enable(element, tooltip = null, type = null) {
    element.removeAttribute("disabled")
    tooltip ? element.setAttribute("tooltip", tooltip) : element.removeAttribute("tooltip")
    type
        ? element.setAttribute(
              "tooltip-type",
              element.getAttribute("tooltip-type").includes(type)
                  ? element.getAttribute("tooltip-type").replace(type, "-").replace("  ", " ")
                  : str + " " + type
          )
        : element.removeAttribute("tooltip-type")
}

// Convert string to milliseconds
/**
 * @param {string} str
 * @returns {number | null}
 */
function stringToMilliseconds(str = "") {
    str = str.toString()

    const numberPattern = /\d+(\.\d+)?/g
    const letterPattern = /[a-zA-Z]+/g

    if (str.match(numberPattern) && str.match(letterPattern)) {
        const numbers = parseFloat(str.match(numberPattern)[0])
        const letters = str.match(letterPattern)[0]

        switch (letters) {
            case "ms":
                return numbers
            case "s":
                return numbers * 1000
            default:
                return null
        }
    }
}

/**
 * @param {*} value
 * @param {HTMLElement} element
 * @returns number
 */
function unitsToPixels(value, element = document.documentElement) {
    if (!value.match(/[\d.]+([a-z]+)/i)) return null

    const unit = value.match(/[\d.]+([a-z]+)/i)[1]

    const number = parseFloat(value)

    switch (unit) {
        case "px":
            return number
        case "em":
            return number * parseFloat(getComputedStyle(element).fontSize)
        case "rem":
            return number * parseFloat(getComputedStyle(document.documentElement).fontSize)
        default:
            return null
    }
}

// Detect broken images
/**
 * @param {Array} images
 */
function detectBrokenImages(images) {
    images.forEach((image) => {
        if (image.classList.contains("none")) {
            return
        }

        const imgObj = new Image()
        imgObj.src = image.src

        imgObj.addEventListener("load", () => {
            clearTimeout(timeout)
            image.classList.remove("loading")
            image.classList.remove("broken")
        })

        imgObj.addEventListener("error", () => {
            clearTimeout(timeout)
            image.classList.remove("loading")
            image.classList.add("broken")
            image.setAttribute("alt", "")
        })

        const timeout = setTimeout(function () {
            image.classList.add("broken")
            image.classList.remove("loading")
            image.removeAttribute("src")
        }, 5000)
    })
}

// Format keyboard shortcuts
/**
 * @param {Array} images
 */
function formatKeyboardShortcuts(kbd) {
    const keyboardKeys = {
        Win: {
            Windows: { name: "Windows", short: "Win", symbol: "⊞" },
            macOS: { name: "Command", short: "Cmd", symbol: "⌘" },
            Linux: { name: "Super", symbol: "❖" },
            _: { name: "Windows", short: "Win", symbol: "⊞" },
        },
        Alt: {
            Windows: { name: "Alt" },
            macOS: { name: "Option", short: "Opt", symbol: "⌥" },
            _: { name: "Alt" },
        },
        Shift: {
            _: { name: "Shift", symbol: "⇧" },
        },
        Backspace: {
            _: { name: "Backspace", symbol: "←" },
        },
        Tab: {
            _: { name: "Tab", symbol: "⇥", after: true },
        },
        Enter: {
            _: { name: "Enter", symbol: "↵" },
        },
        Esc: {
            _: { name: "Escape", short: "Esc" },
        },
    }

    const os = root.getAttribute("os") || getDeviceInfo().os || "_"

    kbd.forEach((key) => {
        const value = key.textContent

        if (keyboardKeys[value]) {
            let osKey
            if (keyboardKeys[value][os]) {
                osKey = keyboardKeys[value][os]
            } else {
                osKey = keyboardKeys[value]._
            }

            if (osKey.name) {
                key.setAttribute("key", osKey.name)
                key.innerHTML = osKey.name
            }

            if (osKey.short) {
                key.innerHTML = osKey.short
            }

            if (osKey.symbol) {
                key.setAttribute("symbol", osKey.symbol)
            }

            if (osKey.after) {
                key.setAttribute("after", "")
            }
        } else {
            key.setAttribute("key", value)
        }
    })
}

// Detect mobile devices
/**
 * @returns {boolean}
 */
function isMobile() {
    let check = false
    function _isMobile(a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        ) {
            check = true
        }
    }
    _isMobile(navigator.userAgent || navigator.vendor || window.opera)
    return check
}

// Get device info
/**
 * @returns {Object}
 */
function getDeviceInfo() {
    let deviceInfo = {}

    const av = window.navigator.appVersion
    const ua = window.navigator.userAgent

    // Detect OS
    let OSName = "Unknown"
    if (av.match(/Win/)) OSName = "Windows"
    if (av.match(/Macintosh/)) OSName = "macOS"
    if (av.match(/iPhone/)) OSName = "iPhone"
    if (av.match(/Android/)) OSName = "Android"
    if (av.match(/iPad/)) OSName = "iPad"
    if (av.match(/X11/)) OSName = "UNIX"
    if (av.match(/Linux/)) OSName = "Linux"
    deviceInfo.os = OSName

    // Detect Browser
    let browserName = "Unknown"
    if (ua.match(/Chrome\//) && !ua.match(/Chromium\//) && !ua.match(/Edg.*\//)) browserName = "Chrome"
    if (ua.match(/Chromium\//)) browserName = "Chromium"
    if (ua.match(/Edg.*\//)) browserName = "Edge"
    if (ua.match(/Firefox\//) && !ua.match(/Seamonkey\//)) browserName = "Firefox"
    if (ua.match(/OPR\//) || ua.match(/Opera\//)) browserName = "Opera"
    if (ua.match(/Safari\//) && !ua.match(/Chrome\//) && !ua.match(/Chromium\//)) browserName = "Safari"
    if (ua.match(/Seamonkey\//)) browserName = "Seamonkey"
    if (ua.match(/MSIE\//) || !!document.documentMode == true) browserName = "IE"
    deviceInfo.browser = browserName

    // Detect Rendering Engine
    let engineName = "Unknown"
    if (ua.match(/Chrome\//)) engineName = "Blink"
    if (ua.match(/Edge\//)) engineName = "EdgeHTML"
    if (ua.match(/Gecko\//)) engineName = "Gecko"
    if (ua.match(/Opera\//)) engineName = "Presto"
    if (ua.match(/AppleWebKit\//)) engineName = "WebKit"
    deviceInfo.engine = engineName

    deviceInfo.isMobile = isMobile()

    return deviceInfo
}

window.addEventListener("DOMContentLoaded", () => {
    detectBrokenImages([...document.getElementsByTagName("img")])
    formatKeyboardShortcuts([...document.getElementsByTagName("kbd")])

    // Mutation observer for detecting JS changes to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                detectBrokenImages(
                    Array.from(mutation.addedNodes)
                        .filter((node) => node instanceof Element)
                        .flatMap((node) => Array.from(node.querySelectorAll("img")))
                )
                formatKeyboardShortcuts(
                    Array.from(mutation.addedNodes)
                        .filter((node) => node instanceof Element)
                        .flatMap((node) => Array.from(node.querySelectorAll("kbd")))
                )
            }
        })
    })
    const config = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true,
    }
    observer.observe(document.body, config)
})

window.addEventListener("load", () => {
    // Mobile debugging
    // const originalConsoleError = console.error
    // const originalConsoleLog = console.log

    // console.error = function (message) {
    //     originalConsoleError.apply(console, arguments)
    //     appendMessageToDom(message)
    // }

    // console.log = function (message) {
    //     originalConsoleLog.apply(console, arguments)
    //     appendMessageToDom(message)
    // }

    // function appendMessageToDom(message) {
    //     const p = document.createElement("p")
    //     p.textContent = message
    //     document.querySelector("main").prepend(p)
    // }

    // Device info
    const deviceInfo = getDeviceInfo()

    if (deviceInfo.isMobile) {
        root.setAttribute("mobile", "")
    }

    root.setAttribute("os", deviceInfo.os)
    root.setAttribute("browser", deviceInfo.browser)
    root.setAttribute("engine", deviceInfo.engine)

    /* → Scale menu buttons
    // --------------------- */
    function scaleButtons() {
        const elements = document.querySelectorAll("header > button")
        const screenWidth = window.innerWidth
        const minScale = 0.75
        const maxScale = 1.0
        const minGap = -0.5
        const maxGap = 0.375
        const maxScreenWidth = 1080

        if (screenWidth < maxScreenWidth) {
            const scale = minScale + (maxScale - minScale) * (screenWidth / maxScreenWidth)
            const gap = minGap + (maxGap - minGap) * (screenWidth / maxScreenWidth)

            elements.forEach((element) => {
                element.style.scale = `${scale}`
                element.style.setProperty("--gap", gap.toString() + "rem")
            })
        }
    }

    scaleButtons()

    window.addEventListener("resize", scaleButtons)

    // Set language information
    const langElements = document.querySelectorAll(".lang")
    langElements.forEach((el) => {
        el.innerHTML = root.getAttribute("lang")
    })
})

window.addEventListener("scroll", () => {
    var scrollPosition = root.scrollTop || document.body.scrollTop
    if (scrollPosition === 0) {
        root.setAttribute("at-top", "")
    } else {
        root.removeAttribute("at-top")
    }
})

document.write('<script src="/_static/js/settings.js"></script>')

document.write('<script src="/_static/js/caret.js" defer></script>')
document.write('<script src="/_static/js/clicks.js" defer></script>')
document.write('<script src="/_static/js/menu.js" defer></script>')
document.write('<script src="/_static/js/tooltip.js" defer></script>')

document.write('<script type="module" src="/_static/js/search.js"></script>')
