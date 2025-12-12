'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Code2,
  Eye,
  Accessibility,
  Volume2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ViewMode = 'code' | 'visual' | 'accessibility' | 'screenreader';

interface ComparisonExample {
  id: string;
  name: string;
  description: string;
  divSoup: {
    html: string;
    accessibilityTree: AccessibilityNode[];
    screenReaderOutput: string[];
  };
  semantic: {
    html: string;
    accessibilityTree: AccessibilityNode[];
    screenReaderOutput: string[];
  };
}

interface AccessibilityNode {
  role: string;
  name?: string;
  children?: AccessibilityNode[];
  level?: number;
}

const examples: ComparisonExample[] = [
  {
    id: 'page-layout',
    name: 'Page Layout',
    description: 'Basic page structure with header, content, and footer',
    divSoup: {
      html: `<div class="header">
  <div class="logo">My Site</div>
  <div class="nav">
    <div class="nav-item">Home</div>
    <div class="nav-item">About</div>
  </div>
</div>
<div class="content">
  <div class="title">Welcome</div>
  <div class="text">Hello world!</div>
</div>
<div class="footer">
  <div class="copyright">© 2024</div>
</div>`,
      accessibilityTree: [
        {
          role: 'generic',
          children: [
            { role: 'generic', name: 'My Site' },
            {
              role: 'generic',
              children: [
                { role: 'generic', name: 'Home' },
                { role: 'generic', name: 'About' },
              ],
            },
          ],
        },
        {
          role: 'generic',
          children: [
            { role: 'generic', name: 'Welcome' },
            { role: 'generic', name: 'Hello world!' },
          ],
        },
        {
          role: 'generic',
          children: [{ role: 'generic', name: '© 2024' }],
        },
      ],
      screenReaderOutput: [
        'My Site',
        'Home',
        'About',
        'Welcome',
        'Hello world!',
        '© 2024',
      ],
    },
    semantic: {
      html: `<header>
  <h1>My Site</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
<main>
  <h2>Welcome</h2>
  <p>Hello world!</p>
</main>
<footer>
  <p>© 2024</p>
</footer>`,
      accessibilityTree: [
        {
          role: 'banner',
          children: [
            { role: 'heading', name: 'My Site', level: 1 },
            {
              role: 'navigation',
              children: [
                { role: 'link', name: 'Home' },
                { role: 'link', name: 'About' },
              ],
            },
          ],
        },
        {
          role: 'main',
          children: [
            { role: 'heading', name: 'Welcome', level: 2 },
            { role: 'paragraph', name: 'Hello world!' },
          ],
        },
        {
          role: 'contentinfo',
          children: [{ role: 'paragraph', name: '© 2024' }],
        },
      ],
      screenReaderOutput: [
        'Banner landmark',
        'Heading level 1, My Site',
        'Navigation landmark',
        'Link, Home',
        'Link, About',
        'Main landmark',
        'Heading level 2, Welcome',
        'Hello world!',
        'Content info landmark',
        '© 2024',
      ],
    },
  },
  {
    id: 'article',
    name: 'Blog Article',
    description: 'A blog post with title, content, and metadata',
    divSoup: {
      html: `<div class="post">
  <div class="post-title">
    How to Learn HTML
  </div>
  <div class="post-meta">
    <div class="author">By Jane</div>
    <div class="date">Dec 12, 2024</div>
  </div>
  <div class="post-content">
    <div class="paragraph">
      HTML is the foundation...
    </div>
  </div>
</div>`,
      accessibilityTree: [
        {
          role: 'generic',
          children: [
            { role: 'generic', name: 'How to Learn HTML' },
            {
              role: 'generic',
              children: [
                { role: 'generic', name: 'By Jane' },
                { role: 'generic', name: 'Dec 12, 2024' },
              ],
            },
            {
              role: 'generic',
              children: [{ role: 'generic', name: 'HTML is the foundation...' }],
            },
          ],
        },
      ],
      screenReaderOutput: [
        'How to Learn HTML',
        'By Jane',
        'Dec 12, 2024',
        'HTML is the foundation...',
      ],
    },
    semantic: {
      html: `<article>
  <header>
    <h1>How to Learn HTML</h1>
    <p>By <span>Jane</span></p>
    <time datetime="2024-12-12">
      Dec 12, 2024
    </time>
  </header>
  <p>HTML is the foundation...</p>
</article>`,
      accessibilityTree: [
        {
          role: 'article',
          children: [
            {
              role: 'banner',
              children: [
                { role: 'heading', name: 'How to Learn HTML', level: 1 },
                { role: 'paragraph', name: 'By Jane' },
                { role: 'time', name: 'Dec 12, 2024' },
              ],
            },
            { role: 'paragraph', name: 'HTML is the foundation...' },
          ],
        },
      ],
      screenReaderOutput: [
        'Article',
        'Banner landmark',
        'Heading level 1, How to Learn HTML',
        'By Jane',
        'Time, Dec 12, 2024',
        'HTML is the foundation...',
        'End of article',
      ],
    },
  },
  {
    id: 'navigation',
    name: 'Navigation Menu',
    description: 'A site navigation with links',
    divSoup: {
      html: `<div class="menu">
  <div class="menu-item">
    <span onclick="goto('/')">Home</span>
  </div>
  <div class="menu-item">
    <span onclick="goto('/products')">
      Products
    </span>
  </div>
  <div class="menu-item">
    <span onclick="goto('/contact')">
      Contact
    </span>
  </div>
</div>`,
      accessibilityTree: [
        {
          role: 'generic',
          children: [
            { role: 'generic', children: [{ role: 'generic', name: 'Home' }] },
            { role: 'generic', children: [{ role: 'generic', name: 'Products' }] },
            { role: 'generic', children: [{ role: 'generic', name: 'Contact' }] },
          ],
        },
      ],
      screenReaderOutput: ['Home', 'Products', 'Contact'],
    },
    semantic: {
      html: `<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li>
      <a href="/products">Products</a>
    </li>
    <li>
      <a href="/contact">Contact</a>
    </li>
  </ul>
</nav>`,
      accessibilityTree: [
        {
          role: 'navigation',
          name: 'Main',
          children: [
            {
              role: 'list',
              children: [
                { role: 'listitem', children: [{ role: 'link', name: 'Home' }] },
                { role: 'listitem', children: [{ role: 'link', name: 'Products' }] },
                { role: 'listitem', children: [{ role: 'link', name: 'Contact' }] },
              ],
            },
          ],
        },
      ],
      screenReaderOutput: [
        'Navigation, Main',
        'List, 3 items',
        'Link, Home',
        'Link, Products',
        'Link, Contact',
        'End of list',
        'End of navigation',
      ],
    },
  },
];

const viewModes: { id: ViewMode; name: string; icon: typeof Code2 }[] = [
  { id: 'code', name: 'Code', icon: Code2 },
  { id: 'visual', name: 'Visual', icon: Eye },
  { id: 'accessibility', name: 'A11y Tree', icon: Accessibility },
  { id: 'screenreader', name: 'Screen Reader', icon: Volume2 },
];

interface StructureComparisonProps {
  initialExample?: string;
}

export function StructureComparison({ initialExample }: StructureComparisonProps) {
  const [selectedExample, setSelectedExample] = useState(
    examples.find((e) => e.id === initialExample) || examples[0]
  );
  const [viewMode, setViewMode] = useState<ViewMode>('code');

  const handleReset = () => {
    setSelectedExample(examples[0]);
    setViewMode('code');
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          Div Soup vs Semantic HTML
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Example Selector */}
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => setSelectedExample(example)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              selectedExample.id === example.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {example.name}
          </button>
        ))}
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                viewMode === mode.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {mode.name}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{selectedExample.description}</p>

      {/* Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Div Soup Side */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-500">Div Soup</span>
            <span className="ml-auto text-xs text-red-400/70">❌ Not recommended</span>
          </div>
          <ComparisonContent
            viewMode={viewMode}
            data={selectedExample.divSoup}
            variant="bad"
          />
        </Card>

        {/* Semantic Side */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-500">Semantic HTML</span>
            <span className="ml-auto text-xs text-green-400/70">✓ Recommended</span>
          </div>
          <ComparisonContent
            viewMode={viewMode}
            data={selectedExample.semantic}
            variant="good"
          />
        </Card>
      </div>

      {/* Key Differences */}
      <Card className="p-4 bg-card border shadow-sm">
        <h4 className="font-medium mb-3 text-sm">Key Differences</h4>
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1">🔍 SEO</div>
            <p className="text-muted-foreground">
              Search engines understand semantic elements, improving page ranking and indexing.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1">♿ Accessibility</div>
            <p className="text-muted-foreground">
              Screen readers announce landmarks and roles, helping users navigate efficiently.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="font-medium text-primary mb-1">🛠️ Maintainability</div>
            <p className="text-muted-foreground">
              Semantic code is self-documenting and easier to understand and maintain.
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Switch between views to see how div soup and semantic HTML differ in code, visual structure, accessibility tree, and screen reader output.
      </div>
    </div>
  );
}

interface ComparisonContentProps {
  viewMode: ViewMode;
  data: ComparisonExample['divSoup'];
  variant: 'good' | 'bad';
}

function ComparisonContent({ viewMode, data, variant }: ComparisonContentProps) {
  return (
    <div className="p-4 min-h-[300px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'code' && <CodeView html={data.html} />}
          {viewMode === 'visual' && <VisualView html={data.html} variant={variant} />}
          {viewMode === 'accessibility' && (
            <AccessibilityTreeView nodes={data.accessibilityTree} variant={variant} />
          )}
          {viewMode === 'screenreader' && (
            <ScreenReaderView output={data.screenReaderOutput} variant={variant} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CodeView({ html }: { html: string }) {
  return (
    <pre className="p-3 rounded-lg bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
      {html}
    </pre>
  );
}

function VisualView({ html, variant }: { html: string; variant: 'good' | 'bad' }) {
  // Parse and visualize the structure
  const lines = html.split('\n').filter((l) => l.trim());
  const elements: { tag: string; indent: number; isClosing: boolean }[] = [];

  lines.forEach((line) => {
    const indent = line.search(/\S/);
    const tagMatch = line.match(/<\/?([a-z0-9]+)/i);
    if (tagMatch) {
      elements.push({
        tag: tagMatch[1],
        indent: Math.floor(indent / 2),
        isClosing: line.includes('</'),
      });
    }
  });

  // Filter to opening tags only for visualization
  const openingTags = elements.filter((e) => !e.isClosing);

  return (
    <div className="space-y-1">
      {openingTags.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{ marginLeft: el.indent * 16 }}
          className={cn(
            'flex items-center gap-2 p-2 rounded text-xs',
            variant === 'good'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-zinc-500/10 border border-zinc-500/20'
          )}
        >
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <code
            className={cn(
              'font-mono',
              variant === 'good' ? 'text-green-400' : 'text-zinc-400'
            )}
          >
            &lt;{el.tag}&gt;
          </code>
        </motion.div>
      ))}
    </div>
  );
}

function AccessibilityTreeView({
  nodes,
  variant,
}: {
  nodes: AccessibilityNode[];
  variant: 'good' | 'bad';
}) {
  const renderNode = (node: AccessibilityNode, depth = 0): React.ReactNode => {
    const isGeneric = node.role === 'generic';
    return (
      <motion.div
        key={`${node.role}-${node.name}-${depth}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        style={{ marginLeft: depth * 16 }}
        className="py-1"
      >
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded text-xs',
            isGeneric
              ? 'bg-zinc-500/10 border border-zinc-500/20'
              : variant === 'good'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-zinc-500/10 border border-zinc-500/20'
          )}
        >
          <span
            className={cn(
              'px-1.5 py-0.5 rounded font-mono text-xs',
              isGeneric
                ? 'bg-zinc-500/20 text-zinc-400'
                : variant === 'good'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-zinc-500/20 text-zinc-400'
            )}
          >
            {node.role}
          </span>
          {node.level && (
            <span className="text-muted-foreground">level {node.level}</span>
          )}
          {node.name && (
            <span className="text-foreground truncate">&quot;{node.name}&quot;</span>
          )}
        </div>
        {node.children?.map((child, i) => (
          <div key={i}>{renderNode(child, depth + 1)}</div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        <Accessibility className="w-3 h-3" />
        Accessibility Tree
      </div>
      {nodes.map((node, i) => (
        <div key={i}>{renderNode(node)}</div>
      ))}
    </div>
  );
}

function ScreenReaderView({
  output,
  variant,
}: {
  output: string[];
  variant: 'good' | 'bad';
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        <Volume2 className="w-3 h-3" />
        Screen Reader Output
      </div>
      <div className="space-y-1">
        {output.map((line, i) => {
          const isLandmark =
            line.includes('landmark') ||
            line.includes('Heading') ||
            line.includes('Link') ||
            line.includes('Article') ||
            line.includes('List') ||
            line.includes('Navigation');
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'p-2 rounded text-sm',
                isLandmark && variant === 'good'
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-secondary text-foreground'
              )}
            >
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {line}
            </motion.div>
          );
        })}
      </div>
      <div
        className={cn(
          'mt-4 p-3 rounded-lg text-xs',
          variant === 'good'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
        )}
      >
        {variant === 'good' ? (
          <>
            ✓ Screen reader announces {output.filter((l) => l.includes('landmark') || l.includes('Heading') || l.includes('Link')).length} semantic landmarks and roles
          </>
        ) : (
          <>
            ⚠ Screen reader has no context about page structure - just reads text content
          </>
        )}
      </div>
    </div>
  );
}

export { examples };
