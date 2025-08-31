import React, { useState, useRef, useEffect } from "react"
import "./chat-widget.css"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

interface ChatMessage {
  sender: "user" | "assistant"
  text: string
  sql?: string // Optional SQL/code block for Mika replies
}

// Error boundary for ReactMarkdown rendering
// Error boundary that falls back to plain text if Markdown rendering fails
class MarkdownErrorBoundary extends React.Component<{children: React.ReactNode, fallbackText: string}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, fallbackText: string}) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: any, info: any) { /* Optionally log error */ }
  render() {
    if (this.state.hasError) {
      // Fallback: show Mika's reply as plain text, preserving line breaks (not red)
      return <div style={{whiteSpace: 'pre-line', color: '#222', fontWeight: 400}}>{this.props.fallbackText}</div>
    }
    return this.props.children
  }
}

const MikaLogo = () => (
  <span style={{ fontWeight: 700, fontSize: 20, marginRight: 8 }}>Mika</span>
)

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "assistant", text: "Hi! I’m Mika. Ask me anything about your Metabase data." }
  ])
  const [loading, setLoading] = useState(false)
  const [backendUrl, setBackendUrl] = useState<string | null>(null)
  const [mikaToken, setMikaToken] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open])

  // Load backend URL from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get(["mika-extension-settings"], (result) => {
      const settings = result["mika-extension-settings"]
      if (settings && settings.mikaUrl) {
        setBackendUrl(settings.mikaUrl.replace(/\/$/, ""))
      }
      if (settings && settings.mikaToken) {
        setMikaToken(settings.mikaToken)
      }
    })
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || !backendUrl || !mikaToken) return
    const userMsg: ChatMessage = { sender: "user", text: input }
    setMessages((msgs) => [...msgs, userMsg])
    setInput("")
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 40000)
      const resp = await fetch(`${backendUrl}/ai/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mikaToken}`
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
          }))
        }),
        signal: controller.signal
      })
      clearTimeout(timeout)
      if (!resp.ok) {
        setMessages((msgs) => [
          ...msgs,
          { sender: "assistant", text: `Error: ${resp.status} ${resp.statusText}` }
        ])
        return
      }
      const data = await resp.json()
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: data.reply || "(No response)", sql: data.sql && data.sql.trim() ? data.sql : undefined }
      ])
    } catch (e: any) {
      let msg = "Sorry, something went wrong."
      if (e.name === "AbortError") {
        msg = "Request timed out. Please try again."
      }
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: msg }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Auto-grow textarea height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [input, open]);

  // Copy SQL to clipboard
  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql)
  }

  return (
    <div className="mika-chat-widget">
      <button className="mika-chat-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "×" : <MikaLogo />} Chat
      </button>
      {open && (
        <div className="mika-chat-window">
          <div className="mika-chat-messages">
            {messages.map((msg, i) => {
              const isUser = msg.sender === "user"
              return (
                <div key={i} className={`mika-chat-row ${isUser ? "user" : "assistant"}`}>
                  <div
                    className={`mika-chat-bubble mika-chat-bubble-${msg.sender}`}
                    style={{
                      borderRadius: 18,
                      margin: "8px 0",
                      boxShadow: isUser ? "0 1px 4px rgba(0,0,0,0.04)" : "0 1px 4px rgba(26,115,232,0.06)",
                      padding: msg.sql ? "16px 16px 8px 16px" : "12px 16px"
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 14, color: isUser ? "#555" : undefined }}>
                      {isUser ? "You" : <MikaLogo />}
                    </div>
                    {/* Render Markdown for assistant, with custom code block renderer and copy button */}
                    {msg.sender === "assistant" ? (
                      <MarkdownErrorBoundary fallbackText={typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, inline, className, children, ...props}) {
                              try {
                                const safeClass = typeof className === 'string' ? className : '';
                                const match = /language-(\w+)/.exec(safeClass);
                                let codeString = '';
                                // Defensive: flatten and stringify children for code blocks
                                if (typeof children === 'string') {
                                  codeString = children;
                                } else if (Array.isArray(children)) {
                                  codeString = children.join('');
                                } else if (children !== undefined && children !== null) {
                                  codeString = String(children);
                                }
                                // Log for debugging if children is unexpected
                                if (typeof children !== 'string' && !Array.isArray(children)) {
                                  console.warn('Unexpected code block children:', children);
                                }
                                if (!inline) {
                                  return (
                                    <div style={{ position: 'relative', margin: '12px 0' }}>
                                      <SyntaxHighlighter
                                        style={dracula}
                                        language={match ? match[1] : undefined}
                                        PreTag="div"
                                        customStyle={{
                                          borderRadius: 10,
                                          padding: '14px 16px',
                                          fontSize: 15,
                                          margin: 0,
                                          background: '#23272e',
                                          border: '1px solid #1a2330',
                                          overflowX: 'auto',
                                        }}
                                      >
                                        {codeString}
                                      </SyntaxHighlighter>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(codeString)}
                                        style={{
                                          position: 'absolute',
                                          top: 8,
                                          right: 8,
                                          background: '#e3f2fd',
                                          border: 'none',
                                          borderRadius: 6,
                                          padding: '2px 8px',
                                          fontSize: 13,
                                          color: '#1760c4',
                                          cursor: 'pointer',
                                          fontWeight: 500
                                        }}
                                        title="Copy code"
                                      >Copy</button>
                                    </div>
                                  );
                                } else {
                                  return <code className={safeClass} style={{ background: '#f3f6fa', borderRadius: 4, padding: '2px 4px', fontSize: 15 }}>{codeString}</code>;
                                }
                              } catch (err) {
                                console.error('Error rendering code block:', err, children);
                                return <code style={{ background: '#f3f6fa', borderRadius: 4, padding: '2px 4px', fontSize: 15 }}>[code block could not be rendered]</code>;
                              }
                            }
                          }}
                        >
                          {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
                        </ReactMarkdown>
                      </MarkdownErrorBoundary>
                    ) : (
                      <div style={{ whiteSpace: "pre-line", fontSize: 16 }}>{typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}</div>
                    )}
                    {msg.sql && (
                      <div style={{ position: 'relative', marginTop: 12 }}>
                        <pre
                          className="mika-sql-block"
                          style={{
                            background: "#f3f6fa",
                            color: "#2d3a4a",
                            borderRadius: 10,
                            padding: "12px 14px",
                            fontFamily: "Consolas, Menlo, Monaco, 'Liberation Mono', monospace",
                            fontSize: 15,
                            overflowX: "auto",
                            border: "1px solid #e0e6ed",
                            margin: 0
                          }}
                        ><code style={{ background: 'none', padding: 0 }}>{msg.sql}</code></pre>
                        <button
                          onClick={() => handleCopy(msg.sql!)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#e3f2fd',
                            border: 'none',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 13,
                            color: '#1760c4',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          title="Copy SQL"
                        >Copy</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="mika-chat-input-row">
            <textarea
              ref={inputRef}
              className="mika-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask Mika..."
              disabled={loading}
              style={{ fontFamily: "inherit", fontSize: 16, resize: 'none', minHeight: 36, maxHeight: 120, overflow: 'auto' }}
              rows={1}
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
