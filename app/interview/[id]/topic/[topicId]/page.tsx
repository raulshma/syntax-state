"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { getTopic, regenerateAnalogy, type AnalogyStyle } from "@/lib/actions/topic"

// Dynamic import for Shiki (code highlighting) - prevents SSR issues
const MarkdownRenderer = dynamic(
  () => import("@/components/streaming/markdown-renderer"),
  { ssr: false }
)
import { getInterview } from "@/lib/actions/interview"
import type { RevisionTopic, Interview } from "@/lib/db/schemas/interview"
import { readStreamableValue } from "@ai-sdk/rsc"

const styleLabels: Record<AnalogyStyle, string> = {
  professional: "Professional",
  construction: "House Construction",
  simple: "ELI5 (Simple)",
}

const styleDescriptions: Record<AnalogyStyle, string> = {
  professional: "Technical explanation suitable for interviews",
  construction: "Explained using house building analogies",
  simple: "Explained like you're 5 years old",
}

export default function TopicDetailPage() {
  const params = useParams()
  const interviewId = params.id as string
  const topicId = params.topicId as string
  
  const [topic, setTopic] = useState<RevisionTopic | null>(null)
  const [interview, setInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedStyle, setSelectedStyle] = useState<AnalogyStyle>("professional")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string>("")

  // Load topic and interview data
  useEffect(() => {
    async function loadData() {
      try {
        const [topicResult, interviewResult] = await Promise.all([
          getTopic(interviewId, topicId),
          getInterview(interviewId),
        ])
        
        if (topicResult.success) {
          setTopic(topicResult.data)
          setSelectedStyle(topicResult.data.style)
        } else {
          setError(topicResult.error.message)
        }
        
        if (interviewResult.success) {
          setInterview(interviewResult.data)
        }
      } catch (err) {
        console.error("Failed to load topic:", err)
        setError("Failed to load topic")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [interviewId, topicId])

  const handleStyleChange = async (newStyle: AnalogyStyle) => {
    if (newStyle === selectedStyle || isRegenerating) return
    
    setSelectedStyle(newStyle)
    setIsRegenerating(true)
    setStreamingContent("")
    
    try {
      const { stream } = await regenerateAnalogy(interviewId, topicId, newStyle)
      
      for await (const chunk of readStreamableValue(stream)) {
        if (chunk !== undefined) {
          setStreamingContent(chunk)
        }
      }
      
      // Refresh topic data after regeneration
      const result = await getTopic(interviewId, topicId)
      if (result.success) {
        setTopic(result.data)
        setStreamingContent("")
      }
    } catch (err) {
      console.error("Failed to regenerate analogy:", err)
      // Revert to previous style on error
      if (topic) {
        setSelectedStyle(topic.style)
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  const displayContent = isRegenerating && streamingContent ? streamingContent : topic.content

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/interview/${interviewId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-mono text-foreground">{topic.title}</h1>
                {interview && (
                  <p className="text-sm text-muted-foreground">
                    {interview.jobDetails.title} at {interview.jobDetails.company}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select 
                value={selectedStyle} 
                onValueChange={(v) => handleStyleChange(v as AnalogyStyle)}
                disabled={isRegenerating}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(styleLabels) as AnalogyStyle[]).map((style) => (
                    <SelectItem key={style} value={style}>
                      <div className="flex flex-col items-start">
                        <span>{styleLabels[style]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link href={`/interview/${interviewId}/topic/${topicId}/chat`}>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Topic Info */}
          <div className="flex items-center gap-4">
            <Badge 
              variant="secondary" 
              className={`capitalize ${
                topic.confidence === "low" 
                  ? "bg-red-500/10 text-red-500" 
                  : topic.confidence === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-green-500/10 text-green-500"
              }`}
            >
              {topic.confidence} confidence
            </Badge>
            <span className="text-sm text-muted-foreground">{topic.reason}</span>
          </div>

          {/* Main Content Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-mono text-lg text-foreground">Deep Dive</h2>
                {isRegenerating && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />
                )}
              </div>
              
              <div className="prose prose-invert max-w-none">
                <MarkdownRenderer
                  content={displayContent}
                  isStreaming={isRegenerating && !!streamingContent}
                />
                {isRegenerating && !streamingContent && (
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                )}
              </div>

              {/* Analogy Style Info */}
              <div className="border-t border-border pt-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Explanation Style
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {styleLabels[selectedStyle]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {styleDescriptions[selectedStyle]}
                </p>
                
                {/* Style Selector Buttons */}
                <div className="flex gap-2 mt-4">
                  {(Object.keys(styleLabels) as AnalogyStyle[]).map((style) => (
                    <Button
                      key={style}
                      variant={selectedStyle === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStyleChange(style)}
                      disabled={isRegenerating}
                      className="flex-1"
                    >
                      {isRegenerating && selectedStyle === style ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : null}
                      {styleLabels[style]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleStyleChange(selectedStyle)}
              disabled={isRegenerating}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerate Explanation
            </Button>
            <Link href={`/interview/${interviewId}/topic/${topicId}/chat`} className="flex-1">
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Follow-up Questions
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
