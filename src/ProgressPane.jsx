import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Area, XAxis, YAxis, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { scalePow } from "d3-scale"

const scale = scalePow()
    .exponent(30)

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

async function fetchData() {
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

            obj.percentBytes = Math.round((obj.matchingBytes / obj.totalBytes) * 100)

            return obj
        })
}

let cachedData = null

export default function ProgressPane({ captionPortal, nonce }) {
    const [data, setData] = useState(cachedData)

    useEffect(() => {
        fetchData()
            .then(data => {
                cachedData = data
                setData(cachedData)
            })
    }, [])

    // TODO: cute spin animation when data loads

    return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {data && <DataView data={data} nonce={nonce} captionPortal={captionPortal}/>}
        {!data && "Loading..."}
    </div>
}

const monthDates = []
{
    let date = new Date(2020, 3, 1)
    while (date < Date.now()) {
        monthDates.push(date / 1000)

        date = new Date(date) // clone
        date.setMonth(date.getMonth() + 1)
    }
}

function DataView({ data, captionPortal, nonce }) {
    const latest = data[data.length - 1]
    const oldest = data[0]

    const [selectedEntry, setSelectedEntry] = useState(latest)

    function renderTooltip(tip) {
        const entry = data.find(row => row.timestamp === tip.label)

        if (entry) {
            setSelectedEntry(entry)
        }

        return <span/>
    }

    const maxPercent = Math.ceil(latest.percentBytes / 25) * 25

    return <>
        {/*<table width="250" className="outline-invert">
            <tbody>
                <tr>
                    <td>Matched</td>
                    <td className="thin align-right">{Math.round((latest.matchingBytes / latest.totalBytes) * 10000) / 100}%</td>
                </tr>
            </tbody>
        </table>*/}

        <div className="shadow-box flex-grow">
            <div className="shadow-box-inner" style={{ paddingRight: ".7em", paddingTop: ".7em", "--text-outline": "transparent" }}>
                <div className="progress-chart">
                    <ResponsiveContainer>
                        <AreaChart data={data}>
                            <XAxis dataKey="timestamp" type="number" scale={scale} domain={["dataMin", Date.now()/1000]} ticks={monthDates} tickFormatter={formatTimestampMonth} interval={0}/>
                            <YAxis type="number" unit="%" domain={[0, maxPercent]} tickCount={maxPercent / 5 + 1}/>

                            <CartesianGrid stroke="#eee"/>

                            <Area
                                type="linear"
                                dataKey="percentBytes"
                                unit="%"
                                stroke="#e3ac34" strokeWidth={2}
                                fill="#edc97e"
                                dot={true}
                                isAnimationActive={false}
                            />

                            <Tooltip content={renderTooltip}/>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <button className="shadow-box-title yellow">
                {selectedEntry ? formatTimestamp(selectedEntry.timestamp, {
                    dateStyle: "long",
                    timeStyle: "short",
                }) : ""}
            </button>
        </div>

        {selectedEntry && captionPortal.current && createPortal(<EntryInfo entry={selectedEntry} isLatest={selectedEntry.commit === latest.commit}/>, captionPortal.current)}
    </>
}

function formatTimestamp(timestamp, options={}) {
    const date = new Date(timestamp * 1000)

    return new Intl.DateTimeFormat([], options).format(date)
}

function formatTimestampMonth(timestamp) {
    const date = new Date(timestamp * 1000)
    const [day, month, year] = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
    }).format(date).split(" ")

    if (month === "Jan") {
        return year
    }

    return month
}

function EntryInfo({ entry, isLatest }) {
    /*const [commitMessage, setCommitMessage] = useState(null)

    useEffect(async () => {
        fetch(`https://api.github.com/repos/ethteck/papermario/commits/${entry.commit}`)
            .then(resp => resp.json())
            .then(resp => {
                setCommitMessage(resp.commit.message.split("\n")[0])
            })
    }, [entry.commit])*/

    return <div>
        <a href={`https://github.com/ethteck/papermario/commit/${entry.commit}`}>
            {entry.commit.substr(0, 8)}
        </a>
        {isLatest && " (latest)"}
        <table>
            <tbody>
                <tr>
                    <td width="200">Matched</td>
                    <td className="thin align-right">
                        {Math.round((entry.matchingBytes / entry.totalBytes) * 10000) / 100}%
                        ({entry.matchingFuncs}/{entry.totalFuncs} functions)
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
}
