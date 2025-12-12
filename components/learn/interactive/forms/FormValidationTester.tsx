'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Play,
  Code2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ValidationState = 'valid' | 'invalid' | 'pending' | 'pristine';

export interface ValidationExample {
  id: string;
  title: string;
  description: string;
  inputType: string;
  validationRules: string[];
  testCases: {
    value: string;
    expectedState: 'valid' | 'invalid';
    explanation: string;
  }[];
}

export const validationExamples: ValidationExample[] = [
  {
    id: 'required',
    title: 'Required Field',
    description: 'The simplest validation - field must not be empty',
    inputType: 'text',
    validationRules: ['required'],
    testCases: [
      { value: '', expectedState: 'invalid', explanation: 'Empty value fails required check' },
      { value: 'Hello', expectedState: 'valid', explanation: 'Any non-empty value passes' },
      { value: '   ', expectedState: 'invalid', explanation: 'Whitespace-only may fail (browser-dependent)' },
    ],
  },
  {
    id: 'email',
    title: 'Email Validation',
    description: 'Built-in email format validation',
    inputType: 'email',
    validationRules: ['type="email"', 'required'],
    testCases: [
      { value: 'user@example.com', expectedState: 'valid', explanation: 'Valid email format' },
      { value: 'invalid-email', expectedState: 'invalid', explanation: 'Missing @ symbol' },
      { value: 'user@', expectedState: 'invalid', explanation: 'Missing domain' },
      { value: '@example.com', expectedState: 'invalid', explanation: 'Missing local part' },
    ],
  },
  {
    id: 'minmax-length',
    title: 'Length Constraints',
    description: 'Minimum and maximum character limits',
    inputType: 'text',
    validationRules: ['minlength="3"', 'maxlength="10"'],
    testCases: [
      { value: 'ab', expectedState: 'invalid', explanation: 'Too short (< 3 chars)' },
      { value: 'abc', expectedState: 'valid', explanation: 'Exactly minimum length' },
      { value: 'hello', expectedState: 'valid', explanation: 'Within range' },
      { value: 'abcdefghij', expectedState: 'valid', explanation: 'Exactly maximum length' },
    ],
  },
  {
    id: 'pattern',
    title: 'Pattern Matching',
    description: 'Regular expression validation',
    inputType: 'text',
    validationRules: ['pattern="[A-Za-z]{3}-\\d{3}"', 'title="Format: ABC-123"'],
    testCases: [
      { value: 'ABC-123', expectedState: 'valid', explanation: 'Matches pattern exactly' },
      { value: 'abc-456', expectedState: 'valid', explanation: 'Lowercase also matches' },
      { value: 'AB-123', expectedState: 'invalid', explanation: 'Only 2 letters (need 3)' },
      { value: 'ABC-12', expectedState: 'invalid', explanation: 'Only 2 digits (need 3)' },
    ],
  },
  {
    id: 'number-range',
    title: 'Number Range',
    description: 'Minimum and maximum numeric values',
    inputType: 'number',
    validationRules: ['min="1"', 'max="100"', 'required'],
    testCases: [
      { value: '0', expectedState: 'invalid', explanation: 'Below minimum (1)' },
      { value: '1', expectedState: 'valid', explanation: 'Exactly minimum' },
      { value: '50', expectedState: 'valid', explanation: 'Within range' },
      { value: '100', expectedState: 'valid', explanation: 'Exactly maximum' },
      { value: '101', expectedState: 'invalid', explanation: 'Above maximum (100)' },
    ],
  },
];


interface FormValidationTesterProps {
  initialExample?: string;
  showConstraintApi?: boolean;
}

export function FormValidationTester({
  initialExample = 'required',
  showConstraintApi = true,
}: FormValidationTesterProps) {
  const [selectedExampleId, setSelectedExampleId] = useState(initialExample);
  const [inputValue, setInputValue] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('pristine');
  const [validityState, setValidityState] = useState<ValidityState | null>(null);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedExample = validationExamples.find((e) => e.id === selectedExampleId)!;

  // Check validity when input changes
  const checkValidity = useCallback(() => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const validity = input.validity;
    setValidityState({ ...validity } as ValidityState);

    if (inputValue === '' && validationState === 'pristine') {
      return; // Keep pristine state for empty initial value
    }

    if (input.checkValidity()) {
      setValidationState('valid');
    } else {
      setValidationState('invalid');
    }
  }, [inputValue, validationState]);

  useEffect(() => {
    // Small delay to simulate "pending" state
    if (inputValue !== '' || validationState !== 'pristine') {
      // Use setTimeout to avoid synchronous setState in effect
      const pendingTimer = setTimeout(() => setValidationState('pending'), 0);
      const validityTimer = setTimeout(checkValidity, 150);
      return () => {
        clearTimeout(pendingTimer);
        clearTimeout(validityTimer);
      };
    }
  }, [inputValue, checkValidity, validationState]);

  const handleReset = () => {
    setInputValue('');
    setValidationState('pristine');
    setValidityState(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleExampleChange = (exampleId: string) => {
    setSelectedExampleId(exampleId);
    handleReset();
  };

  const applyTestCase = (value: string) => {
    setInputValue(value);
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  };

  const getStateIcon = () => {
    switch (validationState) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStateBorderClass = () => {
    switch (validationState) {
      case 'valid':
        return 'border-green-500 ring-2 ring-green-500/20';
      case 'invalid':
        return 'border-red-500 ring-2 ring-red-500/20';
      case 'pending':
        return 'border-yellow-500 ring-2 ring-yellow-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Form Validation Tester
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Example Selector */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            Validation Examples
          </h4>
          <div className="space-y-2">
            {validationExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => handleExampleChange(example.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-colors',
                  selectedExampleId === example.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-secondary/50 border-border'
                )}
              >
                <span className="text-sm font-medium">{example.title}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Validation Demo */}
        <Card className="lg:col-span-2 p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            {selectedExample.title}
          </h4>

          {/* HTML Code */}
          <div className="mb-4 p-3 rounded-lg bg-zinc-900">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400">HTML</span>
            </div>
            <pre className="text-sm font-mono text-zinc-300 overflow-x-auto">
              {`<input type="${selectedExample.inputType}"\n       ${selectedExample.validationRules.join('\n       ')} />`}
            </pre>
          </div>

          {/* Live Input */}
          <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="mb-4">
            <Label className="text-sm mb-2 block">Try it out:</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type={selectedExample.inputType}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={cn('pr-10 transition-all', getStateBorderClass())}
                  {...getValidationProps(selectedExample)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getStateIcon()}
                </div>
              </div>
            </div>
          </form>

          {/* Validation State Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={validationState}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                'p-3 rounded-lg mb-4',
                validationState === 'valid' && 'bg-green-500/10 border border-green-500/30',
                validationState === 'invalid' && 'bg-red-500/10 border border-red-500/30',
                validationState === 'pending' && 'bg-yellow-500/10 border border-yellow-500/30',
                validationState === 'pristine' && 'bg-secondary/50 border border-border'
              )}
            >
              <div className="flex items-center gap-2">
                {getStateIcon()}
                <span className="text-sm font-medium capitalize">{validationState}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {validationState === 'pristine' && 'Enter a value to test validation'}
                {validationState === 'pending' && 'Checking validity...'}
                {validationState === 'valid' && 'Input passes all validation rules'}
                {validationState === 'invalid' && 'Input fails one or more validation rules'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Test Cases */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3 h-3" />
              Test Cases
            </h5>
            <div className="grid gap-2">
              {selectedExample.testCases.map((testCase, i) => (
                <button
                  key={i}
                  onClick={() => applyTestCase(testCase.value)}
                  className="flex items-center gap-3 p-2 rounded-lg border hover:bg-secondary/50 transition-colors text-left"
                >
                  {testCase.expectedState === 'valid' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                      {testCase.value === '' ? '(empty)' : `"${testCase.value}"`}
                    </code>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {testCase.explanation}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Constraint Validation API Details */}
      {showConstraintApi && validityState && validationState !== 'pristine' && (
        <Card className="p-4 bg-card border shadow-sm">
          <button
            onClick={() => setShowApiDetails(!showApiDetails)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Info className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-sm">Constraint Validation API</h4>
            <span className="ml-auto text-xs text-muted-foreground">
              {showApiDetails ? 'Hide' : 'Show'} details
            </span>
          </button>

          <AnimatePresence>
            {showApiDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <ValidityFlag name="valid" value={validityState.valid} />
                  <ValidityFlag name="valueMissing" value={validityState.valueMissing} />
                  <ValidityFlag name="typeMismatch" value={validityState.typeMismatch} />
                  <ValidityFlag name="patternMismatch" value={validityState.patternMismatch} />
                  <ValidityFlag name="tooShort" value={validityState.tooShort} />
                  <ValidityFlag name="tooLong" value={validityState.tooLong} />
                  <ValidityFlag name="rangeUnderflow" value={validityState.rangeUnderflow} />
                  <ValidityFlag name="rangeOverflow" value={validityState.rangeOverflow} />
                  <ValidityFlag name="stepMismatch" value={validityState.stepMismatch} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  These properties are available via <code className="bg-secondary px-1 rounded">input.validity</code> in JavaScript.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on test cases to see how different values affect validation state.
      </div>
    </div>
  );
}


// Validity Flag Display
function ValidityFlag({ name, value }: { name: string; value: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded text-xs font-mono',
        value ? 'bg-red-500/10 text-red-400' : 'bg-secondary/50 text-muted-foreground'
      )}
    >
      {value ? (
        <XCircle className="w-3 h-3" />
      ) : (
        <CheckCircle2 className="w-3 h-3 text-green-500" />
      )}
      <span>{name}</span>
      <span className="ml-auto">{value ? 'true' : 'false'}</span>
    </div>
  );
}

// Generate validation props from example
function getValidationProps(example: ValidationExample): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = {};

  example.validationRules.forEach((rule) => {
    if (rule === 'required') {
      props.required = true;
    } else {
      const match = rule.match(/(\w+)="([^"]+)"/);
      if (match) {
        const [, attr, value] = match;
        if (attr === 'minlength') props.minLength = parseInt(value);
        else if (attr === 'maxlength') props.maxLength = parseInt(value);
        else if (attr === 'min') props.min = parseInt(value);
        else if (attr === 'max') props.max = parseInt(value);
        else if (attr === 'pattern') props.pattern = value;
        else if (attr === 'title') props.title = value;
      }
    }
  });

  return props;
}

// Export for testing
export { getValidationProps };
