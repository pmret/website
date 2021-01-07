import React, { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import clsx from "clsx"

import ProgressPane from "./ProgressPane"
import Contributors from "./Contributors"

const tabs = [
    {
        slug: "/",
        name: "Info",
        color: "red",
        pane: () => <div>
            <p className="outline-invert">
                Welcome to the Paper Mario Reverse-Engineering website!
            </p>
        </div>,
    },
    {
        slug: "/progress",
        name: "Progress",
        color: "yellow",
        pane: (props) => <ProgressPane {...props}/>
    },
    {
        slug: "/party",
        name: "Party",
        color: "teal",
        pane: (props) => <Contributors {...props}/>
    },
]

let routedTabIndex = tabs.findIndex(tab => tab.slug === document.location.pathname)
if (routedTabIndex == -1) routedTabIndex = 0

function App() {
    const [paneIndex, setPaneIndex] = useState(routedTabIndex)
    const [tabIndex, setTabIndex] = useState(routedTabIndex)
    const [rotation, setRotation] = useState(0)
    const [flip, setFlip] = useState(false)
    const pane = useRef()

    function switchToTab(index) {
        if (index === paneIndex || index === tabIndex) return

        console.info("switching to tab", index)

        setRotation(rotation - 180)
        setTabIndex(index)

        history.pushState(null, tabs[index].name, tabs[index].slug)

        setTimeout(() => {
            setPaneIndex(index)
            setFlip(!flip)
        }, 300) // half the animation time
    }

    useEffect(() => {
        function listener() {
            switchToTab(tabs.findIndex(tab => tab.slug === document.location.pathname))
        }

        window.addEventListener("popstate", listener)
        return () => window.removeEventListener("popstate", listener)
    }, [rotation, flip, tabIndex, paneIndex])

    const captionPortal = useRef()

    return <>
        <nav>
            {tabs.map((tab, index) => {
                return <button
                    key={tab.name}
                    className={clsx("tab", tab.color, { "inactive": index !== tabIndex })}
                    onClick={() => {
                        switchToTab(index)
                    }}
                >
                    {tab.name}
                </button>
            })}
            <button className="tab blurple inactive" onClick={() => window.open("https://discord.gg/urUm3VG")}>
                Discord
            </button>
            <button className="tab github inactive" onClick={() => window.open("https://github.com/pmret/papermario")}>
                GitHub
            </button>
        </nav>
        <main id="main" ref={pane} className={clsx(tabs[paneIndex].color)} style={{
            transform: `perspective(4000px) rotateX(${rotation}deg)`,
        }}>
            <div style={{
                display: "flex",
                flex: 1,
                transform: `rotateX(${flip ? '180deg' : '0deg'})`,
            }}>
                {tabs[paneIndex].pane({ captionPortal, nonce: rotation })}
            </div>
        </main>
        <div className="caption outline-invert" ref={captionPortal}></div>
    </>
}

ReactDOM.render(<App/>, document.getElementById("container"))
