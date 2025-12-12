'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FormInput,
  Type,
  Mail,
  Lock,
  Hash,
  CheckSquare,
  Circle,
  ChevronDown,
  AlignLeft,
  RotateCcw,
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'textarea';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email';
  value?: string | number;
  message: string;
}

export interface FormElement {
  id: string;
  type: InputType;
  label: string;
  name: string;
  placeholder?: string;
  options?: string[]; // For select and radio
  validation: ValidationRule[];
}

interface InputTypeInfo {
  type: InputType;
  name: string;
  description: string;
  icon: typeof Type;
  color: string;
  supportsValidation: ('required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max')[];
}

export const inputTypes: InputTypeInfo[] = [
  {
    type: 'text',
    name: 'Text',
    description: 'Single-line text input',
    icon: Type,
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    supportsValidation: ['required', 'minLength', 'maxLength', 'pattern'],
  },
  {
    type: 'email',
    name: 'Email',
    description: 'Email address input',
    icon: Mail,
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    supportsValidation: ['required'],
  },
  {
    type: 'password',
    name: 'Password',
    description: 'Password input (masked)',
    icon: Lock,
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
    supportsValidation: ['required', 'minLength', 'maxLength', 'pattern'],
  },
  {
    type: 'number',
    name: 'Number',
    description: 'Numeric input',
    icon: Hash,
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
    supportsValidation: ['required', 'min', 'max'],
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    description: 'Boolean checkbox',
    icon: CheckSquare,
    color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    supportsValidation: ['required'],
  },
  {
    type: 'radio',
    name: 'Radio',
    description: 'Radio button group',
    icon: Circle,
    color: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
    supportsValidation: ['required'],
  },
  {
    type: 'select',
    name: 'Select',
    description: 'Dropdown selection',
    icon: ChevronDown,
    color: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
    supportsValidation: ['required'],
  },
  {
    type: 'textarea',
    name: 'Textarea',
    description: 'Multi-line text input',
    icon: AlignLeft,
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    supportsValidation: ['required', 'minLength', 'maxLength'],
  },
];

export const getInputTypeInfo = (type: InputType): InputTypeInfo => {
  return inputTypes.find((t) => t.type === type)!;
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultFormElements: FormElement[] = [
  {
    id: generateId(),
    type: 'text',
    label: 'Full Name',
    name: 'fullName',
    placeholder: 'Enter your name',
    validation: [{ type: 'required', message: 'Name is required' }],
  },
  {
    id: generateId(),
    type: 'email',
    label: 'Email Address',
    name: 'email',
    placeholder: 'you@example.com',
    validation: [{ type: 'required', message: 'Email is required' }],
  },
];


interface FormBuilderProps {
  initialElements?: FormElement[];
  onFormChange?: (elements: FormElement[]) => void;
}

export function FormBuilder({
  initialElements = defaultFormElements,
  onFormChange,
}: FormBuilderProps) {
  const [elements, setElements] = useState<FormElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const updateElements = useCallback(
    (newElements: FormElement[]) => {
      setElements(newElements);
      onFormChange?.(newElements);
    },
    [onFormChange]
  );

  const handleReset = () => {
    updateElements(defaultFormElements);
    setSelectedId(null);
  };

  const addElement = (type: InputType) => {
    const info = getInputTypeInfo(type);
    const newElement: FormElement = {
      id: generateId(),
      type,
      label: `${info.name} Field`,
      name: `field_${generateId()}`,
      placeholder: type === 'select' || type === 'radio' ? undefined : `Enter ${info.name.toLowerCase()}...`,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      validation: [],
    };
    updateElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const removeElement = (id: string) => {
    updateElements(elements.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    updateElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const toggleValidation = (id: string, ruleType: ValidationRule['type']) => {
    const element = elements.find((el) => el.id === id);
    if (!element) return;

    const hasRule = element.validation.some((r) => r.type === ruleType);
    let newValidation: ValidationRule[];

    if (hasRule) {
      newValidation = element.validation.filter((r) => r.type !== ruleType);
    } else {
      const defaultMessages: Record<ValidationRule['type'], string> = {
        required: 'This field is required',
        minLength: 'Too short',
        maxLength: 'Too long',
        pattern: 'Invalid format',
        min: 'Value too low',
        max: 'Value too high',
        email: 'Invalid email',
      };
      newValidation = [
        ...element.validation,
        { type: ruleType, message: defaultMessages[ruleType] },
      ];
    }

    updateElement(id, { validation: newValidation });
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FormInput className="w-5 h-5 text-primary" />
          Form Builder
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-3 py-1.5 text-xs flex items-center gap-1 transition-colors',
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                'px-3 py-1.5 text-xs flex items-center gap-1 transition-colors',
                viewMode === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
              <Code2 className="w-3 h-3" />
              HTML
            </button>
          </div>
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
            Form Elements
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Click to add elements to your form
          </p>
          <div className="space-y-2">
            {inputTypes.map((info) => {
              const Icon = info.icon;
              return (
                <motion.button
                  key={info.type}
                  onClick={() => addElement(info.type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    info.color,
                    'hover:opacity-80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left flex-1">
                    <span className="text-sm font-medium">{info.name}</span>
                    <p className="text-xs opacity-70 mt-0.5">{info.description}</p>
                  </div>
                  <Plus className="w-4 h-4 opacity-50" />
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Form Preview / Code */}
        <Card className="lg:col-span-2 p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            {viewMode === 'preview' ? 'Form Preview' : 'Generated HTML'}
          </h4>

          {viewMode === 'preview' ? (
            <div className="min-h-[300px] rounded-lg border-2 border-dashed p-4 border-border">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                  <FormInput className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Add form elements from the palette
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={elements}
                  onReorder={updateElements}
                  className="space-y-4"
                >
                  {elements.map((element) => (
                    <FormElementPreview
                      key={element.id}
                      element={element}
                      isSelected={selectedId === element.id}
                      onSelect={() => setSelectedId(element.id)}
                      onRemove={() => removeElement(element.id)}
                    />
                  ))}
                </Reorder.Group>
              )}
            </div>
          ) : (
            <pre className="p-4 rounded-lg bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto min-h-[300px]">
              {generateFormHtml(elements)}
            </pre>
          )}
        </Card>
      </div>

      {/* Element Configuration */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-card border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-sm">Configure: {selectedElement.label}</h4>
              </div>
              <ElementConfiguration
                element={selectedElement}
                onUpdate={(updates) => updateElement(selectedElement.id, updates)}
                onToggleValidation={(ruleType) =>
                  toggleValidation(selectedElement.id, ruleType)
                }
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on a form element to configure its label, name, and validation rules.
      </div>
    </div>
  );
}


// Form Element Preview Component
interface FormElementPreviewProps {
  element: FormElement;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function FormElementPreview({
  element,
  isSelected,
  onSelect,
  onRemove,
}: FormElementPreviewProps) {
  const info = getInputTypeInfo(element.type);
  const Icon = info.icon;
  const isRequired = element.validation.some((r) => r.type === 'required');

  return (
    <Reorder.Item value={element} id={element.id}>
      <motion.div
        layout
        onClick={onSelect}
        className={cn(
          'rounded-lg border p-4 cursor-pointer transition-colors bg-background',
          isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
        )}
      >
        <div className="flex items-start gap-3">
          <GripVertical className="w-4 h-4 mt-1 opacity-50 cursor-grab" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', info.color.split(' ')[1])} />
              <Label className="text-sm">
                {element.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <FormElementInput element={element} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 hover:bg-destructive/10 rounded text-destructive opacity-50 hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

// Render the actual form input based on type
function FormElementInput({ element }: { element: FormElement }) {
  switch (element.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
      return (
        <Input
          type={element.type}
          placeholder={element.placeholder}
          className="max-w-md"
          disabled
        />
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4" disabled />
          <span className="text-sm text-muted-foreground">{element.placeholder || 'Check this option'}</span>
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {(element.options || ['Option 1', 'Option 2']).map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name={element.name} className="w-4 h-4" disabled />
              <span className="text-sm text-muted-foreground">{option}</span>
            </div>
          ))}
        </div>
      );
    case 'select':
      return (
        <select className="w-full max-w-md px-3 py-2 rounded-md border bg-background text-sm" disabled>
          <option value="">Select an option...</option>
          {(element.options || ['Option 1', 'Option 2']).map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={element.placeholder}
          className="w-full max-w-md px-3 py-2 rounded-md border bg-background text-sm resize-none"
          rows={3}
          disabled
        />
      );
    default:
      return null;
  }
}

// Element Configuration Panel
interface ElementConfigurationProps {
  element: FormElement;
  onUpdate: (updates: Partial<FormElement>) => void;
  onToggleValidation: (ruleType: ValidationRule['type']) => void;
}

function ElementConfiguration({
  element,
  onUpdate,
  onToggleValidation,
}: ElementConfigurationProps) {
  const info = getInputTypeInfo(element.type);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Basic Settings
        </h5>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              value={element.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Name (for form data)</Label>
            <Input
              value={element.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="mt-1 font-mono text-sm"
            />
          </div>
          {element.type !== 'checkbox' && element.type !== 'radio' && element.type !== 'select' && (
            <div>
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={element.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
          {(element.type === 'select' || element.type === 'radio') && (
            <div>
              <Label className="text-xs">Options (one per line)</Label>
              <textarea
                value={(element.options || []).join('\n')}
                onChange={(e) =>
                  onUpdate({ options: e.target.value.split('\n').filter(Boolean) })
                }
                className="mt-1 w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
                rows={4}
              />
            </div>
          )}
        </div>
      </div>

      {/* Validation Rules */}
      <div className="space-y-4">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Validation Rules
        </h5>
        <div className="space-y-3">
          {/* Required - available for all */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Required</Label>
              <p className="text-xs text-muted-foreground">Field must be filled</p>
            </div>
            <Switch
              checked={element.validation.some((r) => r.type === 'required')}
              onCheckedChange={() => onToggleValidation('required')}
            />
          </div>

          {/* Type-specific validation */}
          {info.supportsValidation.includes('minLength') && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Min Length</Label>
                <p className="text-xs text-muted-foreground">Minimum characters</p>
              </div>
              <Switch
                checked={element.validation.some((r) => r.type === 'minLength')}
                onCheckedChange={() => onToggleValidation('minLength')}
              />
            </div>
          )}

          {info.supportsValidation.includes('maxLength') && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Max Length</Label>
                <p className="text-xs text-muted-foreground">Maximum characters</p>
              </div>
              <Switch
                checked={element.validation.some((r) => r.type === 'maxLength')}
                onCheckedChange={() => onToggleValidation('maxLength')}
              />
            </div>
          )}

          {info.supportsValidation.includes('pattern') && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Pattern</Label>
                <p className="text-xs text-muted-foreground">Regex validation</p>
              </div>
              <Switch
                checked={element.validation.some((r) => r.type === 'pattern')}
                onCheckedChange={() => onToggleValidation('pattern')}
              />
            </div>
          )}

          {info.supportsValidation.includes('min') && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Min Value</Label>
                <p className="text-xs text-muted-foreground">Minimum number</p>
              </div>
              <Switch
                checked={element.validation.some((r) => r.type === 'min')}
                onCheckedChange={() => onToggleValidation('min')}
              />
            </div>
          )}

          {info.supportsValidation.includes('max') && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Max Value</Label>
                <p className="text-xs text-muted-foreground">Maximum number</p>
              </div>
              <Switch
                checked={element.validation.some((r) => r.type === 'max')}
                onCheckedChange={() => onToggleValidation('max')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Generate HTML from form elements
export function generateFormHtml(elements: FormElement[]): string {
  if (elements.length === 0) {
    return '<form>\n  <!-- Add form elements -->\n</form>';
  }

  const lines: string[] = ['<form>'];

  elements.forEach((element) => {
    const validationAttrs = generateValidationAttrs(element);
    
    lines.push(`  <div class="form-group">`);
    
    switch (element.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        lines.push(`    <label for="${element.name}">${element.label}</label>`);
        lines.push(
          `    <input type="${element.type}" id="${element.name}" name="${element.name}"${
            element.placeholder ? ` placeholder="${element.placeholder}"` : ''
          }${validationAttrs} />`
        );
        break;

      case 'checkbox':
        lines.push(`    <label>`);
        lines.push(`      <input type="checkbox" name="${element.name}"${validationAttrs} />`);
        lines.push(`      ${element.label}`);
        lines.push(`    </label>`);
        break;

      case 'radio':
        lines.push(`    <fieldset>`);
        lines.push(`      <legend>${element.label}</legend>`);
        (element.options || []).forEach((option, i) => {
          const optionId = `${element.name}_${i}`;
          lines.push(`      <label>`);
          lines.push(`        <input type="radio" name="${element.name}" value="${option}"${i === 0 ? validationAttrs : ''} />`);
          lines.push(`        ${option}`);
          lines.push(`      </label>`);
        });
        lines.push(`    </fieldset>`);
        break;

      case 'select':
        lines.push(`    <label for="${element.name}">${element.label}</label>`);
        lines.push(`    <select id="${element.name}" name="${element.name}"${validationAttrs}>`);
        lines.push(`      <option value="">Select...</option>`);
        (element.options || []).forEach((option) => {
          lines.push(`      <option value="${option}">${option}</option>`);
        });
        lines.push(`    </select>`);
        break;

      case 'textarea':
        lines.push(`    <label for="${element.name}">${element.label}</label>`);
        lines.push(
          `    <textarea id="${element.name}" name="${element.name}"${
            element.placeholder ? ` placeholder="${element.placeholder}"` : ''
          }${validationAttrs}></textarea>`
        );
        break;
    }

    lines.push(`  </div>`);
    lines.push('');
  });

  lines.push('  <button type="submit">Submit</button>');
  lines.push('</form>');

  return lines.join('\n');
}

function generateValidationAttrs(element: FormElement): string {
  const attrs: string[] = [];

  element.validation.forEach((rule) => {
    switch (rule.type) {
      case 'required':
        attrs.push('required');
        break;
      case 'minLength':
        attrs.push(`minlength="${rule.value || 1}"`);
        break;
      case 'maxLength':
        attrs.push(`maxlength="${rule.value || 100}"`);
        break;
      case 'pattern':
        attrs.push(`pattern="${rule.value || '.*'}"`);
        break;
      case 'min':
        attrs.push(`min="${rule.value || 0}"`);
        break;
      case 'max':
        attrs.push(`max="${rule.value || 100}"`);
        break;
    }
  });

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

export { defaultFormElements, generateId };
