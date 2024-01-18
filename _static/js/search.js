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
            }, 50)
        }
    }
})

const type_icons = {
    gh: {
        name: ["ph", "ph-github-logo"],
    },
    mw: {
        link: "https://upload.wikimedia.org/wikipedia/commons/c/c6/MediaWiki-2020-small-icon.svg",
    },
}

let DATE_REGEX, WIKI_URL
fetch("/_static/json/shared.json")
    .then((response) => response.json())
    .then((data) => {
        DATE_REGEX = new RegExp(data.date_regex)
        WIKI_URL = data.wiki_url
    })
    .catch((error) => console.error("Error: ", error))

function search(documents, query) {
    const results = fuzzysort.go(query, documents, {
        all: false,
        keys: ["name", "desc"],
    })

    numResults = results.length

    results.slice(0, perPage(numResults)).forEach(function (searchResult, index) {
        const result = searchResult.obj

        if (result) {
            if (DATE_REGEX.test(result.date)) {
                const resultElement = document.createElement("a")
                resultElement.classList.add("result")
                resultElement.style = `--index: ${index};`
                if (result.lang) {
                    resultElement.setAttribute("data-lang", result.lang)
                }
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

                if (result.lang) {
                    const langWrapperElement = document.createElement("div")
                    langWrapperElement.classList.add("result-lang-wrapper")

                    const langElement = document.createElement("div")
                    langElement.classList.add("result-lang")
                    langElement.textContent = "\uE004"
                    langElement.setAttribute("tooltip", "\uE001 Python – 100%")

                    langWrapperElement.appendChild(langElement)
                    infoElement.appendChild(langWrapperElement)
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

        // iff [sic] "all", include "other"
        filterValues.other = false

        const categories = Object.keys(filterValues).filter(
            (key) => (filterValues.all === true || filterValues[key] === true) && key !== "all"
        )

        if (categories.length > 0) {
            let promises = categories.map((category) => {
                if (documentTable[category]) {
                    // If the data is already in the documentTable, resolve it immediately
                    return Promise.resolve(documentTable[category])
                } else {
                    // Fetch the data and store it in the documentTable
                    return fetch(`/_static/json/search/${category}.json`)
                        .then((response) => response.json())
                        .then((data) => {
                            const categorisedData = data.map((item) => ({
                                ...item,
                                _cat: category,
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

searchMenu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        searchBox.blur()
        this.removeAttribute("open")
    }
})

searchBox.addEventListener("keyup", function () {
    if (this.value !== prevSearchValue) {
        performSearch()
        prevSearchValue = this.value
    }
})

searchFilters.querySelectorAll("input[type=checkbox]").forEach((filter) => {
    filter.addEventListener("change", function () {
        filterValues[this.value] = this.checked
        if (searchBox.value !== "" && (!searchFilterAll.checked || this.value === "all")) {
            performSearch()
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
