"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ViewTransitionLink } from "@/components/transitions/view-transition-link"

interface InterviewCardProps {
  id: string
  role: string
  company: string
  date: string
  daysUntil: number
  topics: string[]
  progress: number
  status: "upcoming" | "active" | "completed"
  onDelete?: () => void
}

export function InterviewCard({ 
  id, 
  role, 
  company, 
  date, 
  daysUntil, 
  topics, 
  progress, 
  status,
  onDelete 
}: InterviewCardProps) {
  return (
    <ViewTransitionLink 
      href={`/interview/${id}`}
      viewTransitionName={`interview-card-${id}`}
    >
      <Card 
        className="bg-card border-border hover:border-muted-foreground/50 transition-colors cursor-pointer h-full"
        style={{ viewTransitionName: `interview-card-${id}` } as React.CSSProperties}
      >
        <CardContent className="p-6 overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-mono text-foreground truncate">{role}</h3>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 -mr-2 -mt-2" 
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Duplicate</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete?.()
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
            {daysUntil !== 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysUntil > 0 ? `${daysUntil} days` : "Today"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4 overflow-hidden">
            {topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="secondary" className="font-mono text-xs truncate max-w-[120px]">
                {topic}
              </Badge>
            ))}
            {topics.length > 3 && (
              <Badge variant="secondary" className="font-mono text-xs shrink-0">
                +{topics.length - 3}
              </Badge>
            )}
            {topics.length === 0 && (
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                No topics yet
              </Badge>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground">{progress}%</span>
            </div>
            <div className="h-1 bg-muted">
              <div 
                className="h-full bg-foreground transition-all" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </ViewTransitionLink>
  )
}
