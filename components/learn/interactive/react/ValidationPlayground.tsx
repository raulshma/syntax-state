'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Send,
  Code2,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ValidationRule {
  name: string;
  validate: (value: string) => boolean;
  message: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  rules: ValidationRule[];
}

export interface ValidationPlaygroundProps {
  /** Form field configurations */
  fields?: FormFieldConfig[];
  /** Whether to show validation code */
  showCode?: boolean;
}

// Default validation rules
const createRequiredRule = (fieldName: string): ValidationRule => ({
  name: 'required',
  validate: (value) => value.trim().length > 0,
  message: `${fieldName} is required`,
});

const createMinLengthRule = (min: number): ValidationRule => ({
  name: 'minLength',
  validate: (value) => value.length >= min,
  message: `Must be at least ${min} characters`,
});

const createEmailRule = (): ValidationRule => ({
  name: 'email',
  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message: 'Please enter a valid email address',
});

const createPasswordRule = (): ValidationRule => ({
  name: 'password',
  validate: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
  message: 'Must contain uppercase, lowercase, and number',
});

// Default form configuration
const defaultFields: FormFieldConfig[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Enter username',
    rules: [
      createRequiredRule('Username'),
      createMinLengthRule(3),
    ],
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    rules: [
      createRequiredRule('Email'),
      createEmailRule(),
    ],
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    rules: [
      createRequiredRule('Password'),
      createMinLengthRule(8),
      createPasswordRule(),
    ],
  },
];

interface FieldState {
  value: string;
  touched: boolean;
  errors: string[];
}

type FormState = Record<string, FieldState>;

/**
 * ValidationPlayground Component
 * Real-time validation demonstration with error messages and form submission
 * Requirements: 16.7
 */
export function ValidationPlayground({
  fields = defaultFields,
  showCode = true,
}: ValidationPlaygroundProps) {
  // Initialize form state
  const initialState = useMemo(() => {
    const state: FormState = {};
    fields.forEach((field) => {
      state[field.name] = { value: '', touched: false, errors: [] };
    });
    return state;
  }, [fields]);

  const [formState, setFormState] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'error' | null>(null);

  // Validate a single field
  const validateField = useCallback((field: FormFieldConfig, value: string): string[] => {
    const errors: string[] = [];
    for (const rule of field.rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }
    return errors;
  }, []);

  // Handle input change
  const handleChange = useCallback((fieldName: string, value: string) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return;

    const errors = validateField(field, value);
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        errors,
      },
    }));
    setSubmissionResult(null);
  }, [fields, validateField]);

  // Handle blur (mark as touched)
  const handleBlur = useCallback((fieldName: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  }, []);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return fields.every((field) => {
      const state = formState[field.name];
      return state.value.trim().length > 0 && state.errors.length === 0;
    });
  }, [fields, formState]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setFormState((prev) => {
      const newState = { ...prev };
      fields.forEach((field) => {
        newState[field.name] = {
          ...newState[field.name],
          touched: true,
        };
      });
      return newState;
    });

    setSubmitted(true);

    if (isFormValid) {
      setSubmissionResult('success');
    } else {
      setSubmissionResult('error');
    }
  }, [fields, isFormValid]);

  // Reset form
  const handleReset = useCallback(() => {
    setFormState(initialState);
    setSubmitted(false);
    setSubmissionResult(null);
  }, [initialState]);

  // Get field status
  const getFieldStatus = (fieldName: string): 'valid' | 'invalid' | 'pristine' => {
    const state = formState[fieldName];
    if (!state.touched && !submitted) return 'pristine';
    if (state.errors.length > 0) return 'invalid';
    if (state.value.trim().length > 0) return 'valid';
    return 'pristine';
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Form Validation Playground
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Real-time Validation:</strong> This form validates
          input as you type. Errors appear after you leave a field (on blur) or when you submit.
          The submit button is disabled until all fields are valid.
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Form */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Interactive Form</span>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {fields.map((field) => {
              const state = formState[field.name];
              const status = getFieldStatus(field.name);
              const showError = state.touched || submitted;

              return (
                <div key={field.name} className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    {field.label}
                    {status === 'valid' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {status === 'invalid' && showError && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      type={field.type === 'password' && showPasswords ? 'text' : field.type}
                      value={state.value}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={field.placeholder}
                      className={cn(
                        'w-full px-3 py-2 rounded-md border bg-background text-sm transition-all',
                        status === 'valid' && 'border-green-500 focus:ring-green-500/50',
                        status === 'invalid' && showError && 'border-red-500 focus:ring-red-500/50',
                        status === 'pristine' && 'focus:ring-primary/50'
                      )}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Error Messages */}
                  <AnimatePresence>
                    {showError && state.errors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        {state.errors.map((error, i) => (
                          <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                          </p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Validation Rules */}
                  <div className="flex flex-wrap gap-1">
                    {field.rules.map((rule) => {
                      const passed = rule.validate(state.value);
                      return (
                        <span
                          key={rule.name}
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded',
                            passed
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                              : 'bg-secondary text-muted-foreground'
                          )}
                        >
                          {rule.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid}
              className={cn(
                'w-full gap-2',
                isFormValid
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
              {isFormValid ? 'Submit Form' : 'Fill all fields correctly'}
            </Button>

            {/* Submission Result */}
            <AnimatePresence>
              {submissionResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'p-3 rounded-lg flex items-center gap-2',
                    submissionResult === 'success'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                  )}
                >
                  {submissionResult === 'success' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Form submitted successfully!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Please fix the errors above</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>

        {/* State & Code */}
        <div className="space-y-4">
          {/* Current State */}
          <Card className="overflow-hidden border shadow-sm">
            <div className="px-4 py-2 bg-secondary/30 border-b border-border">
              <span className="text-sm font-medium">Form State</span>
            </div>
            <pre className="p-4 bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto max-h-[200px]">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(formState).map(([key, state]) => [
                    key,
                    {
                      value: state.value,
                      valid: state.errors.length === 0,
                      touched: state.touched,
                    },
                  ])
                ),
                null,
                2
              )}
            </pre>
          </Card>

          {/* Code Example */}
          {showCode && (
            <Card className="overflow-hidden border shadow-sm">
              <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Validation Pattern</span>
              </div>
              <pre className="p-4 bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto max-h-[250px]">
{`const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [errors, setErrors] = useState({});

const validate = (name, value) => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value))
        return 'Invalid email';
      return '';
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Too short';
      return '';
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  setErrors(prev => ({ 
    ...prev, 
    [name]: validate(name, value) 
  }));
};`}
              </pre>
            </Card>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Try typing in each field to see real-time validation. Errors show after you leave a field or submit.
      </div>
    </div>
  );
}

// Export utilities for testing
export { createRequiredRule, createMinLengthRule, createEmailRule, createPasswordRule, defaultFields };
export default ValidationPlayground;
