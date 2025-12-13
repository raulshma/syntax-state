'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Code2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CssApproach {
  title: string;
  description?: string;
  css: string;
  html?: string; // Optional: if different HTML is needed
}

interface CssComparisonProps {
  approaches: CssApproach[];
  sharedHtml: string;
  syncInteractions?: boolean;
  showCode?: boolean;
  height?: number;
}

interface InteractionState {
  scrollTop: number;
  scrollLeft: number;
  hoveredElement: string | null;
}

/**
 * CssComparison Component
 * 
 * Displays side-by-side comparisons of different CSS approaches
 * with synchronized interactions and live previews.
 */
export function CssComparison({
  approaches,
  sharedHtml,
  syncInteractions = true,
  showCode = true,
  height = 400,
}: CssComparisonProps) {
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [interactionState, setInteractionState] = useState<InteractionState>({
    scrollTop: 0,
    scrollLeft: 0,
    hoveredElement: null,
  });

  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Initialize iframe content
  const initializeIframe = useCallback(
    (iframe: HTMLIFrameElement | null, index: number) => {
      if (!iframe) return;

      const approach = approaches[index];
      const html = approach.html || sharedHtml;

      const doc = iframe.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(`
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
                padding: 16px;
                background: white;
                color: #1a1a1a;
              }
              ${approach.css}
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      doc.close();

      // Add interaction synchronization
      if (syncInteractions) {
        // Sync scroll events
        iframe.contentWindow?.addEventListener('scroll', () => {
          const scrollTop = iframe.contentWindow?.scrollY || 0;
          const scrollLeft = iframe.contentWindow?.scrollX || 0;
          setInteractionState((prev) => ({ ...prev, scrollTop, scrollLeft }));
        });

        // Sync hover events
        doc.body.addEventListener('mouseover', (e) => {
          const target = e.target as HTMLElement;
          const selector = getElementSelector(target);
          setInteractionState((prev) => ({ ...prev, hoveredElement: selector }));
        });

        doc.body.addEventListener('mouseout', () => {
          setInteractionState((prev) => ({ ...prev, hoveredElement: null }));
        });
      }
    },
    [approaches, sharedHtml, syncInteractions]
  );

  // Synchronize interactions across all iframes
  useEffect(() => {
    if (!syncInteractions) return;

    iframeRefs.current.forEach((iframe) => {
      if (!iframe?.contentWindow) return;

      // Sync scroll position
      iframe.contentWindow.scrollTo(interactionState.scrollLeft, interactionState.scrollTop);

      // Sync hover state
      if (interactionState.hoveredElement) {
        const doc = iframe.contentDocument;
        if (!doc) return;

        // Remove previous highlights
        doc.querySelectorAll('[data-comparison-highlight]').forEach((el) => {
          el.removeAttribute('data-comparison-highlight');
          (el as HTMLElement).style.outline = '';
        });

        // Add new highlight
        try {
          const element = doc.querySelector(interactionState.hoveredElement);
          if (element) {
            element.setAttribute('data-comparison-highlight', 'true');
            (element as HTMLElement).style.outline = '2px solid rgba(59, 130, 246, 0.5)';
          }
        } catch (e) {
          // Invalid selector, ignore
        }
      }
    });
  }, [interactionState, syncInteractions]);

  const handleReset = () => {
    iframeRefs.current.forEach((iframe, index) => {
      initializeIframe(iframe, index);
    });
    setInteractionState({
      scrollTop: 0,
      scrollLeft: 0,
      hoveredElement: null,
    });
  };

  return (
    <div className="w-full my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          CSS Approach Comparison
        </h3>
        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'preview' | 'code')}>
            <TabsList>
              <TabsTrigger value="preview" className="gap-1">
                <Eye className="w-3 h-3" />
                Preview
              </TabsTrigger>
              {showCode && (
                <TabsTrigger value="code" className="gap-1">
                  <Code2 className="w-3 h-3" />
                  Code
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div
        className={cn(
          'grid gap-4',
          approaches.length === 2 && 'md:grid-cols-2',
          approaches.length === 3 && 'md:grid-cols-3',
          approaches.length >= 4 && 'md:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {approaches.map((approach, index) => (
          <Card key={index} className="overflow-hidden">
            {/* Approach Header */}
            <div className="p-3 border-b bg-secondary/30">
              <h4 className="font-semibold text-sm">{approach.title}</h4>
              {approach.description && (
                <p className="text-xs text-muted-foreground mt-1">{approach.description}</p>
              )}
            </div>

            {/* Content */}
            {activeView === 'preview' ? (
              <div className="relative">
                <iframe
                  ref={(el) => {
                    iframeRefs.current[index] = el;
                    initializeIframe(el, index);
                  }}
                  className="w-full border-0 bg-white"
                  style={{ height: `${height}px` }}
                  title={`${approach.title} preview`}
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="p-4 overflow-auto" style={{ maxHeight: `${height}px` }}>
                <pre className="text-xs">
                  <code className="language-css">{approach.css}</code>
                </pre>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Info */}
      {syncInteractions && (
        <div className="text-xs text-muted-foreground">
          💡 Interactions are synchronized across all approaches. Hover over elements or scroll
          to see the same behavior in each version.
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to generate a CSS selector for an element
 */
function getElementSelector(element: HTMLElement): string {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }

  // Try class
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(Boolean);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }

  // Fall back to tag name with nth-child
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element) + 1;
    return `${element.tagName.toLowerCase()}:nth-child(${index})`;
  }

  return element.tagName.toLowerCase();
}
