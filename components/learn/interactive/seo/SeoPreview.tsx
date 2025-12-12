'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Share2,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Twitter,
  Facebook,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SeoMetaTags {
  title: string;
  description: string;
  url: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
}

export interface CharacterLimits {
  titleMin: number;
  titleMax: number;
  titleOptimal: number;
  descriptionMin: number;
  descriptionMax: number;
  descriptionOptimal: number;
}

export const DEFAULT_LIMITS: CharacterLimits = {
  titleMin: 30,
  titleMax: 60,
  titleOptimal: 55,
  descriptionMin: 120,
  descriptionMax: 160,
  descriptionOptimal: 155,
};

export const DEFAULT_META_TAGS: SeoMetaTags = {
  title: 'Learn Web Development | SyntaxState',
  description: 'Master web development with interactive lessons, hands-on projects, and AI-powered learning paths. Start your coding journey today.',
  url: 'https://syntaxstate.com/learn',
  ogTitle: 'Learn Web Development | SyntaxState',
  ogDescription: 'Master web development with interactive lessons and AI-powered learning.',
  ogImage: 'https://syntaxstate.com/og-image.png',
  twitterCard: 'summary_large_image',
};

export interface SeoPreviewProps {
  metaTags?: SeoMetaTags;
  showSocialPreviews?: boolean;
  onMetaChange?: (tags: SeoMetaTags) => void;
}

export function SeoPreview({
  metaTags = DEFAULT_META_TAGS,
  showSocialPreviews = true,
  onMetaChange,
}: SeoPreviewProps) {
  const [activePreview, setActivePreview] = useState<'google' | 'facebook' | 'twitter' | 'linkedin'>('google');

  const handleReset = useCallback(() => {
    onMetaChange?.(DEFAULT_META_TAGS);
  }, [onMetaChange]);

  // Character count analysis
  const titleAnalysis = useMemo(() => {
    const length = metaTags.title.length;
    return {
      length,
      status: length < DEFAULT_LIMITS.titleMin 
        ? 'too-short' 
        : length > DEFAULT_LIMITS.titleMax 
          ? 'too-long' 
          : 'optimal',
      message: length < DEFAULT_LIMITS.titleMin
        ? `Too short (${length}/${DEFAULT_LIMITS.titleMin} min)`
        : length > DEFAULT_LIMITS.titleMax
          ? `Too long (${length}/${DEFAULT_LIMITS.titleMax} max)`
          : `Good length (${length}/${DEFAULT_LIMITS.titleOptimal} optimal)`,
    };
  }, [metaTags.title]);

  const descriptionAnalysis = useMemo(() => {
    const length = metaTags.description.length;
    return {
      length,
      status: length < DEFAULT_LIMITS.descriptionMin 
        ? 'too-short' 
        : length > DEFAULT_LIMITS.descriptionMax 
          ? 'too-long' 
          : 'optimal',
      message: length < DEFAULT_LIMITS.descriptionMin
        ? `Too short (${length}/${DEFAULT_LIMITS.descriptionMin} min)`
        : length > DEFAULT_LIMITS.descriptionMax
          ? `Too long (${length}/${DEFAULT_LIMITS.descriptionMax} max)`
          : `Good length (${length}/${DEFAULT_LIMITS.descriptionOptimal} optimal)`,
    };
  }, [metaTags.description]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'too-short':
        return 'text-yellow-500';
      case 'too-long':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'too-short':
      case 'too-long':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Truncate text for preview
  const truncateTitle = (text: string, max: number = 60) => {
    if (text.length <= max) return text;
    return text.substring(0, max - 3) + '...';
  };

  const truncateDescription = (text: string, max: number = 160) => {
    if (text.length <= max) return text;
    return text.substring(0, max - 3) + '...';
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          SEO Preview
        </h3>
        {onMetaChange && (
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Character Count Warnings */}
      <Card className="p-4 bg-card border shadow-sm">
        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Character Analysis</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Title</span>
              <span className={cn('text-xs flex items-center gap-1', getStatusColor(titleAnalysis.status))}>
                {getStatusIcon(titleAnalysis.status)}
                {titleAnalysis.message}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  titleAnalysis.status === 'optimal' && 'bg-green-500',
                  titleAnalysis.status === 'too-short' && 'bg-yellow-500',
                  titleAnalysis.status === 'too-long' && 'bg-red-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((titleAnalysis.length / DEFAULT_LIMITS.titleMax) * 100, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Description</span>
              <span className={cn('text-xs flex items-center gap-1', getStatusColor(descriptionAnalysis.status))}>
                {getStatusIcon(descriptionAnalysis.status)}
                {descriptionAnalysis.message}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  descriptionAnalysis.status === 'optimal' && 'bg-green-500',
                  descriptionAnalysis.status === 'too-short' && 'bg-yellow-500',
                  descriptionAnalysis.status === 'too-long' && 'bg-red-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((descriptionAnalysis.length / DEFAULT_LIMITS.descriptionMax) * 100, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Tabs */}
      {showSocialPreviews && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activePreview === 'google' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePreview('google')}
            className="gap-1"
          >
            <Search className="w-3 h-3" />
            Google
          </Button>
          <Button
            variant={activePreview === 'facebook' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePreview('facebook')}
            className="gap-1"
          >
            <Facebook className="w-3 h-3" />
            Facebook
          </Button>
          <Button
            variant={activePreview === 'twitter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePreview('twitter')}
            className="gap-1"
          >
            <Twitter className="w-3 h-3" />
            Twitter/X
          </Button>
          <Button
            variant={activePreview === 'linkedin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePreview('linkedin')}
            className="gap-1"
          >
            <Linkedin className="w-3 h-3" />
            LinkedIn
          </Button>
        </div>
      )}

      {/* Preview Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePreview}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activePreview === 'google' && (
            <GooglePreview metaTags={metaTags} truncateTitle={truncateTitle} truncateDescription={truncateDescription} />
          )}
          {activePreview === 'facebook' && (
            <FacebookPreview metaTags={metaTags} truncateTitle={truncateTitle} truncateDescription={truncateDescription} />
          )}
          {activePreview === 'twitter' && (
            <TwitterPreview metaTags={metaTags} truncateTitle={truncateTitle} truncateDescription={truncateDescription} />
          )}
          {activePreview === 'linkedin' && (
            <LinkedInPreview metaTags={metaTags} truncateTitle={truncateTitle} truncateDescription={truncateDescription} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Optimal title length is 50-60 characters. Description should be 150-160 characters for best results.
      </div>
    </div>
  );
}


// Google Search Result Preview
function GooglePreview({
  metaTags,
  truncateTitle,
  truncateDescription,
}: {
  metaTags: SeoMetaTags;
  truncateTitle: (text: string, max?: number) => string;
  truncateDescription: (text: string, max?: number) => string;
}) {
  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Google Search Preview</span>
      </div>
      
      {/* Google Search Result */}
      <div className="max-w-xl">
        {/* URL breadcrumb */}
        <div className="flex items-center gap-1 text-sm mb-1">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-3 h-3 text-primary" />
          </div>
          <span className="text-zinc-600 dark:text-zinc-400">{metaTags.url}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-1 font-normal">
          {truncateTitle(metaTags.title)}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {truncateDescription(metaTags.description)}
        </p>
      </div>
    </Card>
  );
}

// Facebook Share Preview
function FacebookPreview({
  metaTags,
  truncateTitle,
  truncateDescription,
}: {
  metaTags: SeoMetaTags;
  truncateTitle: (text: string, max?: number) => string;
  truncateDescription: (text: string, max?: number) => string;
}) {
  const ogTitle = metaTags.ogTitle || metaTags.title;
  const ogDescription = metaTags.ogDescription || metaTags.description;
  
  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Facebook className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-muted-foreground">Facebook Share Preview</span>
      </div>
      
      <div className="max-w-lg border rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800">
        {/* Image placeholder */}
        {metaTags.ogImage ? (
          <div className="aspect-[1.91/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Share2 className="w-12 h-12 text-primary/40" />
          </div>
        ) : (
          <div className="aspect-[1.91/1] bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No og:image set</span>
          </div>
        )}
        
        {/* Content */}
        <div className="p-3 border-t">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
            {new URL(metaTags.url).hostname}
          </p>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">
            {truncateTitle(ogTitle, 88)}
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {truncateDescription(ogDescription, 200)}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Twitter/X Card Preview
function TwitterPreview({
  metaTags,
  truncateTitle,
  truncateDescription,
}: {
  metaTags: SeoMetaTags;
  truncateTitle: (text: string, max?: number) => string;
  truncateDescription: (text: string, max?: number) => string;
}) {
  const twitterTitle = metaTags.twitterTitle || metaTags.ogTitle || metaTags.title;
  const twitterDescription = metaTags.twitterDescription || metaTags.ogDescription || metaTags.description;
  const isLargeCard = metaTags.twitterCard === 'summary_large_image';
  
  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Twitter className="w-4 h-4 text-sky-500" />
        <span className="text-sm text-muted-foreground">Twitter/X Card Preview</span>
        <span className="text-xs bg-secondary px-2 py-0.5 rounded ml-auto">
          {isLargeCard ? 'Large Image' : 'Summary'}
        </span>
      </div>
      
      <div className={cn(
        'max-w-lg border rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800',
        !isLargeCard && 'flex'
      )}>
        {/* Image */}
        {isLargeCard ? (
          <div className="aspect-[2/1] bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center">
            <Share2 className="w-12 h-12 text-sky-500/40" />
          </div>
        ) : (
          <div className="w-32 h-32 bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center shrink-0">
            <Share2 className="w-8 h-8 text-sky-500/40" />
          </div>
        )}
        
        {/* Content */}
        <div className={cn('p-3', !isLargeCard && 'flex-1 flex flex-col justify-center')}>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">
            {truncateTitle(twitterTitle, 70)}
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-1">
            {truncateDescription(twitterDescription, 200)}
          </p>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {new URL(metaTags.url).hostname}
          </p>
        </div>
      </div>
    </Card>
  );
}

// LinkedIn Share Preview
function LinkedInPreview({
  metaTags,
  truncateTitle,
  truncateDescription,
}: {
  metaTags: SeoMetaTags;
  truncateTitle: (text: string, max?: number) => string;
  truncateDescription: (text: string, max?: number) => string;
}) {
  const ogTitle = metaTags.ogTitle || metaTags.title;
  const ogDescription = metaTags.ogDescription || metaTags.description;
  
  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Linkedin className="w-4 h-4 text-blue-700" />
        <span className="text-sm text-muted-foreground">LinkedIn Share Preview</span>
      </div>
      
      <div className="max-w-lg border rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800">
        {/* Image */}
        <div className="aspect-[1.91/1] bg-gradient-to-br from-blue-700/20 to-blue-700/5 flex items-center justify-center">
          <Share2 className="w-12 h-12 text-blue-700/40" />
        </div>
        
        {/* Content */}
        <div className="p-3 border-t">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">
            {truncateTitle(ogTitle, 150)}
          </h4>
          <p className="text-xs text-zinc-500">
            {new URL(metaTags.url).hostname}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Utilities already exported at declaration
