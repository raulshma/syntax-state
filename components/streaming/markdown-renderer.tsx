"use client";

/**
 * Markdown Renderer using llm-ui
 * Displays streaming markdown content with code block support
 * Based on: https://github.com/richardgill/llm-ui
 */

import type { CodeToHtmlOptions } from "@llm-ui/code";
import {
  allLangs,
  allLangsAlias,
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
  loadHighlighter,
  useCodeBlockToHtml,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputComponent } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";
// NOTE: For production, consider importing specific themes to reduce bundle size
// import githubDark from "shiki/themes/github-dark.mjs";
import { bundledThemes } from "shiki/themes";
import getWasm from "shiki/wasm";
import { cn } from "@/lib/utils";

// -------Step 1: Create a code block component with Shiki-------

// Load highlighter once with optimized bundle using getHighlighterCore
const highlighter = loadHighlighter(
  getHighlighterCore({
    langs: allLangs(bundledLanguagesInfo),
    langAlias: allLangsAlias(bundledLanguagesInfo),
    themes: Object.values(bundledThemes),
    loadWasm: getWasm,
  })
);

const codeToHtmlOptions: CodeToHtmlOptions = {
  theme: "github-dark",
};

// Code block component with Shiki syntax highlighting
const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { html, code } = useCodeBlockToHtml({
    markdownCodeBlock: blockMatch.output,
    highlighter,
    codeToHtmlOptions,
  });

  if (!html) {
    // Fallback while Shiki is loading
    return (
      <pre className="shiki bg-muted p-4 rounded-lg overflow-x-auto my-4 max-w-full scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/30">
        <code className="text-sm font-mono">{code}</code>
      </pre>
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden max-w-full [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:-webkit-overflow-scrolling-touch [&_code]:text-sm [&_pre]:scrollbar-thin [&_pre]:scrollbar-track-muted [&_pre]:scrollbar-thumb-muted-foreground/30">
      {parseHtml(html)}
    </div>
  );
};

// -------Step 2: Main MarkdownRenderer component-------

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  proseClassName?: string;
}

export function MarkdownRenderer({
  content,
  isStreaming = false,
  className,
  proseClassName,
}: MarkdownRendererProps) {
  // Markdown component with styling using react-markdown
  // Defined inside to access proseClassName
  const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
    const markdown = blockMatch.output;
    return (
      <div className={cn("prose dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-pre:my-0 prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm", proseClassName)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    );
  };

  const { blockMatches } = useLLMOutput({
    llmOutput: content,
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    blocks: [
      {
        component: CodeBlock,
        findCompleteMatch: findCompleteCodeBlock(),
        findPartialMatch: findPartialCodeBlock(),
        lookBack: codeBlockLookBack(),
      },
    ],
    isStreamFinished: !isStreaming,
  });

  return (
    <div className={cn("relative", className)}>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse ml-0.5" />
      )}
    </div>
  );
}

// Simple markdown renderer without streaming (for static content)
export function StaticMarkdown({
  content,
  className,
  proseClassName,
}: {
  content: string;
  className?: string;
  proseClassName?: string;
}) {
  return (
    <MarkdownRenderer
      content={content}
      isStreaming={false}
      className={className}
      proseClassName={proseClassName}
    />
  );
}

// Export for use in AI log viewer and other components
export { MarkdownRenderer as default };
