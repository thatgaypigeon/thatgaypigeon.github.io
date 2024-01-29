const searchMenu = document.getElementById("search-menu")
const searchBox = document.getElementById("search")
const searchFilters = document.getElementById("search-filters")
const searchSettings = document.getElementById("search-settings")
const searchResults = document.getElementById("search-results")
const searchInfo = document.getElementById("search-info")

const searchFilterAll = document.getElementById("search-filter-all")
const numResultsPerPageButtons = document.getElementsByName(RESULTS_PER_PAGE_BUTTONS_NAME)

let numResults
let resultTime

let documentTable = {}
let searchCategories = []

let prevSearchValue = searchBox.value
let prevResultsCount =
    Array.from(numResultsPerPageButtons).find((button) => button.checked)?.value || RESULTS_PER_PAGE_DEFAULT

let filterValues = Array.from(searchFilters.querySelectorAll("input[type=checkbox]")).reduce((obj, filter) => {
    obj[filter.value] = filter.checked
    return obj
}, {})

/**
 * @param {number} numResults
 * @returns {number}
 */
function perPage(numResults) {
    return getNumResultsPerPage() === -1 ? numResults : getNumResultsPerPage()
}

/**
 * @param {number} numResults
 */
function updateNumResultsPerPage(numResults) {
    // Update input (needed for page load)
    document.getElementById(RESULTS_PER_PAGE_BUTTONS_NAME + "-" + numResultsPerPageToString(numResults)).checked = true

    // Set local storage
    ifCookies(localStorage.setItem.bind(localStorage), RESULTS_PER_PAGE_VAR, numResults)
}

updateNumResultsPerPage(getNumResultsPerPage())

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "/") {
        event.preventDefault()
        if (document.activeElement !== searchBox) {
            searchMenu.setAttribute("open", "")
            setTimeout(function () {
                searchBox.focus()
                document.getElementById("caret").style.display = "block"
            }, 50)
        }
    }
})

const type_icons = {
    gh: {
        name: ["ph", "ph-github-logo"]
    },
    mw: {
        link: "https://upload.wikimedia.org/wikipedia/commons/c/c6/MediaWiki-2020-small-icon.svg"
    }
}

let DATE_REGEX, WIKI_URL
fetch("/_static/config.json")
    .then((response) => response.json())
    .then((data) => {
        DATE_REGEX = new RegExp(data.date_regex)
        WIKI_URL = data.wiki_url
    })
    .catch((error) => console.error("Error: ", error))

let GLYPH_MAP = {}
let SOURCE_GLYPH_MAP = {}
fetch("/_static/fonts/TheNestIcons/map.glyphmap")
    .then((response) => response.text())
    .then((glyphMap) => {
        const lines = glyphMap.split("\n")
        lines.forEach((line) => {
            const arr = line.split(",")
            if (arr && arr.length > 0 && arr[0] !== "") {
                const source = arr.slice(0, arr.length - 3).join(",")
                const fileName = source[source.length - 1].trim().replace(/\.svg$/, "")
                const name = arr[arr.length - 3].trim()
                const code = arr[arr.length - 1].trim()

                if (arr[arr.length - 3]) {
                    GLYPH_MAP[name] = code
                    SOURCE_GLYPH_MAP[fileName] = code
                }
            }
        })
    })
    .catch((error) => console.error("Error: ", error))

function search(documents, query) {
    const results = fuzzysort.go(query, documents, {
        all: false,
        keys: ["name", "desc"]
    })

    numResults = results.length

    results.slice(0, perPage(numResults)).forEach(function (searchResult, index) {
        const result = searchResult.obj

        if (result) {
            if (DATE_REGEX.test(result.date)) {
                const resultElement = document.createElement("a")
                resultElement.classList.add("result")
                resultElement.style = `--index: ${index};`
                if (result._cat) {
                    resultElement.setAttribute("ctgy", result._cat)
                }
                // if (result.tags.every((e) => e !== "")) {
                //     resultElement.setAttribute("data-tags", result.tags.join(", "))
                // }
                resultElement.href = result.link

                let imageElement
                if (result.imag) {
                    imageElement = document.createElement("img")
                    imageElement.src = result.imag
                } else if (result.icon) {
                    imageElement = document.createElement("div")
                    imageElement.classList.add("result-icon", ...result.icon)
                } else if (Object.keys(type_icons).includes(result.type)) {
                    if (Object.keys(type_icons[result.type]).includes("name")) {
                        imageElement = document.createElement("div")
                        imageElement.classList.add("result-icon", ...type_icons[result.type.name])
                    } else if (Object.keys(type_icons[result.type]).includes("link")) {
                        imageElement = document.createElement("img")
                        imageElement.src = type_icons[result.type.link]
                    }
                }

                if (imageElement) {
                    imageElement.classList.add("result-image")
                } else {
                    imageElement = document.createElement("img")
                    imageElement.classList.add("result-image", "none")
                }

                // const imageWrapperElement = document.createElement("div")
                // imageWrapperElement.classList.add("result-image")
                // imageWrapperElement.appendChild(imageElement)
                // resultElement.appendChild(imageWrapperElement)
                resultElement.appendChild(imageElement)

                const headerElement = document.createElement("div")
                headerElement.classList.add("result-header")
                resultElement.appendChild(headerElement)

                const nameElement = document.createElement(result.code ? "code" : "p")
                nameElement.classList.add("result-name")
                nameElement.innerHTML =
                    fuzzysort.highlight(searchResult[0], "<mark>", "</mark>") || escapeHtml(result.name)
                headerElement.appendChild(nameElement)

                const infoElement = document.createElement("div")
                infoElement.classList.add("result-info")

                if (result.code) {
                    const divider = String.fromCharCode(parseInt(GLYPH_MAP.Divider, 16))

                    const data = result.code

                    const roundedValues = roundToTotal(Object.values(data), 100, 1).map((val) => val.toFixed(1))
                    const codeLangs = Object.keys(data).reduce(
                        (acc, key, i) => ({ ...acc, [key]: roundedValues[i] }),
                        {}
                    )

                    const maxValue = getKeyOfLargestValue(codeLangs)
                    const codeLangText = String.fromCharCode(parseInt(GLYPH_MAP[maxValue], 16))
                    let codeLangTooltip = `${codeLangText}\u200A${maxValue}`

                    if (Object.keys(codeLangs).length > 1) {
                        codeLangTooltip = Object.entries(codeLangs)
                            .map(
                                ([key, value]) =>
                                    `${String.fromCharCode(
                                        parseInt(GLYPH_MAP[key], 16)
                                    )}\u200A${key}${divider}${value.toString()}%`
                            )
                            .join("\u000A")
                    }

                    const codeLangWrapperElement = document.createElement("div")
                    codeLangWrapperElement.classList.add("result-code-lang-wrapper")

                    const codeLangElement = document.createElement("div")
                    codeLangElement.classList.add("result-code-lang")
                    codeLangElement.textContent = codeLangText
                    codeLangElement.setAttribute("tooltip", codeLangTooltip)
                    codeLangElement.setAttribute("tooltip-type", "code bold spaced")

                    codeLangWrapperElement.appendChild(codeLangElement)
                    infoElement.appendChild(codeLangWrapperElement)
                }

                const dateWrapperElement = document.createElement("div")
                dateWrapperElement.classList.add("result-date-wrapper")

                const date = result.date.split("-")
                const day = +date[0] || ""
                const month = new Date(new Date().setMonth(+date[1] - 1)).toLocaleString("en-GB", { month: "long" })
                const year = +date[2] || ""

                const shortDate = `${month.substring(0, 3)} ${year}`
                const longDate = `${toOrdinal(day)} ${month}, ${year}`

                const dateElement = document.createElement("span")
                dateElement.classList.add("result-date")
                dateElement.textContent = shortDate
                dateElement.setAttribute("tooltip", "Last updated: " + longDate)
                dateWrapperElement.appendChild(dateElement)

                infoElement.appendChild(dateWrapperElement)

                headerElement.appendChild(infoElement)

                // const categoriesElement = document.createElement("p")
                // categoriesElement.classList.add("result-cats")
                // categoriesElement.textContent = doc.cats.join(", ")
                // resultElement.appendChild(categoriesElement)

                if (result.desc) {
                    const textElement = document.createElement("p")
                    textElement.classList.add("result-desc")
                    textElement.innerHTML = fuzzysort.highlight(searchResult[1], "<mark>", "</mark>") || result.desc
                    resultElement.appendChild(textElement)
                } else {
                    resultElement.classList.add("no-desc")
                }

                searchResults.appendChild(resultElement)
            } else {
                console.error(`ENTRY '${result.name}' HAS INVALID DATE '${result.date}'! NOT IN FORMAT 'DD-MM-YYYY'!`)
            }
        } else {
            console.error(`ENTRY DOES NOT EXIST`)
        }
    })
}

function performSearch() {
    const query = searchBox.value

    searchResults.innerHTML = ""
    searchInfo.innerHTML = '<div class="no-results">No results found</div>'

    if (query) {
        const startTime = performance.now()

        const categories = Object.keys(filterValues).filter(
            (key) => (filterValues.all === true || filterValues[key] === true) && key !== "all"
        )

        if (categories.length > 0) {
            let promises = categories.map((category) => {
                if (documentTable[category]) {
                    return Promise.resolve(documentTable[category])
                } else {
                    return fetch(`/_static/searchindex/${category}.json`)
                        .then((response) => response.json())
                        .then((data) => {
                            const categorisedData = data.map((item) => ({
                                ...item,
                                _cat: category
                            }))
                            documentTable[category] = categorisedData
                            return categorisedData
                        })
                }
            })

            Promise.all(promises)
                .then((docs) => {
                    search(docs.flat(), query)
                    if (numResults) {
                        const elapsedTime = round(performance.now() - startTime, 1)
                        const numResultsPerPage = numResults > perPage(numResults) ? perPage(numResults) : numResults
                        searchInfo.innerHTML = `<div class="result-info">${numResults} results in ${elapsedTime}ms</div><div class="results-per-page">Showing ${numResultsPerPage} result${
                            numResultsPerPage !== 1 ? "s" : ""
                        }</div>`
                    }
                })
                .catch((error) => console.error("Error performing search: ", error))
        }
    }
}

searchMenu.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        searchBox.blur()
        document.getElementById("caret").style.display = "none"
        this.removeAttribute("open")
    }
})

searchBox.addEventListener("keyup", function () {
    if (this.value !== prevSearchValue) {
        performSearch()
        prevSearchValue = this.value
    }
})

if (searchFilterAll.checked) {
    searchFilters.setAttribute("all", "")
    searchFilters.querySelectorAll("input[type=checkbox]:not([value='all'])").forEach((filter) => {
        filter.setAttribute("disabled", "")
    })
} else {
    searchFilters.removeAttribute("all")
    searchFilters.querySelectorAll("input[type=checkbox]:not([value='all'])").forEach((filter) => {
        filter.removeAttribute("disabled")
    })
}

searchFilters.querySelectorAll("input[type=checkbox]").forEach((filter) => {
    filter.addEventListener("change", function () {
        filterValues[this.value] = this.checked
        if (searchBox.value !== "" && (!searchFilterAll.checked || this.value === "all")) {
            performSearch()
        }

        if (this.value === "all") {
            if (this.checked) {
                searchFilters.setAttribute("all", "")
                searchFilters.querySelectorAll("input[type=checkbox]:not([value='all'])").forEach((filter) => {
                    filter.setAttribute("disabled", "")
                })
            } else {
                searchFilters.removeAttribute("all")
                searchFilters.querySelectorAll("input[type=checkbox]:not([value='all'])").forEach((filter) => {
                    filter.removeAttribute("disabled")
                })
            }
        }
    })
})

numResultsPerPageButtons.forEach((button) => {
    button.addEventListener("click", function () {
        if (this.checked && this.value !== prevResultsCount) {
            updateNumResultsPerPage(numResultsPerPageToNumber(this.value))
            if (searchBox.value !== "") {
                performSearch()
            }
            prevResultsCount = this.value
        }
    })
})
