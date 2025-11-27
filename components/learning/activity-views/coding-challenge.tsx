'use client';

import { useState } from 'react';
import { Code, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/ui/code-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CodingChallenge } from '@/lib/db/schemas/learning-path';

const SUPPORTED_LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'shell', label: 'Shell/Bash' },
];

interface CodingChallengeViewProps {
  content: CodingChallenge;
  language?: string;
  onComplete: (answer: string, isCorrect?: boolean) => void;
}

export function CodingChallengeView({
  content,
  language: initialLanguage = 'typescript',
  onComplete
}: CodingChallengeViewProps) {
  const [code, setCode] = useState(content.starterCode || '');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    onComplete(code);
  };

  return (
    <div className="space-y-8">
      {/* Problem Description */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl text-foreground font-medium leading-relaxed">{content.problemDescription}</p>
      </div>

      {/* Input/Output Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border/50 bg-secondary/20">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Input Format</h4>
          <p className="text-base text-foreground leading-relaxed">{content.inputFormat}</p>
        </div>
        <div className="p-6 rounded-2xl border border-border/50 bg-secondary/20">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Output Format</h4>
          <p className="text-base text-foreground leading-relaxed">{content.outputFormat}</p>
        </div>
      </div>

      {/* Sample Input/Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
            <h4 className="text-xs font-mono font-medium text-muted-foreground">Sample Input</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(content.sampleInput)}
              className="h-6 w-6 rounded-md hover:bg-background/80"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto">
            {content.sampleInput}
          </pre>
        </div>
        <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
            <h4 className="text-xs font-mono font-medium text-muted-foreground">Sample Output</h4>
          </div>
          <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto">
            {content.sampleOutput}
          </pre>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="p-6 rounded-2xl border border-border/50 bg-secondary/10">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Evaluation Criteria</h4>
        <div className="flex flex-wrap gap-2">
          {content.evaluationCriteria.map((criteria, index) => (
            <Badge key={index} variant="secondary" className="rounded-lg px-3 py-1.5 text-sm font-medium bg-secondary/50 text-foreground border-border/50">
              {criteria}
            </Badge>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Code className="w-4 h-4" />
            Your Solution
          </h4>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[160px] h-9 rounded-full text-xs font-medium bg-secondary/30 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-xs font-medium">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            height="400px"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25">
          Submit Solution
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
