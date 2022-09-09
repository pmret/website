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
        pane: () => <div className="prose">
            <div className="prose-col">
                <h3>What is this?</h3>
                <p>
                    <a href="https://github.com/pmret/papermario">papermario</a> is an ongoing project to reverse-engineer the sourcecode for <a href="https://wikipedia.org/wiki/Paper_Mario_(video_game)">Paper Mario</a> on the Nintendo 64. The game's assembly code is manually decompiled into C source code. We also split out assets (such as backgrounds, sprites, maps, and text) from an original game copy into more modern formats. The C code and assets can then be <i>recompiled</i> to create a 1-to-1 ("matching") copy of the game.
                </p>

                <h3>Why?</h3>
                <p>
                    Different contributors have their own reasons for decompiling Paper Mario.<br/>
                    These include:
                </p>
                <ul>
                    <li>Preserving the game</li>
                    <li>Learning more about how the game was engineered</li>
                    <li>Helping speedrunners and glitch-hunters understand why bugs occur</li>
                    <li>Making engine mods easier to create</li>
                    <li>Because its a fun puzzle</li>
                </ul>

                <h3>How completed is it?</h3>
                <p>
                    We are currently focusing on decompiling the US release of the game, because it is the version that has had the most reverse-engineering work put into it. JP is supported as a proof-of-concept, while EU will come later.
                </p>
                <p>
                    <a href="/progress-us">View the progress chart ›</a>
                </p>
            </div>

            <div className="prose-col">
                <h3>Would a PC port be possible?</h3>
                <p>
                    Yes! Eventually.
                </p>
                <p>
                    Completed decompilations, such as <a href="https://github.com/n64decomp/sm64">sm64</a>, have enjoyed efforts to port the game to other platforms. For papermario, a PC port is largely infeasible until much much more of the game's code is decompiled.
                </p>

                <h3>Can I make mods with this?</h3>
                <p>
                    It's possible, but its not recommended unless you know what you're doing, and really need to be able to make sweeping changes to the core game engine. The Star Rod modding tool is very powerful and allows for quite a lot of flexibility. If you do decide to attempt to use papermario as a base for your mod, Star Rod can be used to view and edit most assets with ease.
                </p>
                <p>
                    Currently, papermario is not <a href="https://github.com/pmret/papermario/issues/367">shiftable</a>. In making changes to the source code, data and functions must not be changed in a way that makes them compile to a larger binary, or the game will crash. This makes modding a lot more difficult that it would be if the game was shiftable.
                </p>
                <p>
                    <a href="https://discord.gg/urUm3VG">Join the modding Discord server ›</a>
                </p>

                <h3>How can I help?</h3>
                <p>
                    <a href="https://github.com/pmret/papermario/blob/master/INSTALL.md">Setup instructions ›</a><br/>
                    <a href="https://github.com/pmret/papermario/blob/master/CONTRIBUTING.md">Decompilation tutorial ›</a><br/>
                    <a href="https://github.com/pmret/papermario/issues">Github issues ›</a>
                </p>
            </div>
        </div>
    },
    {
        slug: "/progress-us",
        name: "Progress (US)",
        color: "yellow",
        pane: (props) => <ProgressPane version="us" color="yellow" {...props}/>
    },
    {
        slug: "/progress-jp",
        name: "Progress (JP)",
        color: "green",
        pane: (props) => <ProgressPane version="jp" color="green" {...props}/>
    },
    /*{
        slug: "/contributors",
        name: "Contributors",
        color: "teal",
        pane: (props) => <Contributors {...props}/>
    },*/
]

let routedTabIndex = tabs.findIndex(tab => tab.slug === document.location.pathname)
if (routedTabIndex == -1) routedTabIndex = 0

function App() {
    const [paneIndex, setPaneIndex] = useState(routedTabIndex)
    const [tabIndex, setTabIndex] = useState(routedTabIndex)
    const [rotation, setRotation] = useState(0)
    const [flip, setFlip] = useState(false)
    const pane = useRef()

    function switchToTab(index, pushState) {
        if (index === paneIndex || index === tabIndex) return

        console.info("switching to tab", index)

        setRotation(rotation - 180)
        setTabIndex(index)

        if (pushState)
            history.pushState(null, tabs[index].name, tabs[index].slug)

        setTimeout(() => {
            setPaneIndex(index)
            setFlip(!flip)
        }, 300) // half the animation time
    }

    useEffect(() => {
        function listener() {
            switchToTab(tabs.findIndex(tab => tab.slug === window.location.pathname), false)
        }

        window.addEventListener("popstate", listener)
        return () => window.removeEventListener("popstate", listener)
    }, [rotation, flip, tabIndex, paneIndex])

    const captionPortal = useRef()

    return <>
        <nav>
            {tabs.map((tab, index) => {
                return <a
                    key={tab.name}
                    className={clsx("tab", tab.color, { "inactive": index !== tabIndex })}
                    aria-selected={index === tabIndex}
                    href={tab.slug}
                    onClick={evt => {
                        const q = window.matchMedia("(prefers-reduced-motion: reduce)")
                        if (!q.matches) {
                            switchToTab(index, true)
                            evt.preventDefault()
                        }
                    }}
                >
                    {tab.name}
                </a>
            })}
            <a className="tab blurple inactive" href="https://discord.gg/urUm3VG">
                Discord
            </a>
            <a className="tab github inactive" href="https://github.com/pmret/papermario">
                GitHub
            </a>
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
