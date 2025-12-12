'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Eye,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LiveHtmlEditorProps {
  initialCode?: string;
  showLineNumbers?: boolean;
  height?: number;
  onCodeChange?: (code: string) => void;
}

const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
    }
    .highlight {
      background: yellow;
      padding: 2px 6px;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is my <span class="highlight">first</span> web page.</p>
  <ul>
    <li>HTML provides structure</li>
    <li>CSS adds style</li>
    <li>JavaScript adds interactivity</li>
  </ul>
</body>
</html>`;

interface SyntaxError {
  line: number;
  message: string;
}

// Simple HTML syntax validator
function validateHtml(html: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = html.split('\n');
  const tagStack: { tag: string; line: number }[] = [];
  
  // Self-closing tags that don't need closing
  const selfClosing = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  lines.forEach((line, lineIndex) => {
    // Find opening tags
    const openingTags = line.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*(?<!\/)\s*>/g);
    for (const match of openingTags) {
      const tagName = match[1].toLowerCase();
      if (!selfClosing.has(tagName)) {
        tagStack.push({ tag: tagName, line: lineIndex + 1 });
      }
    }

    // Find closing tags
    const closingTags = line.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g);
    for (const match of closingTags) {
      const tagName = match[1].toLowerCase();
      if (tagStack.length === 0) {
        errors.push({
          line: lineIndex + 1,
          message: `Unexpected closing tag </${tagName}>`,
        });
      } else {
        const lastOpen = tagStack[tagStack.length - 1];
        if (lastOpen.tag === tagName) {
          tagStack.pop();
        } else {
          errors.push({
            line: lineIndex + 1,
            message: `Expected </${lastOpen.tag}> but found </${tagName}>`,
          });
        }
      }
    }
  });

  // Check for unclosed tags
  tagStack.forEach(({ tag, line }) => {
    errors.push({
      line,
      message: `Unclosed tag <${tag}>`,
    });
  });

  return errors;
}


// Simple syntax highlighting for HTML
function highlightHtml(code: string): string {
  let result = code
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight comments
  result = result.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="text-zinc-500">$1</span>'
  );

  // Highlight doctype
  result = result.replace(
    /(&lt;!DOCTYPE[^&]*&gt;)/gi,
    '<span class="text-purple-400">$1</span>'
  );

  // Highlight tags
  result = result.replace(
    /(&lt;\/?)([\w-]+)/g,
    '$1<span class="text-blue-400">$2</span>'
  );

  // Highlight attributes
  result = result.replace(
    /\s([\w-]+)(=)/g,
    ' <span class="text-yellow-400">$1</span>$2'
  );

  // Highlight attribute values
  result = result.replace(
    /=(&quot;|"|')([^"']*?)(\1|&quot;)/g,
    '=<span class="text-green-400">"$2"</span>'
  );

  // Highlight CSS in style tags (simplified)
  result = result.replace(
    /(&lt;style&gt;)([\s\S]*?)(&lt;\/style&gt;)/gi,
    (_, open, content, close) => {
      const highlightedCss = content
        .replace(/([\w-]+)\s*:/g, '<span class="text-cyan-400">$1</span>:')
        .replace(/:\s*([^;{]+)/g, ': <span class="text-orange-400">$1</span>');
      return `${open}${highlightedCss}${close}`;
    }
  );

  return result;
}

export function LiveHtmlEditor({
  initialCode = defaultHtml,
  showLineNumbers = true,
  height = 400,
  onCodeChange,
}: LiveHtmlEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compute errors using useMemo instead of useEffect + setState
  const errors = useMemo(() => validateHtml(code), [code]);

  // Sync scroll between textarea and pre
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Update preview iframe
  useEffect(() => {
    onCodeChange?.(code);

    // Update iframe preview
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, onCodeChange]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
  };

  const lines = code.split('\n');
  const errorLines = new Set(errors.map((e) => e.line));

  const editorHeight = isExpanded ? 600 : height;

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Live HTML Editor
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Editor */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="ml-2 text-xs text-zinc-400 font-mono">index.html</span>
            {errors.length > 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs text-yellow-500">
                <AlertCircle className="w-3 h-3" />
                {errors.length} issue{errors.length !== 1 && 's'}
              </span>
            )}
          </div>
          <div
            className="relative bg-zinc-950"
            style={{ height: editorHeight }}
          >
            {/* Syntax highlighted display */}
            <pre
              ref={preRef}
              className="absolute inset-0 p-4 overflow-auto font-mono text-sm pointer-events-none"
              aria-hidden="true"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    errorLines.has(i + 1) && 'bg-red-500/10'
                  )}
                >
                  {showLineNumbers && (
                    <span
                      className={cn(
                        'select-none w-10 text-right mr-4 shrink-0',
                        errorLines.has(i + 1)
                          ? 'text-red-400'
                          : 'text-zinc-600'
                      )}
                    >
                      {i + 1}
                    </span>
                  )}
                  <code
                    className="text-zinc-300 whitespace-pre"
                    dangerouslySetInnerHTML={{
                      __html: highlightHtml(line) || ' ',
                    }}
                  />
                </div>
              ))}
            </pre>
            {/* Actual textarea for editing */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onScroll={handleScroll}
              className={cn(
                'absolute inset-0 p-4 font-mono text-sm bg-transparent text-transparent caret-white resize-none outline-none',
                showLineNumbers && 'pl-[72px]'
              )}
              spellCheck={false}
              style={{ caretColor: 'white' }}
            />
          </div>
        </Card>

        {/* Preview */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Live Preview</span>
            <span className="ml-auto text-xs text-muted-foreground">
              Updates as you type
            </span>
          </div>
          <div
            className="bg-white"
            style={{ height: editorHeight }}
          >
            <iframe
              ref={iframeRef}
              title="HTML Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </Card>
      </div>

      {/* Error display */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
        >
          <h4 className="text-sm font-medium text-yellow-500 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Potential Issues
          </h4>
          <ul className="space-y-1">
            {errors.slice(0, 5).map((error, i) => (
              <li key={i} className="text-xs text-yellow-400/80">
                Line {error.line}: {error.message}
              </li>
            ))}
            {errors.length > 5 && (
              <li className="text-xs text-yellow-400/60">
                ...and {errors.length - 5} more
              </li>
            )}
          </ul>
        </motion.div>
      )}

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Try editing the HTML above and watch the preview update in real-time!
      </div>
    </div>
  );
}

// Export default HTML for testing
export { defaultHtml };
