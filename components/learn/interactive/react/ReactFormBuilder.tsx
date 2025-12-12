'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FormInput,
  Type,
  Mail,
  Lock,
  Hash,
  CheckSquare,
  ChevronDown,
  AlignLeft,
  RotateCcw,
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Types for React form builder
export type ReactInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'textarea';

export interface ReactFormField {
  id: string;
  type: ReactInputType;
  label: string;
  name: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  defaultValue?: string;
}

export interface ReactFormBuilderProps {
  /** Initial form fields */
  initialFields?: ReactFormField[];
  /** Callback when form changes */
  onFormChange?: (fields: ReactFormField[]) => void;
  /** Whether to show the controlled component pattern explanation */
  showControlledPattern?: boolean;
}

interface InputTypeInfo {
  type: ReactInputType;
  name: string;
  description: string;
  icon: typeof Type;
  color: string;
}

const inputTypes: InputTypeInfo[] = [
  {
    type: 'text',
    name: 'Text',
    description: 'Single-line text input',
    icon: Type,
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  {
    type: 'email',
    name: 'Email',
    description: 'Email address input',
    icon: Mail,
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  },
  {
    type: 'password',
    name: 'Password',
    description: 'Password input (masked)',
    icon: Lock,
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
  {
    type: 'number',
    name: 'Number',
    description: 'Numeric input',
    icon: Hash,
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    description: 'Boolean checkbox',
    icon: CheckSquare,
    color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  },
  {
    type: 'select',
    name: 'Select',
    description: 'Dropdown selection',
    icon: ChevronDown,
    color: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  },
  {
    type: 'textarea',
    name: 'Textarea',
    description: 'Multi-line text input',
    icon: AlignLeft,
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
];

const getInputTypeInfo = (type: ReactInputType): InputTypeInfo => {
  return inputTypes.find((t) => t.type === type)!;
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultFormFields: ReactFormField[] = [
  {
    id: generateId(),
    type: 'text',
    label: 'Full Name',
    name: 'fullName',
    placeholder: 'Enter your name',
    required: true,
  },
  {
    id: generateId(),
    type: 'email',
    label: 'Email Address',
    name: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
];


/**
 * Generate React form code from fields
 */
export function generateReactFormCode(fields: ReactFormField[]): string {
  if (fields.length === 0) {
    return `function MyForm() {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Add form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}`;
  }

  // Generate initial state
  const initialState = fields.reduce((acc, field) => {
    if (field.type === 'checkbox') {
      acc[field.name] = false;
    } else {
      acc[field.name] = field.defaultValue || '';
    }
    return acc;
  }, {} as Record<string, string | boolean>);

  const stateStr = JSON.stringify(initialState, null, 4).replace(/"/g, "'");

  // Generate JSX for each field
  const fieldJsx = fields.map((field) => {
    const indent = '      ';
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return `${indent}<div className="form-group">
${indent}  <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
${indent}  <input
${indent}    type="${field.type}"
${indent}    id="${field.name}"
${indent}    name="${field.name}"
${indent}    value={formData.${field.name}}
${indent}    onChange={handleChange}${field.placeholder ? `\n${indent}    placeholder="${field.placeholder}"` : ''}${field.required ? `\n${indent}    required` : ''}
${indent}  />
${indent}</div>`;

      case 'checkbox':
        return `${indent}<div className="form-group">
${indent}  <label>
${indent}    <input
${indent}      type="checkbox"
${indent}      name="${field.name}"
${indent}      checked={formData.${field.name}}
${indent}      onChange={handleCheckboxChange}
${indent}    />
${indent}    ${field.label}
${indent}  </label>
${indent}</div>`;

      case 'select':
        const options = (field.options || ['Option 1', 'Option 2'])
          .map((opt) => `${indent}    <option value="${opt}">${opt}</option>`)
          .join('\n');
        return `${indent}<div className="form-group">
${indent}  <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
${indent}  <select
${indent}    id="${field.name}"
${indent}    name="${field.name}"
${indent}    value={formData.${field.name}}
${indent}    onChange={handleChange}${field.required ? `\n${indent}    required` : ''}
${indent}  >
${indent}    <option value="">Select...</option>
${options}
${indent}  </select>
${indent}</div>`;

      case 'textarea':
        return `${indent}<div className="form-group">
${indent}  <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
${indent}  <textarea
${indent}    id="${field.name}"
${indent}    name="${field.name}"
${indent}    value={formData.${field.name}}
${indent}    onChange={handleChange}${field.placeholder ? `\n${indent}    placeholder="${field.placeholder}"` : ''}${field.required ? `\n${indent}    required` : ''}
${indent}  />
${indent}</div>`;

      default:
        return '';
    }
  }).join('\n\n');

  const hasCheckbox = fields.some((f) => f.type === 'checkbox');

  return `import { useState } from 'react';

function MyForm() {
  // Controlled component pattern: state holds all form values
  const [formData, setFormData] = useState(${stateStr});

  // Generic handler for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
${hasCheckbox ? `
  // Handler for checkboxes (uses checked instead of value)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
` : ''}
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <form onSubmit={handleSubmit}>
${fieldJsx}

      <button type="submit">Submit</button>
    </form>
  );
}`;
}


/**
 * ReactFormBuilder Component
 * Build forms with drag-and-drop and generate React form code
 * Requirements: 16.5
 */
export function ReactFormBuilder({
  initialFields = defaultFormFields,
  onFormChange,
  showControlledPattern = true,
}: ReactFormBuilderProps) {
  const [fields, setFields] = useState<ReactFormField[]>(initialFields);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  // Form preview state (for live demo)
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});

  const updateFields = useCallback(
    (newFields: ReactFormField[]) => {
      setFields(newFields);
      onFormChange?.(newFields);
    },
    [onFormChange]
  );

  const handleReset = useCallback(() => {
    updateFields(defaultFormFields);
    setSelectedId(null);
    setFormData({});
  }, [updateFields]);

  const addField = useCallback((type: ReactInputType) => {
    const info = getInputTypeInfo(type);
    const newField: ReactFormField = {
      id: generateId(),
      type,
      label: `${info.name} Field`,
      name: `field_${generateId()}`,
      placeholder: type === 'select' ? undefined : `Enter ${info.name.toLowerCase()}...`,
      options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      required: false,
    };
    updateFields([...fields, newField]);
    setSelectedId(newField.id);
  }, [fields, updateFields]);

  const removeField = useCallback((id: string) => {
    updateFields(fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [fields, selectedId, updateFields]);

  const updateField = useCallback((id: string, updates: Partial<ReactFormField>) => {
    updateFields(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, [fields, updateFields]);

  const handleCopyCode = useCallback(async () => {
    const code = generateReactFormCode(fields);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fields]);

  // Handle form preview input changes
  const handlePreviewChange = useCallback((name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedId),
    [fields, selectedId]
  );

  const generatedCode = useMemo(() => generateReactFormCode(fields), [fields]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FormInput className="w-5 h-5 text-primary" />
          React Form Builder
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
              React Code
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Controlled Pattern Explanation */}
      {showControlledPattern && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Controlled Components:</strong> In React, form inputs
            are &quot;controlled&quot; when their values are managed by React state. The input&apos;s value comes
            from state, and changes update state via <code className="bg-secondary px-1 rounded">onChange</code>.
          </p>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Field Palette */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            Form Fields
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Click to add fields to your form
          </p>
          <div className="space-y-2">
            {inputTypes.map((info) => {
              const Icon = info.icon;
              return (
                <motion.button
                  key={info.type}
                  onClick={() => addField(info.type)}
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
        <Card className="lg:col-span-2 overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">
              {viewMode === 'preview' ? 'Form Preview' : 'Generated React Code'}
            </span>
            {viewMode === 'code' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="gap-1 h-7"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>

          {viewMode === 'preview' ? (
            <div className="p-4 min-h-[350px]">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center border-2 border-dashed rounded-lg">
                  <FormInput className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Add form fields from the palette
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={fields}
                  onReorder={updateFields}
                  className="space-y-4"
                >
                  {fields.map((field) => (
                    <FormFieldPreview
                      key={field.id}
                      field={field}
                      isSelected={selectedId === field.id}
                      value={formData[field.name] ?? ''}
                      onSelect={() => setSelectedId(field.id)}
                      onRemove={() => removeField(field.id)}
                      onChange={(value) => handlePreviewChange(field.name, value)}
                    />
                  ))}
                </Reorder.Group>
              )}
            </div>
          ) : (
            <div className="h-[350px] overflow-auto">
              <pre className="p-4 bg-zinc-900 text-sm font-mono text-zinc-300 min-h-full">
                {generatedCode}
              </pre>
            </div>
          )}
        </Card>
      </div>

      {/* Field Configuration */}
      <AnimatePresence>
        {selectedField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-card border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-sm">Configure: {selectedField.label}</h4>
              </div>
              <FieldConfiguration
                field={selectedField}
                onUpdate={(updates) => updateField(selectedField.id, updates)}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State Visualization */}
      {fields.length > 0 && Object.keys(formData).length > 0 && (
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Current Form State
          </h4>
          <pre className="p-3 rounded-lg bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Card>
      )}

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Drag fields to reorder. Click a field to configure its properties. Switch to &quot;React Code&quot; to see the generated component.
      </div>
    </div>
  );
}


/**
 * FormFieldPreview - Renders a single field in the form preview
 */
interface FormFieldPreviewProps {
  field: ReactFormField;
  isSelected: boolean;
  value: string | boolean;
  onSelect: () => void;
  onRemove: () => void;
  onChange: (value: string | boolean) => void;
}

function FormFieldPreview({
  field,
  isSelected,
  value,
  onSelect,
  onRemove,
  onChange,
}: FormFieldPreviewProps) {
  const info = getInputTypeInfo(field.type);
  const Icon = info.icon;

  return (
    <Reorder.Item value={field} id={field.id}>
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
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <FormFieldInput field={field} value={value} onChange={onChange} />
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

/**
 * FormFieldInput - Renders the actual input based on field type
 */
interface FormFieldInputProps {
  field: ReactFormField;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

function FormFieldInput({ field, value, onChange }: FormFieldInputProps) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-md"
        />
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={typeof value === 'boolean' ? value : false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-muted-foreground">
            {field.placeholder || 'Check this option'}
          </span>
        </div>
      );
    case 'select':
      return (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-md border bg-background text-sm"
        >
          <option value="">Select an option...</option>
          {(field.options || ['Option 1', 'Option 2']).map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-md border bg-background text-sm resize-none"
          rows={3}
        />
      );
    default:
      return null;
  }
}

/**
 * FieldConfiguration - Configuration panel for a selected field
 */
interface FieldConfigurationProps {
  field: ReactFormField;
  onUpdate: (updates: Partial<ReactFormField>) => void;
}

function FieldConfiguration({ field, onUpdate }: FieldConfigurationProps) {
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
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Name (for state key)</Label>
            <Input
              value={field.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="mt-1 font-mono text-sm"
            />
          </div>
          {field.type !== 'checkbox' && field.type !== 'select' && (
            <div>
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
          {field.type === 'select' && (
            <div>
              <Label className="text-xs">Options (one per line)</Label>
              <textarea
                value={(field.options || []).join('\n')}
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

      {/* Validation */}
      <div className="space-y-4">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Validation
        </h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Required</Label>
              <p className="text-xs text-muted-foreground">Field must be filled</p>
            </div>
            <Switch
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
          </div>
        </div>

        {/* Code Preview */}
        <div className="mt-4">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            State Key
          </h5>
          <code className="block p-2 rounded bg-zinc-900 text-zinc-300 text-xs font-mono">
            formData.{field.name}
          </code>
        </div>
      </div>
    </div>
  );
}

// Export for testing
export { generateId, defaultFormFields, inputTypes, getInputTypeInfo };
export default ReactFormBuilder;
