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
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-sm md:text-lg text-foreground truncate">{role}</h1>
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
                <p className="text-xs md:text-sm text-muted-foreground truncate">{company}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">
                  {progress}%
                </span>
                <div className="w-16 md:w-24 h-1.5 bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-0.5 md:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary h-9 w-9 md:h-10 md:w-10"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary h-9 w-9 md:h-10 md:w-10"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
