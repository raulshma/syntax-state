import { jsPDF } from 'jspdf';
import { Lexer, type Token, type Tokens } from 'marked';
import type { Interview, RevisionTopic, MCQ, RapidFire } from '@/lib/db/schemas/interview';

/**
 * Options for PDF export
 */
export interface PDFExportOptions {
  includeOpeningBrief?: boolean;
  includeTopics?: boolean;
  includeMCQs?: boolean;
  includeRapidFire?: boolean;
}

// Color scheme for syntax highlighting
const syntaxColors: Record<string, string> = {
  keyword: '#c678dd',    // purple - for, if, else, return, const, let, etc.
  string: '#98c379',     // green - strings
  comment: '#5c6370',    // gray - comments
  number: '#d19a66',     // orange - numbers
  function: '#61afef',   // blue - function names
  operator: '#56b6c2',   // cyan - operators
  default: '#abb2bf',    // light gray - default text
};

// Keywords for common languages
const keywords = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await',
  'try', 'catch', 'throw', 'new', 'this', 'super', 'static', 'public', 'private',
  'protected', 'interface', 'type', 'enum', 'implements', 'readonly', 'abstract',
  'def', 'self', 'None', 'True', 'False', 'lambda', 'yield', 'with', 'as',
  'in', 'not', 'and', 'or', 'is', 'pass', 'break', 'continue', 'elif',
  'int', 'float', 'double', 'char', 'boolean', 'void', 'string', 'bool',
  'null', 'undefined', 'true', 'false', 'typeof', 'instanceof', 'switch', 'case',
]);

/**
 * PDF Export Service
 * Generates formatted PDF documents from interview data with markdown rendering
 */
export class PDFExportService {
  private readonly pageWidth = 210;
  private readonly pageHeight = 297;
  private readonly margin = 20;
  private readonly contentWidth = 170;

  /**
   * Generate a PDF buffer from interview data
   */
  async generatePDF(
    interview: Interview,
    options: PDFExportOptions = {}
  ): Promise<Buffer> {
    const {
      includeOpeningBrief = true,
      includeTopics = true,
      includeMCQs = true,
      includeRapidFire = true,
    } = options;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = this.margin;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Interview Preparation', this.pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Job Details
    doc.setFontSize(14);
    doc.text(`${interview.jobDetails.title} at ${interview.jobDetails.company}`, this.margin, y);
    y += 10;

    if (includeOpeningBrief && interview.modules.openingBrief) {
      y = this.addOpeningBriefSection(doc, interview.modules.openingBrief, y);
    }

    if (includeTopics && interview.modules.revisionTopics.length > 0) {
      y = this.checkPageBreak(doc, y, 60);
      y = this.addRevisionTopicsSection(doc, interview.modules.revisionTopics, y);
    }

    if (includeMCQs && interview.modules.mcqs.length > 0) {
      y = this.checkPageBreak(doc, y, 60);
      y = this.addMCQsSection(doc, interview.modules.mcqs, y);
    }

    if (includeRapidFire && interview.modules.rapidFire.length > 0) {
      y = this.checkPageBreak(doc, y, 60);
      this.addRapidFireSection(doc, interview.modules.rapidFire, y);
    }

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }

  getFilename(interview: Interview): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const company = interview.jobDetails.company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const title = interview.jobDetails.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `interview-prep_${company}_${title}_${timestamp}.pdf`;
  }

  private checkPageBreak(doc: jsPDF, y: number, requiredSpace: number = 30): number {
    if (y + requiredSpace > this.pageHeight - this.margin) {
      doc.addPage();
      return this.margin;
    }
    return y;
  }


  /**
   * Render markdown content to PDF
   */
  private renderMarkdown(doc: jsPDF, markdown: string, startY: number, indent: number = 0): number {
    let y = startY;
    const tokens = Lexer.lex(markdown);

    for (const token of tokens) {
      y = this.renderToken(doc, token, y, indent);
    }

    return y;
  }

  /**
   * Render a single markdown token
   */
  private renderToken(doc: jsPDF, token: Token, y: number, indent: number): number {
    const leftMargin = this.margin + indent;
    const width = this.contentWidth - indent;

    switch (token.type) {
      case 'heading': {
        const heading = token as Tokens.Heading;
        y = this.checkPageBreak(doc, y, 12);
        const fontSize = Math.max(16 - (heading.depth - 1) * 2, 11);
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const headingText = this.extractText(heading.tokens || []);
        const lines = doc.splitTextToSize(headingText, width);
        lines.forEach((line: string) => {
          y = this.checkPageBreak(doc, y, 6);
          doc.text(line, leftMargin, y);
          y += fontSize * 0.4;
        });
        y += 3;
        break;
      }

      case 'paragraph': {
        const para = token as Tokens.Paragraph;
        y = this.checkPageBreak(doc, y, 10);
        y = this.renderInlineTokens(doc, para.tokens || [], y, leftMargin, width);
        y += 4;
        break;
      }

      case 'code': {
        const code = token as Tokens.Code;
        y = this.renderCodeBlockWithBackground(doc, code.text, code.lang || '', y, leftMargin, width);
        y += 4;
        break;
      }

      case 'list': {
        const list = token as Tokens.List;
        list.items.forEach((item, index) => {
          y = this.checkPageBreak(doc, y, 8);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          
          const bullet = list.ordered ? `${index + 1}.` : '•';
          doc.text(bullet, leftMargin, y);
          
          const itemText = this.extractText(item.tokens || []);
          const lines = doc.splitTextToSize(itemText, width - 8);
          lines.forEach((line: string, lineIndex: number) => {
            if (lineIndex > 0) y = this.checkPageBreak(doc, y, 5);
            doc.text(line, leftMargin + 6, y);
            y += 5;
          });
        });
        y += 2;
        break;
      }

      case 'blockquote': {
        const quote = token as Tokens.Blockquote;
        y = this.checkPageBreak(doc, y, 10);
        // Draw left border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        const quoteStartY = y;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        
        const quoteText = this.extractText(quote.tokens || []);
        const lines = doc.splitTextToSize(quoteText, width - 10);
        lines.forEach((line: string) => {
          y = this.checkPageBreak(doc, y, 5);
          doc.text(line, leftMargin + 5, y);
          y += 5;
        });
        
        doc.line(leftMargin, quoteStartY - 3, leftMargin, y);
        y += 4;
        break;
      }

      case 'space':
        y += 2;
        break;

      default:
        // Handle any raw text
        if ('text' in token && typeof token.text === 'string') {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const lines = doc.splitTextToSize(token.text, width);
          lines.forEach((line: string) => {
            y = this.checkPageBreak(doc, y, 5);
            doc.text(line, leftMargin, y);
            y += 5;
          });
        }
    }

    return y;
  }


  /**
   * Render inline tokens (bold, italic, code, links)
   */
  private renderInlineTokens(doc: jsPDF, tokens: Token[], y: number, leftMargin: number, width: number): number {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Flatten inline tokens to text with formatting info
    const text = this.extractText(tokens);
    const lines = doc.splitTextToSize(text, width);
    
    doc.setFont('helvetica', 'normal');
    lines.forEach((line: string) => {
      y = this.checkPageBreak(doc, y, 5);
      doc.text(line, leftMargin, y);
      y += 5;
    });
    
    return y;
  }

  /**
   * Extract plain text from tokens
   */
  private extractText(tokens: Token[]): string {
    return tokens.map(token => {
      if ('text' in token && typeof token.text === 'string') {
        if ('tokens' in token && Array.isArray(token.tokens)) {
          return this.extractText(token.tokens);
        }
        return token.text;
      }
      if ('raw' in token && typeof token.raw === 'string') {
        return token.raw;
      }
      return '';
    }).join('');
  }

  /**
   * Render a code block with syntax highlighting (handles page breaks)
   */
  private renderCodeBlock(doc: jsPDF, code: string, lang: string, y: number, leftMargin: number, width: number): number {
    const padding = 4;
    const lineHeight = 4;
    const codeLines = code.split('\n');
    const maxY = this.pageHeight - this.margin;
    
    // Helper to draw background for a code segment
    const drawCodeBackground = (startY: number, height: number, isStart: boolean, isEnd: boolean) => {
      doc.setFillColor(40, 44, 52);
      const topRadius = isStart ? 2 : 0;
      const bottomRadius = isEnd ? 2 : 0;
      
      if (topRadius === 0 && bottomRadius === 0) {
        doc.rect(leftMargin, startY - padding, width, height + padding, 'F');
      } else {
        doc.roundedRect(leftMargin, startY - padding, width, height + padding, topRadius, bottomRadius, 'F');
      }
    };
    
    // Start first code block
    y = this.checkPageBreak(doc, y, 15);
    let blockStartY = y;
    let isFirstBlock = true;
    
    // Language label on first block
    if (lang) {
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      // Will draw after background
    }
    
    doc.setFontSize(8);
    
    for (let i = 0; i < codeLines.length; i++) {
      const line = codeLines[i];
      
      // Check if we need a page break
      if (y + lineHeight > maxY) {
        // Draw background for current page segment
        drawCodeBackground(blockStartY, y - blockStartY, isFirstBlock, false);
        
        // Add continuation indicator
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('...continued', leftMargin + width - 2, y - 1, { align: 'right' });
        
        // New page
        doc.addPage();
        y = this.margin;
        blockStartY = y;
        isFirstBlock = false;
        
        // Draw "continued" label
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
      }
      
      // Render the line with syntax highlighting
      let x = leftMargin + padding;
      const highlightedTokens = this.tokenizeLine(line);
      
      highlightedTokens.forEach(({ text, color }) => {
        const rgb = this.hexToRgb(color);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.text(text, x, y);
        x += doc.getTextWidth(text);
      });
      
      y += lineHeight;
    }
    
    // Draw background for final segment
    drawCodeBackground(blockStartY, y - blockStartY + padding, isFirstBlock, true);
    
    // Re-render text on top of background (since we drew bg after text)
    // Actually, let's restructure to draw bg first per segment
    
    doc.setTextColor(0, 0, 0);
    return y + padding;
  }
  
  /**
   * Render a code block with proper background and page breaks
   */
  private renderCodeBlockWithBackground(doc: jsPDF, code: string, lang: string, y: number, leftMargin: number, width: number): number {
    const padding = 4;
    const lineHeight = 4;
    const codeLines = code.split('\n');
    const maxY = this.pageHeight - this.margin;
    
    // Split lines into page chunks
    const chunks: { lines: string[]; isFirst: boolean; isLast: boolean }[] = [];
    let currentChunk: string[] = [];
    let currentY = y;
    let isFirst = true;
    
    for (const line of codeLines) {
      if (currentY + lineHeight > maxY && currentChunk.length > 0) {
        chunks.push({ lines: currentChunk, isFirst, isLast: false });
        currentChunk = [];
        currentY = this.margin;
        isFirst = false;
      }
      currentChunk.push(line);
      currentY += lineHeight;
    }
    if (currentChunk.length > 0) {
      chunks.push({ lines: currentChunk, isFirst, isLast: true });
    }
    
    // Render each chunk
    for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
      const chunk = chunks[chunkIdx];
      
      if (chunkIdx > 0) {
        doc.addPage();
        y = this.margin;
      }
      
      const chunkHeight = chunk.lines.length * lineHeight + padding * 2;
      
      // Draw background
      doc.setFillColor(40, 44, 52);
      const radius = 2;
      doc.roundedRect(leftMargin, y - padding, width, chunkHeight, 
        chunk.isFirst ? radius : 0, 
        chunk.isLast ? radius : 0, 'F');
      
      // Language label on first chunk
      if (chunk.isFirst && lang) {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(lang.toUpperCase(), leftMargin + width - padding - 2, y + 2, { align: 'right' });
      }
      
      // Continued label
      if (!chunk.isFirst) {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('...continued', leftMargin + padding, y + 2);
        y += 4;
      }
      
      // Render lines
      doc.setFontSize(8);
      for (const line of chunk.lines) {
        let x = leftMargin + padding;
        const tokens = this.tokenizeLine(line);
        
        for (const { text, color } of tokens) {
          const rgb = this.hexToRgb(color);
          doc.setTextColor(rgb.r, rgb.g, rgb.b);
          doc.setFont('courier', 'normal');
          doc.text(text, x, y);
          x += doc.getTextWidth(text);
        }
        y += lineHeight;
      }
      
      y += padding;
    }
    
    doc.setTextColor(0, 0, 0);
    return y;
  }

  /**
   * Simple tokenizer for syntax highlighting
   */
  private tokenizeLine(line: string): Array<{ text: string; color: string }> {
    const tokens: Array<{ text: string; color: string }> = [];
    
    // Regex patterns for different token types
    const patterns = [
      { regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/, color: syntaxColors.comment },
      { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, color: syntaxColors.string },
      { regex: /\b(\d+\.?\d*)\b/, color: syntaxColors.number },
      { regex: /\b(function|def|fn)\s+(\w+)/, color: syntaxColors.function },
      { regex: /(\w+)\s*\(/, color: syntaxColors.function },
    ];
    
    let remaining = line;
    let position = 0;
    
    while (remaining.length > 0) {
      let matched = false;
      
      // Check for comments first (highest priority)
      const commentMatch = remaining.match(/^(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/);
      if (commentMatch) {
        tokens.push({ text: commentMatch[0], color: syntaxColors.comment });
        remaining = remaining.slice(commentMatch[0].length);
        matched = true;
        continue;
      }
      
      // Check for strings
      const stringMatch = remaining.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
      if (stringMatch) {
        tokens.push({ text: stringMatch[0], color: syntaxColors.string });
        remaining = remaining.slice(stringMatch[0].length);
        matched = true;
        continue;
      }
      
      // Check for numbers
      const numberMatch = remaining.match(/^(\d+\.?\d*)/);
      if (numberMatch) {
        tokens.push({ text: numberMatch[0], color: syntaxColors.number });
        remaining = remaining.slice(numberMatch[0].length);
        matched = true;
        continue;
      }
      
      // Check for keywords and identifiers
      const wordMatch = remaining.match(/^(\w+)/);
      if (wordMatch) {
        const word = wordMatch[0];
        const color = keywords.has(word) ? syntaxColors.keyword : syntaxColors.default;
        tokens.push({ text: word, color });
        remaining = remaining.slice(word.length);
        matched = true;
        continue;
      }
      
      // Check for operators
      const operatorMatch = remaining.match(/^([+\-*/%=<>!&|^~?:]+)/);
      if (operatorMatch) {
        tokens.push({ text: operatorMatch[0], color: syntaxColors.operator });
        remaining = remaining.slice(operatorMatch[0].length);
        matched = true;
        continue;
      }
      
      // Default: single character
      if (!matched) {
        tokens.push({ text: remaining[0], color: syntaxColors.default });
        remaining = remaining.slice(1);
      }
    }
    
    return tokens;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 171, g: 178, b: 191 }; // default color
  }


  /**
   * Add opening brief section
   */
  private addOpeningBriefSection(
    doc: jsPDF,
    openingBrief: Interview['modules']['openingBrief'],
    startY: number
  ): number {
    if (!openingBrief) return startY;

    let y = startY;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Opening Brief', this.margin, y);
    y += 3;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(this.margin, y, this.margin + 40, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Experience Match: ${openingBrief.experienceMatch}%`, this.margin, y);
    y += 6;
    doc.text(`Recommended Prep Time: ${openingBrief.prepTime}`, this.margin, y);
    y += 8;

    if (openingBrief.keySkills.length > 0) {
      doc.text('Key Skills:', this.margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      openingBrief.keySkills.forEach((skill) => {
        y = this.checkPageBreak(doc, y, 6);
        doc.text(`• ${skill}`, this.margin + 5, y);
        y += 5;
      });
      y += 3;
    }

    // Render markdown content
    y = this.renderMarkdown(doc, openingBrief.content, y);

    return y + 10;
  }

  /**
   * Add revision topics section
   */
  private addRevisionTopicsSection(
    doc: jsPDF,
    topics: RevisionTopic[],
    startY: number
  ): number {
    let y = startY;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Revision Topics', this.margin, y);
    y += 3;
    doc.setLineWidth(0.5);
    doc.line(this.margin, y, this.margin + 45, y);
    y += 8;

    topics.forEach((topic, index) => {
      y = this.checkPageBreak(doc, y, 25);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${topic.title}`, this.margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Confidence: ${topic.confidence} | Reason: ${topic.reason}`, this.margin, y);
      y += 6;

      doc.setTextColor(0, 0, 0);
      y = this.renderMarkdown(doc, topic.content, y);
      y += 8;
    });

    return y;
  }

  /**
   * Add MCQs section
   */
  private addMCQsSection(doc: jsPDF, mcqs: MCQ[], startY: number): number {
    let y = startY;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Multiple Choice Questions', this.margin, y);
    y += 3;
    doc.setLineWidth(0.5);
    doc.line(this.margin, y, this.margin + 70, y);
    y += 8;

    mcqs.forEach((mcq, index) => {
      y = this.checkPageBreak(doc, y, 40);

      // Render question with markdown
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}.`, this.margin, y);
      y = this.renderMarkdown(doc, mcq.question, y - 4, 8);
      y += 2;

      // Options
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      mcq.options.forEach((option, optIndex) => {
        y = this.checkPageBreak(doc, y, 8);
        const letter = String.fromCharCode(65 + optIndex);
        doc.text(`${letter}.`, this.margin + 5, y);
        y = this.renderMarkdown(doc, option, y - 4, 15);
      });
      y += 2;

      // Answer
      const answerLetter = String.fromCharCode(65 + mcq.options.indexOf(mcq.answer));
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34); // Green
      doc.text(`Answer: ${answerLetter}`, this.margin + 5, y);
      y += 5;

      // Explanation
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      y = this.renderMarkdown(doc, `**Explanation:** ${mcq.explanation}`, y, 5);
      y += 8;
    });

    return y;
  }

  /**
   * Add rapid-fire section
   */
  private addRapidFireSection(
    doc: jsPDF,
    rapidFire: RapidFire[],
    startY: number
  ): number {
    let y = startY;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Rapid-Fire Questions', this.margin, y);
    y += 3;
    doc.setLineWidth(0.5);
    doc.line(this.margin, y, this.margin + 55, y);
    y += 8;

    rapidFire.forEach((item, index) => {
      y = this.checkPageBreak(doc, y, 20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}.`, this.margin, y);
      y = this.renderMarkdown(doc, item.question, y - 4, 8);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      y = this.renderMarkdown(doc, `**Answer:** ${item.answer}`, y, 5);
      y += 6;
    });

    return y;
  }
}

export const pdfExportService = new PDFExportService();
