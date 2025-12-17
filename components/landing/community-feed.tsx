"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Copy, ArrowRight } from "lucide-react";
import Link from "next/link";

const communityPreps = [
  {
    role: "Frontend Journey",
    company: "React • TypeScript • Performance",
    topics: ["React", "System Design", "TypeScript"],
    views: 1240,
    daysAgo: 2,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    role: "Backend Foundations",
    company: "Node.js • Databases • APIs",
    topics: ["Node.js", "PostgreSQL", "Microservices"],
    views: 890,
    daysAgo: 5,
    color: "bg-green-500/10 text-green-500",
  },
  {
    role: "Full Stack Path",
    company: "Next.js • GraphQL • Cloud",
    topics: ["Next.js", "GraphQL", "AWS"],
    views: 2100,
    daysAgo: 1,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    role: "DevOps Journey",
    company: "Infrastructure • Delivery • Observability",
    topics: ["Kubernetes", "CI/CD", "Terraform"],
    views: 650,
    daysAgo: 7,
    color: "bg-orange-500/10 text-orange-500",
  },
];

export function CommunityFeed() {
  return (
    <section id="community" className="py-24 px-6 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
              Community Paths.
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl">
              See what others are learning right now. Clone a Journey and make it yours.
            </p>
          </div>
          <Link href="/community">
            <Button
              variant="outline"
              className="rounded-full px-6 border-border/50 bg-secondary/30 hover:bg-secondary/50 group"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {communityPreps.map((prep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-all duration-300 group rounded-3xl overflow-hidden hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                        {prep.role}
                      </h3>
                      <p className="text-muted-foreground">{prep.company}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${prep.color}`}>
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {prep.topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="font-medium px-3 py-1 rounded-lg bg-background/50"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {prep.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {prep.daysAgo}d ago
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full hover:bg-background/50"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Clone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
