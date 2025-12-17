"use client";

import { motion } from "framer-motion";
import { Map, BookOpen, MessageSquare, Trophy } from "lucide-react";

const steps = [
  {
    icon: Map,
    step: "01",
    title: "Pick a goal",
    description: "Choose a journey or create a plan for what you want to learn.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Learn",
    description: "Follow structured lessons with interactive demos and exercises.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Ask AI",
    description: "Use AI chat to get explanations, examples, and personalized help.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Practice + track",
    description: "Run mock interviews and drills, and track your progress over time.",
    color: "bg-green-500/10 text-green-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
            How it works.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From goals to progress in four simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center mb-8 relative z-10 bg-background border-4 border-background shadow-lg`}
              >
                <step.icon className="w-10 h-10" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
