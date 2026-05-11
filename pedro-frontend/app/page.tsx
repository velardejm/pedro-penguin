"use client"

import { useState } from "react"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return

    // Add user message to history
    const userMessage = { role: "user", content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    // Send to Next.js API route
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages })
    })

    const data = await response.json()

    // Add Pedro's reply to history
    const pedroMessage = { role: "assistant", content: data.reply }
    setMessages([...updatedMessages, pedroMessage])
    setLoading(false)
  }

  // Send on Enter key
  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🐧 Pedro the Penguin
      </h1>

      {/* Chat History */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-32">
            Say hi to Pedro! SQUAWK!
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-xs ${msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-100 text-gray-800 self-start"
              }`}
          >
            {msg.role === "assistant" && (
              <span className="font-bold">🐧 Pedro: </span>
            )}
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 text-gray-800 self-start p-3 rounded-lg">
            🐧 Pedro is thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Pedro something..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  )
}