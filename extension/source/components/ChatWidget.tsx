import React, { useState, useRef, useEffect } from "react"
import "./chat-widget.css"

interface ChatMessage {
  sender: "user" | "mika"
  text: string
}

const MikaLogo = () => (
  <span style={{ fontWeight: 700, fontSize: 20, marginRight: 8 }}>Mika</span>
)

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "mika", text: "Hi! I’m Mika. Ask me anything about your Metabase data." }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { sender: "user" as const, text: input }
    setMessages((msgs) => [...msgs, userMsg])
    setInput("")
    setLoading(true)
    try {
      // TODO: Replace with your backend API endpoint
      const resp = await fetch("http://localhost:8000/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.sender, content: m.text }))
        })
      })
      const data = await resp.json()
      setMessages((msgs) => [...msgs, { sender: "mika", text: data.reply || "(No response)" }])
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: "mika", text: "Sorry, something went wrong." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mika-chat-widget">
      <button className="mika-chat-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "×" : <MikaLogo />} Chat
      </button>
      {open && (
        <div className="mika-chat-window">
          <div className="mika-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`mika-chat-msg mika-chat-msg-${msg.sender}`}>
                <b>{msg.sender === "mika" ? <MikaLogo /> : "You:"}</b> {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="mika-chat-input-row">
            <input
              className="mika-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask Mika..."
              disabled={loading}
            />
            <button className="mika-chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget
