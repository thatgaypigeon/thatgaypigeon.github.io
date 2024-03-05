document.addEventListener("DOMContentLoaded", function () {
    const extra = document.querySelector("extra")
    const inputs = document.querySelectorAll('input[type="text"]')
    const caret = document.createElement("div")
    caret.id = "caret"
    extra.appendChild(caret)

    // Hide by default
    caret.style.display = "none"

    // Function to update caret position based on the active input
    function updateCaretPosition(activeInput) {
        const { left, top, height } = activeInput.getBoundingClientRect()
        const selection = activeInput.selectionStart
        const inputStyle = window.getComputedStyle(activeInput)
        const fontSize = parseFloat(inputStyle.fontSize) * 1.4
        const text = activeInput.value.substring(0, selection)
        const textSpan = document.createElement("span")
        textSpan.style.font = inputStyle.font
        textSpan.style.fontSize = inputStyle.fontSize
        textSpan.style.fontFamily = inputStyle.fontFamily
        textSpan.style.fontWeight = inputStyle.fontWeight
        textSpan.style.letterSpacing = inputStyle.letterSpacing
        textSpan.style.visibility = "hidden"
        textSpan.textContent = text
        document.body.appendChild(textSpan)
        const textWidth = textSpan.offsetWidth
        document.body.removeChild(textSpan)

        const paddingLeft = parseFloat(inputStyle.paddingLeft)
        const paddingTop = parseFloat(inputStyle.paddingTop)
        const borderLeft = parseFloat(inputStyle.borderLeftWidth)
        const borderTop = parseFloat(inputStyle.borderTopWidth)

        // Calculate the vertical centring
        const inputHeight = height - paddingTop - borderTop
        const caretTopOffset = (inputHeight - fontSize) / 2 + paddingTop + borderTop

        caret.style.left = `${left + textWidth + paddingLeft + borderLeft}px` // Adjusted to match text width
        caret.style.top = `${top + caretTopOffset}px` // Adjusted to center vertically
        caret.style.height = `${fontSize}px`
    }

    // Event listener for input changes and focus
    inputs.forEach((input) => {
        ;["input", "focus", "click", "keyup", "blur"].forEach((event) => {
            input.addEventListener(event, () => updateCaretPosition(input))
        })
    })

    // Initial position update
    const activeInput = document.activeElement
    if (activeInput.classList.contains("text-input")) {
        updateCaretPosition(activeInput)
    }

    // Hide caret when no input is focused
    document.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT" && e.target.type === "text") {
            caret.style.display = "block"
        } else {
            caret.style.display = "none"
        }
    })
})
