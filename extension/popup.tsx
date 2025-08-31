import React, { useEffect, useState } from "react"

const STORAGE_KEY = "mika-extension-settings"

const defaultSettings = {
  mikaUrl: "http://localhost:8000",
  metabaseUrl: "http://localhost:3000",
  username: "",
  password: ""
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 4,
  marginTop: 16
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  fontSize: 16,
  marginBottom: 8
}

const buttonStyle: React.CSSProperties = {
  background: "#509ee3",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "10px 20px",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  marginTop: 16
}

const containerStyle: React.CSSProperties = {
  maxWidth: 500,
  minWidth: 350,
  margin: "20px auto",
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  padding: 24,
  fontFamily: "inherit"
}

const Popup = () => {
  console.log('[Mika] Popup rendered')
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [loginStatus, setLoginStatus] = useState<string | null>(null)

  useEffect(() => {
    console.log('[Mika] useEffect: loading settings from chrome.storage.sync')
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      console.log('[Mika] chrome.storage.sync.get result:', result)
      if (result[STORAGE_KEY]) {
        setSettings(result[STORAGE_KEY])
        console.log('[Mika] Settings loaded from storage:', result[STORAGE_KEY])
      }
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    console.log("[Mika] handleSave called", settings)
    setLoginStatus(null)
    // Try to login to Mika backend
    try {
      console.log("[Mika] Sending fetch to", `${settings.mikaUrl.replace(/\/$/, "")}/login`)
      const res = await fetch(`${settings.mikaUrl.replace(/\/$/, "")}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: settings.username, password: settings.password })
      })
      console.log("[Mika] Fetch response", res)
      if (!res.ok) {
        setLoginStatus("Login failed: Invalid credentials or server error.")
        return
      }
      const data = await res.json()
      console.log("[Mika] Login success, data:", data)
      // Save token and settings
      chrome.storage.sync.set({
        [STORAGE_KEY]: { ...settings, mikaToken: data.token, mikaTokenExpires: Date.now() + (data.expires_in * 1000) }
      }, () => {
        setSaved(true)
        setLoginStatus("Login successful!")
        setTimeout(() => { setSaved(false); setLoginStatus(null) }, 1500)
      })
    } catch (err) {
      console.error("[Mika] Login error", err)
      setLoginStatus("Login failed: Network error.")
    }
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "#1a73e8" }}>Mika Extension Settings</h2>
      <label style={labelStyle} htmlFor="mikaUrl">Mika Server URL</label>
      <input
        style={inputStyle}
        id="mikaUrl"
        name="mikaUrl"
        value={settings.mikaUrl}
        onChange={handleChange}
        placeholder="http://localhost:8000"
      />
      <label style={labelStyle} htmlFor="metabaseUrl">Metabase URL</label>
      <input
        style={inputStyle}
        id="metabaseUrl"
        name="metabaseUrl"
        value={settings.metabaseUrl}
        onChange={handleChange}
        placeholder="http://localhost:3000"
      />
      <label style={labelStyle} htmlFor="username">Username</label>
      <input
        style={inputStyle}
        id="username"
        name="username"
        value={settings.username}
        onChange={handleChange}
        placeholder="Mika Username"
      />
      <label style={labelStyle} htmlFor="password">Password</label>
      <input
        style={inputStyle}
        id="password"
        name="password"
        type="password"
        value={settings.password}
        onChange={handleChange}
        placeholder="Mika Password"
      />
  <button style={buttonStyle} onClick={() => { console.log('[Mika] Save & Login button clicked'); handleSave(); }}>Save & Login</button>
      {saved && <div style={{ color: "#388e3c", marginTop: 12 }}>Settings saved!</div>}
      {loginStatus && <div style={{ color: loginStatus.includes("success") ? "#388e3c" : "#d32f2f", marginTop: 12 }}>{loginStatus}</div>}
    </div>
  )
}

export default Popup
