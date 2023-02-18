import React, { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { Area, XAxis, YAxis, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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

    let totalBytes = latest.totalBytes
    // TODO hack for JP since we haven't mapped all the segments
    if (version !== "us") {
        totalBytes = 3718668
    }

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
    const oldest = data[0]
    const { stroke, fill } = colors[color]

    const [selectedEntry, setSelectedEntry] = useState(latest)

    if (!selectedEntry && latest) {
        setSelectedEntry(latest)
    }

    function renderTooltip(tip) {
        const entry = data.find(row => row.timestamp === tip.label)

        if (entry) {
            setSelectedEntry(entry)
        }

        return <span/>
    }

    const maxPercent = latest ? Math.ceil(latest.percentBytes / 25) * 25 : 25

    const monthDates = useMemo(() => {
        const monthDates = []

        if (oldest) {
            let date = new Date(oldest.timestamp * 1000)
            date.setDate(0)

            while (date < Date.now()) {
                monthDates.push(date / 1000)

                date = new Date(date) // clone
                date.setMonth(date.getMonth() + 1)
            }

            return monthDates
        }
    }, [oldest && oldest.timestamp])

    return <>
        <h1 className="aria-only">
            {latest && formatPercent(latest.percentBytes)} decompiled
        </h1>
        <div className="shadow-box flex-grow">
            <div className="shadow-box-inner" style={{ paddingRight: ".7em", paddingTop: ".7em", "--text-outline": "transparent", background: "#e2e1d8" }}>
                <div className="progress-chart">
                    <ResponsiveContainer>
                        <AreaChart data={data}>
                            <XAxis dataKey="timestamp" type="number" scale="linear" domain={["dataMin", Date.now()/1000]} ticks={monthDates} tickFormatter={formatTimestampMonth}/>
                            <YAxis type="number" unit="%" domain={[0, maxPercent]} tickCount={maxPercent / 5 + 1}/>

                            <CartesianGrid stroke="#d9d0c9"/>

                            <Area
                                type="linear"
                                dataKey="percentBytes"
                                unit="%"
                                stroke={stroke} strokeWidth={2}
                                fill={fill}
                                dot={true}
                                isAnimationActive={false}
                            />

                            <Tooltip content={renderTooltip}/>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
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
