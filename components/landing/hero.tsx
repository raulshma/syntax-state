'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Code2, Zap } from "lucide-react"
import { motion } from "framer-motion"

const floatingTags = [
  { text: "React", delay: 0 },
  { text: "System Design", delay: 0.1 },
  { text: "TypeScript", delay: 0.2 },
  { text: "Algorithms", delay: 0.3 },
  { text: "Node.js", delay: 0.4 },
  { text: "AWS", delay: 0.5 },
]

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-2 mb-6 text-sm text-foreground"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Interview Preparation</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-mono tracking-tight text-foreground mb-6 leading-[1.1]">
              Ace your next{" "}
              <span className="relative">
                <span className="relative z-10">technical</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -z-0" />
              </span>{" "}
              interview
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Personalized preparation tailored to your specific role, company, and tech stack. 
              Our AI breaks down complex concepts into digestible insights you'll actually remember.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Preparing Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 pt-8 border-t border-border">
              <div>
                <div className="text-xl sm:text-2xl font-mono text-foreground">10k+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Interviews Prepped</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono text-foreground">95%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono text-foreground">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Companies</div>
              </div>
            </div>
          </motion.div>

          {/* Right visual - Interactive code preview (hidden on mobile) */}
          <motion.div
            className="relative hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              {/* Main card */}
              <div className="bg-card border border-border p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <Code2 className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">Your Interview Prep</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Analyzing job description...</span>
                  </div>
                  
                  <div className="bg-secondary/50 p-4 font-mono text-sm">
                    <div className="text-muted-foreground mb-2">// Generated topics</div>
                    <div className="text-foreground">
                      <span className="text-primary">const</span> topics = [
                    </div>
                    <div className="pl-4 text-foreground">"React Hooks Deep Dive",</div>
                    <div className="pl-4 text-foreground">"System Design Patterns",</div>
                    <div className="pl-4 text-foreground">"TypeScript Generics",</div>
                    <div className="text-foreground">];</div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground">Personalized for Senior Frontend @ Tech Co</span>
                  </div>
                </div>
              </div>

              {/* Floating tags */}
              <div className="absolute -top-4 -right-4 flex flex-wrap gap-2 max-w-[200px]">
                {floatingTags.slice(0, 3).map((tag, i) => (
                  <motion.div
                    key={tag.text}
                    className="bg-background border border-border px-3 py-1 text-xs font-mono shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + tag.delay }}
                  >
                    {tag.text}
                  </motion.div>
                ))}
              </div>

              <div className="absolute -bottom-4 -left-4 flex flex-wrap gap-2 max-w-[200px]">
                {floatingTags.slice(3).map((tag, i) => (
                  <motion.div
                    key={tag.text}
                    className="bg-background border border-border px-3 py-1 text-xs font-mono shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + tag.delay }}
                  >
                    {tag.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
