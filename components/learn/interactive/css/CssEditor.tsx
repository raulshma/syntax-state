'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Eye, RotateCcw, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeEditor } from '@/components/ui/code-editor';
import { cn } from '@/lib/utils';
import type { CssEditorProps, CssEditorState, CssValidationResult } from './types';

const DEFAULT_CSS = `/* Write your CSS here */
.example {
  color: #3b82f6;
  font-size: 16px;
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`;

const DEFAULT_HTML = `<div class="example">
  <h2>Hello, CSS!</h2>
  <p>This is a live preview of your CSS styles.</p>
</div>`;

export const CssEditor = memo(function CssEditor({
  initialCss = DEFAULT_CSS,
  initialHtml = DEFAULT_HTML,
  height = 400,
  showLineNumbers = true,
  showPreview = true,
  validateAgainst,
  onValidate,
}: CssEditorProps) {
  const [state, setState] = useState<CssEditorState>({
    css: initialCss,
    html: initialHtml,
    errors: [],
    isValid: true,
  });

  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState<CssValidationResult | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Debounced validation
  useEffect(() => {
    if (!validateAgainst) return;

    const timer = setTimeout(() => {
      const result = validateAgainst(state.css);
      setValidationResult(result);
      setState((prev) => ({
        ...prev,
        isValid: result.valid,
        errors: result.errors || [],
      }));
      onValidate?.(result);
    }, 300);

    return () => clearTimeout(timer);
  }, [state.css, validateAgainst, onValidate]);

  // Update preview iframe with debouncing for better performance
  useEffect(() => {
    if (!showPreview || !previewRef.current) return;

    const timer = setTimeout(() => {
      const iframe = previewRef.current;
      if (!iframe) return;
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Create complete HTML document with styles
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                padding: 20px;
                background: white;
                color: #1a1a1a;
              }
              ${state.css}
            </style>
          </head>
          <body>
            ${state.html}
          </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();
    }, 300); // 300ms debounce for preview updates

    return () => clearTimeout(timer);
  }, [state.css, state.html, showPreview]);

  const handleCssChange = (value: string) => {
    setState((prev) => ({ ...prev, css: value }));
  };

  const handleReset = () => {
    setState({
      css: initialCss,
      html: initialHtml,
      errors: [],
      isValid: true,
    });
    setValidationResult(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Basic CSS syntax validation
  const syntaxErrors = useMemo(() => {
    const errors: Array<{ line: number; message: string }> = [];
    const lines = state.css.split('\n');
    
    let openBraces = 0;
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Count braces
      openBraces += (line.match(/{/g) || []).length;
      openBraces -= (line.match(/}/g) || []).length;
      
      // Check for common syntax errors
      if (trimmed && !trimmed.startsWith('/*') && !trimmed.startsWith('*') && !trimmed.startsWith('//')) {
        // Check for missing semicolons (basic check)
        if (trimmed.includes(':') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
          errors.push({
            line: index + 1,
            message: 'Missing semicolon',
          });
        }
      }
    });
    
    if (openBraces !== 0) {
      errors.push({
        line: lines.length,
        message: openBraces > 0 ? 'Unclosed brace' : 'Extra closing brace',
      });
    }
    
    return errors;
  }, [state.css]);

  const hasErrors = syntaxErrors.length > 0 || state.errors.length > 0;

  return (
    <div 
      className="w-full max-w-6xl mx-auto my-8 space-y-4"
      role="region"
      aria-label="CSS Code Editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" aria-hidden="true" />
          CSS Editor
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1"
            disabled={copied}
            aria-label={copied ? 'CSS code copied to clipboard' : 'Copy CSS code to clipboard'}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" aria-hidden="true" />
                Copy CSS
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            className="gap-1"
            aria-label="Reset CSS code to initial example"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>

      {/* Validation Result */}
      <AnimatePresence>
        {validationResult && !validationResult.valid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationResult.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        {validationResult && validationResult.valid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {validationResult.message || 'CSS is valid!'}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor and Preview */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')}>
          <div className="border-b bg-secondary/30 px-4">
            <TabsList className="bg-transparent" aria-label="Editor view tabs">
              <TabsTrigger value="code" className="gap-2" aria-label="View CSS code editor">
                <Code2 className="w-4 h-4" aria-hidden="true" />
                CSS Code
              </TabsTrigger>
              {showPreview && (
                <TabsTrigger value="preview" className="gap-2" aria-label="View live preview">
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  Live Preview
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="code" className="m-0">
            <div className="relative">
              <CodeEditor
                value={state.css}
                onChange={handleCssChange}
                language="css"
                height={height}
                className="border-0"
              />
              
              {/* Syntax Errors Overlay */}
              {hasErrors && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-destructive/10 border-t border-destructive/20 p-3 space-y-1"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    Syntax Errors:
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {[...syntaxErrors, ...state.errors].map((error, index) => (
                      <div key={index} className="text-xs text-destructive/80">
                        Line {error.line}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {showPreview && (
            <TabsContent value="preview" className="m-0">
              <div 
                className="relative bg-white dark:bg-gray-900" 
                style={{ height }}
                role="region"
                aria-label="Live CSS preview"
              >
                <iframe
                  ref={previewRef}
                  title="CSS Preview - Live rendering of your CSS code"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                  aria-live="polite"
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </Card>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Write CSS in the editor and see the results in real-time. The preview updates automatically as you type.
      </div>
    </div>
  );
});
