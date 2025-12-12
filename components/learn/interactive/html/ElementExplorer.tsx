'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Type,
  Layout,
  Image,
  Link2,
  List,
  Table2,
  FormInput,
  FileText,
  ChevronRight,
  Search,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ElementCategory =
  | 'text'
  | 'structure'
  | 'media'
  | 'links'
  | 'lists'
  | 'tables'
  | 'forms'
  | 'semantic';

export interface HtmlElement {
  tag: string;
  name: string;
  category: ElementCategory;
  description: string;
  attributes: {
    name: string;
    description: string;
    required?: boolean;
    values?: string[];
  }[];
  example: string;
  tips?: string[];
  blockLevel: boolean;
}

export const htmlElements: HtmlElement[] = [
  // Text Elements
  {
    tag: 'h1',
    name: 'Heading 1',
    category: 'text',
    description: 'The main heading of a page. There should only be one h1 per page.',
    attributes: [],
    example: '<h1>Welcome to My Website</h1>',
    tips: ['Use only one h1 per page for SEO', 'Should describe the main topic'],
    blockLevel: true,
  },
  {
    tag: 'h2',
    name: 'Heading 2',
    category: 'text',
    description: 'A section heading. Use for major sections of content.',
    attributes: [],
    example: '<h2>About Us</h2>',
    tips: ['Use to divide content into sections', 'Follow heading hierarchy (h1 → h2 → h3)'],
    blockLevel: true,
  },
  {
    tag: 'h3',
    name: 'Heading 3',
    category: 'text',
    description: 'A subsection heading. Use within h2 sections.',
    attributes: [],
    example: '<h3>Our Mission</h3>',
    blockLevel: true,
  },
  {
    tag: 'p',
    name: 'Paragraph',
    category: 'text',
    description: 'A paragraph of text. The most common element for text content.',
    attributes: [],
    example: '<p>This is a paragraph of text.</p>',
    tips: ['Browsers add margin above and below paragraphs'],
    blockLevel: true,
  },
  {
    tag: 'span',
    name: 'Span',
    category: 'text',
    description: 'An inline container for text. Used for styling parts of text.',
    attributes: [],
    example: '<p>This is <span class="highlight">important</span> text.</p>',
    tips: ['Use for styling inline text', 'Has no semantic meaning'],
    blockLevel: false,
  },
  {
    tag: 'strong',
    name: 'Strong',
    category: 'text',
    description: 'Indicates strong importance. Typically displayed as bold.',
    attributes: [],
    example: '<p>This is <strong>very important</strong>.</p>',
    tips: ['Use for important text, not just for bold styling'],
    blockLevel: false,
  },
  {
    tag: 'em',
    name: 'Emphasis',
    category: 'text',
    description: 'Indicates emphasis. Typically displayed as italic.',
    attributes: [],
    example: '<p>I <em>really</em> like this.</p>',
    tips: ['Use for emphasis, not just for italic styling'],
    blockLevel: false,
  },
  {
    tag: 'br',
    name: 'Line Break',
    category: 'text',
    description: 'Creates a line break within text. Self-closing tag.',
    attributes: [],
    example: '<p>Line one<br>Line two</p>',
    tips: ['Use sparingly', 'Not for spacing - use CSS instead'],
    blockLevel: false,
  },

  // Structure Elements
  {
    tag: 'div',
    name: 'Division',
    category: 'structure',
    description: 'A generic container for grouping content. No semantic meaning.',
    attributes: [],
    example: '<div class="container">\n  <p>Content here</p>\n</div>',
    tips: ['Use semantic elements when possible', 'Good for layout and styling'],
    blockLevel: true,
  },
  {
    tag: 'html',
    name: 'HTML Root',
    category: 'structure',
    description: 'The root element of an HTML document.',
    attributes: [
      { name: 'lang', description: 'Language of the document', values: ['en', 'es', 'fr', 'de'] },
    ],
    example: '<html lang="en">\n  ...\n</html>',
    tips: ['Always include lang attribute for accessibility'],
    blockLevel: true,
  },
  {
    tag: 'head',
    name: 'Head',
    category: 'structure',
    description: 'Contains metadata about the document (title, styles, scripts).',
    attributes: [],
    example: '<head>\n  <title>Page Title</title>\n</head>',
    blockLevel: true,
  },
  {
    tag: 'body',
    name: 'Body',
    category: 'structure',
    description: 'Contains all visible content of the document.',
    attributes: [],
    example: '<body>\n  <h1>Hello World</h1>\n</body>',
    blockLevel: true,
  },

  // Media Elements
  {
    tag: 'img',
    name: 'Image',
    category: 'media',
    description: 'Embeds an image. Self-closing tag.',
    attributes: [
      { name: 'src', description: 'URL of the image', required: true },
      { name: 'alt', description: 'Alternative text for accessibility', required: true },
      { name: 'width', description: 'Width in pixels' },
      { name: 'height', description: 'Height in pixels' },
    ],
    example: '<img src="photo.jpg" alt="A beautiful sunset">',
    tips: ['Always include alt text', 'Specify dimensions to prevent layout shift'],
    blockLevel: false,
  },
  {
    tag: 'video',
    name: 'Video',
    category: 'media',
    description: 'Embeds a video player.',
    attributes: [
      { name: 'src', description: 'URL of the video' },
      { name: 'controls', description: 'Show playback controls' },
      { name: 'autoplay', description: 'Start playing automatically' },
      { name: 'loop', description: 'Loop the video' },
    ],
    example: '<video src="movie.mp4" controls>\n  Your browser does not support video.\n</video>',
    tips: ['Include fallback text', 'Consider adding captions'],
    blockLevel: true,
  },
  {
    tag: 'audio',
    name: 'Audio',
    category: 'media',
    description: 'Embeds an audio player.',
    attributes: [
      { name: 'src', description: 'URL of the audio file' },
      { name: 'controls', description: 'Show playback controls' },
    ],
    example: '<audio src="song.mp3" controls></audio>',
    blockLevel: true,
  },


  // Link Elements
  {
    tag: 'a',
    name: 'Anchor (Link)',
    category: 'links',
    description: 'Creates a hyperlink to another page or resource.',
    attributes: [
      { name: 'href', description: 'URL to link to', required: true },
      { name: 'target', description: 'Where to open the link', values: ['_blank', '_self', '_parent', '_top'] },
      { name: 'rel', description: 'Relationship to linked page', values: ['noopener', 'noreferrer', 'nofollow'] },
    ],
    example: '<a href="https://example.com">Visit Example</a>',
    tips: ['Use target="_blank" with rel="noopener" for security', 'Make link text descriptive'],
    blockLevel: false,
  },

  // List Elements
  {
    tag: 'ul',
    name: 'Unordered List',
    category: 'lists',
    description: 'A bulleted list where order does not matter.',
    attributes: [],
    example: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
    tips: ['Use for lists where order is not important'],
    blockLevel: true,
  },
  {
    tag: 'ol',
    name: 'Ordered List',
    category: 'lists',
    description: 'A numbered list where order matters.',
    attributes: [
      { name: 'start', description: 'Starting number' },
      { name: 'type', description: 'Numbering type', values: ['1', 'a', 'A', 'i', 'I'] },
    ],
    example: '<ol>\n  <li>First step</li>\n  <li>Second step</li>\n</ol>',
    tips: ['Use for sequential steps or rankings'],
    blockLevel: true,
  },
  {
    tag: 'li',
    name: 'List Item',
    category: 'lists',
    description: 'An item in a list (ul or ol).',
    attributes: [],
    example: '<li>List item content</li>',
    tips: ['Must be a direct child of ul or ol'],
    blockLevel: true,
  },

  // Table Elements
  {
    tag: 'table',
    name: 'Table',
    category: 'tables',
    description: 'Creates a data table.',
    attributes: [],
    example: '<table>\n  <tr>\n    <th>Header</th>\n  </tr>\n  <tr>\n    <td>Data</td>\n  </tr>\n</table>',
    tips: ['Use for tabular data, not layout', 'Include thead and tbody for accessibility'],
    blockLevel: true,
  },
  {
    tag: 'tr',
    name: 'Table Row',
    category: 'tables',
    description: 'A row in a table.',
    attributes: [],
    example: '<tr>\n  <td>Cell 1</td>\n  <td>Cell 2</td>\n</tr>',
    blockLevel: true,
  },
  {
    tag: 'th',
    name: 'Table Header',
    category: 'tables',
    description: 'A header cell in a table.',
    attributes: [
      { name: 'scope', description: 'Scope of header', values: ['col', 'row', 'colgroup', 'rowgroup'] },
    ],
    example: '<th scope="col">Name</th>',
    tips: ['Use scope attribute for accessibility'],
    blockLevel: true,
  },
  {
    tag: 'td',
    name: 'Table Data',
    category: 'tables',
    description: 'A data cell in a table.',
    attributes: [
      { name: 'colspan', description: 'Number of columns to span' },
      { name: 'rowspan', description: 'Number of rows to span' },
    ],
    example: '<td>Cell content</td>',
    blockLevel: true,
  },

  // Form Elements
  {
    tag: 'form',
    name: 'Form',
    category: 'forms',
    description: 'A container for form controls.',
    attributes: [
      { name: 'action', description: 'URL to submit form to' },
      { name: 'method', description: 'HTTP method', values: ['get', 'post'] },
    ],
    example: '<form action="/submit" method="post">\n  ...\n</form>',
    blockLevel: true,
  },
  {
    tag: 'input',
    name: 'Input',
    category: 'forms',
    description: 'An input field. Self-closing tag.',
    attributes: [
      { name: 'type', description: 'Type of input', values: ['text', 'email', 'password', 'number', 'checkbox', 'radio', 'submit'] },
      { name: 'name', description: 'Name for form submission', required: true },
      { name: 'placeholder', description: 'Placeholder text' },
      { name: 'required', description: 'Make field required' },
    ],
    example: '<input type="text" name="username" placeholder="Enter username">',
    tips: ['Always pair with a label', 'Use appropriate type for validation'],
    blockLevel: false,
  },
  {
    tag: 'label',
    name: 'Label',
    category: 'forms',
    description: 'A label for a form control.',
    attributes: [
      { name: 'for', description: 'ID of the associated input', required: true },
    ],
    example: '<label for="email">Email:</label>\n<input type="email" id="email" name="email">',
    tips: ['Always use labels for accessibility', 'Click on label focuses the input'],
    blockLevel: false,
  },
  {
    tag: 'button',
    name: 'Button',
    category: 'forms',
    description: 'A clickable button.',
    attributes: [
      { name: 'type', description: 'Button type', values: ['button', 'submit', 'reset'] },
    ],
    example: '<button type="submit">Submit</button>',
    tips: ['Default type is "submit" inside forms', 'Use type="button" for non-form buttons'],
    blockLevel: false,
  },
  {
    tag: 'textarea',
    name: 'Text Area',
    category: 'forms',
    description: 'A multi-line text input.',
    attributes: [
      { name: 'name', description: 'Name for form submission' },
      { name: 'rows', description: 'Number of visible rows' },
      { name: 'cols', description: 'Number of visible columns' },
    ],
    example: '<textarea name="message" rows="4" cols="50"></textarea>',
    blockLevel: true,
  },
  {
    tag: 'select',
    name: 'Select (Dropdown)',
    category: 'forms',
    description: 'A dropdown selection menu.',
    attributes: [
      { name: 'name', description: 'Name for form submission' },
      { name: 'multiple', description: 'Allow multiple selections' },
    ],
    example: '<select name="country">\n  <option value="us">USA</option>\n  <option value="uk">UK</option>\n</select>',
    blockLevel: true,
  },

  // Semantic Elements
  {
    tag: 'header',
    name: 'Header',
    category: 'semantic',
    description: 'Introductory content or navigation links.',
    attributes: [],
    example: '<header>\n  <h1>Site Title</h1>\n  <nav>...</nav>\n</header>',
    tips: ['Use for page or section headers', 'Can contain navigation'],
    blockLevel: true,
  },
  {
    tag: 'nav',
    name: 'Navigation',
    category: 'semantic',
    description: 'A section containing navigation links.',
    attributes: [],
    example: '<nav>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
    tips: ['Use for main navigation', 'Helps screen readers identify navigation'],
    blockLevel: true,
  },
  {
    tag: 'main',
    name: 'Main',
    category: 'semantic',
    description: 'The main content of the document. Only one per page.',
    attributes: [],
    example: '<main>\n  <h1>Article Title</h1>\n  <p>Content...</p>\n</main>',
    tips: ['Only one main element per page', 'Should not include repeated content'],
    blockLevel: true,
  },
  {
    tag: 'article',
    name: 'Article',
    category: 'semantic',
    description: 'Self-contained content that could be distributed independently.',
    attributes: [],
    example: '<article>\n  <h2>Blog Post Title</h2>\n  <p>Post content...</p>\n</article>',
    tips: ['Use for blog posts, news articles, comments'],
    blockLevel: true,
  },
  {
    tag: 'section',
    name: 'Section',
    category: 'semantic',
    description: 'A thematic grouping of content.',
    attributes: [],
    example: '<section>\n  <h2>Features</h2>\n  <p>Feature list...</p>\n</section>',
    tips: ['Should have a heading', 'Use for distinct sections of content'],
    blockLevel: true,
  },
  {
    tag: 'aside',
    name: 'Aside',
    category: 'semantic',
    description: 'Content tangentially related to the main content.',
    attributes: [],
    example: '<aside>\n  <h3>Related Links</h3>\n  ...\n</aside>',
    tips: ['Use for sidebars, pull quotes, ads'],
    blockLevel: true,
  },
  {
    tag: 'footer',
    name: 'Footer',
    category: 'semantic',
    description: 'Footer for a page or section.',
    attributes: [],
    example: '<footer>\n  <p>&copy; 2024 Company Name</p>\n</footer>',
    tips: ['Use for copyright, contact info, site links'],
    blockLevel: true,
  },
];


const categoryInfo: Record<ElementCategory, { name: string; icon: typeof Code2; color: string }> = {
  text: { name: 'Text', icon: Type, color: 'text-blue-500' },
  structure: { name: 'Structure', icon: Layout, color: 'text-purple-500' },
  media: { name: 'Media', icon: Image, color: 'text-green-500' },
  links: { name: 'Links', icon: Link2, color: 'text-cyan-500' },
  lists: { name: 'Lists', icon: List, color: 'text-orange-500' },
  tables: { name: 'Tables', icon: Table2, color: 'text-pink-500' },
  forms: { name: 'Forms', icon: FormInput, color: 'text-yellow-500' },
  semantic: { name: 'Semantic', icon: FileText, color: 'text-indigo-500' },
};

interface ElementExplorerProps {
  initialCategory?: ElementCategory;
  showSearch?: boolean;
}

export function ElementExplorer({
  initialCategory,
  showSearch = true,
}: ElementExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | null>(
    initialCategory || null
  );
  const [selectedElement, setSelectedElement] = useState<HtmlElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter elements based on category and search
  const filteredElements = useMemo(() => {
    let elements = htmlElements;

    if (selectedCategory) {
      elements = elements.filter((el) => el.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      elements = elements.filter(
        (el) =>
          el.tag.toLowerCase().includes(query) ||
          el.name.toLowerCase().includes(query) ||
          el.description.toLowerCase().includes(query)
      );
    }

    return elements;
  }, [selectedCategory, searchQuery]);

  const handleCopyExample = async (example: string) => {
    await navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedElement(null);
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          HTML Element Explorer
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elements..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
          />
        </div>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          All ({htmlElements.length})
        </button>
        {(Object.entries(categoryInfo) as [ElementCategory, typeof categoryInfo.text][]).map(
          ([cat, info]) => {
            const count = htmlElements.filter((el) => el.category === cat).length;
            const Icon = info.icon;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3 h-3" />
                {info.name} ({count})
              </button>
            );
          }
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Element List */}
        <Card className="p-4 bg-card border shadow-sm max-h-[500px] overflow-auto">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            {filteredElements.length} element{filteredElements.length !== 1 && 's'}
          </h4>
          <div className="space-y-1">
            {filteredElements.map((element) => {
              const catInfo = categoryInfo[element.category];
              return (
                <button
                  key={element.tag}
                  onClick={() => setSelectedElement(element)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                    selectedElement?.tag === element.tag
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-secondary'
                  )}
                >
                  <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    &lt;{element.tag}&gt;
                  </code>
                  <span className="text-sm text-foreground flex-1 truncate">
                    {element.name}
                  </span>
                  <span className={cn('text-xs', catInfo.color)}>
                    {catInfo.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
            {filteredElements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No elements found matching your search.
              </p>
            )}
          </div>
        </Card>

        {/* Element Details */}
        <Card className="p-4 bg-card border shadow-sm">
          <AnimatePresence mode="wait">
            {selectedElement ? (
              <motion.div
                key={selectedElement.tag}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <code className="text-xl font-mono text-primary">
                      &lt;{selectedElement.tag}&gt;
                    </code>
                    <h4 className="text-lg font-semibold text-foreground mt-1">
                      {selectedElement.name}
                    </h4>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      selectedElement.blockLevel
                        ? 'bg-purple-500/20 text-purple-500'
                        : 'bg-cyan-500/20 text-cyan-500'
                    )}
                  >
                    {selectedElement.blockLevel ? 'Block' : 'Inline'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {selectedElement.description}
                </p>

                {/* Attributes */}
                {selectedElement.attributes.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Attributes
                    </h5>
                    <div className="space-y-2">
                      {selectedElement.attributes.map((attr) => (
                        <div
                          key={attr.name}
                          className="p-2 rounded-lg bg-secondary/50 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <code className="text-primary font-mono">
                              {attr.name}
                            </code>
                            {attr.required && (
                              <span className="text-xs text-red-500">required</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {attr.description}
                          </p>
                          {attr.values && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {attr.values.map((v) => (
                                <code
                                  key={v}
                                  className="text-xs bg-secondary px-1.5 py-0.5 rounded"
                                >
                                  {v}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-muted-foreground">
                      Example
                    </h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyExample(selectedElement.example)}
                      className="h-6 px-2 text-xs"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto">
                    {selectedElement.example}
                  </pre>
                </div>

                {/* Tips */}
                {selectedElement.tips && selectedElement.tips.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      💡 Tips
                    </h5>
                    <ul className="space-y-1">
                      {selectedElement.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
              >
                <Code2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">
                  👈 Select an element to see its details
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Browse by category or search for specific elements
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-500 text-xs">
            Block
          </span>
          Takes full width, starts new line
        </span>
        <span className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-500 text-xs">
            Inline
          </span>
          Flows with text, no line break
        </span>
      </div>
    </div>
  );
}
