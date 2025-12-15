'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Code, FileCode, MonitorPlay, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface JSInteropVisualizerProps {
  mode?: 'csharp-to-js' | 'js-to-csharp' | 'bisymmetric';
}

export function JSInteropVisualizer({ mode = 'csharp-to-js' }: JSInteropVisualizerProps) {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; source: 'csharp' | 'js' }>>([]);

  const triggerCSharpToJs = () => {
    setActiveFlow('c2j');
    addMessage('csharp', 'InvokeVoidAsync("alert", "Hello!")');
    
    setTimeout(() => {
      addMessage('js', 'window.alert("Hello!")');
      setTimeout(() => setActiveFlow(null), 1000);
    }, 1500);
  };

  const triggerJsToCSharp = () => {
    setActiveFlow('j2c');
    addMessage('js', 'DotNet.invokeMethodAsync(...)');
    
    setTimeout(() => {
      addMessage('csharp', '[JSInvokable] public static void CallMe()');
      setTimeout(() => setActiveFlow(null), 1000);
    }, 1500);
  };

  const addMessage = (source: 'csharp' | 'js', text: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setMessages(prev => [...prev.slice(-3), { id, text, source }]);
  };

  return (
    <div className="my-8">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4 items-center">
        {/* C# / Blazor Side */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full p-4 border-2 border-primary/20 bg-primary/5 rounded-xl text-center min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 left-2 text-xs font-bold text-primary flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              C# (Wasm/Server)
            </div>
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <Button 
              size="sm" 
              variant="default"
              onClick={triggerCSharpToJs}
              disabled={!!activeFlow}
              className="mt-2"
            >
              Call JS Function
            </Button>
          </div>
        </div>

        {/* The Connection Bridge */}
        <div className="flex flex-col items-center justify-center gap-2 w-32 relative h-full min-h-[160px]">
          <div className="absolute inset-x-0 h-2 bg-muted rounded-full top-1/2 -translate-y-1/2" />
          
          {/* Animated Particles */}
          <AnimatePresence>
            {activeFlow === 'c2j' && (
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 60, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-1/2 -translate-y-1/2 z-10"
              >
                <div className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                  JSON Data <ArrowRightLeft className="w-3 h-3" />
                </div>
              </motion.div>
            )}
            
            {activeFlow === 'j2c' && (
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: -60, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-1/2 -translate-y-1/2 z-10"
              >
                <div className="bg-yellow-500 text-white text-[10px] px-2 py-1 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                  <ArrowRightLeft className="w-3 h-3" /> JSON Data
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
            IJSRuntime
          </div>
        </div>

        {/* JS / Browser Side */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full p-4 border-2 border-yellow-500/20 bg-yellow-500/5 rounded-xl text-center min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-xs font-bold text-yellow-600 flex items-center gap-1">
              JavaScript (Browser)
              <MonitorPlay className="w-3 h-3" />
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-full mb-2">
              <span className="text-xl font-bold text-yellow-600">JS</span>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200 mt-2"
              onClick={triggerJsToCSharp}
              disabled={!!activeFlow}
            >
              Call .NET Method
            </Button>
          </div>
        </div>
      </div>

      {/* Console / Log Area */}
      <Card className="bg-zinc-950 text-zinc-100 p-4 font-mono text-sm h-[150px] overflow-y-auto">
        <div className="flex items-center gap-2 text-zinc-500 mb-2 pb-2 border-b border-zinc-800 text-xs uppercase tracking-wider">
          <MessageSquare className="w-3 h-3" />
          Interop Log
        </div>
        <div className="space-y-2">
          {messages.length === 0 && (
            <div className="text-zinc-600 italic">Waiting for interaction...</div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <span className={cn(
                "w-16 text-xs uppercase opacity-70 shrink-0",
                msg.source === 'csharp' ? "text-blue-400" : "text-yellow-400"
              )}>
                {msg.source}::
              </span>
              <span className="text-zinc-300">{msg.text}</span>
            </motion.div>
          ))}
        </div>
      </Card>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        Blazor relies on <code>IJSRuntime</code> to serialize data between .NET and JavaScript worlds.
      </p>
    </div>
  );
}
