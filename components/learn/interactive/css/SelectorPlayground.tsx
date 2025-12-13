'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, RotateCcw, Info, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { calculateSpecificity, formatSpecificity, explainSpecificity } from './shared/SpecificityCalculator';
import type { SelectorPlaygroundProps } from './types';

// Default HTML structure for the playground
const DEFAULT_HTML = `<div class="container">
  <header id="main-header" class="header">
    <h1 class="title">Welcome</h1>
    <nav class="navigation">
      <a href="#" class="nav-link active">Home</a>
      <a href="#" class="nav-link">About</a>
      <a href="#" class="nav-link">Contact</a>
    </nav>
  </header>
  <main class="content">
    <article class="post featured">
      <h2 class="post-title">First Post</h2>
      <p class="post-text">This is the first paragraph.</p>
      <p class="post-text">This is the second paragraph.</p>
    </article>
    <article class="post">
      <h2 class="post-title">Second Post</h2>
      <p class="post-text">Another paragraph here.</p>
    </article>
  </main>
  <footer id="main-footer">
    <p>© 2024 Example Site</p>
  </footer>
</div>`;

// Common selector examples
const SELECTOR_EXAMPLES = [
  { label: 'Element', selector: 'p', description: 'All <p> elements' },
  { label: 'Class', selector: '.post-title', description: 'Elements with class="post-title"' },
  { label: 'ID', selector: '#main-header', description: 'Element with id="main-header"' },
  { label: 'Descendant', selector: '.post p', description: '<p> inside .post' },
  { label: 'Child', selector: '.content > article', description: 'Direct <article> children of .content' },
  { label: 'Multiple Classes', selector: '.post.featured', description: 'Elements with both classes' },
  { label: 'Attribute', selector: 'a[href="#"]', description: '<a> with href="#"' },
  { label: 'Pseudo-class', selector: '.nav-link:first-child', description: 'First .nav-link' },
  { label: 'Complex', selector: '#main-header .navigation a.active', description: 'Complex selector' },
];

interface ParsedElement {
  tag: string;
  id?: string;
  classes: string[];
  attributes: Record<string, string>;
  text?: string;
  children: ParsedElement[];
  depth: number;
}

// Simple HTML parser for visualization
function parseHTML(html: string): ParsedElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  function parseNode(node: Element, depth = 0): ParsedElement | null {
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    
    const element: ParsedElement = {
      tag: node.tagName.toLowerCase(),
      id: node.id || undefined,
      classes: Array.from(node.classList),
      attributes: {},
      children: [],
      depth,
    };
    
    // Get attributes
    Array.from(node.attributes).forEach(attr => {
      if (attr.name !== 'class' && attr.name !== 'id') {
        element.attributes[attr.name] = attr.value;
      }
    });
    
    // Get text content (only direct text, not from children)
    const textContent = Array.from(node.childNodes)
      .filter(child => child.nodeType === Node.TEXT_NODE)
      .map(child => child.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    
    if (textContent) {
      element.text = textContent;
    }
    
    // Parse children
    Array.from(node.children).forEach(child => {
      const parsed = parseNode(child, depth + 1);
      if (parsed) {
        element.children.push(parsed);
      }
    });
    
    return element;
  }
  
  const body = doc.body;
  const elements: ParsedElement[] = [];
  
  Array.from(body.children).forEach(child => {
    const parsed = parseNode(child);
    if (parsed) {
      elements.push(parsed);
    }
  });
  
  return elements;
}

// Check if an element matches a selector
function elementMatchesSelector(element: ParsedElement, selector: string): boolean {
  try {
    // Create a temporary DOM element to test the selector
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementToHTML(element);
    const tempElement = tempDiv.firstElementChild;
    
    if (!tempElement) return false;
    
    return tempElement.matches(selector);
  } catch (error) {
    // Invalid selector
    return false;
  }
}

// Convert parsed element back to HTML string
function elementToHTML(element: ParsedElement): string {
  const attrs: string[] = [];
  
  if (element.id) {
    attrs.push(`id="${element.id}"`);
  }
  
  if (element.classes.length > 0) {
    attrs.push(`class="${element.classes.join(' ')}"`);
  }
  
  Object.entries(element.attributes).forEach(([key, value]) => {
    attrs.push(`${key}="${value}"`);
  });
  
  const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  const childrenHTML = element.children.map(elementToHTML).join('');
  const textContent = element.text || '';
  
  return `<${element.tag}${attrString}>${textContent}${childrenHTML}</${element.tag}>`;
}

// Find all matching elements in the tree
function findMatchingElements(elements: ParsedElement[], selector: string): ParsedElement[] {
  const matches: ParsedElement[] = [];
  
  function traverse(element: ParsedElement) {
    if (elementMatchesSelector(element, selector)) {
      matches.push(element);
    }
    element.children.forEach(traverse);
  }
  
  elements.forEach(traverse);
  return matches;
}

export function SelectorPlayground({
  initialHtml = DEFAULT_HTML,
  initialSelector = 'p',
  showSpecificity = true,
  highlightMatches = true,
}: SelectorPlaygroundProps) {
  const [selector, setSelector] = useState(initialSelector);
  const [html] = useState(initialHtml);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  
  // Parse HTML structure
  const parsedElements = useMemo(() => parseHTML(html), [html]);
  
  // Find matching elements
  const matchingElements = useMemo(() => {
    if (!selector.trim()) return [];
    try {
      return findMatchingElements(parsedElements, selector);
    } catch (error) {
      return [];
    }
  }, [parsedElements, selector]);
  
  // Calculate specificity
  const specificity = useMemo(() => {
    if (!selector.trim()) return null;
    try {
      return calculateSpecificity(selector);
    } catch (error) {
      return null;
    }
  }, [selector]);
  
  // Check if selector is valid
  const isValidSelector = useMemo(() => {
    if (!selector.trim()) return true;
    try {
      document.querySelector(selector);
      return true;
    } catch (error) {
      return false;
    }
  }, [selector]);
  
  const handleReset = useCallback(() => {
    setSelector(initialSelector);
    setSelectedExample(null);
  }, [initialSelector]);
  
  const handleExampleClick = useCallback((example: typeof SELECTOR_EXAMPLES[0]) => {
    setSelector(example.selector);
    setSelectedExample(example.selector);
  }, []);
  
  // Render element tree
  const renderElement = (element: ParsedElement, index: number): React.ReactElement => {
    const isMatched = highlightMatches && matchingElements.includes(element);
    const indent = element.depth * 20;
    
    return (
      <div key={`${element.tag}-${index}-${element.depth}`}>
        <motion.div
          className={cn(
            'py-1.5 px-3 rounded font-mono text-sm transition-colors',
            isMatched && 'bg-primary/10 border-l-2 border-primary'
          )}
          style={{ marginLeft: `${indent}px` }}
          initial={false}
          animate={{
            backgroundColor: isMatched ? 'hsl(var(--primary) / 0.1)' : 'transparent',
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-muted-foreground">&lt;</span>
          <span className="text-blue-600 dark:text-blue-400">{element.tag}</span>
          
          {element.id && (
            <>
              <span className="text-muted-foreground"> id=</span>
              <span className="text-green-600 dark:text-green-400">&quot;{element.id}&quot;</span>
            </>
          )}
          
          {element.classes.length > 0 && (
            <>
              <span className="text-muted-foreground"> class=</span>
              <span className="text-green-600 dark:text-green-400">
                &quot;{element.classes.join(' ')}&quot;
              </span>
            </>
          )}
          
          {Object.entries(element.attributes).map(([key, value]) => (
            <span key={key}>
              <span className="text-muted-foreground"> {key}=</span>
              <span className="text-green-600 dark:text-green-400">&quot;{value}&quot;</span>
            </span>
          ))}
          
          <span className="text-muted-foreground">&gt;</span>
          
          {element.text && (
            <span className="text-foreground ml-1">{element.text}</span>
          )}
          
          {isMatched && (
            <motion.span
              className="ml-2 text-xs text-primary font-semibold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              ✓ Matched
            </motion.span>
          )}
        </motion.div>
        
        {element.children.map((child, childIndex) => renderElement(child, childIndex))}
        
        {element.children.length > 0 && (
          <div
            className="py-0.5 px-3 font-mono text-sm text-muted-foreground"
            style={{ marginLeft: `${indent}px` }}
          >
            &lt;/<span className="text-blue-600 dark:text-blue-400">{element.tag}</span>&gt;
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          CSS Selector Playground
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Selector Input & Examples */}
        <div className="space-y-4">
          {/* Selector Input */}
          <Card className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">CSS Selector</label>
              <Input
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="Enter a CSS selector..."
                className={cn(
                  'font-mono',
                  !isValidSelector && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {!isValidSelector && (
                <p className="text-xs text-destructive mt-2">Invalid selector syntax</p>
              )}
            </div>
            
            {/* Match Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Matches found:</span>
              <span className="font-semibold text-primary">
                {matchingElements.length} element{matchingElements.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Specificity */}
            {showSpecificity && specificity && (
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info className="w-4 h-4 text-primary" />
                  Specificity
                </div>
                <div className="bg-secondary/50 rounded p-3 space-y-2">
                  <div className="font-mono text-lg font-bold text-center">
                    {formatSpecificity(specificity)}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    (inline, IDs, classes, elements)
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs mt-3">
                    <div>
                      <div className="font-semibold text-purple-600 dark:text-purple-400">
                        {specificity.inline}
                      </div>
                      <div className="text-muted-foreground">Inline</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {specificity.ids}
                      </div>
                      <div className="text-muted-foreground">IDs</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {specificity.classes}
                      </div>
                      <div className="text-muted-foreground">Classes</div>
                    </div>
                    <div>
                      <div className="font-semibold text-orange-600 dark:text-orange-400">
                        {specificity.elements}
                      </div>
                      <div className="text-muted-foreground">Elements</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                    {explainSpecificity(selector)}
                  </p>
                </div>
              </div>
            )}
          </Card>
          
          {/* Common Examples */}
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Code2 className="w-4 h-4 text-primary" />
              Common Selectors
            </div>
            <div className="space-y-1">
              {SELECTOR_EXAMPLES.map((example) => (
                <button
                  key={example.selector}
                  onClick={() => handleExampleClick(example)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                    'hover:bg-secondary/80',
                    selectedExample === example.selector && 'bg-primary/10 border border-primary/20'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{example.label}</span>
                    <code className="text-xs font-mono text-muted-foreground">
                      {example.selector}
                    </code>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Right: HTML Structure Visualization */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-4">
            <Code2 className="w-4 h-4 text-primary" />
            HTML Structure
          </div>
          <div className="bg-secondary/30 rounded p-4 max-h-[600px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {parsedElements.map((element, index) => renderElement(element, index))}
            </AnimatePresence>
          </div>
        </Card>
      </div>
      
      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Type a CSS selector to see which elements it matches in real-time. 
        Try the common examples or create your own complex selectors!
      </div>
    </div>
  );
}
