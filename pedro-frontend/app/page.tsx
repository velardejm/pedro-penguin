"use client"

import { useState, useRef } from "react"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  async function sendMessage(text) {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage = { role: "user", content: messageText }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    // Get Pedro's text reply
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages })
    })
    const data = await response.json()

    const pedroMessage = { role: "assistant", content: data.reply }
    setMessages([...updatedMessages, pedroMessage])
    setLoading(false)

    // Make Pedro speak the reply
    speakReply(data.reply)
  }

  async function speakReply(text) {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.play()
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    audioChunks.current = []

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data)
    }

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" })
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.wav")

      // Send to Whisper for transcription
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      })
      const data = await response.json()

      // Auto send transcribed text to Pedro
      if (data.text) sendMessage(data.text)
    }

    mediaRecorder.current.start()
    setRecording(true)
  }

  function stopRecording() {
    mediaRecorder.current.stop()
    setRecording(false)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🐧 Pedro the Penguin
      </h1>

      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-32">
            Say hi to Pedro! SQUAWK!
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-xs ${
              msg.role === "user"
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
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>

        {/* Mic button */}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-lg text-white ${
            recording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {recording ? "⏹ Stop" : "🎤 Speak"}
        </button>
      </div>
    </main>
  )
}