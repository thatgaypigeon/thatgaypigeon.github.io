const LOCALE_DIRECTORY = "/_static/locales"

const PAGE_LANG_VAR = "lang"
const PAGE_LANG_ATTR = "lang"
const PAGE_LANG_DEFAULT = "en-GB"
const PAGE_LANG_FALLBACK = "en"

const PAGE_LANG_BUTTONS_NAME = "lang"
const PAGE_LANG_CLASS_NAME = "lang"
const PAGE_LANG_CLASS_NAME_ICON = "lang-icon"

/**
 * @returns {string}
 */
function getPageLang() {
    return localStorage.getItem(PAGE_LANG_VAR) || PAGE_LANG_DEFAULT
}

// Set motion state
const pageLang = getPageLang()
document.documentElement.setAttribute(PAGE_LANG_ATTR, pageLang)

const TRANSLATION_MISSING_HTML =
    '<div class="translation-missing ph-bold ph-info icon-tooltip"><div tooltip="⚠️ Translation missing" tooltip-type="warning small"></div></div>'

function updatePageLangText(lang) {
    fetch(`${LOCALE_DIRECTORY}/${PAGE_LANG_FALLBACK}.json`)
        .then((response) => response.json())
        .then((defaultData) => {
            fetch(`${LOCALE_DIRECTORY}/${lang}.json`)
                .then((response) => response.json())
                .then((data) => {
                    class Translation {
                        /**
                         *
                         * @param {string} str
                         */
                        constructor(str, orig = null) {
                            this.query = str
                            this.original = orig

                            if (data.hasOwnProperty(str)) {
                                this.text = data[str]
                                this.html = data[str]
                                if (data[str] === null && !pageLang.startsWith("en")) {
                                    this.html += TRANSLATION_MISSING_HTML
                                }
                            } else if (defaultData.hasOwnProperty(str)) {
                                this.text = defaultData[str]
                                this.html = defaultData[str]
                            } else {
                                throw new Error(`Translation key "${str}" does not exist for lang "${lang}".`)
                            }
                        }
                    }

                    const search = document.getElementById("search")
                    search.setAttribute("placeholder", new Translation("search").text)

                    const contentText = Array.from(document.getElementsByClassName("content-text"))
                    contentText.forEach((element) => {
                        element.innerHTML = new Translation(
                            element.hasAttribute("text") ? element.getAttribute("text") : element.id
                        ).html
                    })
                })
                .catch((error) => pass) // console.error(error))
        })
        .catch((error) => pass) // console.error(error))
}
