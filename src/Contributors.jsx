import React, { useState } from "react"
import { createPortal } from "react-dom"
import clsx from "clsx"

import cdownURL from "./cdown.svg"

function CDown() {
    return <img src={cdownURL} style={{ width: "1em", height: "1em", verticalAlign: "-5px" }}/>
}

const contributors = [
    {
        name: "Ethan",
        avatar: "https://avatars2.githubusercontent.com/u/2985314?s=400",
        url: "https://github.com/ethteck",
        description: <div>
        </div>,
    },
    {
        name: "stuckpixel",
        avatar: "https://avatars3.githubusercontent.com/u/3634616?s=400",
        url: "https://github.com/pixel-stuck",
        description: <div>
        </div>,
    },
    {
        name: "alex",
        avatar: "https://avatars3.githubusercontent.com/u/9429556?s=400",
        url: "https://github.com/nanaian",
        description: <div>
        </div>,
    },
]

export default function Contributors({ captionPortal }) {
    const [selected, setSelected] = useState(0)
    const { name, description, url } = contributors[selected]

    return <div style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: ".5em", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="avatars">
                {contributors.map((contributor, i) => {
                    let t = (Math.PI * 2) * ((i - selected) / contributors.length) + Math.PI/2

                    let x = 150 * Math.cos(t) + 200
                    let y = 140 * Math.sin(t) + 200

                    return <img
                        key={contributor.name}
                        className={clsx("avatar", { inactive: i !== selected })}
                        onClick={() => setSelected(i)}
                        src={contributor.avatar}
                        alt={contributor.name}
                        style={{ top: y + "px", left: x + "px", zIndex: y }}
                    />
                })}
            </div>

            <button className="teal" style={{ width: "80%", cursor: "pointer" }} onClick={() => window.open(url)}>
                {name}
            </button>
        </div>

        <div>
            <div className="shadow-box" style={{ width: "27em", height: "20em" }}>
                <div className="shadow-box-inner" style={{ backgroundImage: `url(http://placekitten.com/800/${600 + Math.floor(Math.random() * 100)})`, backgroundSize: "cover" }}>
                </div>
            </div>
        </div>

        {captionPortal.current && createPortal(<div>
            {description}
        </div>, captionPortal.current)}
    </div>
}
