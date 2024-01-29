// DO THESE BEFORE DOM LOADS; PREVENTS FLASHING

// ----------------------------------------------------------------------------------------- //
// ---------------------------------------- Cookies ---------------------------------------- //
// ----------------------------------------------------------------------------------------- //

/* → Cookies
// --------------------- */
const COOKIES_VAR = "cookies"
const COOKIES_ATTR = "cookies"
const COOKIES_ON = "enabled"
const COOKIES_OFF = "disabled"
const COOKIES_DEFAULT = COOKIES_ON

const COOKIES_BUTTON = "cookies-button"
const COOKIES_INPUT = "cookies-input"

/**
 * @returns {boolean}
 */
function getCookies() {
    return (localStorage.getItem(COOKIES_VAR) || COOKIES_DEFAULT) === COOKIES_ON
}

/**
 * @param {boolean} cookies
 * @returns {string}
 */
function cookiesToString(cookies) {
    return cookies ? COOKIES_ON : COOKIES_OFF
}

/**
 * @param {Function} func
 * @param  {...any} args
 */
function ifCookies(func, ...args) {
    if (getCookies()) {
        func(...args)
    }
}

// Set cookies state
const cookies = getCookies()
const FIRST_VISIT = localStorage.length === 0
root.setAttribute(COOKIES_ATTR, cookiesToString(cookies))
localStorage.setItem(COOKIES_VAR, cookies)

// ----------------------------------------------------------------------------------------- //
// ------------------------------------- Accessibility ------------------------------------- //
// ----------------------------------------------------------------------------------------- //

/* → Text size
// --------------------- */
const FONT_SIZE_VAR = "fontSize"
const FONT_SIZE_MIN = 70
const FONT_SIZE_MAX = 150
const FONT_SIZE_BASE = 16
const FONT_SIZE_STEP = 10
const FONT_SIZE_DEFAULT = 100
const FONT_SIZE_DYSLEXIC_MODIFIER = 0.9
const FONT_SIZE_UNITS = "px"

const FONT_SIZE_INCREASE_BUTTON = "increase-font-size"
const FONT_SIZE_DECREASE_BUTTON = "decrease-font-size"
const FONT_SIZE_OUTPUT = "font-size-output"

/**
 * @returns {number}
 */
function getFontSize() {
    let fontSize = Number(localStorage.getItem(FONT_SIZE_VAR)) || FONT_SIZE_DEFAULT

    if (fontSize > FONT_SIZE_MAX) {
        fontSize = FONT_SIZE_MAX
    } else if (fontSize < FONT_SIZE_MIN) {
        fontSize = FONT_SIZE_MIN
    } else if (fontSize % 10 !== 0) {
        fontSize = Math.round(fontSize)
    }

    return fontSize
}

/**
 * @param {number} percent
 * @returns {string}
 */
function fontSizeToNumber(percent) {
    return FONT_SIZE_BASE * (percent / 100)
}

/**
 * @param {number} percent
 * @returns {string}
 */
function fontSizeToString(percent) {
    return fontSizeToNumber(percent).toString() + FONT_SIZE_UNITS
}

// Set font size
const fontSize = getFontSize()
root.style.fontSize = fontSizeToString(fontSize)

/* → Font family
// --------------------- */
const FONT_VAR = "font"
const FONT_ATTR = "font"
const FONT_ID = "font-css"
const FONT_PATH = "/_static/css/font/"
const FONT_DEFAULT = "default"
const FONT_ALTERNATE = "atkinson-hyperlegible"
const FONT_CLEAN = "noto-sans"
const FONT_DYSLEXIC = "open-dyslexic"
const FONT_VALUES = [FONT_DEFAULT, FONT_ALTERNATE, FONT_CLEAN, FONT_DYSLEXIC]

const FONT_BUTTONS_NAME = "font"
const FONT_DEFAULT_INPUT = "font-" + FONT_DEFAULT
const FONT_ALTERNATE_INPUT = "font-" + FONT_ALTERNATE
const FONT_CLEAN_INPUT = "font-" + FONT_CLEAN
const FONT_DYSLEXIC_INPUT = "font-" + FONT_DYSLEXIC

/**
 * @returns string
 */
function getFont() {
    const font = localStorage.getItem(FONT_VAR)
    return FONT_VALUES.includes(font) ? font : FONT_DEFAULT
}

// Set font family
const font = getFont()
const FONT_CSS = document.getElementById(FONT_ID)
FONT_CSS.setAttribute("href", FONT_PATH + font + ".css")
if (font === "open-dyslexic") {
    root.style.fontSize = fontSizeToString(getFontSize() * FONT_SIZE_DYSLEXIC_MODIFIER)
}

/* → Reduce motion
// --------------------- */
const REDUCE_MOTION_VAR = "reduceMotion"
const REDUCE_MOTION_ATTR = "reduce-motion"
const REDUCE_MOTION_ON = "true"
const REDUCE_MOTION_OFF = "false"
const REDUCE_MOTION_DEFAULT = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? REDUCE_MOTION_ON
    : REDUCE_MOTION_OFF

const REDUCE_MOTION_INPUT = "reduce-motion"

/**
 * @returns boolean
 */
function getMotionState() {
    return (localStorage.getItem(REDUCE_MOTION_VAR) || REDUCE_MOTION_DEFAULT) === REDUCE_MOTION_ON
}

/**
 * @param {boolean} state
 * @returns string
 */
function motionStateToString(state) {
    return state ? REDUCE_MOTION_ON : REDUCE_MOTION_OFF
}

// Set motion state
const motionState = getMotionState()
root.setAttribute(REDUCE_MOTION_ATTR, motionStateToString(motionState))

// ----------------------------------------------------------------------------------------- //
// -------------------------------------- Preferences -------------------------------------- //
// ----------------------------------------------------------------------------------------- //

/* → Sound
// --------------------- */
const SOUND_VAR = "sound"
const SOUND_ATTR = "sound"
const SOUND_ON = "on"
const SOUND_OFF = "off"
const SOUND_DEFAULT = SOUND_ON

const SOUND_BUTTON = "sound-button"
const SOUND_INPUT = "sound-input"

/**
 * @returns boolean
 */
function getSoundState() {
    return (localStorage.getItem(SOUND_VAR) || SOUND_DEFAULT) === SOUND_ON
}

/**
 * @param {boolean} state
 * @returns string
 */
function soundStateToString(state) {
    return state ? SOUND_ON : SOUND_OFF
}

// Set sound state
const soundState = getSoundState()
root.setAttribute(SOUND_ATTR, soundStateToString(soundState))

// ----------------------------------------------------------------------------------------- //
// -------------------------------------- Appearance --------------------------------------- //
// ----------------------------------------------------------------------------------------- //

/* → Brightness
// --------------------- */
const BRIGHTNESS_VAR = "brightness"
const BRIGHTNESS_ATTR = "--brightness"
const BRIGHTNESS_MIN = 0.5
const BRIGHTNESS_MAX = 1.5
const BRIGHTNESS_DEFAULT = 1
const BRIGHTNESS_STEP = 0.01

const BRIGHTNESS_INPUT = "brightness-input"
const BRIGHTNESS_OUTPUT = "brightness-output"
const BRIGHTNESS_RESET_BUTTON = "brightness-reset"

/**
 * @returns number
 */
function getBrightnessValue() {
    const brightnessValue = localStorage.getItem(BRIGHTNESS_VAR)
    return brightnessValue
        ? BRIGHTNESS_MAX >= brightnessValue >= BRIGHTNESS_MIN
            ? brightnessValue
            : BRIGHTNESS_DEFAULT
        : BRIGHTNESS_DEFAULT
}

// Set brightness
const brightnessValue = getBrightnessValue()
root.style.setProperty(BRIGHTNESS_ATTR, brightnessValue)

// /* → Colour
// // --------------------- */
// const THEME_COLOUR_VAR = "themeColour";
// const THEME_COLOUR_ATTR = "--h";
// const THEME_COLOUR_MIN = 0;
// const THEME_COLOUR_MAX = 360;
// const THEME_COLOUR_DEFAULT = 227;

// /**
//  * @returns number
//  */
// function getThemeColour() {
//     const themeColour = localStorage.getItem(THEME_COLOUR_VAR);
//     return themeColour ? THEME_COLOUR_MAX > themeColour >= THEME_COLOUR_MIN ? themeColour : THEME_COLOUR_DEFAULT : THEME_COLOUR_DEFAULT;
// }

// // Set theme colour
// const themeColour = getThemeColour();
// root.style.setProperty(THEME_COLOUR_ATTR, themeColour);

/* → Contrast
// --------------------- */
const CONTRAST_VAR = "contrast"
const CONTRAST_ATTR = "--contrast"
const CONTRAST_MIN = 0.5
const CONTRAST_MAX = 1.5
const CONTRAST_DEFAULT = 1
const CONTRAST_STEP = 0.01

const CONTRAST_INPUT = "contrast-input"
const CONTRAST_OUTPUT = "contrast-output"
const CONTRAST_RESET_BUTTON = "contrast-reset"

/**
 * @returns number
 */
function getContrastValue() {
    const contrastValue = localStorage.getItem(CONTRAST_VAR)
    return contrastValue
        ? CONTRAST_MAX >= contrastValue >= CONTRAST_MIN
            ? contrastValue
            : CONTRAST_DEFAULT
        : CONTRAST_DEFAULT
}

// Set contrast
const contrastValue = getContrastValue()
root.style.setProperty(CONTRAST_ATTR, contrastValue)

// ----------------------------------------------------------------------------------------- //
// ----------------------------------------- Theme ----------------------------------------- //
// ----------------------------------------------------------------------------------------- //

const THEME_VAR = "theme"
const THEME_ATTR = "mode"
const THEME_ID = "theme-css"
const THEME_PATH = "/_static/css/theme/"
const THEME_LIGHT = "light"
const THEME_DARK = "dark"
const THEME_DEFAULT = THEME_DARK

const THEME_BUTTON = "theme-button"

/**
 * @returns string
 */
function getTheme() {
    return localStorage.getItem(THEME_VAR) || THEME_DEFAULT
}

/**
 * @returns string
 */
function swapTheme() {
    return getTheme() === THEME_LIGHT ? THEME_DARK : THEME_LIGHT
}

// Set theme
const theme = getTheme()
root.setAttribute(THEME_ATTR, theme)
const THEME_CSS = document.getElementById(THEME_ID)
THEME_CSS.setAttribute("href", THEME_PATH + theme + ".css")

// ----------------------------------------------------------------------------------------- //
// ----------------------------------------- Other ----------------------------------------- //
// ----------------------------------------------------------------------------------------- //

// See search.js

const RESULTS_PER_PAGE_VAR = "numResultsPerPage"
const RESULTS_PER_PAGE_DEFAULT = 5
const RESULTS_PER_PAGE_BUTTONS_NAME = "search-results-count"

/**
 * @returns {number}
 */
function getNumResultsPerPage() {
    return Number(localStorage.getItem(RESULTS_PER_PAGE_VAR) || RESULTS_PER_PAGE_DEFAULT)
}

/**
 * @param {number} numResults
 * @returns {string}
 */
function numResultsPerPageToString(numResults) {
    return numResults === -1 ? "all" : String(numResults)
}

/**
 * @param {string} numResults
 * @returns {number}
 */
function numResultsPerPageToNumber(numResults) {
    return numResults === "all" ? -1 : Number(numResults)
}

// ------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------- //
// -------------------------------------------------- ON LOAD -------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------- //

// DO THESE AFTER DOM LOADS!
// THIS SHOULDN'T CAUSE ANY JUMPS / FLASHES!

window.addEventListener("load", function () {
    // ----------------------------------------------------------------------------------------- //
    // ---------------------------------------- Cookies ---------------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    const cookiesButton = document.getElementById(COOKIES_BUTTON)
    const cookiesInput = document.getElementById(COOKIES_INPUT)

    /**
     * @param {boolean} state
     */
    function updateCookies(state) {
        // Set root properties
        if (!FIRST_VISIT) {
            root.setAttribute(COOKIES_ATTR, cookiesToString(state))
            const attrs = ["tooltip", "tooltip-type"]
            attrs.forEach(function (key) {
                document.getElementById("settings-button").removeAttribute(key)
            })
        }

        // Set input state
        cookiesInput.checked = state

        // Set button properties
        cookiesButton.setAttribute(
            "tooltip",
            "Cookies are " + (state ? "✅" : "❌") + " " + cookiesToString(state).toUpperCase()
        )

        // Set local storage
        state ? localStorage.setItem(COOKIES_VAR, cookiesToString(state)) : localStorage.removeItem(COOKIES_VAR)
    }

    updateCookies(cookies)

    // Events
    cookiesInput.addEventListener("click", function () {
        updateCookies(this.checked)
    })

    // ----------------------------------------------------------------------------------------- //
    // ----------------------------------------- Theme ----------------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    const themeButton = document.getElementById(THEME_BUTTON)

    /**
     * @param {string} theme
     */
    function updateTheme(theme) {
        // Set root properties
        root.setAttribute(THEME_ATTR, theme)

        // Set stylesheet
        document.getElementById("theme-css").setAttribute("href", "/_static/css/theme/" + theme + ".css")

        // Set button properties
        themeButton.setAttribute(
            "tooltip",
            "You're in " + (theme === THEME_DARK ? "🌙" : "☀️") + " " + theme.toUpperCase() + " mode"
        )

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), THEME_VAR, theme)
    }

    updateTheme(theme)

    // Events
    themeButton.addEventListener("click", function () {
        updateTheme(swapTheme())
    })

    // ----------------------------------------------------------------------------------------- //
    // ----------------------------------------- Sound ----------------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    const soundButton = document.getElementById(SOUND_BUTTON)
    const soundInput = document.getElementById(SOUND_INPUT)

    /**
     * @param {boolean} state
     */
    function updateSoundState(state) {
        // Set root properties
        root.setAttribute(SOUND_ATTR, soundStateToString(state))

        // Set button properties
        soundButton.setAttribute(
            "tooltip",
            "Sound is " + (state ? "✅" : "❌") + " " + soundStateToString(state).toUpperCase()
        )

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), SOUND_VAR, soundStateToString(state))
    }

    updateSoundState(soundState)

    // Events
    soundInput.addEventListener("click", function () {
        updateSoundState(this.checked)
    })

    // ----------------------------------------------------------------------------------------- //
    // ------------------------------------- Reduce motion ------------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    const reduceMotionInput = document.getElementById(REDUCE_MOTION_INPUT)

    /**
     * @param {boolean} state
     */
    function updateMotionState(state) {
        // Set root properties
        state ? root.setAttribute(REDUCE_MOTION_ATTR, "") : root.removeAttribute(REDUCE_MOTION_ATTR)

        // Set input state
        reduceMotionInput.checked = state

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), REDUCE_MOTION_VAR, motionStateToString(state))
    }

    updateMotionState(motionState)

    // Events
    reduceMotionInput.addEventListener("click", function () {
        updateMotionState(this.checked)
    })

    // ----------------------------------------------------------------------------------------- //
    // -------------------------------------- Font family -------------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    const fontButtons = document.getElementsByName(FONT_BUTTONS_NAME)

    /**
     * @param {string} font
     */
    function updateFont(font) {
        // Update input (needed for page load)
        document.getElementById(FONT_BUTTONS_NAME + "-" + font).checked = true

        // Update CSS file
        FONT_CSS.setAttribute("href", FONT_PATH + font + ".css")

        // Set root properties
        root.setAttribute(FONT_ATTR, font)

        // Update font size for OpenDyslexic
        if (font === "open-dyslexic") {
            root.style.fontSize = fontSizeToString(getFontSize() * FONT_SIZE_DYSLEXIC_MODIFIER)
        } else {
            root.style.fontSize = fontSizeToString(getFontSize())
        }

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), FONT_VAR, font)
    }

    updateFont(font)

    // Events
    fontButtons.forEach((button) => {
        button.addEventListener("click", function () {
            if (this.checked) updateFont(this.value)
        })
    })

    // ----------------------------------------------------------------------------------------- //
    // --------------------------------------- Text size --------------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    const fontSizeButtonIncrease = document.getElementById(FONT_SIZE_INCREASE_BUTTON)
    const fontSizeButtonDecrease = document.getElementById(FONT_SIZE_DECREASE_BUTTON)
    const fontSizeOutput = document.getElementById(FONT_SIZE_OUTPUT)

    const fontSizeButtons = [fontSizeButtonIncrease, fontSizeButtonDecrease]

    /**
     * @param {number} size
     * @param {object} button
     * @returns
     */
    function updateFontSize(size, button = null) {
        if (!(FONT_SIZE_MAX >= size && size >= FONT_SIZE_MIN)) {
            if (button) {
                disable(button, "⛔ An error occurred!")
            }
            return
        }

        // Calculate disabled buttons
        const disabledButtons =
            size === FONT_SIZE_MAX ? [fontSizeButtonIncrease] : size === FONT_SIZE_MIN ? [fontSizeButtonDecrease] : []

        // Set root properties
        if (getFont() === "open-dyslexic") {
            root.style.fontSize = fontSizeToString(size * FONT_SIZE_DYSLEXIC_MODIFIER)
        } else {
            root.style.fontSize = fontSizeToString(size)
        }

        // Set button properties (enable / disable)
        fontSizeButtons.forEach((button) => {
            disabledButtons.includes(button) ? disable(button) : enable(button)
        })

        // Set output
        fontSizeOutput.textContent = size.toString() + "%"

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), FONT_SIZE_VAR, size)
    }

    updateFontSize(fontSize)

    // Events
    fontSizeButtonIncrease.addEventListener("click", function () {
        updateFontSize(getFontSize() + FONT_SIZE_STEP, this)
    })
    fontSizeButtonDecrease.addEventListener("click", function () {
        updateFontSize(getFontSize() - FONT_SIZE_STEP, this)
    })

    // ----------------------------------------------------------------------------------------- //
    // -------------------------------------- Appearance --------------------------------------- //
    // ----------------------------------------------------------------------------------------- //

    // -> Colour
    // --------------------- //
    // const themeColourInput = document.getElementById('theme-colour-input');
    // const themeColourOutput = document.getElementById('theme-colour-output');
    // const themeColourReset = document.getElementById('theme-colour-reset');

    // /**
    //  * @param {number} colour
    //  */
    // function updateThemeColour(colour) {
    //     // Set root properties
    //     root.style.setProperty(THEME_COLOUR_ATTR, colour);

    //     // Set range value
    //     themeColourInput.value = colour;

    //     // Set output
    //     themeColourOutput.textContent = colour.toString();

    //     // Set local storage
    //     ifCookies(localStorage.setItem.bind(localStorage)(THEME_COLOUR_VAR, colour));
    // }

    // updateThemeColour(themeColour);

    // // Events
    // themeColourInput.addEventListener("input", function () { updateThemeColour(this.value); })
    // themeColourReset.addEventListener("click", function () { updateThemeColour(THEME_COLOUR_DEFAULT); })

    // -> Brightness
    // --------------------- //
    const brightnessInput = document.getElementById(BRIGHTNESS_INPUT)
    const brightnessOutput = document.getElementById(BRIGHTNESS_OUTPUT)
    const brightnessReset = document.getElementById(BRIGHTNESS_RESET_BUTTON)

    /**
     * @param {number} value
     */
    function updateBrightness(value) {
        // Set root properties
        root.style.setProperty(BRIGHTNESS_ATTR, value)

        // Set range value
        brightnessInput.value = value

        // Set output
        brightnessOutput.textContent = value.toString()

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), BRIGHTNESS_VAR, value)
    }

    updateBrightness(brightnessValue)

    // Events
    brightnessInput.addEventListener("input", function () {
        updateBrightness(this.value)
    })
    brightnessReset.addEventListener("click", function () {
        updateBrightness(BRIGHTNESS_DEFAULT)
    })

    // -> Contrast
    // --------------------- //
    const contrastInput = document.getElementById(CONTRAST_INPUT)
    const contrastOutput = document.getElementById(CONTRAST_OUTPUT)
    const contrastReset = document.getElementById(CONTRAST_RESET_BUTTON)

    /**
     * @param {number} value
     */
    function updateContrast(value) {
        // Set root properties
        root.style.setProperty(CONTRAST_ATTR, value)

        // Set range value
        contrastInput.value = value

        // Set output
        contrastOutput.textContent = value.toString()

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), CONTRAST_VAR, value)
    }

    updateContrast(contrastValue)

    // Events
    contrastInput.addEventListener("input", function () {
        updateContrast(this.value)
    })
    contrastReset.addEventListener("click", function () {
        updateContrast(CONTRAST_DEFAULT)
    })

    // -> Page lang
    // --------------------- //
    const pageLangButtons = document.getElementsByName(PAGE_LANG_BUTTONS_NAME)
    const pageLangOutputs = Array.from(document.getElementsByClassName(PAGE_LANG_CLASS_NAME))

    /**
     * @param {string} value
     */
    function updatePageLang(value) {
        // Translate page text
        updatePageLangText(value)

        // Update input (needed for page load)
        document.getElementById(PAGE_LANG_BUTTONS_NAME + "-" + value).checked = true

        // Set root properties
        root.setAttribute(PAGE_LANG_ATTR, value)

        // Set outputs
        pageLangOutputs.forEach(function (output) {
            output.textContent = value
        })

        // Set local storage
        ifCookies(localStorage.setItem.bind(localStorage), PAGE_LANG_VAR, value)
    }

    updatePageLang(pageLang)

    // Events
    pageLangButtons.forEach((button) => {
        button.addEventListener("click", function () {
            if (this.checked) updatePageLang(this.value)
        })
    })
})
