"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Share2,
  Download,
  Sparkles,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface InterviewHeaderProps {
  role: string;
  company: string;
  date: string;
  progress: number;
  isGenerating?: boolean;
}

export function InterviewHeader({
  role,
  company,
  date,
  progress,
  isGenerating,
}: InterviewHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary rounded-full h-10 w-10 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>

            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-bold text-foreground truncate tracking-tight">{role}</h1>
                  {isGenerating && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex-shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate font-medium">{company}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-secondary/20 px-4 py-2 rounded-full border border-border/50">
                <span className="text-sm font-semibold text-muted-foreground">
                  {progress}%
                </span>
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary rounded-full h-10 w-10"
                >
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary rounded-full h-10 w-10"
                >
                  <Download className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
