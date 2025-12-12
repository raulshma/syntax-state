'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  RotateCcw,
  Code2,
  Accessibility,
  Eye,
  Keyboard,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface AccessibilityIssue {
  id: string;
  severity: IssueSeverity;
  rule: string;
  element: string;
  description: string;
  suggestion: string;
  wcagCriteria?: string;
}

export interface AccessibilityExample {
  id: string;
  name: string;
  description: string;
  html: string;
  issues: AccessibilityIssue[];
}

export const accessibilityExamples: AccessibilityExample[] = [
  {
    id: 'missing-alt',
    name: 'Missing Alt Text',
    description: 'Images without alternative text',
    html: `<img src="hero.jpg">
<img src="logo.png" alt="">
<img src="profile.jpg" alt="User profile photo">`,
    issues: [
      {
        id: '1',
        severity: 'error',
        rule: 'img-alt',
        element: '<img src="hero.jpg">',
        description: 'Image is missing alt attribute',
        suggestion: 'Add alt attribute describing the image content',
        wcagCriteria: 'WCAG 1.1.1 Non-text Content',
      },
      {
        id: '2',
        severity: 'warning',
        rule: 'img-alt-empty',
        element: '<img src="logo.png" alt="">',
        description: 'Image has empty alt text',
        suggestion: 'If decorative, add role="presentation". Otherwise, add descriptive alt text',
        wcagCriteria: 'WCAG 1.1.1 Non-text Content',
      },
    ],
  },
  {
    id: 'heading-order',
    name: 'Heading Structure',
    description: 'Improper heading hierarchy',
    html: `<h1>Welcome to My Site</h1>
<h3>About Us</h3>
<h2>Our Services</h2>
<h4>Contact</h4>`,
    issues: [
      {
        id: '1',
        severity: 'error',
        rule: 'heading-order',
        element: '<h3>About Us</h3>',
        description: 'Heading level skipped: h1 to h3',
        suggestion: 'Use h2 instead to maintain proper heading hierarchy',
        wcagCriteria: 'WCAG 1.3.1 Info and Relationships',
      },
      {
        id: '2',
        severity: 'warning',
        rule: 'heading-order',
        element: '<h4>Contact</h4>',
        description: 'Heading level inconsistent with document structure',
        suggestion: 'Consider using h3 to follow h2 properly',
        wcagCriteria: 'WCAG 1.3.1 Info and Relationships',
      },
    ],
  },
  {
    id: 'form-labels',
    name: 'Form Labels',
    description: 'Form inputs without proper labels',
    html: `<input type="text" placeholder="Enter name">
<input type="email" id="email">
<label for="phone">Phone:</label>
<input type="tel" id="phone">`,
    issues: [
      {
        id: '1',
        severity: 'error',
        rule: 'label-missing',
        element: '<input type="text" placeholder="Enter name">',
        description: 'Form input has no associated label',
        suggestion: 'Add a <label> element with for attribute matching input id',
        wcagCriteria: 'WCAG 1.3.1 Info and Relationships',
      },
      {
        id: '2',
        severity: 'error',
        rule: 'label-missing',
        element: '<input type="email" id="email">',
        description: 'Input has id but no associated label',
        suggestion: 'Add <label for="email">Email:</label> before the input',
        wcagCriteria: 'WCAG 1.3.1 Info and Relationships',
      },
    ],
  },
  {
    id: 'color-contrast',
    name: 'Color Contrast',
    description: 'Text with insufficient color contrast',
    html: `<p style="color: #999; background: #fff;">
  Light gray text on white
</p>
<p style="color: #333; background: #fff;">
  Dark text on white (good!)
</p>
<a href="#" style="color: #aaa;">
  Low contrast link
</a>`,
    issues: [
      {
        id: '1',
        severity: 'error',
        rule: 'color-contrast',
        element: '<p style="color: #999">',
        description: 'Text color #999 on #fff has contrast ratio of 2.85:1',
        suggestion: 'Use darker text color. Minimum ratio is 4.5:1 for normal text',
        wcagCriteria: 'WCAG 1.4.3 Contrast (Minimum)',
      },
      {
        id: '2',
        severity: 'error',
        rule: 'link-contrast',
        element: '<a style="color: #aaa">',
        description: 'Link color has insufficient contrast',
        suggestion: 'Use a darker color or add underline for link identification',
        wcagCriteria: 'WCAG 1.4.3 Contrast (Minimum)',
      },
    ],
  },
  {
    id: 'interactive-elements',
    name: 'Interactive Elements',
    description: 'Clickable elements without proper roles',
    html: `<div onclick="handleClick()">Click me</div>
<span class="button" onclick="submit()">
  Submit
</span>
<button type="button">
  Proper Button
</button>`,
    issues: [
      {
        id: '1',
        severity: 'error',
        rule: 'interactive-role',
        element: '<div onclick="handleClick()">',
        description: 'Clickable div is not keyboard accessible',
        suggestion: 'Use <button> element or add role="button" and tabindex="0"',
        wcagCriteria: 'WCAG 2.1.1 Keyboard',
      },
      {
        id: '2',
        severity: 'error',
        rule: 'interactive-role',
        element: '<span class="button">',
        description: 'Span with click handler lacks proper semantics',
        suggestion: 'Replace with <button> for proper keyboard and screen reader support',
        wcagCriteria: 'WCAG 4.1.2 Name, Role, Value',
      },
    ],
  },
  {
    id: 'good-example',
    name: 'Accessible Example',
    description: 'Well-structured accessible HTML',
    html: `<main>
  <h1>Welcome</h1>
  <img src="hero.jpg" alt="Team collaboration">
  <form>
    <label for="name">Name:</label>
    <input type="text" id="name" required>
    <button type="submit">Submit</button>
  </form>
</main>`,
    issues: [],
  },
];


interface AccessibilityCheckerProps {
  initialExample?: string;
  showSuggestions?: boolean;
}

export function AccessibilityChecker({
  initialExample = 'missing-alt',
  showSuggestions = true,
}: AccessibilityCheckerProps) {
  const [selectedExampleId, setSelectedExampleId] = useState(initialExample);
  const [analyzedHtml, setAnalyzedHtml] = useState<string | null>(null);

  const selectedExample = accessibilityExamples.find((e) => e.id === selectedExampleId)!;

  const handleReset = useCallback(() => {
    setSelectedExampleId('missing-alt');
    setAnalyzedHtml(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    setAnalyzedHtml(selectedExample.html);
  }, [selectedExample.html]);

  const getSeverityIcon = (severity: IssueSeverity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: IssueSeverity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getCategoryIcon = (rule: string) => {
    if (rule.includes('img') || rule.includes('alt')) return <Eye className="w-3 h-3" />;
    if (rule.includes('heading') || rule.includes('label')) return <Type className="w-3 h-3" />;
    if (rule.includes('keyboard') || rule.includes('interactive')) return <Keyboard className="w-3 h-3" />;
    if (rule.includes('color') || rule.includes('contrast')) return <Eye className="w-3 h-3" />;
    return <Accessibility className="w-3 h-3" />;
  };

  const errorCount = selectedExample.issues.filter((i) => i.severity === 'error').length;
  const warningCount = selectedExample.issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-primary" />
          Accessibility Checker
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Example Selector */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            Test Examples
          </h4>
          <div className="space-y-2">
            {accessibilityExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => {
                  setSelectedExampleId(example.id);
                  setAnalyzedHtml(null);
                }}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-colors',
                  selectedExampleId === example.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-secondary/50 border-border'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{example.name}</span>
                  {example.issues.length === 0 ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />
                  ) : (
                    <span className="ml-auto text-xs text-red-400">
                      {example.issues.length} issue{example.issues.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Analysis Panel */}
        <Card className="lg:col-span-2 p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            {selectedExample.name}
          </h4>

          {/* HTML Code */}
          <div className="mb-4 p-3 rounded-lg bg-zinc-900">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400">HTML to analyze</span>
            </div>
            <pre className="text-sm font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
              {selectedExample.html}
            </pre>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            className="w-full mb-4 gap-2"
            variant={analyzedHtml ? 'outline' : 'default'}
          >
            <Accessibility className="w-4 h-4" />
            {analyzedHtml ? 'Re-analyze' : 'Check Accessibility'}
          </Button>

          {/* Results */}
          <AnimatePresence mode="wait">
            {analyzedHtml && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div
                  className={cn(
                    'p-3 rounded-lg border',
                    selectedExample.issues.length === 0
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-secondary/50 border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {selectedExample.issues.length === 0 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-400">
                          No accessibility issues found!
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          {errorCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                              <XCircle className="w-3 h-3" />
                              {errorCount} error{errorCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {warningCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <AlertTriangle className="w-3 h-3" />
                              {warningCount} warning{warningCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Issues List */}
                {selectedExample.issues.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Issues Found
                    </h5>
                    {selectedExample.issues.map((issue, index) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          'p-3 rounded-lg border',
                          getSeverityClass(issue.severity)
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium capitalize">
                                {issue.severity}
                              </span>
                              <span className="flex items-center gap-1 text-xs bg-black/20 px-1.5 py-0.5 rounded">
                                {getCategoryIcon(issue.rule)}
                                {issue.rule}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{issue.description}</p>
                            <code className="block text-xs bg-black/20 px-2 py-1 rounded mt-2 overflow-x-auto">
                              {issue.element}
                            </code>
                            {showSuggestions && (
                              <div className="mt-2 p-2 rounded bg-black/10">
                                <span className="text-xs font-medium">💡 Suggestion: </span>
                                <span className="text-xs">{issue.suggestion}</span>
                              </div>
                            )}
                            {issue.wcagCriteria && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                📋 {issue.wcagCriteria}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* WCAG Quick Reference */}
      <Card className="p-4 bg-card border shadow-sm">
        <h4 className="font-medium mb-3 text-sm">Common WCAG Criteria</h4>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              1.1.1 Non-text Content
            </div>
            <p className="text-muted-foreground">
              All images need alt text describing their content
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1 flex items-center gap-1">
              <Type className="w-3 h-3" />
              1.3.1 Info & Relationships
            </div>
            <p className="text-muted-foreground">
              Use proper headings, labels, and semantic structure
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              1.4.3 Contrast
            </div>
            <p className="text-muted-foreground">
              Text must have 4.5:1 contrast ratio minimum
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1 flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              2.1.1 Keyboard
            </div>
            <p className="text-muted-foreground">
              All functionality must be keyboard accessible
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Select different examples to see common accessibility issues and how to fix them.
      </div>
    </div>
  );
}

export { accessibilityExamples as examples };
