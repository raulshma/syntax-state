'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  RotateCcw,
  Eye,
  Code,
  Palette,
  Type,
  Image,
  RefreshCw,
  Copy,
  Check,
  Bug,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FallbackUIBuilderProps {
  /** Whether to show the code preview */
  showCode?: boolean;
  /** Whether to show the live preview */
  showPreview?: boolean;
}

interface FallbackConfig {
  title: string;
  message: string;
  showIcon: boolean;
  iconType: 'warning' | 'bug' | 'alert';
  showRetryButton: boolean;
  retryButtonText: string;
  showHomeButton: boolean;
  homeButtonText: string;
  showErrorDetails: boolean;
  backgroundColor: 'red' | 'yellow' | 'blue' | 'gray';
  borderStyle: 'solid' | 'dashed' | 'none';
}

const defaultConfig: FallbackConfig = {
  title: 'Something went wrong',
  message: 'We encountered an unexpected error. Please try again.',
  showIcon: true,
  iconType: 'warning',
  showRetryButton: true,
  retryButtonText: 'Try Again',
  showHomeButton: false,
  homeButtonText: 'Go Home',
  showErrorDetails: true,
  backgroundColor: 'red',
  borderStyle: 'solid',
};

const colorClasses = {
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-500',
    title: 'text-red-600 dark:text-red-400',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-500',
    title: 'text-yellow-600 dark:text-yellow-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
    title: 'text-blue-600 dark:text-blue-400',
  },
  gray: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    icon: 'text-gray-500',
    title: 'text-gray-600 dark:text-gray-400',
  },
};

/**
 * FallbackUIBuilder Component
 * Design custom fallback components and preview fallback rendering
 * Requirements: 18.7
 */
export function FallbackUIBuilder({
  showCode = true,
  showPreview = true,
}: FallbackUIBuilderProps) {
  const [config, setConfig] = useState<FallbackConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);

  const updateConfig = useCallback(<K extends keyof FallbackConfig>(
    key: K,
    value: FallbackConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  const generateCode = useCallback(() => {
    const colors = colorClasses[config.backgroundColor];
    const iconComponent = config.iconType === 'warning' 
      ? 'AlertTriangle' 
      : config.iconType === 'bug' 
      ? 'Bug' 
      : 'AlertCircle';

    return `function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="${colors.bg} ${config.borderStyle !== 'none' ? `border ${config.borderStyle === 'dashed' ? 'border-dashed' : ''} ${colors.border}` : ''} rounded-lg p-6">
      <div className="flex items-start gap-4">
        ${config.showIcon ? `<${iconComponent} className="w-6 h-6 ${colors.icon} shrink-0" />` : ''}
        <div className="flex-1">
          <h3 className="font-semibold ${colors.title}">
            ${config.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            ${config.message}
          </p>
          ${config.showErrorDetails ? `
          <details className="mt-3">
            <summary className="text-xs cursor-pointer">
              Error details
            </summary>
            <pre className="mt-2 p-2 rounded bg-secondary/50 text-xs overflow-auto">
              {error.message}
            </pre>
          </details>` : ''}
          <div className="flex gap-2 mt-4">
            ${config.showRetryButton ? `<Button onClick={resetErrorBoundary} variant="outline" size="sm">
              <RotateCcw className="w-3 h-3 mr-1" />
              ${config.retryButtonText}
            </Button>` : ''}
            ${config.showHomeButton ? `<Button onClick={() => window.location.href = '/'} variant="ghost" size="sm">
              <Home className="w-3 h-3 mr-1" />
              ${config.homeButtonText}
            </Button>` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}`;
  }, [config]);

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generateCode]);

  const IconComponent = config.iconType === 'warning' 
    ? AlertTriangle 
    : config.iconType === 'bug' 
    ? Bug 
    : AlertTriangle;

  const colors = colorClasses[config.backgroundColor];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Fallback UI Builder
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration Panel */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Configuration</span>
          </div>
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {/* Content Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4" />
                Content
              </h4>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs">Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  placeholder="Error title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs">Message</Label>
                <Textarea
                  id="message"
                  value={config.message}
                  onChange={(e) => updateConfig('message', e.target.value)}
                  placeholder="Error message"
                  rows={2}
                />
              </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-3 pt-3 border-t">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Color Theme</Label>
                  <Select
                    value={config.backgroundColor}
                    onValueChange={(v) => updateConfig('backgroundColor', v as FallbackConfig['backgroundColor'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red (Error)</SelectItem>
                      <SelectItem value="yellow">Yellow (Warning)</SelectItem>
                      <SelectItem value="blue">Blue (Info)</SelectItem>
                      <SelectItem value="gray">Gray (Neutral)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Border Style</Label>
                  <Select
                    value={config.borderStyle}
                    onValueChange={(v) => updateConfig('borderStyle', v as FallbackConfig['borderStyle'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showIcon" className="text-xs">Show Icon</Label>
                <Switch
                  id="showIcon"
                  checked={config.showIcon}
                  onCheckedChange={(v) => updateConfig('showIcon', v)}
                />
              </div>
              {config.showIcon && (
                <div className="space-y-2">
                  <Label className="text-xs">Icon Type</Label>
                  <Select
                    value={config.iconType}
                    onValueChange={(v) => updateConfig('iconType', v as FallbackConfig['iconType'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning Triangle</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="alert">Alert Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="space-y-3 pt-3 border-t">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Actions
              </h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="showRetry" className="text-xs">Show Retry Button</Label>
                <Switch
                  id="showRetry"
                  checked={config.showRetryButton}
                  onCheckedChange={(v) => updateConfig('showRetryButton', v)}
                />
              </div>
              {config.showRetryButton && (
                <div className="space-y-2">
                  <Label className="text-xs">Retry Button Text</Label>
                  <Input
                    value={config.retryButtonText}
                    onChange={(e) => updateConfig('retryButtonText', e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="showHome" className="text-xs">Show Home Button</Label>
                <Switch
                  id="showHome"
                  checked={config.showHomeButton}
                  onCheckedChange={(v) => updateConfig('showHomeButton', v)}
                />
              </div>
              {config.showHomeButton && (
                <div className="space-y-2">
                  <Label className="text-xs">Home Button Text</Label>
                  <Input
                    value={config.homeButtonText}
                    onChange={(e) => updateConfig('homeButtonText', e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="showDetails" className="text-xs">Show Error Details</Label>
                <Switch
                  id="showDetails"
                  checked={config.showErrorDetails}
                  onCheckedChange={(v) => updateConfig('showErrorDetails', v)}
                />
              </div>
            </div>
          </div>
        </Card>


        {/* Preview Panel */}
        {showPreview && (
          <Card className="overflow-hidden border shadow-sm">
            <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Live Preview</span>
            </div>
            <div className="p-4">
              <motion.div
                key={JSON.stringify(config)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-lg p-6',
                  colors.bg,
                  config.borderStyle !== 'none' && 'border',
                  config.borderStyle === 'dashed' && 'border-dashed',
                  config.borderStyle !== 'none' && colors.border
                )}
              >
                <div className="flex items-start gap-4">
                  {config.showIcon && (
                    <IconComponent className={cn('w-6 h-6 shrink-0', colors.icon)} />
                  )}
                  <div className="flex-1">
                    <h3 className={cn('font-semibold', colors.title)}>
                      {config.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.message}
                    </p>
                    {config.showErrorDetails && (
                      <details className="mt-3">
                        <summary className="text-xs cursor-pointer hover:text-foreground text-muted-foreground">
                          Error details
                        </summary>
                        <pre className="mt-2 p-2 rounded bg-secondary/50 text-xs overflow-auto font-mono">
                          TypeError: Cannot read property &apos;map&apos; of undefined
                        </pre>
                      </details>
                    )}
                    <div className="flex gap-2 mt-4">
                      {config.showRetryButton && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <RotateCcw className="w-3 h-3" />
                          {config.retryButtonText}
                        </Button>
                      )}
                      {config.showHomeButton && (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Home className="w-3 h-3" />
                          {config.homeButtonText}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        )}
      </div>

      {/* Code Preview */}
      {showCode && (
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4" />
              Generated Code
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="gap-1 h-7"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-4 max-h-[300px] overflow-auto">
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {generateCode()}
            </pre>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium mb-2">Best Practices for Fallback UIs</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Be helpful:</strong> Tell users what happened and what they can do</li>
          <li>• <strong>Provide actions:</strong> Give users a way to recover (retry, go home, contact support)</li>
          <li>• <strong>Show details optionally:</strong> Technical details help developers but can confuse users</li>
          <li>• <strong>Match your design:</strong> Fallback UIs should feel like part of your app</li>
          <li>• <strong>Log errors:</strong> Send error details to your error tracking service</li>
        </ul>
      </Card>
    </div>
  );
}

export default FallbackUIBuilder;
