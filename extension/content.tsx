import type { PlasmoCSConfig } from "plasmo"
import React from "react"
import { createRoot } from "react-dom/client"
import ChatWidget from "./source/components/ChatWidget"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

console.log(
  "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
)

// Inject Mika chat widget into the page
const mikaRoot = document.createElement("div")
mikaRoot.id = "mika-chat-root"
document.body.appendChild(mikaRoot)

createRoot(mikaRoot).render(<ChatWidget />)