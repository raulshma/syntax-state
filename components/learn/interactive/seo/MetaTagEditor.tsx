'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  Info,
  Globe,
  Share2,
  Twitter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SeoPreview, SeoMetaTags, DEFAULT_META_TAGS } from './SeoPreview';

export interface MetaTag {
  id: string;
  type: 'name' | 'property';
  name: string;
  content: string;
}

export interface MetaTagEditorProps {
  initialTags?: SeoMetaTags;
  showPreview?: boolean;
  onTagsChange?: (tags: SeoMetaTags) => void;
}

const META_TAG_PRESETS: { category: string; tags: { name: string; type: 'name' | 'property'; description: string }[] }[] = [
  {
    category: 'Basic SEO',
    tags: [
      { name: 'title', type: 'name', description: 'Page title shown in search results' },
      { name: 'description', type: 'name', description: 'Page description for search engines' },
      { name: 'keywords', type: 'name', description: 'Keywords related to page content' },
      { name: 'author', type: 'name', description: 'Author of the page content' },
      { name: 'robots', type: 'name', description: 'Instructions for search engine crawlers' },
    ],
  },
  {
    category: 'Open Graph',
    tags: [
      { name: 'og:title', type: 'property', description: 'Title for social sharing' },
      { name: 'og:description', type: 'property', description: 'Description for social sharing' },
      { name: 'og:image', type: 'property', description: 'Image URL for social sharing' },
      { name: 'og:url', type: 'property', description: 'Canonical URL of the page' },
      { name: 'og:type', type: 'property', description: 'Type of content (website, article, etc.)' },
      { name: 'og:site_name', type: 'property', description: 'Name of the website' },
    ],
  },
  {
    category: 'Twitter Card',
    tags: [
      { name: 'twitter:card', type: 'name', description: 'Card type (summary, summary_large_image)' },
      { name: 'twitter:title', type: 'name', description: 'Title for Twitter sharing' },
      { name: 'twitter:description', type: 'name', description: 'Description for Twitter sharing' },
      { name: 'twitter:image', type: 'name', description: 'Image URL for Twitter sharing' },
      { name: 'twitter:site', type: 'name', description: 'Twitter @username of the site' },
    ],
  },
];

export function MetaTagEditor({
  initialTags = DEFAULT_META_TAGS,
  showPreview = true,
  onTagsChange,
}: MetaTagEditorProps) {
  const [metaTags, setMetaTags] = useState<SeoMetaTags>(initialTags);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'opengraph' | 'twitter'>('basic');

  const handleReset = useCallback(() => {
    setMetaTags(DEFAULT_META_TAGS);
    onTagsChange?.(DEFAULT_META_TAGS);
  }, [onTagsChange]);

  const updateMetaTag = useCallback((key: keyof SeoMetaTags, value: string) => {
    setMetaTags(prev => {
      const updated = { ...prev, [key]: value };
      onTagsChange?.(updated);
      return updated;
    });
  }, [onTagsChange]);

  const generateHtmlCode = useCallback(() => {
    const lines: string[] = [
      `<title>${metaTags.title}</title>`,
      `<meta name="description" content="${metaTags.description}">`,
      '',
      '<!-- Open Graph / Facebook -->',
      `<meta property="og:type" content="website">`,
      `<meta property="og:url" content="${metaTags.url}">`,
      `<meta property="og:title" content="${metaTags.ogTitle || metaTags.title}">`,
      `<meta property="og:description" content="${metaTags.ogDescription || metaTags.description}">`,
    ];

    if (metaTags.ogImage) {
      lines.push(`<meta property="og:image" content="${metaTags.ogImage}">`);
    }

    lines.push(
      '',
      '<!-- Twitter -->',
      `<meta name="twitter:card" content="${metaTags.twitterCard || 'summary_large_image'}">`,
      `<meta name="twitter:url" content="${metaTags.url}">`,
      `<meta name="twitter:title" content="${metaTags.twitterTitle || metaTags.ogTitle || metaTags.title}">`,
      `<meta name="twitter:description" content="${metaTags.twitterDescription || metaTags.ogDescription || metaTags.description}">`
    );

    if (metaTags.ogImage) {
      lines.push(`<meta name="twitter:image" content="${metaTags.ogImage}">`);
    }

    return lines.join('\n');
  }, [metaTags]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateHtmlCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateHtmlCode]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Meta Tag Editor
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'basic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('basic')}
              className="gap-1"
            >
              <Globe className="w-3 h-3" />
              Basic SEO
            </Button>
            <Button
              variant={activeTab === 'opengraph' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('opengraph')}
              className="gap-1"
            >
              <Share2 className="w-3 h-3" />
              Open Graph
            </Button>
            <Button
              variant={activeTab === 'twitter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('twitter')}
              className="gap-1"
            >
              <Twitter className="w-3 h-3" />
              Twitter
            </Button>
          </div>

          {/* Editor Forms */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 bg-card border shadow-sm space-y-4">
                {activeTab === 'basic' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm flex items-center gap-2">
                        Page Title
                        <span className="text-xs text-muted-foreground">({metaTags.title.length}/60)</span>
                      </Label>
                      <Input
                        id="title"
                        value={metaTags.title}
                        onChange={(e) => updateMetaTag('title', e.target.value)}
                        placeholder="Enter page title..."
                        className={cn(
                          metaTags.title.length > 60 && 'border-yellow-500'
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm flex items-center gap-2">
                        Meta Description
                        <span className="text-xs text-muted-foreground">({metaTags.description.length}/160)</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={metaTags.description}
                        onChange={(e) => updateMetaTag('description', e.target.value)}
                        placeholder="Enter meta description..."
                        rows={3}
                        className={cn(
                          metaTags.description.length > 160 && 'border-yellow-500'
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-sm">Canonical URL</Label>
                      <Input
                        id="url"
                        value={metaTags.url}
                        onChange={(e) => updateMetaTag('url', e.target.value)}
                        placeholder="https://example.com/page"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'opengraph' && (
                  <>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                      <Info className="w-4 h-4 text-blue-500 inline mr-2" />
                      Open Graph tags control how your page appears when shared on Facebook, LinkedIn, and other platforms.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ogTitle" className="text-sm">og:title</Label>
                      <Input
                        id="ogTitle"
                        value={metaTags.ogTitle || ''}
                        onChange={(e) => updateMetaTag('ogTitle', e.target.value)}
                        placeholder={metaTags.title || 'Falls back to page title'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ogDescription" className="text-sm">og:description</Label>
                      <Textarea
                        id="ogDescription"
                        value={metaTags.ogDescription || ''}
                        onChange={(e) => updateMetaTag('ogDescription', e.target.value)}
                        placeholder={metaTags.description || 'Falls back to meta description'}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ogImage" className="text-sm">og:image</Label>
                      <Input
                        id="ogImage"
                        value={metaTags.ogImage || ''}
                        onChange={(e) => updateMetaTag('ogImage', e.target.value)}
                        placeholder="https://example.com/og-image.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1200x630 pixels
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'twitter' && (
                  <>
                    <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sm">
                      <Info className="w-4 h-4 text-sky-500 inline mr-2" />
                      Twitter Card tags control how your page appears when shared on Twitter/X.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterCard" className="text-sm">twitter:card</Label>
                      <select
                        id="twitterCard"
                        value={metaTags.twitterCard || 'summary_large_image'}
                        onChange={(e) => updateMetaTag('twitterCard', e.target.value as 'summary' | 'summary_large_image')}
                        className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                      >
                        <option value="summary">summary</option>
                        <option value="summary_large_image">summary_large_image</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterTitle" className="text-sm">twitter:title</Label>
                      <Input
                        id="twitterTitle"
                        value={metaTags.twitterTitle || ''}
                        onChange={(e) => updateMetaTag('twitterTitle', e.target.value)}
                        placeholder={metaTags.ogTitle || metaTags.title || 'Falls back to og:title'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterDescription" className="text-sm">twitter:description</Label>
                      <Textarea
                        id="twitterDescription"
                        value={metaTags.twitterDescription || ''}
                        onChange={(e) => updateMetaTag('twitterDescription', e.target.value)}
                        placeholder={metaTags.ogDescription || metaTags.description || 'Falls back to og:description'}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Generated Code */}
          <Card className="p-4 bg-zinc-900 border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-400">Generated HTML</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="gap-1 text-zinc-400 hover:text-zinc-100"
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
            <pre className="text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
              {generateHtmlCode()}
            </pre>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div>
            <SeoPreview metaTags={metaTags} showSocialPreviews={true} />
          </div>
        )}
      </div>

      {/* Meta Tag Reference */}
      <Card className="p-4 bg-card border shadow-sm">
        <h4 className="font-medium mb-3 text-sm">Common Meta Tags Reference</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {META_TAG_PRESETS.map((category) => (
            <div key={category.category}>
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category.category}
              </h5>
              <div className="space-y-1">
                {category.tags.slice(0, 4).map((tag) => (
                  <div key={tag.name} className="text-xs p-2 rounded bg-secondary/50">
                    <code className="text-primary">{tag.name}</code>
                    <p className="text-muted-foreground mt-0.5">{tag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Edit the fields above to see real-time updates in the preview. Copy the generated HTML to use in your website.
      </div>
    </div>
  );
}

// Export for use in MDX
export { META_TAG_PRESETS };
