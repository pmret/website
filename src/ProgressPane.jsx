import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Area, XAxis, YAxis, AreaChart, CartesianGrid, Tooltip } from "recharts"
import useDimensions from "use-element-dimensions"

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

export default function ProgressPane({ captionPortal }) {
    const [data, setData] = useState(null)

    useEffect(() => {
        fetchData()
            .then(data => setData(data))
    }, [])

    // TODO: cute spin animation when data loads

    return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {data && <DataView data={data} captionPortal={captionPortal}/>}
        {!data && "Loading..."}
    </div>
}

const MONTH = 2678400

function DataView({ data, captionPortal }) {
    const [chartDimensions, chartRef] = useDimensions()
    const latest = data[data.length - 1]
    const oldest = data[0]

    let monthDates = []
    for (let i = new Date(1583020800000); i < new Date(latest.timestamp); i.setMonth(i.getMonth() + 1)) {
        if (i > new Date(oldest.timestamp)) {
            monthDates.push(i)
        }
    }

    console.log(monthDates)

    const [selectedEntry, setSelectedEntry] = useState(null)

    function renderTooltip(tip) {
        const entry = data.find(row => row.timestamp === tip.label)

        setSelectedEntry(entry)

        return <span/>
    }

    return <>
        <table width="250" className="outline-invert">
            <tbody>
                <tr>
                    <td>Matched</td>
                    <td className="thin align-right">{Math.round((latest.matchingBytes / latest.totalBytes) * 10000) / 100}%</td>
                </tr>
            </tbody>
        </table>

        <div className="shadow-box flex-grow">
            <div className="shadow-box-inner" style={{ paddingRight: ".7em", paddingTop: ".7em", "--text-outline": "transparent" }}>
                <div className="progress-chart" ref={chartRef}>
                    {chartDimensions.width > 0 && <AreaChart width={chartDimensions.width} height={chartDimensions.height} data={data}>
                        <XAxis dataKey="timestamp" type="number" scale="time" domain={["dataMin", "dataMax"]} ticks={monthDates} tickFormatter={formatDate}/>
                        <YAxis type="number" unit="%" domain={[0, 100]} tickCount={11}/>

                        <CartesianGrid stroke="#eee" horizontalPoints={monthDates}/>

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
                    </AreaChart>}
                </div>
            </div>

            <button className="shadow-box-title yellow">
                {selectedEntry ? formatDate(selectedEntry.timestamp, {
                    dateStyle: "long",
                    timeStyle: "short",
                }) : ""}
            </button>
        </div>

        {selectedEntry && captionPortal.current && createPortal(<EntryInfo entry={selectedEntry}/>, captionPortal.current)}
    </>
}

function formatDate(timestamp, options={}) {
    const date = new Date(timestamp * 1000)

    return new Intl.DateTimeFormat([], options).format(date)
}

function EntryInfo({ entry }) {
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
