'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Box, Code, ArrowRight, Zap, Database, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ComponentVisualizerProps {
  mode?: 'simple' | 'lifecycle' | 'structure';
}

export function ComponentVisualizer({ mode = 'simple' }: ComponentVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'html' | 'code' | 'render'>('render');

  if (mode === 'structure') {
    return <StructureView />;
  }

  return (
    <div className="my-8 space-y-4">
      <div className="flex justify-center gap-2 mb-6">
        <TabButton active={activeTab === 'html'} onClick={() => setActiveTab('html')} icon={<Box className="w-4 h-4" />}>
          HTML
        </TabButton>
        <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Code className="w-4 h-4" />}>
          C# Code
        </TabButton>
        <div className="w-px h-8 bg-border mx-2" />
        <TabButton active={activeTab === 'render'} onClick={() => setActiveTab('render')} icon={<Zap className="w-4 h-4" />}>
          Result
        </TabButton>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Visual Representation */}
        <Card className="p-6 relative overflow-hidden min-h-[300px] flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="w-full"
          >
            {activeTab === 'html' && (
              <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm border-orange-200 dark:border-orange-900/50">
                <div className="text-xs font-mono text-orange-600 mb-2">&lt;template&gt;</div>
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                <div className="h-24 w-full bg-muted/50 rounded animate-pulse" />
                <div className="h-10 w-24 bg-primary/20 rounded animate-pulse" />
                <div className="text-xs font-mono text-orange-600 mt-2">&lt;/template&gt;</div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm border-blue-200 dark:border-blue-900/50">
                <div className="text-xs font-mono text-blue-600 mb-2">@code {'{'}</div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex gap-2">
                    <span className="text-purple-500">private</span>
                    <span className="text-blue-500">int</span>
                    <span>count</span>
                    <span>=</span>
                    <span className="text-green-500">0</span>;
                  </div>
                  <div className="h-4" />
                  <div className="flex gap-2">
                    <span className="text-purple-500">void</span>
                    <span className="text-yellow-600">Increment</span>()
                  </div>
                  <div className="pl-4 text-muted-foreground">{'// Logic happens here'}</div>
                </div>
                <div className="text-xs font-mono text-blue-600 mt-2">{'}'}</div>
              </div>
            )}

            {activeTab === 'render' && (
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors rounded-full" />
                <div className="relative bg-card border rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Live Component
                  </h3>
                  <p className="text-muted-foreground mb-4">I combine HTML + C#!</p>
                  <Button className="w-full">Interactive Element</Button>
                </div>
                
                {/* Connection Lines from "Backend" */}
                <motion.div 
                  className="absolute -right-4 -bottom-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs px-2 py-1 rounded-full border border-blue-200"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  C# Logic
                </motion.div>
                <motion.div 
                  className="absolute -left-4 -top-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs px-2 py-1 rounded-full border border-orange-200"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                >
                  HTML UI
                </motion.div>
              </div>
            )}
          </motion.div>
        </Card>

        {/* Explanation Text */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            {activeTab === 'html' && 'The Structure (HTML)'}
            {activeTab === 'code' && 'The Logic (C#)'}
            {activeTab === 'render' && 'The Result (Component)'}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {activeTab === 'html' && 'Blazor uses standard HTML and Razor syntax. You define what the user sees using tags you already know, sprinkled with some C# magic.'}
            {activeTab === 'code' && 'The @code block is where your C# lives. You define variables, methods, and event handlers here. It runs right alongside your HTML!'}
            {activeTab === 'render' && 'When compiled, Blazor smashes the HTML and C# together into a reusable class. This component handles its own updates, events, and state.'}
          </p>
          
          <div className="pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                <Box className="w-3 h-3" />
              </div>
              <span className="font-medium">Razor Syntax (.razor)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <Database className="w-3 h-3" />
              </div>
              <span className="font-medium">State Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StructureView() {
  return (
    <div className="my-8 p-6 border rounded-xl bg-gradient-to-b from-muted/30 to-background">
      <h3 className="text-lg font-semibold mb-6 text-center">Component Anatomy</h3>
      <div className="flex items-stretch justify-center gap-4">
        <div className="flex-1 max-w-[200px] flex flex-col items-center gap-2 p-4 border rounded-lg bg-card shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-semibold">Directives</span>
          <span className="text-xs text-center text-muted-foreground">@page, @using, @inject</span>
        </div>
        <ArrowRight className="w-6 h-6 text-muted-foreground self-center" />
        <div className="flex-1 max-w-[200px] flex flex-col items-center gap-2 p-4 border rounded-lg bg-card shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Code className="w-5 h-5" />
          </div>
          <span className="font-semibold">Markup</span>
          <span className="text-xs text-center text-muted-foreground">HTML + Razor Expressions</span>
        </div>
        <ArrowRight className="w-6 h-6 text-muted-foreground self-center" />
        <div className="flex-1 max-w-[200px] flex flex-col items-center gap-2 p-4 border rounded-lg bg-card shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-semibold">Logic</span>
          <span className="text-xs text-center text-muted-foreground">@code block (C#)</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "hover:bg-muted text-muted-foreground"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
