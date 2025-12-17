"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, CheckCircle2, Sparkles, Scan } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Hero() {
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const analysisSteps = [
    { text: "Understanding Goals...", color: "text-blue-500" },
    { text: "Mapping Your Journey...", color: "text-purple-500" },
    { text: "Recommending Lessons...", color: "text-orange-500" },
    { text: "Generating Practice...", color: "text-green-500" },
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background pt-20 pb-12">
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Learning, Journeys, and Practice</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-foreground mb-8 leading-[1.05]">
            Master the <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              skills for your next role.
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Journeys, lessons, and AI chat tailored to you.
          <br className="hidden sm:block" />
          Practice with mock interviews when you&apos;re ready.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/onboarding">
            <Button
              size="lg"
              className="rounded-full px-8 h-14 text-lg font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 shadow-xl shadow-primary/5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-14 text-lg font-medium hover:bg-secondary/50 transition-all"
            >
              Explore Journeys
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Hero Visual / Dashboard Preview */}
        <motion.div
          className="mt-20 relative mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 backdrop-blur-xl ring-1 ring-white/10">
            {/* Window Controls */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-muted/30 border-b border-border/50 flex items-center px-4 gap-2 z-20">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
            </div>

            {/* Content Area */}
            <div className="pt-10 bg-linear-to-br from-background via-background to-secondary/20 min-h-[400px] flex items-center justify-center relative">

              {/* Scanning Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="w-full h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent absolute top-0"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                />
              </div>

              {/* Central Analysis Card */}
              <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Scan className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                          <div className="font-semibold text-sm">Personalized Plan</div>
                        <div className="text-xs text-muted-foreground">AI Engine v2.0</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Steps */}
                  <div className="space-y-3">
                    {analysisSteps.map((step, index) => (
                      <motion.div
                        key={step.text}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${index === analysisStep
                            ? "bg-secondary border-border"
                            : index < analysisStep
                              ? "bg-background border-transparent opacity-50"
                              : "bg-background border-transparent opacity-30"
                          }`}
                        animate={{
                          scale: index === analysisStep ? 1.02 : 1,
                        }}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${index <= analysisStep ? "bg-primary text-background" : "bg-muted"
                          }`}>
                          {index < analysisStep ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${index === analysisStep ? step.color : ""}`}>
                          {step.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating Code Snippets (Decorative) */}
              <motion.div
                className="absolute left-8 top-20 p-4 bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg max-w-[200px] hidden md:block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="space-y-2">
                  <div className="h-2 w-16 bg-blue-500/20 rounded-full" />
                  <div className="h-2 w-24 bg-purple-500/20 rounded-full" />
                  <div className="h-2 w-10 bg-green-500/20 rounded-full" />
                </div>
              </motion.div>

              <motion.div
                className="absolute right-8 bottom-20 p-4 bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg max-w-[200px] hidden md:block"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex gap-2 mb-2">
                  <div className="h-6 w-6 rounded-md bg-orange-500/20" />
                  <div className="h-6 w-6 rounded-md bg-pink-500/20" />
                </div>
                <div className="h-2 w-20 bg-muted rounded-full" />
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
