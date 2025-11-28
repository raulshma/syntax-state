"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, MessageSquare, Zap, BookOpen, CheckCircle, Circle, Lock } from "lucide-react"
import Link from "next/link"
import { getAnalogyStyles, type AnalogyStyle } from "@/lib/utils/feature-gate"
import type { UserPlan } from "@/lib/db/schemas/user"

interface TopicCardProps {
  id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed"
  difficulty: "beginner" | "intermediate" | "advanced"
  subtopics: { name: string; completed: boolean }[]
  timeEstimate: string
  userPlan?: UserPlan
}

export function TopicCard({ id, title, description, status, difficulty, subtopics, timeEstimate, userPlan = "FREE" }: TopicCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [analogyLevel, setAnalogyLevel] = useState<AnalogyStyle>("professional")
  const completedCount = subtopics.filter((s) => s.completed).length
  const availableStyles = getAnalogyStyles(userPlan)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-foreground" />
              ) : status === "in-progress" ? (
                <div className="w-4 h-4 border-2 border-foreground rounded-full border-t-transparent animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <h3 className="font-mono text-foreground">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>
            {completedCount} of {subtopics.length} subtopics
          </span>
          <span>{timeEstimate}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted mb-4">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${(completedCount / subtopics.length) * 100}%` }}
          />
        </div>

        {/* Analogy Level Selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-muted-foreground">Analogy Level:</span>
          <Select value={analogyLevel} onValueChange={(value) => setAnalogyLevel(value as AnalogyStyle)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              {availableStyles.includes("construction") ? (
                <SelectItem value="construction">Construction</SelectItem>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground cursor-not-allowed opacity-50">
                  <Lock className="w-3 h-3" />
                  <span>Construction (PRO+)</span>
                </div>
              )}
              {availableStyles.includes("simple") ? (
                <SelectItem value="simple">Simple</SelectItem>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground cursor-not-allowed opacity-50">
                  <Lock className="w-3 h-3" />
                  <span>Simple (PRO+)</span>
                </div>
              )}
            </SelectContent>
          </Select>
          {userPlan === "FREE" && (
            <Link href="/settings/upgrade">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:bg-primary/10">
                Upgrade
              </Button>
            </Link>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/interview/1/topic/${id}?mode=deepdive`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <BookOpen className="w-3 h-3 mr-2" />
              Deep Dive
            </Button>
          </Link>
          <Link href={`/interview/1/topic/${id}?mode=rapidfire`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Zap className="w-3 h-3 mr-2" />
              Rapid Fire
            </Button>
          </Link>
          <Link href={`/interview/1/topic/${id}/chat`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Expandable subtopics */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide" : "Show"} subtopics
        </button>

        {expanded && (
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {subtopics.map((subtopic, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                {subtopic.completed ? (
                  <CheckCircle className="w-3 h-3 text-foreground" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={subtopic.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                  {subtopic.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
