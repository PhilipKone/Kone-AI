import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0e] shadow-lg">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18191a] border-b border-white/[0.08] text-xs text-[#c4c7c5]">
        <div className="flex items-center gap-2 font-mono">
          <Terminal size={14} className="text-[#a8c7fa]" />
          <span className="font-medium text-[#c4c7c5]">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 text-[#e3e3e3] transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-[#e3e3e3] bg-[#0d0d0e]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  // Parse inline markdown: links [text](url), autolinks <url>, bold **text**, italic *text*, code `code`
  const renderInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return null;

    // Handle <br> tags within table cells or paragraphs
    const brSplits = text.split(/<br\s*\/?>/gi);
    if (brSplits.length > 1) {
      return (
        <>
          {brSplits.map((sub, sIdx) => (
            <React.Fragment key={sIdx}>
              {sIdx > 0 && <br />}
              {renderInlineFormatting(sub)}
            </React.Fragment>
          ))}
        </>
      );
    }

    // Auto-normalize <https://...> autolinks to [https://...](https://...)
    // Normalize typographic curly quotes around identifiers to backticks
    const normalized = text
      .replace(/<(https?:\/\/[^>]+)>/g, '[$1]($1)')
      .replace(/[‘’]([a-zA-Z0-9_().->:/*]+)[‘’]/g, '`$1`');

    // Tokenize by code `...`, links [...](...), bold **...**, italic *...*
    const tokens = normalized.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g);

    return tokens.map((token, tIdx) => {
      if (!token) return null;

      // Inline code
      if (token.startsWith('`') && token.endsWith('`') && token.length > 1) {
        return (
          <code
            key={tIdx}
            className="px-1.5 py-0.5 rounded bg-white/10 text-[#a8c7fa] font-mono text-[12.5px] border border-white/5"
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      // Markdown Link: [label](url)
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        const displayLabel = label.startsWith('http')
          ? label.replace(/^https?:\/\//, '').replace(/\/$/, '')
          : label;
        return (
          <a
            key={tIdx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8ab4f8] hover:text-[#c2e7ff] underline underline-offset-2 transition-colors font-medium inline-flex items-center gap-0.5"
          >
            <span>{displayLabel}</span>
            <ExternalLink size={11} className="inline opacity-70 ml-0.5 shrink-0" />
          </a>
        );
      }

      // Bold: **text**
      if (token.startsWith('**') && token.endsWith('**') && token.length > 3) {
        return (
          <strong key={tIdx} className="font-semibold text-white">
            {renderInlineFormatting(token.slice(2, -2))}
          </strong>
        );
      }

      // Italic: *text* or _text_
      if ((token.startsWith('*') && token.endsWith('*') && token.length > 2) ||
          (token.startsWith('_') && token.endsWith('_') && token.length > 2)) {
        return (
          <em key={tIdx} className="italic text-[#d0d3d5]">
            {renderInlineFormatting(token.slice(1, -1))}
          </em>
        );
      }

      return token;
    });
  };

  // Helper to render markdown tables
  const renderTable = (tableLines: string[], key: string) => {
    if (tableLines.length < 2) return null;

    // Filter empty lines
    const cleanLines = tableLines.filter(l => l.trim().length > 0);
    if (cleanLines.length === 0) return null;

    // Extract headers
    const parseRow = (line: string) => {
      const stripped = line.trim().replace(/^\|/, '').replace(/\|$/, '');
      return stripped.split('|').map(c => c.trim());
    };

    const headerCells = parseRow(cleanLines[0]);
    
    // Check if line 1 is a delimiter row (|---|---|)
    let startIndex = 1;
    let alignments: Array<'left' | 'center' | 'right'> = [];

    if (cleanLines[1] && /^\|?(\s*:?-+:?\s*\|?)+$/.test(cleanLines[1].trim())) {
      const alignCells = parseRow(cleanLines[1]);
      alignments = alignCells.map(c => {
        const trimmed = c.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
      });
      startIndex = 2;
    }

    const bodyRows = cleanLines.slice(startIndex).map(parseRow);

    return (
      <div key={key} className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#161718] shadow-lg">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#1f2022] border-b border-white/10">
              {headerCells.map((h, hIdx) => {
                const align = alignments[hIdx] || 'left';
                const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                return (
                  <th
                    key={hIdx}
                    className={`px-4 py-3 font-semibold text-[#a8c7fa] text-xs uppercase tracking-wider ${alignClass}`}
                  >
                    {renderInlineFormatting(h)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors odd:bg-transparent even:bg-white/[0.01]">
                {row.map((cell, cIdx) => {
                  const align = alignments[cIdx] || 'left';
                  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                  return (
                    <td key={cIdx} className={`px-4 py-3 text-[#e3e3e3] leading-relaxed align-top ${alignClass}`}>
                      {renderInlineFormatting(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Main parser for full message
  const renderFormattedContent = (rawText: string) => {
    // Ensure unclosed code fences are closed so incomplete responses render properly
    let preparedText = rawText;
    const fenceMatches = (preparedText.match(/```/g) || []).length;
    if (fenceMatches % 2 !== 0) {
      preparedText += '\n```';
    }

    // Split by fenced code blocks: ```[language]\n[code]```
    const parts = preparedText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Code Block
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trimStart().split('\n');
        const firstLine = lines[0].trim();
        const language = firstLine.match(/^[a-zA-Z0-9_#+-]+$/) ? firstLine : '';
        const code = language ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <CodeBlock
            key={`code-${index}`}
            language={language || 'text'}
            code={code.trimEnd()}
          />
        );
      }

      // Process prose, tables, headings, lists, blockquotes
      const lines = part.split('\n');
      const elements: React.ReactNode[] = [];
      let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
      let currentTableLines: string[] = [];

      const flushTable = (k: string) => {
        if (currentTableLines.length > 0) {
          elements.push(renderTable(currentTableLines, `${k}-table`));
          currentTableLines = [];
        }
      };

      const flushList = (k: string) => {
        if (!currentList) return;
        if (currentList.type === 'ul') {
          elements.push(
            <ul key={`${k}-ul`} className="list-disc list-inside space-y-1.5 my-2.5 pl-1 text-[#e3e3e3]">
              {currentList.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-sm sm:text-[15px] leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`${k}-ol`} className="list-decimal list-inside space-y-1.5 my-2.5 pl-1 text-[#e3e3e3]">
              {currentList.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-sm sm:text-[15px] leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        }
        currentList = null;
      };

      lines.forEach((rawLine, lineIdx) => {
        const l = rawLine.trim();

        // Check if line is a table row (starts and ends with |)
        if (l.startsWith('|') && l.endsWith('|')) {
          flushList(`pre-table-${lineIdx}`);
          currentTableLines.push(l);
          return;
        } else {
          flushTable(`end-table-${lineIdx}`);
        }

        // Empty lines flush active lists
        if (!l) {
          flushList(`empty-${lineIdx}`);
          return;
        }

        // Horizontal Rules: --- or *** or ___
        if (/^([-*_]){3,}$/.test(l)) {
          flushList(`hr-${lineIdx}`);
          elements.push(<hr key={`hr-${lineIdx}`} className="my-5 border-0 h-px bg-white/10" />);
          return;
        }

        // Blockquote: > text
        if (l.startsWith('> ')) {
          flushList(`quote-${lineIdx}`);
          elements.push(
            <blockquote
              key={`quote-${lineIdx}`}
              className="my-3 pl-3.5 py-1.5 border-l-2 border-[#8ab4f8] bg-white/[0.03] rounded-r-lg text-sm text-[#c4c7c5] italic"
            >
              {renderInlineFormatting(l.replace(/^>\s+/, ''))}
            </blockquote>
          );
          return;
        }

        // Headings
        if (l.startsWith('#### ')) {
          flushList(`h4-${lineIdx}`);
          elements.push(
            <h4 key={`h4-${lineIdx}`} className="text-sm sm:text-base font-semibold text-[#a8c7fa] mt-3.5 mb-1.5">
              {renderInlineFormatting(l.replace(/^####\s+/, ''))}
            </h4>
          );
        } else if (l.startsWith('### ')) {
          flushList(`h3-${lineIdx}`);
          elements.push(
            <h3 key={`h3-${lineIdx}`} className="text-base sm:text-lg font-semibold text-white mt-4 mb-2">
              {renderInlineFormatting(l.replace(/^###\s+/, ''))}
            </h3>
          );
        } else if (l.startsWith('## ')) {
          flushList(`h2-${lineIdx}`);
          elements.push(
            <h2 key={`h2-${lineIdx}`} className="text-lg sm:text-xl font-bold text-white mt-5 mb-2.5">
              {renderInlineFormatting(l.replace(/^##\s+/, ''))}
            </h2>
          );
        } else if (l.startsWith('# ')) {
          flushList(`h1-${lineIdx}`);
          elements.push(
            <h1 key={`h1-${lineIdx}`} className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3">
              {renderInlineFormatting(l.replace(/^#\s+/, ''))}
            </h1>
          );
        }
        // Unordered lists (- , * , • )
        else if (l.startsWith('- ') || l.startsWith('* ') || l.startsWith('• ')) {
          const itemText = l.replace(/^([-*•])\s+/, '');
          if (currentList && currentList.type === 'ul') {
            currentList.items.push(itemText);
          } else {
            flushList(`ul-start-${lineIdx}`);
            currentList = { type: 'ul', items: [itemText] };
          }
        }
        // Ordered lists (1. , 2. )
        else if (/^\d+\.\s+/.test(l)) {
          const itemText = l.replace(/^\d+\.\s+/, '');
          if (currentList && currentList.type === 'ol') {
            currentList.items.push(itemText);
          } else {
            flushList(`ol-start-${lineIdx}`);
            currentList = { type: 'ol', items: [itemText] };
          }
        }
        // Standard Paragraph
        else {
          flushList(`p-${lineIdx}`);
          elements.push(
            <p key={`p-${lineIdx}`} className="text-sm sm:text-[15px] text-[#e3e3e3] leading-relaxed my-1.5">
              {renderInlineFormatting(l)}
            </p>
          );
        }
      });

      flushTable(`final-${index}`);
      flushList(`final-${index}`);

      return (
        <div key={`part-${index}`} className="space-y-1">
          {elements}
        </div>
      );
    });
  };

  return <div className="markdown-content">{renderFormattedContent(content)}</div>;
};

export default MarkdownMessage;
