import type { PlasmoCSConfig } from "plasmo"
import React from "react"
import { createRoot } from "react-dom/client"
import ChatWidget from "./source/components/ChatWidget"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"] // Keep broad for now, but gate at runtime
}

// Helper to get allowed hosts from chrome.storage.sync (from settings)
function getAllowedHosts(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["mika-extension-settings"], (result) => {
      const settings = result["mika-extension-settings"]
      if (settings && settings.metabaseUrl) {
        try {
          const url = new URL(settings.metabaseUrl)
          resolve([url.hostname])
        } catch {
          resolve([])
        }
      } else {
        resolve([])
      }
    })
  })
}

;(async () => {
  const allowedHosts = await getAllowedHosts()
  if (!allowedHosts.includes(window.location.hostname)) {
    // Not an allowed Metabase host, do not inject
    return
  }
  // Inject Mika chat widget into the page
  const mikaRoot = document.createElement("div")
  mikaRoot.id = "mika-chat-root"
  document.body.appendChild(mikaRoot)
  createRoot(mikaRoot).render(<ChatWidget />)
})()