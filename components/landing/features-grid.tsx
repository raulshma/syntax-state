'use client';

import { motion } from "framer-motion"
import { Brain, Clock, MessageSquare, Layers, Zap, Users, ArrowUpRight } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Analogy Engine",
    description: "Complex concepts explained through familiar analogies. Choose from professional, simple, or creative explanations.",
    highlight: true,
  },
  {
    icon: Clock,
    title: "Timeline-Based Prep",
    description: "Smart scheduling that adapts to your interview date. Focus on what matters most with prioritized topics.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Refinement",
    description: "Chat with AI to drill deeper into any topic. Ask follow-ups and get instant clarification.",
  },
  {
    icon: Layers,
    title: "Multi-Mode Learning",
    description: "Rapid Fire, MCQ, and Deep Dive modes for comprehensive preparation that matches your learning style.",
  },
  {
    icon: Zap,
    title: "Real-Time Generation",
    description: "Content generated on-demand based on your specific job requirements. No generic prep materials.",
    highlight: true,
  },
  {
    icon: Users,
    title: "Community Insights",
    description: "Learn from anonymized preps. See what others are studying for similar roles and companies.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 border border-border bg-secondary/50 px-4 py-2 mb-6 text-sm">
            <span className="text-muted-foreground">Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-mono text-foreground mb-4">
            Everything you need to prepare
          </h2>
          <p className="text-muted-foreground max-w-xl">
            A comprehensive system designed to help you understand, not just memorize. 
            Built by engineers who've been through the interview grind.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`group relative bg-card border border-border p-6 md:p-8 hover:border-primary/50 transition-all duration-300 ${
                feature.highlight ? 'lg:col-span-1 bg-gradient-to-br from-card to-secondary/20' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-mono text-foreground mb-3 text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
