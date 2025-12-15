'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw, Check, Terminal, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InteractiveCodeEditorProps {
  initialCode: string;
  language?: string;
  runMode?: 'blazor' | 'csharp' | 'razor';
  title?: string;
  height?: string;
}

export function InteractiveCodeEditor({
  initialCode = '',
  language = 'razor',
  runMode = 'blazor',
  title = 'Interactive Editor',
  height = '300px'
}: InteractiveCodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [key, setKey] = useState(0);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);

    // Simulate compilation/execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple simulation of output based on code content
    // In a real app, this would send code to a backend or use Blazor WASM
    const simulatedOutput = generateSimulatedOutput(code, runMode);
    
    setOutput(simulatedOutput);
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
    setKey(prev => prev + 1);
  };

  return (
    <div className="my-8 border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isRunning}
            className="h-8 w-8 p-0"
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <RotateCcw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {/* Editor Area */}
        <div className="relative">
          <Editor
            key={key}
            height={height}
            defaultLanguage={language}
            defaultValue={initialCode}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
            className="py-2"
          />
        </div>

        {/* Output/Preview Area */}
        <div className="bg-background flex flex-col min-h-[300px]">
          <div className="px-4 py-2 border-b bg-muted/10 text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Preview / Output
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <AnimatePresence mode="wait">
              {output ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {runMode === 'blazor' ? (
                    <div className="border rounded-lg p-4 bg-white dark:bg-zinc-900 shadow-sm">
                      <div className="flex items-center gap-2 border-b pb-2 mb-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <div className="ml-2">localhost:5000</div>
                      </div>
                      <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: output }} />
                    </div>
                  ) : (
                    <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
                      {output}
                    </pre>
                  )}
                  
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-4">
                    <Check className="w-4 h-4" />
                    <span>Build Succeeded</span>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                  <Play className="w-8 h-8" />
                  <p className="text-sm">Click Run to see output</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple simulation logic to make the editor feel somewhat responsive
function generateSimulatedOutput(code: string, mode: string): string {
  if (mode === 'blazor' || mode === 'razor') {
    // Extract potential button text or header text to make it dynamic
    const headerMatch = code.match(/<h1>(.*?)<\/h1>/);
    const buttonMatch = code.match(/<button.*?>(.*?)<\/button>/);
    const pMatch = code.match(/<p.*?>(.*?)<\/p>/);
    
    const header = headerMatch ? headerMatch[1] : 'Counter';
    const buttonText = buttonMatch ? buttonMatch[1] : 'Click me';
    const pContent = pMatch ? pMatch[1] : 'Current count: 0';

    return `
      <h3 style="margin-bottom: 1rem; font-size: 1.5rem; font-weight: bold;">${header}</h3>
      <p style="margin-bottom: 1rem;">${pContent.replace('@currentCount', '0').replace('@count', '0')}</p>
      <button style="
        background-color: #512bd4; 
        color: white; 
        padding: 0.5rem 1rem; 
        border-radius: 0.25rem; 
        border: none; 
        cursor: pointer;
      ">${buttonText}</button>
    `;
  }
  
  return "Compilation completed successfully.\nRunning application...";
}
