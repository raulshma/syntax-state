import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Share2, Download } from "lucide-react"
import Link from "next/link"

interface TimelineHeaderProps {
  role: string
  company: string
  date: string
  daysUntil: number
  progress: number
}

export function TimelineHeader({ role, company, date, daysUntil, progress }: TimelineHeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-mono text-sm md:text-base text-foreground truncate">{role}</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm">
            <span className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
            <Badge variant={daysUntil <= 3 ? "destructive" : "secondary"}>
              <Clock className="w-3 h-3 mr-1" />
              {daysUntil} days left
            </Badge>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-muted-foreground">{progress}% complete</span>
            <div className="w-20 md:w-32 h-1.5 md:h-2 bg-muted">
              <div className="h-full bg-foreground" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
