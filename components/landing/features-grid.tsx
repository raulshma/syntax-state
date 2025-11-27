"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  MessageSquare,
  Layers,
  Zap,
  Users,
  ArrowUpRight,
  Sparkles,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Analogy Engine",
    description: "Complex concepts explained through familiar analogies.",
    className: "md:col-span-2",
    gradient: "from-purple-500/20 via-blue-500/10 to-transparent",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "Timeline-based prep that adapts to your interview date.",
    className: "md:col-span-1",
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
  },
  {
    icon: MessageSquare,
    title: "AI Coaching",
    description: "Chat with AI to drill deeper into any topic instantly.",
    className: "md:col-span-1",
    gradient: "from-orange-500/20 via-red-500/10 to-transparent",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    icon: Layers,
    title: "Multi-Mode Learning",
    description: "Rapid Fire, MCQ, and Deep Dive modes.",
    className: "md:col-span-2",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-32 px-6 bg-secondary/20">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
            Everything you need.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive system designed to help you understand, not just
            memorize.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`group relative rounded-[2.5rem] overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 ${feature.className}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30 group-hover:opacity-100 transition-opacity duration-700`}
              />

              <div className="relative h-full p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight className="w-5 h-5 text-foreground" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
