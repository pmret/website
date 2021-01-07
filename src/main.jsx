import React, { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import clsx from "clsx"

import ProgressPane from "./ProgressPane"

const tabs = [
    {
        slug: "/",
        name: "Info",
        color: "red",
        pane: () => <div>I am the info page</div>,
    },
    {
        slug: "/progress",
        name: "Progress",
        color: "yellow",
        pane: (props) => <ProgressPane {...props}/>
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
    let lockTabs = false // not state

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
                        if (lockTabs) return
                        lockTabs = true

                        switchToTab(index)
                    }}
                >
                    {tab.name}
                </button>
            })}
        </nav>
        <main id="main" ref={pane} className={clsx(tabs[paneIndex].color)} style={{
            transform: `perspective(4000px) rotateX(${rotation}deg)`,
        }}>
            <div style={{
                display: "flex",
                flex: 1,
                transform: `rotateX(${flip ? '180deg' : '0deg'})`,
                overflow: "hidden",
            }}>
                {tabs[paneIndex].pane({ captionPortal })}
            </div>
        </main>
        <div class="caption outline-invert" ref={captionPortal}></div>
    </>
}

ReactDOM.render(<App/>, document.getElementById("container"))
