"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Lightbulb,
  Code,
  BookOpen,
  Copy,
  Check,
  History,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { getTopic } from "@/lib/actions/topic"
import { getInterview } from "@/lib/actions/interview"
import type { RevisionTopic, Interview } from "@/lib/db/schemas/interview"

const MarkdownRenderer = dynamic(
  () => import("@/components/streaming/markdown-renderer"),
  { ssr: false }
)

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const quickActions = [
  { icon: Lightbulb, label: "Simplify", prompt: "Can you explain this more simply?" },
  { icon: Code, label: "Code Example", prompt: "Show me a practical code example" },
  { icon: BookOpen, label: "Real-world Use", prompt: "How is this used in production apps?" },
  { icon: RefreshCw, label: "Different Angle", prompt: "Explain this from a different perspective" },
]

export default function ChatRefinementPage() {
  const params = useParams()
  const interviewId = params.id as string
  const topicId = params.topicId as string

  const [topic, setTopic] = useState<RevisionTopic | null>(null)
  const [interview, setInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load topic, interview data, and existing chat messages
  useEffect(() => {
    async function loadData() {
      try {
        const [topicResult, interviewResult, chatResponse] = await Promise.all([
          getTopic(interviewId, topicId),
          getInterview(interviewId),
          fetch(`/api/interview/${interviewId}/topic/${topicId}/chat`).then((r) =>
            r.ok ? r.json() : { messages: [] }
          ),
        ])

        if (topicResult.success) {
          setTopic(topicResult.data)

          // Load existing messages or show welcome message
          if (chatResponse.messages && chatResponse.messages.length > 0) {
            setMessages(
              chatResponse.messages.map((m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            )
          } else {
            // Set initial welcome message for new chats
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: `I'm here to help you understand **${topicResult.data.title}** better. What specific aspect would you like to explore?\n\nYou can ask me to:\n- Explain a concept differently\n- Give more examples\n- Compare with other patterns\n- Deep dive into implementation details`,
              },
            ])
          }
        } else {
          setError(topicResult.error.message)
        }

        if (interviewResult.success) {
          setInterview(interviewResult.data)
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("Failed to load topic data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [interviewId, topicId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
    setIsStreaming(true)

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `/api/interview/${interviewId}/topic/${topicId}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages.filter(m => m.id !== "welcome"), userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        }
      )

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: accumulatedContent }
              : m
          )
        )
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      console.error("Chat error:", err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: "Sorry, I encountered an error. Please try again." }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [input, isStreaming, messages, interviewId, topicId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const handleCopy = () => {
    if (topic) {
      navigator.clipboard.writeText(topic.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-mono text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error || "Topic not found"}</p>
          <Link href={`/interview/${interviewId}`}>
            <Button>Back to Interview</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Panel - Content Preview */}
      <aside className="w-96 border-r border-border flex-col hidden lg:flex flex-shrink-0">
        <div className="p-4 border-b border-border">
          <Link
            href={`/interview/${interviewId}/topic/${topicId}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to topic</span>
          </Link>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-foreground">{topic.title}</h2>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <MarkdownRenderer
                  content={topic.content.slice(0, 500) + (topic.content.length > 500 ? "..." : "")}
                  isStreaming={false}
                  className="text-sm text-muted-foreground"
                />
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {topic.confidence} confidence
                </Badge>
              </div>
              <Card className="bg-muted border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-foreground font-mono leading-relaxed">{topic.reason}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {interview && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Interview Context
              </h3>
              <div className="space-y-2">
                <div className="p-3 border border-border">
                  <p className="text-sm text-foreground">{interview.jobDetails.title}</p>
                  <p className="text-xs text-muted-foreground">{interview.jobDetails.company}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel - Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/interview/${interviewId}/topic/${topicId}`} className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-8 h-8 border border-border flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h1 className="font-mono text-foreground">AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Refining: {topic.title}</p>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono capitalize">
              {topic.style || "professional"}
            </Badge>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((message, index) => {
              const isLastAssistant =
                message.role === "assistant" && index === messages.length - 1
              const showStreamingIndicator = isStreaming && isLastAssistant && message.content === ""

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-card border border-border"
                    } p-4`}
                  >
                    {showStreamingIndicator ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    ) : message.role === "assistant" ? (
                      <MarkdownRenderer
                        content={message.content}
                        isStreaming={isStreaming && isLastAssistant}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-muted-foreground mb-3">Quick actions:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isStreaming}
                  className="text-xs"
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="font-mono"
              disabled={isStreaming}
            />
            <Button type="submit" disabled={!input.trim() || isStreaming}>
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
