"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="border-b border-border px-6 py-8 bg-gradient-to-r from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <motion.div
            className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Shield className="w-4 h-4 text-primary" />
            <span>Admin Control Center</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-mono tracking-tight text-foreground">
            System{" "}
            <span className="relative">
              <span className="relative z-10">Dashboard</span>
              <span className="absolute bottom-1 left-0 w-full h-2 bg-primary/20 -z-0" />
            </span>
          </h1>

          <p className="text-muted-foreground max-w-md">
            Monitor platform health, manage users, and configure AI systems
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-3"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-600 dark:text-green-400 font-mono">
              Systems Online
            </span>
          </div>
          <Badge variant="outline" className="px-4 py-2 font-mono">
            <Sparkles className="w-3 h-3 mr-2" />
            Admin
          </Badge>
        </motion.div>
      </motion.div>
    </header>
  );
}
