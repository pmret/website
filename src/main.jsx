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
                    We've reached 100% with the US version of the game. We are currently working on full support for the remaining versions of the game, asset support, and more.
                </p>
                <p>
                    <a href="/progress-us">View the progress chart ›</a>
                </p>
            </div>

            <div className="prose-col">
                <h3>You've reached 100%! Congratulations!</h3>
                <p>
                    It's been an incredible journey so far. Although our progress graph shows 100%, this is only one way of measuring the progress of the project. We still have more work planned to make the project the best that it can be.
                </p>

                <h3 id="aspects">What other areas of the project still need work?</h3>
                <p>
                    Although we have reached 100% on the US version, there are still many areas of the project that need work. These include:
                </p>
                <ul>
                    <li>Assets: Although many assets are properly handled and are moddable, there are still a few assets that are not properly being extracted and rebuilt in a way that would allow for modding efforts.</li>
                    <li>Codebase modernization: We plan to add QOL features to the codebase so the code is as nice as it can be while still compiling to match the original assembly.</li>
                    <li>Documentation: Many variables, functions, enum values, and more are not yet named or documented.</li>
                    <li>Other versions: The remaining versions of the game have not yet been fully matched, and we plan to support all releases of the game.</li>
                </ul>
            </div>

            <div className="prose-col">
                <h3>PC Port?</h3>
                <p>
                    There's a lot of people interested in playing a PC port of Paper Mario. Unfortunately, making a port isn't our focus. Porting the game isn't why we made the decomp project, and it's not a motivating factor in delving into this game. 
                    We have so many exciting goals for the project including decompiling other versions, making modding easier, and further understanding and documenting the codebase; making a port isn't really on our radar.
                </p>

                <h3>Can I make mods with this?</h3>
                <p>
                    Yes. However, we're still working out issues with modding support, so please bear with us. Although the main repo is suitable for modding, Alex has started a fork of the main decomp repo, <a href="https://github.com/nanaian/papermario-dx">papermario-dx</a>, which aims to provide a more convenient base for creating mods.
                </p>

                <h3>How can I help contribute?</h3>
                <p>
                    There plenty of ways to get involved, not limited to helping with asset support, documentation, and code cleanup. Please feel free to get involved!
                </p>
                <p>
                    <a href="https://github.com/pmret/papermario/blob/main/SETUP.md">Setup instructions›</a><br/>
                    <a href="https://github.com/pmret/papermario/issues">Github issues ›</a>
                </p>
                <p>
                    To get involved, please <br/>
                    <a href="https://discord.gg/PgcMpQTzh5">Join our Discord server › </a>
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
            <a className="tab blurple inactive" href="https://discord.gg/PgcMpQTzh5">
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
