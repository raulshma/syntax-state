'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Layout,
  Navigation,
  FileText,
  Newspaper,
  Columns,
  PanelRight,
  PanelBottom,
  RotateCcw,
  Check,
  AlertTriangle,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SemanticTag = 'header' | 'nav' | 'main' | 'article' | 'section' | 'aside' | 'footer';

export interface SemanticElement {
  id: string;
  tag: SemanticTag;
  children: SemanticElement[];
  content?: string;
}

interface SemanticElementInfo {
  tag: SemanticTag;
  name: string;
  description: string;
  icon: typeof Layout;
  color: string;
  allowedParents: SemanticTag[];
  allowedChildren: SemanticTag[];
}

const semanticElements: SemanticElementInfo[] = [
  {
    tag: 'header',
    name: 'Header',
    description: 'Introductory content or navigation',
    icon: Layout,
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    allowedParents: [],
    allowedChildren: ['nav'],
  },
  {
    tag: 'nav',
    name: 'Navigation',
    description: 'Navigation links section',
    icon: Navigation,
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    allowedParents: ['header', 'footer'],
    allowedChildren: [],
  },
  {
    tag: 'main',
    name: 'Main',
    description: 'Primary content of the page',
    icon: FileText,
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
    allowedParents: [],
    allowedChildren: ['article', 'section'],
  },
  {
    tag: 'article',
    name: 'Article',
    description: 'Self-contained composition',
    icon: Newspaper,
    color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    allowedParents: ['main', 'section'],
    allowedChildren: ['section'],
  },
  {
    tag: 'section',
    name: 'Section',
    description: 'Thematic grouping of content',
    icon: Columns,
    color: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
    allowedParents: ['main', 'article'],
    allowedChildren: ['article'],
  },
  {
    tag: 'aside',
    name: 'Aside',
    description: 'Tangentially related content',
    icon: PanelRight,
    color: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
    allowedParents: [],
    allowedChildren: [],
  },
  {
    tag: 'footer',
    name: 'Footer',
    description: 'Footer for page or section',
    icon: PanelBottom,
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    allowedParents: [],
    allowedChildren: ['nav'],
  },
];

const getElementInfo = (tag: SemanticTag): SemanticElementInfo => {
  return semanticElements.find((el) => el.tag === tag)!;
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default page structure
const defaultStructure: SemanticElement[] = [
  { id: generateId(), tag: 'header', children: [], content: 'Site Header' },
  { id: generateId(), tag: 'main', children: [], content: 'Main Content' },
  { id: generateId(), tag: 'footer', children: [], content: 'Site Footer' },
];

interface ValidationIssue {
  elementId: string;
  message: string;
  severity: 'error' | 'warning';
}

// Validate the structure
export function validateStructure(elements: SemanticElement[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const mainCount = elements.filter((el) => el.tag === 'main').length;

  // Check for exactly one main element
  if (mainCount === 0) {
    issues.push({
      elementId: 'root',
      message: 'Page should have exactly one <main> element',
      severity: 'error',
    });
  } else if (mainCount > 1) {
    issues.push({
      elementId: 'root',
      message: 'Page should have only one <main> element',
      severity: 'error',
    });
  }

  // Recursive validation
  const validateElement = (element: SemanticElement, parentTag?: SemanticTag) => {
    const info = getElementInfo(element.tag);

    // Check if element is allowed in parent
    if (parentTag) {
      const parentInfo = getElementInfo(parentTag);
      if (!parentInfo.allowedChildren.includes(element.tag)) {
        issues.push({
          elementId: element.id,
          message: `<${element.tag}> is not typically nested inside <${parentTag}>`,
          severity: 'warning',
        });
      }
    }

    // Validate children
    element.children.forEach((child) => validateElement(child, element.tag));
  };

  elements.forEach((el) => validateElement(el));

  return issues;
}

interface SemanticStructureBuilderProps {
  initialStructure?: SemanticElement[];
  onStructureChange?: (structure: SemanticElement[]) => void;
}

export function SemanticStructureBuilder({
  initialStructure = defaultStructure,
  onStructureChange,
}: SemanticStructureBuilderProps) {
  const [structure, setStructure] = useState<SemanticElement[]>(initialStructure);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedTag, setDraggedTag] = useState<SemanticTag | null>(null);

  const issues = validateStructure(structure);
  const hasErrors = issues.some((i) => i.severity === 'error');

  const updateStructure = useCallback(
    (newStructure: SemanticElement[]) => {
      setStructure(newStructure);
      onStructureChange?.(newStructure);
    },
    [onStructureChange]
  );

  const handleReset = () => {
    updateStructure(defaultStructure);
    setExpandedIds(new Set());
    setSelectedId(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addElement = (tag: SemanticTag, parentId?: string) => {
    const newElement: SemanticElement = {
      id: generateId(),
      tag,
      children: [],
      content: `${getElementInfo(tag).name} Content`,
    };

    if (parentId) {
      const addToParent = (elements: SemanticElement[]): SemanticElement[] => {
        return elements.map((el) => {
          if (el.id === parentId) {
            return { ...el, children: [...el.children, newElement] };
          }
          return { ...el, children: addToParent(el.children) };
        });
      };
      updateStructure(addToParent(structure));
      setExpandedIds((prev) => new Set([...prev, parentId]));
    } else {
      updateStructure([...structure, newElement]);
    }
  };

  const removeElement = (id: string) => {
    const removeFromList = (elements: SemanticElement[]): SemanticElement[] => {
      return elements
        .filter((el) => el.id !== id)
        .map((el) => ({ ...el, children: removeFromList(el.children) }));
    };
    updateStructure(removeFromList(structure));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDragStart = (tag: SemanticTag) => {
    setDraggedTag(tag);
  };

  const handleDragEnd = () => {
    setDraggedTag(null);
  };

  const handleDrop = (parentId?: string) => {
    if (draggedTag) {
      addElement(draggedTag, parentId);
      setDraggedTag(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          Semantic Structure Builder
        </h3>
        <div className="flex items-center gap-2">
          {!hasErrors && structure.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <Check className="w-3 h-3" />
              Valid structure
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Element Palette */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            Semantic Elements
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Drag elements to the structure or click to add
          </p>
          <div className="space-y-2">
            {semanticElements.map((el) => {
              const Icon = el.icon;
              return (
                <motion.button
                  key={el.tag}
                  draggable
                  onDragStart={() => handleDragStart(el.tag)}
                  onDragEnd={handleDragEnd}
                  onClick={() => addElement(el.tag)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing',
                    el.color,
                    'hover:opacity-80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left flex-1">
                    <code className="text-sm font-mono">&lt;{el.tag}&gt;</code>
                    <p className="text-xs opacity-70 mt-0.5">{el.description}</p>
                  </div>
                  <Plus className="w-4 h-4 opacity-50" />
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Structure Preview */}
        <Card className="lg:col-span-2 p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            Page Structure
          </h4>

          {/* Drop zone for root level */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop()}
            className={cn(
              'min-h-[300px] rounded-lg border-2 border-dashed p-4 transition-colors',
              draggedTag ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            {structure.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                <Layout className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Drag elements here to build your page structure
                </p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={structure}
                onReorder={updateStructure}
                className="space-y-2"
              >
                {structure.map((element) => (
                  <ElementNode
                    key={element.id}
                    element={element}
                    isExpanded={expandedIds.has(element.id)}
                    isSelected={selectedId === element.id}
                    issues={issues}
                    onToggleExpand={() => toggleExpanded(element.id)}
                    onSelect={() => setSelectedId(element.id)}
                    onRemove={() => removeElement(element.id)}
                    onAddChild={(tag) => addElement(tag, element.id)}
                    onDrop={() => handleDrop(element.id)}
                    draggedTag={draggedTag}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Validation Issues */}
          {issues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
              <h5 className="text-sm font-medium text-yellow-500 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Structure Issues
              </h5>
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li
                    key={i}
                    className={cn(
                      'text-xs',
                      issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400/80'
                    )}
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </Card>
      </div>

      {/* Generated HTML Preview */}
      <Card className="p-4 bg-card border shadow-sm">
        <h4 className="font-medium mb-3 text-sm text-muted-foreground">
          Generated HTML
        </h4>
        <pre className="p-4 rounded-lg bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto">
          {generateHtml(structure)}
        </pre>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Drag and drop elements to build a semantic page structure. The builder validates proper nesting.
      </div>
    </div>
  );
}

// Generate HTML string from structure
function generateHtml(elements: SemanticElement[], indent = 0): string {
  const spaces = '  '.repeat(indent);
  return elements
    .map((el) => {
      const hasChildren = el.children.length > 0;
      if (hasChildren) {
        return `${spaces}<${el.tag}>\n${generateHtml(el.children, indent + 1)}${spaces}</${el.tag}>`;
      }
      return `${spaces}<${el.tag}>...</${el.tag}>`;
    })
    .join('\n');
}

// Element Node Component
interface ElementNodeProps {
  element: SemanticElement;
  isExpanded: boolean;
  isSelected: boolean;
  issues: ValidationIssue[];
  onToggleExpand: () => void;
  onSelect: () => void;
  onRemove: () => void;
  onAddChild: (tag: SemanticTag) => void;
  onDrop: () => void;
  draggedTag: SemanticTag | null;
}

function ElementNode({
  element,
  isExpanded,
  isSelected,
  issues,
  onToggleExpand,
  onSelect,
  onRemove,
  onAddChild,
  onDrop,
  draggedTag,
}: ElementNodeProps) {
  const info = getElementInfo(element.tag);
  const Icon = info.icon;
  const hasChildren = element.children.length > 0;
  const elementIssues = issues.filter((i) => i.elementId === element.id);
  const hasIssues = elementIssues.length > 0;

  return (
    <Reorder.Item value={element} id={element.id}>
      <motion.div
        layout
        className={cn(
          'rounded-lg border transition-colors',
          info.color,
          isSelected && 'ring-2 ring-primary',
          hasIssues && 'border-yellow-500'
        )}
      >
        <div
          className="flex items-center gap-2 p-3 cursor-pointer"
          onClick={onSelect}
        >
          <GripVertical className="w-4 h-4 opacity-50 cursor-grab" />
          
          {(hasChildren || info.allowedChildren.length > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-0.5 hover:bg-white/10 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          <Icon className="w-4 h-4" />
          <code className="text-sm font-mono flex-1">&lt;{element.tag}&gt;</code>

          {hasIssues && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 hover:bg-white/10 rounded text-red-400 opacity-50 hover:opacity-100"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Children area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.stopPropagation();
                  onDrop();
                }}
                className={cn(
                  'mx-3 mb-3 p-2 rounded border-2 border-dashed min-h-[60px]',
                  draggedTag ? 'border-primary bg-primary/5' : 'border-border/50'
                )}
              >
                {hasChildren ? (
                  <div className="space-y-2">
                    {element.children.map((child) => (
                      <ElementNode
                        key={child.id}
                        element={child}
                        isExpanded={false}
                        isSelected={false}
                        issues={issues}
                        onToggleExpand={() => {}}
                        onSelect={() => {}}
                        onRemove={() => {}}
                        onAddChild={() => {}}
                        onDrop={() => {}}
                        draggedTag={null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Drop child elements here
                  </p>
                )}
              </div>

              {/* Quick add buttons for allowed children */}
              {info.allowedChildren.length > 0 && (
                <div className="mx-3 mb-3 flex flex-wrap gap-1">
                  {info.allowedChildren.map((childTag) => {
                    const childInfo = getElementInfo(childTag);
                    return (
                      <button
                        key={childTag}
                        onClick={() => onAddChild(childTag)}
                        className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {childInfo.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  );
}

export { defaultStructure, semanticElements, getElementInfo, generateHtml };
