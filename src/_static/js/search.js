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

                const nameElement = document.createElement(result.code ? "code" : "p")
                nameElement.classList.add("result-name")
                nameElement.innerHTML =
                    fuzzysort.highlight(searchResult[0], "<mark>", "</mark>") || escapeHtml(result.name)
                resultElement.appendChild(nameElement)

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

                resultElement.appendChild(infoElement)

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

    const notFoundText = "<span>Uh oh! No results found!</span>"

    const noResults = document.createElement("div")
    noResults.className = "no-results"
    noResults.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15 1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2m-4 15H9v-2h2zm2.7-7.6a5 5 0 0 1-.3.7a2.7 2.7 0 0 1-.5.6l-.5.5a2.7 2.7 0 0 1-.6.5c-.2.2-.3.4-.5.6a1.9 1.9 0 0 0-.3.8a3.4 3.4 0 0 0-.1 1H9.1a5 5 0 0 1 .1-1.2a3 3 0 0 1 .2-.9a2.5 2.5 0 0 1 .4-.7l.6-.6a1.8 1.8 0 0 1 .5-.4c.2-.1.3-.3.4-.4l.3-.6a1.7 1.7 0 0 0 .1-.7a3 3 0 0 0-.2-.9a2.2 2.2 0 0 0-1-.9a.9.9 0 0 0-.5-.1a1.68 1.68 0 0 0-1.5.7A2.86 2.86 0 0 0 8 8.1H6.2a5.1 5.1 0 0 1 .3-1.7a3.5 3.5 0 0 1 .8-1.3a3.6 3.6 0 0 1 1.2-.8a5.1 5.1 0 0 1 1.7-.3a6 6 0 0 1 1.4.2a2.6 2.6 0 0 1 1.1.7a4.4 4.4 0 0 1 .8 1.1a4 4 0 0 1 .3 1.5a3 3 0 0 1-.1.9"/></svg>${notFoundText}`

    // '<div class="no-results">No results found</div>'
    const searchWiki = document.createElement("a")
    searchWiki.id = "search-wiki"
    searchWiki.textContent = "Search the wiki!"

    searchResults.innerHTML = ""
    searchInfo.innerHTML = noResults.outerHTML

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
                    } else {
                        // } else if (!categories.includes("wiki")) {
                        searchWiki.href = `https://pigeon.miraheze.org/wiki/Special:Search?profile=default&search=${query}&fulltext=1`
                        searchWiki.innerHTML = `<i class="ph-bold ph-magnifying-glass"></i>Search the wiki for "<b>${query}</b>"`

                        const noResultsSearchWiki = noResults.cloneNode(true)
                        noResultsSearchWiki.appendChild(searchWiki)

                        searchInfo.innerHTML = noResultsSearchWiki.outerHTML
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

        if (searchFilters.querySelectorAll("input[type=checkbox]:checked").length <= 1) {
            searchFilters.querySelector(`input[type=checkbox]:checked`).setAttribute("disabled", "")
        } else {
            searchFilters.querySelectorAll(`input[type=checkbox]`).forEach((filter) => {
                filter.removeAttribute("disabled")
            })
        }

        if (this.value === "all") {
            if (this.checked) {
                searchFilters.setAttribute("all", "")
                searchFilters.querySelectorAll("input[type=checkbox]:not([value='all'])").forEach((filter) => {
                    filter.setAttribute("disabled", "")
                })
            } else {
                searchFilters.removeAttribute("all")
                if (searchFilters.querySelectorAll("input[type=checkbox]:checked").length <= 1) {
                    searchFilters.querySelectorAll(`input[type=checkbox]`).forEach((element) => {
                        if (element.checked) {
                            element.setAttribute("disabled", "")
                        } else {
                            element.removeAttribute("disabled")
                        }
                    })
                }
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
