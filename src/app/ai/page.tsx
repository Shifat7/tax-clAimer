"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { getByokConfig, setByokConfig, clearByokConfig, type ByokConfig } from "@/lib/storage"
import { callLlm, type LlmMessage } from "@/lib/llm"

const PRESETS = [
  { label: "What can I claim?", prompt: "What work-related deductions can a typical salaried employee claim? Give me the most common ones with ATO limits." },
  { label: "$300 rule", prompt: "Explain the $300 instant asset write-off threshold for work-related expenses. How does it work for items under and over $300?" },
  { label: "WFH methods", prompt: "Compare the fixed-rate method ($0.67/hr) and the actual cost method for claiming work-from-home expenses. Which is better for someone who works from home 2 days a week?" },
  { label: "Records to keep", prompt: "What records do I need to keep for my tax deductions, and for how long? Give me a practical checklist." },
]

function SettingsPanel({
  config,
  onSave,
  onClear,
}: {
  config: ByokConfig
  onSave: (c: ByokConfig) => void
  onClear: () => void
}) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [model, setModel] = useState(config.model)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model: model.trim() || "gpt-4o-mini" })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="border border-neutral-200 rounded-2xl bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-neutral-900">Your AI provider</p>
          <p className="text-xs text-neutral-500">Bring your own API key. The key stays on your device and is only sent to the endpoint you specify.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-neutral-500 block mb-1">API endpoint</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-taxmate-400 transition"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 block mb-1">API key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-taxmate-400 transition pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 block mb-1">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o-mini"
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-taxmate-400 transition"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="rounded-xl bg-taxmate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-taxmate-700 transition"
        >
          {saved ? "Saved" : "Save settings"}
        </button>
        <button
          onClick={onClear}
          className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition"
        >
          Clear key
        </button>
      </div>

      {apiKey && (
        <p className="text-xs text-emerald-600">Key configured · {model || "gpt-4o-mini"} @ {baseUrl}</p>
      )}
    </div>
  )
}

function ChatMessage({ message }: { message: LlmMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-taxmate-600 text-white rounded-br-md"
            : "bg-neutral-100 text-neutral-800 rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

export default function AiAssistant() {
  const [config, setConfig] = useState<ByokConfig>({ baseUrl: "", apiKey: "", model: "" })
  const [loaded, setLoaded] = useState(false)
  const [messages, setMessages] = useState<LlmMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const chatEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const c = getByokConfig()
    setConfig(c)
    setLoaded(true)
  }, [])

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSaveConfig = (c: ByokConfig) => {
    setByokConfig(c)
    setConfig(c)
  }

  const handleClearConfig = () => {
    clearByokConfig()
    setConfig({ baseUrl: "", apiKey: "", model: "" })
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    if (!config.apiKey) {
      setError("Configure your API key above before chatting.")
      return
    }

    setError("")
    const userMsg: LlmMessage = { role: "user", content: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput("")
    setLoading(true)

    try {
      const result = await callLlm(updated, config)
      setMessages((prev) => [...prev, { role: "assistant", content: result.content }])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!loaded) return null

  const hasKey = !!config.apiKey

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-taxmate-50/20 to-white">
      <nav className="flex items-center gap-4 px-6 py-5 max-w-4xl mx-auto border-b border-neutral-100">
        <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-700 transition flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Home
        </Link>
        <span className="text-sm font-bold tracking-tight">AI Assistant</span>
      </nav>

      <main className="px-6 pb-16 max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </span>
          <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
          <p className="mt-2 text-neutral-500 max-w-xl mx-auto">
            Ask tax questions and get answers powered by your own LLM provider. Your API key stays on your device.
          </p>
        </div>

        <div className="space-y-6">
          <SettingsPanel config={config} onSave={handleSaveConfig} onClear={handleClearConfig} />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {hasKey && (
            <>
              {/* Chat area */}
              <div className="border border-neutral-200 rounded-2xl bg-white min-h-[300px] flex flex-col">
                <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-neutral-400 text-sm">Ask a tax question to get started.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {PRESETS.map((p) => (
                          <button
                            key={p.label}
                            onClick={() => sendMessage(p.prompt)}
                            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 hover:border-taxmate-300 hover:text-taxmate-700 transition"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <ChatMessage key={i} message={m} />
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-500 rounded-bl-md">
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>

                <div className="border-t border-neutral-100 p-4">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a tax question..."
                      disabled={loading}
                      className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-taxmate-400 transition disabled:opacity-50"
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={loading || !input.trim()}
                      className="rounded-xl bg-taxmate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-taxmate-700 transition disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
