import React, { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import clsx from "clsx"

import ProgressPane from "./ProgressPane"

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
                    Different contributors have their own reasons for decompiling Paper Mario. These include:
                </p>
                <ul>
                    <li>Preserving the game</li>
                    <li>Learning more about how the game was engineered</li>
                    <li>Helping speedrunners and glitch-hunters understand why bugs occur</li>
                    <li>Making engine mods easier to create</li>
                    <li>Enjoying decompilation in and of itself</li>
                </ul>
                <h3>How completed is it?</h3>
                <p>
                    We are currently focusing on decompiling the US release of the game, because it is the version that has had the most reverse-engineering work put into it. Other versions have preliminary support, and focus will move to those once US is done.
                </p>
                <p>
                    <a href="/progress-us">View the progress chart ›</a>
                </p>
            </div>

            <div className="prose-col">
                <h3>You're so close to the finish line!</h3>
                <p>
                    It's been an incredible journey so far. Although our progress graph shows that we are almost done, there are a few caveats that should be mentioned:
                </p>
                <ul>
                    <li>Progress will not increase at a constant rate. Plenty of factors influence how fast the number changes, including the availability of contributors, difficulty of remaining functions, and other various issues we may come across.</li>
                    <li>The progress graph is only one way of measuring one aspect of the project's completion. There are <a href="#other-ways">other ways</a> of tracking decompilation progress, and there are plenty of other <a href="#aspects">aspects</a> of the project that can be looked at as a way of gauging completion. We are much further ahead in some areas than others, and most are not easy to quantitatively track.</li>
                </ul>

                <h3 id="other-ways">What other ways of tracking decompilation progress exist?</h3>
                <p>
                    One could consider functions for which there is an equivalent (but non-matching) decompilation. This is a common metric used by these sorts of projects. If our project were to use this metric, it would probably add 1 or 2 percentage points to the total.
                </p>

                <h3 id="aspects">What other aspects of the project can be looked at as a way of gauging completion?</h3>
                <p>
                    In addition to the percentage of decompiled code, there are a few other things that one could measure:
                </p>
                <ul>
                    <li>Assets: Conversion of game assets into modern formats that can be easily read/modified by modern tooling</li>
                    <li>Data: Making sure game data is represented in ways that makes it easy to understand and modify</li>
                    <li>Codebase modernization: Updating the codebase in ways that preserves matching behavior while allowing it to be built with modern tools</li>
                    <li>Documentation: Describing how pieces of the game work, on a micro and macro scale</li>
                    <li>Shiftability: See below</li>
                </ul>

                <h3 id="shiftability">What is "shiftability"?</h3>
                <p>
                    When we say a project is "shiftable", we mean that code can be inserted and removed without breaking the game. By virtue of how these projects are created, they unfortunately contain a number of hard-coded addresses that have not been converted into references. For a matching build of the project, these hard-coded addreses point to the correct places, resulting in a 1:1 equivalent final binary. This comes back to bite us when we try to modify the project, changing the size of a piece of code or data. In this case, any hard-coded address will continue pointing to the same place, which may be in the middle of some other piece of code or even data. Jumping into invalid code or data causes game to crash. We are currently moving toward shiftability, but it's a slow and tedious process.
                </p>
            </div>

            <div className="prose-col">
                <h3>PC Port?</h3>
                <p>
                    There are still many things preventing the possibility of a PC port. Among them, we need a decompiled equivalent for every function in the game, full <a href="#shiftability">shiftability</a>, and much more developed asset support.
                </p>

                <h3>Can I make mods with this?</h3>
                <p>
                    Because the project is not yet <a href="#shiftability">shiftable</a>, trying to use it for modding is not recommended. For now, we recommend using the Star Rod modding tool.
                </p>
                <p>
                    <a href="https://discord.gg/urUm3VG">Join the modding Discord server ›</a>
                </p>

                <h3>How can I help contribute?</h3>
                <p>
                    <a href="https://github.com/pmret/papermario/blob/master/INSTALL.md">Setup instructions ›</a><br/>
                    <a href="https://github.com/pmret/papermario/blob/master/CONTRIBUTING.md">Decompilation tutorial ›</a><br/>
                    <a href="https://github.com/pmret/papermario/issues">Github issues ›</a>
                </p>
            </div>
        </div>
    },
    {
        slug: "/progress-jp",
        name: "Progress (JP)",
        color: "green",
        pane: (props) => <ProgressPane version="jp" color="green" {...props}/>
    },
    {
        slug: "/progress-us",
        name: "Progress (US)",
        color: "yellow",
        pane: (props) => <ProgressPane version="us" color="yellow" {...props}/>
    },
    {
        slug: "/progress-pal",
        name: "Progress (PAL)",
        color: "blue",
        pane: (props) => <ProgressPane version="pal" color="blue" {...props}/>
    },
    {
        slug: "/progress-ique",
        name: "Progress (iQue)",
        color: "orange",
        pane: (props) => <ProgressPane version="ique" color="orange" {...props}/>
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

    function switchToTab(index, pushState, prevTabIndex) {
        if (index === paneIndex || index === tabIndex) return
        setRotation(rotation - 180)

        console.info("switching to tab", index, "from ", prevTabIndex)

        if (pushState)
            history.pushState(null, tabs[index].name, tabs[index].slug)

        setTimeout(() => {
            setTabIndex(index)
            setPaneIndex(index)
            setFlip(!flip)
        }, prevTabIndex === 0 ? 175 : 300) // half the animation time
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
                            switchToTab(index, true, tabIndex)
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
                {tabs[paneIndex].pane({ captionPortal })}
            </div>
        </main>
        {tabIndex !== 0 && <div className="caption outline-invert" ref={captionPortal}></div>}
    </>
}

ReactDOM.render(<App/>, document.getElementById("container"))
