'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeHighlighter } from '@/components/ui/code-highlighter';

interface EnhancedCodeBlockProps {
  children: string;
  className?: string;
}

/**
 * Enhanced Code Block Component
 * Provides syntax highlighting and copy functionality for code blocks in MDX
 * Integrates with the existing CodeHighlighter component
 */
export function EnhancedCodeBlock({ 
  children, 
  className
}: EnhancedCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  // Extract language from className (e.g., "language-css" -> "css")
  const language = className?.replace(/language-/, '') || 'text';
  
  // Clean up the code content
  const code = typeof children === 'string' 
    ? children.trim() 
    : String(children).trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative group my-6">
      {/* Copy button */}
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-3 text-xs bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      {/* Code content with syntax highlighting */}
      <CodeHighlighter
        code={code}
        language={language}
        showLineNumbers={false}
        className="rounded-xl"
      />
    </div>
  );
}
