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
                    <a href="https://github.com/pmret/papermario">papermario</a> is an ongoing project to reverse-engineer the source code for <a href="https://wikipedia.org/wiki/Paper_Mario_(video_game)">Paper Mario</a> on the Nintendo 64. The game's assembly code is manually decompiled into C source code. The project also extracts game assets (such as backgrounds, sprites, maps, and text) from an original game copy into more modern formats. The C code and assets can then be <i>recompiled</i> to create a 1-to-1 ("matching") copy of the game.
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
                    One could consider functions for which there is an equivalent (but non-matching) decompilation. This is a common metric used by these sorts of projects. We could also consider portions of functions rather than entire functions. The way we choose to measure progress is merely by the number of fully-decompiled functions that are byte-equivalent to the original game. This is the most straightforward way to measure progress, and most decompilation projects use this same metric.
                </p>

                <h3 id="aspects">What other aspects of the project can be looked at as a way of gauging completion?</h3>
                <p>
                    In addition to the percentage of decompiled code, there are a few other things that one could measure:
                </p>
                <ul>
                    <li>Assets: Conversion of game assets into modern formats that can be easily read/modified by modern tooling</li>
                    <li>Data: Making sure game data is represented in ways that makes it easy to understand and modify</li>
                    <li>Codebase modernization: Updating the codebase so it can be built with modern tools</li>
                    <li>Documentation: Describing how pieces of the game work and naming functions and variables</li>
                </ul>
            </div>

            <div className="prose-col">
                <h3>PC Port?</h3>
                <p>
                    There is still work to be done before work can be started on a PC port. Among the remaining tasks, we need a decompiled equivalent for every function in the game and full extraction / rebuilding support for all game assets.
                </p>

                <h3>Can I make mods with this?</h3>
                <p>
                    Yes. However, we're still working out issues with modding support, so please bear with us. Although the main repo is suitable for modding, Alex has started a fork of the main decomp repo, <a href="https://github.com/nanaian/papermario-dx">papermario-dx</a>, which aims to provide a more convenient base for creating mods.
                </p>

                <h3>How can I help contribute?</h3>
                <p>
                    The remaining functions to be matched on the US version of the game are extremely difficult and not really suitable for beginners. That being said, there plenty of other ways to get involved, not limited to helping with asset support, documentation, and code cleanup. Please feel free to get involved!
                </p>
                <p>
                    <a href="https://github.com/pmret/papermario/blob/main/INSTALL.md">Setup instructions ›</a><br/>
                    <a href="https://github.com/pmret/papermario/issues">Github issues ›</a>
                </p>
                <p>
                    For modding resources and discussion of the project, please <br/>
                    <a href="https://discord.gg/urUm3VG">Join our Discord server › </a>
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
