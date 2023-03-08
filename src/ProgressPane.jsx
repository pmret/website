import React, { useState, useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import Uplot from "uplot"
import 'uplot/dist/uPlot.min.css'

const csvVersions = {
    "1": {
        timestamp: parseInt,
        commit: s => s,
        totalFuncs: parseInt,
        nonMatchingFuncs: parseInt,
        matchingFuncs: parseInt,
        totalBytes: b => parseInt(b),
        nonMatchingBytes: b => parseInt(b),
        matchingBytes: b => parseInt(b),
    },
}

const colors = {
    yellow: { stroke: "#e3ac34", fill: "#edc97e" },
    green: { stroke: "#40e334", fill: "#91eb7f" },
}

async function fetchData(version) {
    const csv = await fetch(`https://papermar.io/reports/progress_${version}.csv`)
        .then(response => response.text())

    const rows = csv
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

    const latest = rows[rows.length - 1]

    const totalBytes = latest.totalBytes

    for (const row of rows) {
        row.percentBytes = (row.matchingBytes / totalBytes) * 100
    }

    return rows
}

export default function ProgressPane({ captionPortal, color, version }) {
    const [data, setData] = useState()
    const [dataVersion, setDataVersion] = useState()

    useEffect(() => {
        fetchData(version)
            .then(data => {
                setData(data)
                setDataVersion(version)
            })
    }, [version])

    const isDataValid = dataVersion === version

    return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {data && <DataView data={isDataValid ? data : []} captionPortal={captionPortal} color={color}/>}
    </div>
}

function DataView({ data, captionPortal, color }) {
    const latest = data[data.length - 1]
    const { stroke, fill } = colors[color]

    const [selectedEntry, setSelectedEntry] = useState(latest)

    if (!selectedEntry && latest) {
        setSelectedEntry(latest)
    }

    const uplotData = useMemo(() => {
        const uplotData = [
            [], // x-axis (timestamps)
            [], // y-axis (percentages)
        ]

        for (const row of data) {
            uplotData[0].push(row.timestamp)
            uplotData[1].push(row.percentBytes)
        }

        return uplotData
    })
    const uplotEl = useRef()
    useEffect(() => {
        if (uplotEl.current && uplotData.length) {
            const { width, height } = uplotEl.current.getBoundingClientRect()
            const uplot = new Uplot({
                width,
                height,
                series: [
                    {},
                    {
                        scale: "%",
                        value: (u, v) => v == null ? null : v.toFixed(1) + "%",
                        stroke,
                        fill,
                        width: 3/devicePixelRatio,
                    },
                ],
                axes: [
                    {},
                    {
                        scale: "%",
                        values: (u, vals, space) => vals.map(v => +v.toFixed(1) + "%"),
                    },
                ],
                legend: {
                    show: false,
                },
                plugins: [
                    {
                        hooks: {
                            setCursor: u => {
                                const idx = u.cursor.idx
                                if (typeof idx === "number") {
                                    setSelectedEntry(data[idx])
                                }
                            },
                        }
                    }
                ]
            }, uplotData, uplotEl.current)

            // Resize the chart when the window is resized
            function onResize() {
                const { width, height } = uplotEl.current.getBoundingClientRect()
                uplot.setSize({ width, height })
            }
            document.addEventListener("resize", onResize)

            // Hack to make sure the chart is sized correctly after the flip transition when changing page
            const t = setTimeout(onResize, 300)

            return () => {
                uplot.destroy()
                document.removeEventListener("resize", onResize)
                clearTimeout(t)
            }
        }
    }, [uplotData, uplotEl.current, stroke])

    return <>
        <h1 className="aria-only">
            {latest && formatPercent(latest.percentBytes)} decompiled
        </h1>
        <div className="shadow-box flex-grow">
            <div className="shadow-box-inner" style={{ padding: ".7em", "--text-outline": "transparent", background: "#e2e1d8" }}>
                <div className="progress-chart" ref={uplotEl} />
                {latest && <div className="progress-percent" title="Latest matched percentage">
                    {formatPercent(latest.percentBytes)}
                </div>}
            </div>

            <button aria-hidden={true} className={"shadow-box-title " + color}>
                {selectedEntry ? formatTimestamp(selectedEntry.timestamp, {
                    dateStyle: "long",
                    timeStyle: "short",
                }) : ""}
            </button>
        </div>

        {(data.length && selectedEntry && captionPortal.current && createPortal(<EntryInfo entry={selectedEntry} isLatest={selectedEntry.commit === latest.commit}/>, captionPortal.current) || null)}
    </>
}

function formatTimestamp(timestamp, options={}) {
    const date = new Date(timestamp * 1000)

    return new Intl.DateTimeFormat([], options).format(date)
}

function formatTimestampMonth(timestamp) {
    const date = new Date(timestamp * 1000)

    if (date.getMonth() == 0) {
        return date.getFullYear().toString()
    } else {
        return new Intl.DateTimeFormat([], { month: "short" }).format(date)
    }
}

function formatPercent(alpha) {
    return Math.round(alpha * 100) / 100 + "%"
}

function EntryInfo({ entry, isLatest }) {
    /*const [commitMessage, setCommitMessage] = useState(null)

    useEffect(async () => {
        fetch(`https://api.github.com/repos/pmret/papermario/commits/${entry.commit}`)
            .then(resp => resp.json())
            .then(resp => {
                setCommitMessage(resp.commit.message.split("\n")[0])
            })
    }, [entry.commit])*/

    return <div>
        <a href={`https://github.com/pmret/papermario/commit/${entry.commit}`}>
            {entry.commit.substr(0, 8)}
        </a>
        {isLatest && " (latest commit)"}

        <br/>

        <span className="thin">
            Matched {formatPercent(entry.percentBytes)} bytes ({entry.matchingFuncs}/{entry.totalFuncs} functions)
        </span>
    </div>
}
