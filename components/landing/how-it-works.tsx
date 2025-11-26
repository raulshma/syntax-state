'use client';

import { motion } from "framer-motion"
import { FileText, Brain, Sparkles, Target } from "lucide-react"

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Share Your Details",
    description: "Paste your job description and resume. Tell us about the role, company, and your experience level.",
  },
  {
    icon: Brain,
    step: "02", 
    title: "AI Analysis",
    description: "Our AI analyzes the requirements and creates a personalized preparation plan tailored to your interview.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Learn & Practice",
    description: "Study with AI-generated content: topic breakdowns, analogies, MCQs, and rapid-fire questions.",
  },
  {
    icon: Target,
    step: "04",
    title: "Ace the Interview",
    description: "Walk into your interview confident, prepared, and ready to demonstrate your knowledge.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 mb-6 text-sm">
            <span className="text-muted-foreground">Simple Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-mono text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From job posting to interview success in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Connector line - hidden on mobile and tablet */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-border" />
              )}
              
              <div className="relative bg-background border border-border p-5 md:p-6 h-full hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-4xl font-mono text-border group-hover:text-primary/30 transition-colors">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-mono text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
