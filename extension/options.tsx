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
  maxWidth: 400,
  margin: "40px auto",
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  padding: 32,
  fontFamily: "inherit"
}

const Options = () => {
  console.log('[Mika] Options rendered')
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginStatus, setLoginStatus] = useState<string | null>(null)

  useEffect(() => {
    console.log('[Mika] useEffect: loading settings from chrome.storage.sync')
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      console.log('[Mika] chrome.storage.sync.get result:', result)
      if (chrome.runtime.lastError) {
        setError("Failed to load settings: " + chrome.runtime.lastError.message)
        return
      }
      const syncSettings = result[STORAGE_KEY] || {}
      // Load sensitive fields from local
      chrome.storage.local.get([STORAGE_KEY], (localResult) => {
        console.log('[Mika] chrome.storage.local.get result:', localResult)
        if (chrome.runtime.lastError) {
          setError("Failed to load sensitive settings: " + chrome.runtime.lastError.message)
          return
        }
        const localSettings = localResult[STORAGE_KEY] || {}
        setSettings({
          ...defaultSettings,
          ...syncSettings,
          ...localSettings // password from local overrides sync
        })
        console.log('[Mika] Settings loaded:', {
          ...defaultSettings,
          ...syncSettings,
          ...localSettings
        })
      })
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setError(null)
    setLoginStatus(null)
    // Validate required fields
    if (!settings.mikaUrl || !settings.metabaseUrl || !settings.username) {
      setError("Please fill in all required fields.")
      return
    }
    // Save non-sensitive settings to sync
    const syncSettings = { ...settings }
    delete syncSettings.password
    chrome.storage.sync.set({ [STORAGE_KEY]: syncSettings }, () => {
      if (chrome.runtime.lastError) {
        setError("Failed to save settings: " + chrome.runtime.lastError.message)
        return
      }
      // Save sensitive fields to local
      chrome.storage.local.set({ [STORAGE_KEY]: { password: settings.password } }, async () => {
        if (chrome.runtime.lastError) {
          setError("Failed to save sensitive settings: " + chrome.runtime.lastError.message)
          return
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
        // --- LOGIN LOGIC ---
        try {
          console.log('[Mika] Attempting login to', `${settings.mikaUrl.replace(/\/$/, "")}/login`)
          const res = await fetch(`${settings.mikaUrl.replace(/\/$/, "")}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: settings.username, password: settings.password })
          })
          console.log('[Mika] Login fetch response:', res)
          if (!res.ok) {
            setLoginStatus("Login failed: Invalid credentials or server error.")
            return
          }
          const data = await res.json()
          console.log('[Mika] Login success, data:', data)
          setLoginStatus("Login successful!")
        } catch (err) {
          console.error('[Mika] Login error', err)
          setLoginStatus("Login failed: Network error.")
        }
      })
    })
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
        placeholder="Metabase Username"
      />
      <label style={labelStyle} htmlFor="password">Password</label>
      <input
        style={inputStyle}
        id="password"
        name="password"
        type="password"
        value={settings.password}
        onChange={handleChange}
        placeholder="Metabase Password"
      />
  <button style={buttonStyle} onClick={handleSave}>Save & Login</button>
  {saved && <div style={{ color: "#388e3c", marginTop: 12 }}>Settings saved!</div>}
  {loginStatus && <div style={{ color: loginStatus.includes("success") ? "#388e3c" : "#d32f2f", marginTop: 12 }}>{loginStatus}</div>}
  {error && <div style={{ color: "#d32f2f", marginTop: 12 }}>{error}</div>}
    </div>
  )
}

export default Options
