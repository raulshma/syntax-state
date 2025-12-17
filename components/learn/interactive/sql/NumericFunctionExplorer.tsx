'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, Info, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericFunctionExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

type FunctionType = 'FLOOR' | 'CEILING' | 'ROUND' | 'ABS' | 'MOD';

interface FunctionInfo {
  name: FunctionType;
  description: string;
  analogy: string;
  syntax: string;
  example: string;
}

const functions: FunctionInfo[] = [
  {
    name: 'FLOOR',
    description: 'Rounds a number DOWN to the nearest integer',
    analogy: 'Like dropping a ball - it always falls down to the floor below',
    syntax: 'FLOOR(number)',
    example: 'FLOOR(4.7) = 4',
  },
  {
    name: 'CEILING',
    description: 'Rounds a number UP to the nearest integer',
    analogy: 'Like a helium balloon - it always floats up to the ceiling',
    syntax: 'CEILING(number) or CEIL(number)',
    example: 'CEILING(4.2) = 5',
  },
  {
    name: 'ROUND',
    description: 'Rounds to the nearest value based on decimal places',
    analogy: 'Like rounding grades - 4.5 and up rounds up, below rounds down',
    syntax: 'ROUND(number, decimals)',
    example: 'ROUND(4.567, 2) = 4.57',
  },
  {
    name: 'ABS',
    description: 'Returns the absolute (positive) value of a number',
    analogy: 'Like measuring distance - you can\'t walk -5 steps, only 5 steps',
    syntax: 'ABS(number)',
    example: 'ABS(-7) = 7',
  },
  {
    name: 'MOD',
    description: 'Returns the remainder after division',
    analogy: 'Like dividing candy - MOD tells you how many are left over',
    syntax: 'MOD(dividend, divisor) or dividend % divisor',
    example: 'MOD(17, 5) = 2',
  },
];

function calculateResult(func: FunctionType, input: number, param?: number): number {
  switch (func) {
    case 'FLOOR':
      return Math.floor(input);
    case 'CEILING':
      return Math.ceil(input);
    case 'ROUND':
      return Number(input.toFixed(param ?? 0));
    case 'ABS':
      return Math.abs(input);
    case 'MOD':
      return input % (param ?? 1);
    default:
      return input;
  }
}

function NumberLine({ value, result, func }: { value: number; result: number; func: FunctionType }) {
  const min = Math.floor(Math.min(value, result)) - 2;
  const max = Math.ceil(Math.max(value, result)) + 2;
  const range = max - min;
  
  const valuePosition = ((value - min) / range) * 100;
  const resultPosition = ((result - min) / range) * 100;
  
  const integers = [];
  for (let i = Math.ceil(min); i <= Math.floor(max); i++) {
    integers.push(i);
  }

  return (
    <div className="relative h-24 mt-6 mb-8">
      {/* Number line */}
      <div className="absolute left-4 right-4 top-12 h-1 bg-linear-to-r from-blue-500/30 via-blue-500 to-blue-500/30 rounded-full" />
      
      {/* Integer markers */}
      {integers.map((int) => {
        const pos = ((int - min) / range) * 100;
        return (
          <div
            key={int}
            className="absolute top-10 transform -translate-x-1/2"
            style={{ left: `calc(${pos}% * 0.92 + 4%)` }}
          >
            <div className="w-0.5 h-4 bg-blue-400" />
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              {int}
            </span>
          </div>
        );
      })}
      
      {/* Input value marker */}
      <motion.div
        className="absolute top-0 transform -translate-x-1/2"
        style={{ left: `calc(${valuePosition}% * 0.92 + 4%)` }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-blue-400">Input</span>
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
          <div className="w-0.5 h-3 bg-blue-500" />
        </div>
      </motion.div>
      
      {/* Result marker */}
      <AnimatePresence>
        <motion.div
          key={result}
          className="absolute top-0 transform -translate-x-1/2"
          style={{ left: `calc(${resultPosition}% * 0.92 + 4%)` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-emerald-400">{func}</span>
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{result}</span>
            </div>
            <div className="w-0.5 h-3 bg-emerald-500" />
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Arrow showing direction */}
      {value !== result && (
        <motion.div
          className="absolute top-6"
          style={{
            left: `calc(${Math.min(valuePosition, resultPosition)}% * 0.92 + 4%)`,
            width: `calc(${Math.abs(resultPosition - valuePosition)}% * 0.92)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className={cn(
            'h-0.5 w-full',
            func === 'FLOOR' || (func === 'ROUND' && result < value) 
              ? 'bg-linear-to-l from-emerald-500 to-blue-500'
              : 'bg-linear-to-r from-blue-500 to-emerald-500'
          )} />
        </motion.div>
      )}
    </div>
  );
}

export function NumericFunctionExplorer({ mode = 'beginner' }: NumericFunctionExplorerProps) {
  const [selectedFunction, setSelectedFunction] = useState<FunctionType>('FLOOR');
  const [inputValue, setInputValue] = useState<string>('4.7');
  const [paramValue, setParamValue] = useState<string>('2');
  const [showResult, setShowResult] = useState(false);

  const funcInfo = useMemo(
    () => functions.find((f) => f.name === selectedFunction)!,
    [selectedFunction]
  );

  const numericInput = parseFloat(inputValue) || 0;
  const numericParam = parseFloat(paramValue) || 0;
  const result = calculateResult(selectedFunction, numericInput, numericParam);

  const needsParam = selectedFunction === 'ROUND' || selectedFunction === 'MOD';

  const handleCalculate = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setShowResult(false);
  };

  return (
    <div className="p-6 rounded-xl bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Calculator className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Numeric Function Explorer</h3>
      </div>

      {/* Function Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {functions.map((func) => (
          <button
            key={func.name}
            onClick={() => {
              setSelectedFunction(func.name);
              setShowResult(false);
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              selectedFunction === func.name
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
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
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white font-medium">{funcInfo.description}</p>
            {mode === 'beginner' && (
              <p className="text-slate-400 text-sm mt-1">💡 {funcInfo.analogy}</p>
            )}
            <code className="inline-block mt-2 px-2 py-1 rounded bg-slate-900 text-emerald-400 text-sm">
              {funcInfo.syntax}
            </code>
          </div>
        </div>
      </motion.div>

      {/* Input Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Input Value</label>
          <input
            type="number"
            step="0.1"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowResult(false);
            }}
            className="w-32 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {needsParam && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {selectedFunction === 'ROUND' ? 'Decimal Places' : 'Divisor'}
            </label>
            <input
              type="number"
              value={paramValue}
              onChange={(e) => {
                setParamValue(e.target.value);
                setShowResult(false);
              }}
              className="w-32 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <button
          onClick={handleCalculate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
        >
          <Play className="h-4 w-4" />
          Calculate
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

      {/* Number Line Visualization */}
      {showResult && !needsParam && (
        <NumberLine value={numericInput} result={result} func={selectedFunction} />
      )}

      {/* Result Display */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-linear-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
        >
          <div className="flex items-center gap-3">
            <code className="text-lg text-slate-300">
              {selectedFunction}({inputValue}
              {needsParam && `, ${paramValue}`})
            </code>
            <ArrowRight className="h-5 w-5 text-slate-500" />
            <span className="text-2xl font-bold text-emerald-400">{result}</span>
          </div>
          
          {mode !== 'beginner' && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">SQL Query: </span>
                <code className="text-blue-400">
                  SELECT {selectedFunction}({inputValue}
                  {needsParam && `, ${paramValue}`}) AS result;
                </code>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Advanced Mode: Edge Cases */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">⚠️ Edge Cases to Consider</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• FLOOR(-4.7) = -5 (rounds toward negative infinity)</li>
            <li>• ROUND(2.5) behavior varies by database (banker&apos;s rounding)</li>
            <li>• MOD with negative numbers: sign follows dividend in most DBs</li>
            <li>• ABS(NULL) = NULL (null-safe in all databases)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default NumericFunctionExplorer;
