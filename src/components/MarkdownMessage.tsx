import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

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
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0e] shadow-lg">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18191a] border-b border-white/[0.08] text-xs text-[#c4c7c5]">
        <div className="flex items-center gap-2 font-mono">
          <Terminal size={14} className="text-[#a8c7fa]" />
          <span>{language || 'code'}</span>
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
  // Parse message into text segments and code blocks
  const renderFormattedText = (rawText: string) => {
    // Split by fenced code blocks: ```[language]\n[code]```
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trimStart().split('\n');
        const firstLine = lines[0].trim();
        const language = firstLine.match(/^[a-zA-Z0-9_-]+$/) ? firstLine : '';
        const code = language ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <CodeBlock 
            key={index} 
            language={language || 'text'} 
            code={code.trimEnd()} 
          />
        );
      }

      // Process normal text blocks (headings, lists, bold, inline code)
      return (
        <div key={index} className="space-y-2.5 leading-relaxed">
          {part.split('\n\n').map((paragraph, pIdx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Parse lines inside this paragraph block
            const lines = trimmed.split('\n');
            const elements: React.ReactNode[] = [];
            let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

            const flushList = (keyPrefix: string) => {
              if (!currentList) return;
              if (currentList.type === 'ul') {
                elements.push(
                  <ul key={`${keyPrefix}-ul`} className="list-disc list-inside space-y-1.5 my-2 pl-1 text-[#e3e3e3]">
                    {currentList.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm leading-relaxed">
                        {renderInlineFormatting(item)}
                      </li>
                    ))}
                  </ul>
                );
              } else {
                elements.push(
                  <ol key={`${keyPrefix}-ol`} className="list-decimal list-inside space-y-1.5 my-2 pl-1 text-[#e3e3e3]">
                    {currentList.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm leading-relaxed">
                        {renderInlineFormatting(item)}
                      </li>
                    ))}
                  </ol>
                );
              }
              currentList = null;
            };

            lines.forEach((line, lineIdx) => {
              const l = line.trim();
              if (!l) return;

              if (l.startsWith('#### ')) {
                flushList(`line-${lineIdx}`);
                elements.push(
                  <h4 key={`h4-${lineIdx}`} className="text-sm sm:text-[15px] font-semibold text-white mt-3 mb-1">
                    {renderInlineFormatting(l.replace(/^####\s+/, ''))}
                  </h4>
                );
              } else if (l.startsWith('### ')) {
                flushList(`line-${lineIdx}`);
                elements.push(
                  <h3 key={`h3-${lineIdx}`} className="text-base sm:text-lg font-semibold text-white mt-3.5 mb-1">
                    {renderInlineFormatting(l.replace(/^###\s+/, ''))}
                  </h3>
                );
              } else if (l.startsWith('## ')) {
                flushList(`line-${lineIdx}`);
                elements.push(
                  <h2 key={`h2-${lineIdx}`} className="text-lg sm:text-xl font-bold text-white mt-4 mb-1.5">
                    {renderInlineFormatting(l.replace(/^##\s+/, ''))}
                  </h2>
                );
              } else if (l.startsWith('# ')) {
                flushList(`line-${lineIdx}`);
                elements.push(
                  <h1 key={`h1-${lineIdx}`} className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2">
                    {renderInlineFormatting(l.replace(/^#\s+/, ''))}
                  </h1>
                );
              } else if (l.startsWith('- ') || l.startsWith('* ')) {
                const itemText = l.replace(/^[-*]\s+/, '');
                if (currentList && currentList.type === 'ul') {
                  currentList.items.push(itemText);
                } else {
                  flushList(`line-${lineIdx}`);
                  currentList = { type: 'ul', items: [itemText] };
                }
              } else if (/^\d+\.\s+/.test(l)) {
                const itemText = l.replace(/^\d+\.\s+/, '');
                if (currentList && currentList.type === 'ol') {
                  currentList.items.push(itemText);
                } else {
                  flushList(`line-${lineIdx}`);
                  currentList = { type: 'ol', items: [itemText] };
                }
              } else {
                flushList(`line-${lineIdx}`);
                elements.push(
                  <p key={`p-${lineIdx}`} className="text-sm sm:text-[15px] text-[#e3e3e3] leading-relaxed">
                    {renderInlineFormatting(l)}
                  </p>
                );
              }
            });

            flushList('final');

            return <div key={pIdx} className="space-y-1.5">{elements}</div>;
          })}
        </div>
      );
    });
  };

  // Helper for bold and inline code
  const renderInlineFormatting = (text: string) => {
    // Split by inline code `...` first
    const codeSegments = text.split(/(`[^`]+`)/g);

    return codeSegments.map((seg, sIdx) => {
      if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
        return (
          <code
            key={sIdx}
            className="px-1.5 py-0.5 rounded bg-white/10 text-[#a8c7fa] font-mono text-[13px] border border-white/5"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }

      // Handle bold **text**
      const boldSegments = seg.split(/(\*\*[^*]+\*\*)/g);
      return boldSegments.map((bSeg, bIdx) => {
        if (bSeg.startsWith('**') && bSeg.endsWith('**') && bSeg.length > 4) {
          return (
            <strong key={`${sIdx}-${bIdx}`} className="font-semibold text-white">
              {bSeg.slice(2, -2)}
            </strong>
          );
        }
        return bSeg;
      });
    });
  };

  return <div className="markdown-content">{renderFormattedText(content)}</div>;
};

export default MarkdownMessage;
