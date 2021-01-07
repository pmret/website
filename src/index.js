import moment from "moment"

import("./progress.js").then(async ({ fetchData, functionsChart }) => {
    const data = await fetchData()

    functionsChart(data, document.getElementById("progress-chart"))

    const first = data[0]
    const latest = data[data.length - 1]

    document.getElementById("matched-rom-percent").innerText = Math.round((latest.matchingBytes / latest.totalBytes) * 10000) / 100 + "% matched" // TODO: include data
    document.getElementById("functions-ratio").innerText = latest.matchingFuncs + "/" + latest.totalFuncs
    document.getElementById("play-time").innerText = moment(latest.timestamp).from(first.timestamp, true)
}).catch(console.error)
