let sparkGroup

document.addEventListener("mousedown", function (event) {
    if (event.target.tagName === "PRE" && event.target.parentElement.classList.includes("block-code")) {
        event.preventDefault()
        sparkGroup.remove()
    }

    // if (getClickSoundState()) {
    if (getSoundState()) {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)()

        const MAX_SPEED = 1.5
        const MIN_SPEED = 0.75

        fetch("/_static/sound/click.wav")
            .then((response) => response.arrayBuffer())
            .then((buffer) => audioCtx.decodeAudioData(buffer))
            .then((decodedAudio) => {
                var source = audioCtx.createBufferSource()
                source.buffer = decodedAudio

                // Volume
                var gainNode = audioCtx.createGain()
                gainNode.gain.value = 0.15
                source.connect(gainNode)
                gainNode.connect(audioCtx.destination)

                // Pitch
                source.playbackRate.value = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED

                source.start(0)
            })
    }

    // if (getClickEffectState()) {
    if (true && event.target.tagName !== "OPTION") {
        sparkGroup = document.createElement("div")
        sparkGroup.className = "sparks"

        const numSparks = getRndInteger(5, 8)

        for (var i = 0; i < numSparks; i++) {
            const sparkLength = getRndInteger(21, 28)

            const distanceFromCircle = -(sparkLength / 2) // aligns lines to circle
            const circleRadius = distanceFromCircle + sparkLength

            const baseAngle = i * (360 / numSparks)
            const angleDeviation = 360 / numSparks ** 2
            const angle = getRndInteger(baseAngle - angleDeviation, baseAngle + angleDeviation)
            const radians = (angle * Math.PI) / 180

            const x = circleRadius * Math.cos(radians)
            const y = circleRadius * Math.sin(radians)

            const spark = document.createElement("div")
            spark.className = "spark"
            const sparkWrapper = document.createElement("div")
            sparkWrapper.className = "spark-wrapper"

            sparkWrapper.appendChild(spark)

            spark.style.height = String(sparkLength) + "px"

            sparkWrapper.style.left = event.pageX - window.scrollX + x + "px"
            sparkWrapper.style.top = event.pageY - window.scrollY + y + "px"
            sparkWrapper.style.rotate = String(angle - 90) + "deg"

            sparkGroup.appendChild(sparkWrapper)
        }

        document.querySelector("extra").appendChild(sparkGroup)
    }
})
