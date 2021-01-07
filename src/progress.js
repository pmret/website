import Chart from "chart.js"

const csvVersions = {
    "1": {
        timestamp: s => new Date(parseInt(s) * 1000),
        commit: s => s,
        totalFuncs: parseInt,
        nonMatchingFuncs: parseInt,
        matchingFuncs: parseInt,
        totalBytes: parseInt,
        nonMatchingBytes: parseInt,
        matchingBytes: parseInt,
    },
}

export async function fetchData() {
    const csv = await fetch("https://papermar.io/reports/progress.csv")
        .then(response => response.text())

    return csv
        .split("\n")
        .filter(row => row.length)
        .map(row => {
            const [version, ...data] = row.split(",")
            const structure = csvVersions[version]
            const obj = {}

            for (const [key, transform] of Object.entries(structure)) {
                obj[key] = transform(data.shift())
            }

            return obj
        })
}

export async function functionsChart(data, ctx) {
    return new Chart(ctx, {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Matching Functions",
                    borderColor: "transparent",
                    backgroundColor: "#7f5617",
                    pointBackgroundColor: "transparent",
                    pointBorderColor: "black",
                    data: data.map(row => {
                        return {
                            x: row.timestamp,
                            y: row.matchingFuncs,
                        }
                    }),
                    lineTension: 0,
                },
                {
                    label: "Split Functions",
                    borderColor: "transparent",
                    backgroundColor: "#b48b31",
                    pointBackgroundColor: "transparent",
                    pointBorderColor: "black",
                    data: data.map(row => {
                        return {
                            x: row.timestamp,
                            y: row.totalFuncs,
                        }
                    }),
                    lineTension: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [
                    {
                        type: "time",
                        //distribution: "series",
                        ticks: {
                            max: Date.now(),
                            fontFamily: "Paper Mario Dialog Redesigned",
                        },
                        time: {
                            isoWeekday: true,
                            unit: "month",
                        },
                        gridLines: {
                            drawBorder: true,
                        }
                    },
                ],
                yAxes: [
                    {
                        label: "Functions",
                        ticks: {
                            fontFamily: "Paper Mario Dialog Redesigned",
                        }
                    }
                ]
            },
            tooltips: {
                enabled: false,
                intersect: false,
                custom(tooltipModel) {
                    const title = document.getElementById("progress-chart-tooltip-title")
                    const desc = document.getElementById("rogress-chart-tooltip-description")

                    if (!tooltipModel.dataPoints) {
                        title.innerText = ""
                        desc.innerText = ""
                    }

                    const row = data[tooltipModel.dataPoints[0].index]
                    console.log(row)

                    title.innerText = row.commit
                },
            },
        },
    })
}
