'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// JavaScript reserved words
const RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
  'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
  'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
  'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends',
  'import', 'super', 'implements', 'interface', 'let', 'package', 'private',
  'protected', 'public', 'static', 'yield', 'null', 'true', 'false'
]);

// Strict mode reserved words
const STRICT_RESERVED = new Set([
  'implements', 'interface', 'let', 'package', 'private',
  'protected', 'public', 'static', 'yield'
]);

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface VariableNamingValidatorProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  showExamples?: boolean;
  showChallenge?: boolean;
}

// Check if character is valid for start of identifier
function isValidStart(char: string): boolean {
  return /^[a-zA-Z_$]$/.test(char) || /^\p{L}$/u.test(char);
}

// Check if character is valid for rest of identifier
function isValidPart(char: string): boolean {
  return /^[a-zA-Z0-9_$]$/.test(char) || /^[\p{L}\p{N}]$/u.test(char);
}

// Validate a variable name
function validateVariableName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!name || name.length === 0) {
    return { isValid: false, errors: ['Name cannot be empty'], warnings, suggestions };
  }

  // Check first character
  const firstChar = name[0];
  if (/^\d$/.test(firstChar)) {
    errors.push('Cannot start with a number');
  } else if (!isValidStart(firstChar)) {
    errors.push(`Invalid starting character: "${firstChar}"`);
  }

  // Check remaining characters
  for (let i = 1; i < name.length; i++) {
    const char = name[i];
    if (char === '-') {
      errors.push('Hyphens are not allowed (use camelCase or underscores)');
      break;
    } else if (char === ' ') {
      errors.push('Spaces are not allowed');
      break;
    } else if (!isValidPart(char)) {
      errors.push(`Invalid character: "${char}"`);
      break;
    }
  }

  // Check for reserved words
  if (RESERVED_WORDS.has(name)) {
    errors.push(`"${name}" is a reserved keyword`);
  }

  // Check for strict mode reserved
  if (STRICT_RESERVED.has(name)) {
    warnings.push(`"${name}" is reserved in strict mode`);
  }

  // Style warnings and suggestions
  if (errors.length === 0) {
    // Single letter variable
    if (name.length === 1 && !/^[ijkxyzn]$/.test(name)) {
      warnings.push('Single-letter names can be unclear');
      suggestions.push('Consider a more descriptive name');
    }

    // All uppercase (not a constant pattern)
    if (name === name.toUpperCase() && name.length > 1 && !name.includes('_')) {
      suggestions.push('ALL_CAPS is typically for constants');
    }

    // snake_case check
    if (name.includes('_') && name !== name.toUpperCase()) {
      suggestions.push('Consider camelCase for JavaScript variables');
    }

    // Starts with uppercase (class convention)
    if (/^[A-Z]/.test(name) && !name.includes('_')) {
      warnings.push('PascalCase is typically for classes/constructors');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

// Example names for challenges
const CHALLENGE_NAMES = [
  { name: 'firstName', valid: true, hint: 'Perfect camelCase' },
  { name: '1stPlace', valid: false, hint: 'Cannot start with number' },
  { name: '_private', valid: true, hint: 'Underscore prefix is valid' },
  { name: 'my-variable', valid: false, hint: 'Hyphens not allowed' },
  { name: 'const', valid: false, hint: 'Reserved keyword' },
  { name: '$price', valid: true, hint: 'Dollar sign is valid' },
  { name: 'user name', valid: false, hint: 'Spaces not allowed' },
  { name: 'MAX_SIZE', valid: true, hint: 'Valid constant naming' },
  { name: 'café', valid: true, hint: 'Unicode letters work!' },
  { name: 'isActive', valid: true, hint: 'Great boolean naming' },
];

/**
 * VariableNamingValidator Component
 * Interactive component for learning and practicing JavaScript variable naming rules
 */
export function VariableNamingValidator({
  mode = 'beginner',
  showExamples = true,
  showChallenge = true,
}: VariableNamingValidatorProps) {
  const [inputName, setInputName] = useState('');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showChallengeResult, setShowChallengeResult] = useState(false);

  const validation = useMemo(() => validateVariableName(inputName), [inputName]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value);
  }, []);

  const handleChallengeAnswer = useCallback((answer: boolean) => {
    const currentChallenge = CHALLENGE_NAMES[challengeIndex];
    const isCorrect = answer === currentChallenge.valid;
    setChallengeAnswer(answer);
    setShowChallengeResult(true);
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
  }, [challengeIndex]);

  const nextChallenge = useCallback(() => {
    setChallengeIndex(i => (i + 1) % CHALLENGE_NAMES.length);
    setChallengeAnswer(null);
    setShowChallengeResult(false);
  }, []);

  const currentChallenge = CHALLENGE_NAMES[challengeIndex];

  return (
    <Card className="p-6 bg-background/50 border-border">
      <div className="space-y-6">
        {/* Interactive Validator */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Variable Name Validator
          </h3>
          
          <div className="relative">
            <input
              type="text"
              value={inputName}
              onChange={handleInputChange}
              placeholder="Type a variable name..."
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 bg-background text-foreground",
                "font-mono text-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                inputName === '' && "border-border",
                validation.isValid && inputName && "border-green-500",
                !validation.isValid && inputName && "border-red-500"
              )}
            />
            
            <AnimatePresence>
              {inputName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {validation.isValid ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Validation Feedback */}
          <AnimatePresence mode="wait">
            {inputName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 space-y-2"
              >
                {/* Errors */}
                {validation.errors.map((error, i) => (
                  <motion.div
                    key={`error-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-400"
                  >
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                ))}

                {/* Warnings */}
                {validation.warnings.map((warning, i) => (
                  <motion.div
                    key={`warning-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-yellow-400"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </motion.div>
                ))}

                {/* Suggestions */}
                {validation.suggestions.map((suggestion, i) => (
                  <motion.div
                    key={`suggestion-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-blue-400"
                  >
                    <Lightbulb className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </motion.div>
                ))}

                {/* Success */}
                {validation.isValid && validation.errors.length === 0 && 
                 validation.warnings.length === 0 && validation.suggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-400"
                  >
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Valid variable name!</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Examples Section */}
        {showExamples && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Examples
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'userName', valid: true },
                { name: '_count', valid: true },
                { name: '$el', valid: true },
                { name: '2cool', valid: false },
                { name: 'my-var', valid: false },
                { name: 'class', valid: false },
              ].map(({ name, valid }) => (
                <button
                  key={name}
                  onClick={() => setInputName(name)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-mono transition-colors",
                    valid
                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Challenge Mode */}
        {showChallenge && mode !== 'beginner' && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Challenge Mode
              </h4>
              <span className="text-sm font-medium text-primary">
                Score: {score}/{CHALLENGE_NAMES.length}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-2">
                Is this a valid variable name?
              </p>
              <p className="text-xl font-mono font-semibold text-foreground mb-4">
                {currentChallenge.name}
              </p>

              {!showChallengeResult ? (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleChallengeAnswer(true)}
                    variant="outline"
                    className="flex-1 border-green-500/50 hover:bg-green-500/10"
                  >
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Valid
                  </Button>
                  <Button
                    onClick={() => handleChallengeAnswer(false)}
                    variant="outline"
                    className="flex-1 border-red-500/50 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-2 text-red-500" />
                    Invalid
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className={cn(
                    "p-3 rounded-lg",
                    challengeAnswer === currentChallenge.valid
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  )}>
                    {challengeAnswer === currentChallenge.valid
                      ? "Correct!"
                      : `Incorrect! The answer is: ${currentChallenge.valid ? 'Valid' : 'Invalid'}`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 inline mr-1" />
                    {currentChallenge.hint}
                  </p>
                  <Button onClick={nextChallenge} className="w-full">
                    Next Challenge
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default VariableNamingValidator;
