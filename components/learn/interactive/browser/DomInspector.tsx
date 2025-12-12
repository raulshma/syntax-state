'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Code2,
  FileCode,
  Hash,
  Type,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DomNode {
  tagName: string;
  attributes: Record<string, string>;
  children: DomNode[];
  textContent?: string;
  id?: string;
}

interface DomInspectorProps {
  html?: string;
  highlightElement?: string;
  showAttributes?: boolean;
}

// Simple HTML parser that creates a DOM tree structure
export function parseHtmlToDom(html: string): DomNode[] {
  const nodes: DomNode[] = [];
  let idCounter = 0;

  // Clean up the HTML
  const cleanHtml = html.trim();
  if (!cleanHtml) return nodes;

  // Simple regex-based parser for demonstration
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>|<(\w+)([^>]*)\s*\/?>|([^<]+)/g;
  let match;

  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    if (match[1]) {
      // Opening and closing tag pair
      const tagName = match[1].toLowerCase();
      const attrString = match[2] || '';
      const innerContent = match[3] || '';

      const attributes = parseAttributes(attrString);
      const children = parseHtmlToDom(innerContent);

      nodes.push({
        tagName,
        attributes,
        children,
        id: `node-${idCounter++}`,
      });
    } else if (match[4]) {
      // Self-closing tag
      const tagName = match[4].toLowerCase();
      const attrString = match[5] || '';
      const attributes = parseAttributes(attrString);

      nodes.push({
        tagName,
        attributes,
        children: [],
        id: `node-${idCounter++}`,
      });
    } else if (match[6]) {
      // Text content
      const text = match[6].trim();
      if (text) {
        nodes.push({
          tagName: '#text',
          attributes: {},
          children: [],
          textContent: text,
          id: `node-${idCounter++}`,
        });
      }
    }
  }

  return nodes;
}

function parseAttributes(attrString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrRegex = /(\w+)(?:=["']([^"']*)["'])?/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    const name = match[1];
    const value = match[2] || '';
    attributes[name] = value;
  }

  return attributes;
}

const defaultHtml = `<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <header>
      <h1 class="title">Welcome</h1>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
    <main>
      <p id="intro">Hello World!</p>
    </main>
  </body>
</html>`;

export function DomInspector({
  html = defaultHtml,
  highlightElement,
  showAttributes = true,
}: DomInspectorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['node-0', 'node-1', 'node-2', 'node-3']));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [currentHtml, setCurrentHtml] = useState(html);

  const domTree = useMemo(() => parseHtmlToDom(currentHtml), [currentHtml]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: DomNode[]) => {
      nodes.forEach((node) => {
        if (node.id) allIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(domTree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const reset = () => {
    setCurrentHtml(html);
    setSelectedNode(null);
    setExpandedNodes(new Set(['node-0', 'node-1', 'node-2', 'node-3']));
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          DOM Inspector
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* DOM Tree View */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
            <FileCode className="w-4 h-4 text-primary" />
            DOM Tree Structure
          </h4>
          <div className="font-mono text-sm overflow-auto max-h-[400px] bg-secondary/30 rounded-lg p-3">
            {domTree.map((node) => (
              <DomTreeNode
                key={node.id}
                node={node}
                depth={0}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                highlightElement={highlightElement}
                showAttributes={showAttributes}
                onToggle={toggleNode}
                onSelect={setSelectedNode}
              />
            ))}
          </div>
        </Card>

        {/* Selected Node Details */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
            <Hash className="w-4 h-4 text-primary" />
            Element Details
          </h4>
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <SelectedNodeDetails
                key={selectedNode}
                node={findNodeById(domTree, selectedNode)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                <p>👆 Click on an element in the tree to see its details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500" />
          Element Node
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500" />
          Text Node
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500" />
          Attribute
        </span>
      </div>
    </div>
  );
}

interface DomTreeNodeProps {
  node: DomNode;
  depth: number;
  expandedNodes: Set<string>;
  selectedNode: string | null;
  highlightElement?: string;
  showAttributes: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

function DomTreeNode({
  node,
  depth,
  expandedNodes,
  selectedNode,
  highlightElement,
  showAttributes,
  onToggle,
  onSelect,
}: DomTreeNodeProps) {
  const isExpanded = node.id ? expandedNodes.has(node.id) : false;
  const isSelected = node.id === selectedNode;
  const isHighlighted = highlightElement && node.tagName === highlightElement;
  const hasChildren = node.children.length > 0;
  const isTextNode = node.tagName === '#text';

  if (isTextNode) {
    return (
      <div
        className={cn(
          'py-0.5 cursor-pointer rounded px-1 transition-colors',
          isSelected ? 'bg-green-500/20' : 'hover:bg-green-500/10'
        )}
        style={{ paddingLeft: `${depth * 16 + 20}px` }}
        onClick={() => node.id && onSelect(node.id)}
      >
        <span className="text-green-600 dark:text-green-400">
          &quot;{node.textContent}&quot;
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          'py-0.5 cursor-pointer rounded px-1 transition-colors flex items-center',
          isSelected ? 'bg-blue-500/20' : 'hover:bg-blue-500/10',
          isHighlighted && 'ring-2 ring-yellow-500'
        )}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => node.id && onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              node.id && onToggle(node.id);
            }}
            className="w-4 h-4 flex items-center justify-center mr-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4 mr-1" />
        )}
        <span className="text-blue-600 dark:text-blue-400">&lt;{node.tagName}</span>
        {showAttributes && Object.keys(node.attributes).length > 0 && (
          <span className="text-purple-600 dark:text-purple-400 ml-1">
            {Object.entries(node.attributes)
              .slice(0, 2)
              .map(([key, value]) => (
                <span key={key}>
                  {' '}
                  {key}
                  {value && `="${value}"`}
                </span>
              ))}
            {Object.keys(node.attributes).length > 2 && ' ...'}
          </span>
        )}
        <span className="text-blue-600 dark:text-blue-400">&gt;</span>
        {!hasChildren && (
          <span className="text-blue-600 dark:text-blue-400">
            &lt;/{node.tagName}&gt;
          </span>
        )}
      </div>
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child) => (
              <DomTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                highlightElement={highlightElement}
                showAttributes={showAttributes}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
            <div
              className="py-0.5 text-blue-600 dark:text-blue-400"
              style={{ paddingLeft: `${depth * 16 + 20}px` }}
            >
              &lt;/{node.tagName}&gt;
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectedNodeDetails({ node }: { node: DomNode | null }) {
  if (!node) return null;

  const isTextNode = node.tagName === '#text';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Node Type */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            isTextNode
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
          )}
        >
          {isTextNode ? 'Text Node' : 'Element Node'}
        </span>
      </div>

      {/* Tag Name or Text Content */}
      {isTextNode ? (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Text Content
          </h5>
          <p className="text-sm bg-secondary/50 p-2 rounded">
            {node.textContent}
          </p>
        </div>
      ) : (
        <>
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1">
              Tag Name
            </h5>
            <code className="text-sm bg-secondary/50 px-2 py-1 rounded">
              &lt;{node.tagName}&gt;
            </code>
          </div>

          {/* Attributes */}
          {Object.keys(node.attributes).length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2">
                Attributes
              </h5>
              <div className="space-y-1">
                {Object.entries(node.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-sm bg-secondary/50 px-2 py-1 rounded"
                  >
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {key}
                    </span>
                    {value && (
                      <>
                        <span className="text-muted-foreground">=</span>
                        <span className="text-green-600 dark:text-green-400">
                          &quot;{value}&quot;
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Children Count */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1">
              Children
            </h5>
            <p className="text-sm">
              {node.children.length} child node{node.children.length !== 1 && 's'}
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
}

function findNodeById(nodes: DomNode[], id: string): DomNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

// Export for testing
export { defaultHtml };
