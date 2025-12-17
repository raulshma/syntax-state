'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, ArrowRight, Play, RotateCcw, Scissors, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StringFunctionPlaygroundProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

type StringFunctionType = 'CONCAT' | 'LENGTH' | 'SUBSTRING' | 'REPLACE' | 'UPPER' | 'LOWER' | 'TRIM' | 'LEFT' | 'RIGHT';

interface FunctionInfo {
  name: StringFunctionType;
  description: string;
  analogy: string;
  syntax: string;
  needsSecondInput: boolean;
  needsNumbers: boolean;
}

const functions: FunctionInfo[] = [
  {
    name: 'CONCAT',
    description: 'Joins two or more strings together',
    analogy: 'Like linking train cars together to make a longer train',
    syntax: 'CONCAT(string1, string2, ...)',
    needsSecondInput: true,
    needsNumbers: false,
  },
  {
    name: 'LENGTH',
    description: 'Returns the number of characters in a string',
    analogy: 'Like counting beads on a necklace',
    syntax: 'LENGTH(string) or LEN(string)',
    needsSecondInput: false,
    needsNumbers: false,
  },
  {
    name: 'UPPER',
    description: 'Converts all characters to uppercase',
    analogy: 'Like SHOUTING - everything becomes loud and capital',
    syntax: 'UPPER(string)',
    needsSecondInput: false,
    needsNumbers: false,
  },
  {
    name: 'LOWER',
    description: 'Converts all characters to lowercase',
    analogy: 'Like whispering - everything becomes quiet and small',
    syntax: 'LOWER(string)',
    needsSecondInput: false,
    needsNumbers: false,
  },
  {
    name: 'SUBSTRING',
    description: 'Extracts a portion of a string',
    analogy: 'Like cutting a piece of ribbon - choose where to start and how long',
    syntax: 'SUBSTRING(string, start, length)',
    needsSecondInput: false,
    needsNumbers: true,
  },
  {
    name: 'REPLACE',
    description: 'Replaces occurrences of a substring with another',
    analogy: 'Like find-and-replace in a document',
    syntax: 'REPLACE(string, old, new)',
    needsSecondInput: true,
    needsNumbers: false,
  },
  {
    name: 'TRIM',
    description: 'Removes leading and trailing spaces',
    analogy: 'Like trimming the edges of a photo - removes the blank margins',
    syntax: 'TRIM(string)',
    needsSecondInput: false,
    needsNumbers: false,
  },
  {
    name: 'LEFT',
    description: 'Returns the leftmost characters',
    analogy: 'Like reading only the first few letters of a word',
    syntax: 'LEFT(string, count)',
    needsSecondInput: false,
    needsNumbers: true,
  },
  {
    name: 'RIGHT',
    description: 'Returns the rightmost characters',
    analogy: 'Like reading only the last few letters of a word',
    syntax: 'RIGHT(string, count)',
    needsSecondInput: false,
    needsNumbers: true,
  },
];

function calculateResult(
  func: StringFunctionType,
  input: string,
  secondInput: string,
  startPos: number,
  length: number
): string | number {
  switch (func) {
    case 'CONCAT':
      return input + secondInput;
    case 'LENGTH':
      return input.length;
    case 'UPPER':
      return input.toUpperCase();
    case 'LOWER':
      return input.toLowerCase();
    case 'SUBSTRING':
      return input.substring(startPos - 1, startPos - 1 + length);
    case 'REPLACE':
      return input.replaceAll(secondInput.split('→')[0] || '', secondInput.split('→')[1] || '');
    case 'TRIM':
      return input.trim();
    case 'LEFT':
      return input.substring(0, length);
    case 'RIGHT':
      return input.substring(input.length - length);
    default:
      return input;
  }
}

function CharacterVisualizer({ 
  original, 
  result, 
  func 
}: { 
  original: string; 
  result: string | number; 
  func: StringFunctionType;
}) {
  const resultStr = String(result);
  const isLengthFunc = func === 'LENGTH';

  return (
    <div className="mt-4 space-y-4">
      {/* Original string visualization */}
      <div>
        <span className="text-xs text-slate-500 uppercase tracking-wider">Original</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {original.split('').map((char, idx) => (
            <motion.div
              key={`orig-${idx}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded text-sm font-mono',
                char === ' ' 
                  ? 'bg-slate-700/30 border border-dashed border-slate-600' 
                  : 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
              )}
            >
              {char === ' ' ? '␣' : char}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-2 text-slate-500">
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-600 to-transparent" />
        <span className="text-xs uppercase tracking-wider">{func}</span>
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-600 to-transparent" />
      </div>

      {/* Result visualization */}
      <div>
        <span className="text-xs text-slate-500 uppercase tracking-wider">Result</span>
        {isLengthFunc ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50"
          >
            <span className="text-2xl font-bold text-emerald-400">{result}</span>
            <span className="text-sm text-slate-400">characters</span>
          </motion.div>
        ) : (
          <div className="flex flex-wrap gap-1 mt-1">
            {resultStr.split('').map((char, idx) => (
              <motion.div
                key={`res-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.03, type: 'spring' }}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded text-sm font-mono',
                  char === ' '
                    ? 'bg-slate-700/30 border border-dashed border-slate-600'
                    : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                )}
              >
                {char === ' ' ? '␣' : char}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StringFunctionPlayground({ mode = 'beginner' }: StringFunctionPlaygroundProps) {
  const [selectedFunction, setSelectedFunction] = useState<StringFunctionType>('UPPER');
  const [inputValue, setInputValue] = useState<string>('Hello World');
  const [secondInput, setSecondInput] = useState<string>(' SQL!');
  const [startPos, setStartPos] = useState<number>(1);
  const [length, setLength] = useState<number>(5);
  const [showResult, setShowResult] = useState(false);

  const funcInfo = useMemo(
    () => functions.find((f) => f.name === selectedFunction)!,
    [selectedFunction]
  );

  const result = calculateResult(selectedFunction, inputValue, secondInput, startPos, length);

  const handleCalculate = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setShowResult(false);
  };

  const visibleFunctions = mode === 'beginner' 
    ? functions.filter(f => ['CONCAT', 'LENGTH', 'UPPER', 'LOWER'].includes(f.name))
    : functions;

  return (
    <div className="p-6 rounded-xl bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Type className="h-5 w-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">String Function Playground</h3>
      </div>

      {/* Function Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {visibleFunctions.map((func) => (
          <button
            key={func.name}
            onClick={() => {
              setSelectedFunction(func.name);
              setShowResult(false);
              if (func.name === 'REPLACE') {
                setSecondInput('o→0');
              } else if (func.name === 'CONCAT') {
                setSecondInput(' SQL!');
              }
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              selectedFunction === func.name
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            )}
          >
            {func.name}
          </button>
        ))}
      </div>

      {/* Function Info */}
      <motion.div
        key={selectedFunction}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6"
      >
        <p className="text-white font-medium">{funcInfo.description}</p>
        {mode === 'beginner' && (
          <p className="text-slate-400 text-sm mt-1">💡 {funcInfo.analogy}</p>
        )}
        <code className="inline-block mt-2 px-2 py-1 rounded bg-slate-900 text-purple-400 text-sm">
          {funcInfo.syntax}
        </code>
      </motion.div>

      {/* Input Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Input String</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowResult(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your string..."
          />
        </div>

        {funcInfo.needsSecondInput && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {selectedFunction === 'REPLACE' ? 'Find → Replace (use → to separate)' : 'Second String'}
            </label>
            <input
              type="text"
              value={secondInput}
              onChange={(e) => {
                setSecondInput(e.target.value);
                setShowResult(false);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {funcInfo.needsNumbers && (
          <div className="flex gap-4">
            {selectedFunction === 'SUBSTRING' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Start Position</label>
                <input
                  type="number"
                  min={1}
                  value={startPos}
                  onChange={(e) => {
                    setStartPos(parseInt(e.target.value) || 1);
                    setShowResult(false);
                  }}
                  className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                {selectedFunction === 'SUBSTRING' ? 'Length' : 'Count'}
              </label>
              <input
                type="number"
                min={0}
                value={length}
                onChange={(e) => {
                  setLength(parseInt(e.target.value) || 0);
                  setShowResult(false);
                }}
                className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleCalculate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
          >
            <Play className="h-4 w-4" />
            Transform
          </button>

          {showResult && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Character Visualization */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CharacterVisualizer original={inputValue} result={result} func={selectedFunction} />
            
            {mode !== 'beginner' && (
              <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-400">
                  <span className="text-slate-300 font-medium">SQL: </span>
                  <code className="text-purple-400">
                    SELECT {selectedFunction}(&apos;{inputValue}&apos;
                    {funcInfo.needsSecondInput && `, '${secondInput}'`}
                    {funcInfo.needsNumbers && selectedFunction === 'SUBSTRING' && `, ${startPos}, ${length}`}
                    {funcInfo.needsNumbers && selectedFunction !== 'SUBSTRING' && `, ${length}`}
                    ) AS result;
                  </code>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced: Database Differences */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">⚠️ Database Variations</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• LENGTH: MySQL/PostgreSQL use LENGTH, SQL Server uses LEN</li>
            <li>• SUBSTRING: MySQL uses SUBSTR, SQL Server uses SUBSTRING</li>
            <li>• CONCAT: Some DBs support || operator (PostgreSQL, Oracle)</li>
            <li>• String indexing: SQL uses 1-based indexing, not 0-based</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default StringFunctionPlayground;
