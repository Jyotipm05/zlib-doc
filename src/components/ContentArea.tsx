/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode } from 'react';
import { Copy, Check, CornerDownRight, HelpCircle, Layers, Link2, Terminal, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { DocItem } from '../types';
import Playground from './Playground';

// Custom syntax highlighting for high-assurance C++, C, bash, and JS/TS
function highlightCode(code: string, lang: string): ReactNode {
  const language = lang.toLowerCase().trim();
  if (language === 'cpp' || language === 'c' || language === 'c++') {
    const regex = /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(#include\s+<[^>]+>|#include\s+"[^"]+"|#\w+)|\b(class|public|private|protected|virtual|explicit|delete|noexcept|operator|this|return|throw|try|catch|const|constexpr|extern|inline|using|struct|union|typedef|typename|template|new|reinterpret_cast|static_cast|const_cast|dynamic_cast|void|bool|sizeof|nullptr|while|do|if|else|for|case|switch|break|continue|default|namespace|override)\b|\b(z_stream|z_streamp|Bytef|Byte|voidpf|voidpc|gzFile|gz_header|gz_headerp|uLong|uLongf|uInt|size_t|uint8_t|uint32_t|int|char|float|double|std::string|std::vector|std::string_view|std::span|std::byte|std::unique_ptr|std::remove_pointer_t|std::filesystem::path|std::expected|ZlibStatus)\b|\b(deflateInit|deflate|deflateEnd|inflateInit|inflate|inflateEnd|deflateInit2|inflateInit2|deflateSetHeader|compress|uncompress|compressBound|gzopen|gzread|gzwrite|gzclose|adler32|crc32|malloc|free|main|printf|memset|memcpy|strlen|strcmp)\b|\b(0x[0-9a-fA-F]+|\d+L?|\d+(?:\.\d+)?)\b|\b(\w+)\s*(?=\()/g;

    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const textBefore = code.slice(lastIndex, match.index);
      if (textBefore) {
        parts.push(textBefore);
      }

      const matchedText = match[0];
      // Find which group matched (index 1 to 8)
      let matchType = 0;
      for (let g = 1; g <= 8; g++) {
        if (match[g] !== undefined) {
          matchType = g;
          break;
        }
      }

      switch (matchType) {
        case 1:
          // Comment
          parts.push(<span key={match.index} className="text-zinc-500 font-normal italic">{matchedText}</span>);
          break;
        case 2:
          // String
          parts.push(<span key={match.index} className="text-emerald-400 font-normal">{matchedText}</span>);
          break;
        case 3:
          // Preprocessor
          if (matchedText.startsWith('#include')) {
            const headerMatch = matchedText.match(/(#include\s+)(<[^>]+>|"[^"]+")/);
            if (headerMatch) {
              parts.push(
                <span key={match.index}>
                  <span className="text-amber-500 font-bold">{headerMatch[1]}</span>
                  <span className="text-emerald-400 font-semibold">{headerMatch[2]}</span>
                </span>
              );
            } else {
              parts.push(<span key={match.index} className="text-amber-500 font-bold">{matchedText}</span>);
            }
          } else {
            parts.push(<span key={match.index} className="text-amber-500 font-bold">{matchedText}</span>);
          }
          break;
        case 4:
          // Keyword
          parts.push(<span key={match.index} className="text-rose-400 font-semibold">{matchedText}</span>);
          break;
        case 5:
          // Type
          parts.push(<span key={match.index} className="text-sky-400 font-semibold">{matchedText}</span>);
          break;
        case 6:
          // Function (specific builtins)
          parts.push(<span key={match.index} className="text-yellow-300 font-normal">{matchedText}</span>);
          break;
        case 7:
          // Number
          parts.push(<span key={match.index} className="text-purple-400 font-normal">{matchedText}</span>);
          break;
        case 8:
          // General function call
          parts.push(<span key={match.index} className="text-yellow-300 font-normal">{matchedText}</span>);
          break;
        default:
          parts.push(matchedText);
          break;
      }

      lastIndex = regex.lastIndex;
    }

    const textAfter = code.slice(lastIndex);
    if (textAfter) {
      parts.push(textAfter);
    }

    return <>{parts}</>;
  }

  if (language === 'bash' || language === 'sh' || language === 'shell') {
    const regex = /(\s|^)(gcc|g\+\+|npx|npm|git|mkdir|cd|rm|cp|ls|cat|echo)\b|([#].*)|('[-a-zA-Z0-9_\/.]+'|"[-a-zA-Z0-9_\/.]+")/g;
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const textBefore = code.slice(lastIndex, match.index);
      if (textBefore) {
        parts.push(textBefore);
      }

      const matchedText = match[0];
      if (match[2]) {
        // Command name
        const space = match[1] || '';
        parts.push(space);
        parts.push(<span key={match.index} className="text-sky-400 font-semibold">{match[2]}</span>);
      } else if (match[3]) {
        // Comment
        parts.push(<span key={match.index} className="text-zinc-500 italic">{matchedText}</span>);
      } else if (match[4]) {
        // String argument
        parts.push(<span key={match.index} className="text-emerald-400 font-normal">{matchedText}</span>);
      } else {
        parts.push(matchedText);
      }

      lastIndex = regex.lastIndex;
    }

    const textAfter = code.slice(lastIndex);
    if (textAfter) {
      parts.push(textAfter);
    }

    return <>{parts}</>;
  }

  if (language === 'js' || language === 'javascript' || language === 'ts' || language === 'typescript') {
    const regex = /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?:\b(const|let|var|function|return|import|from|export|default|class|extends|new|if|else|for|while|try|catch|throw|async|await|typeof|instanceof|as)\b)|(?:\b(require|module|exports|process|console|window|document)\b)|(?:\b(true|false|null|undefined)\b)/g;
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const textBefore = code.slice(lastIndex, match.index);
      if (textBefore) {
        parts.push(textBefore);
      }

      const matchedText = match[0];
      if (match[1]) {
        // Comment
        parts.push(<span key={match.index} className="text-zinc-500 italic">{matchedText}</span>);
      } else if (match[2]) {
        // String
        parts.push(<span key={match.index} className="text-emerald-400 font-normal">{matchedText}</span>);
      } else if (match[3]) {
        // Keywords
        parts.push(<span key={match.index} className="text-rose-400 font-semibold">{matchedText}</span>);
      } else if (match[4]) {
        // Builtins
        parts.push(<span key={match.index} className="text-amber-400 font-normal">{matchedText}</span>);
      } else if (match[5]) {
        // Literals
        parts.push(<span key={match.index} className="text-purple-400 font-normal">{matchedText}</span>);
      } else {
        parts.push(matchedText);
      }

      lastIndex = regex.lastIndex;
    }

    const textAfter = code.slice(lastIndex);
    if (textAfter) {
      parts.push(textAfter);
    }

    return <>{parts}</>;
  }

  return <span>{code}</span>;
}

interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

const formatFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Which of the three formats has the best compression ratio?',
    answer: 'All three formats utilize the exact same underlying DEFLATE algorithm. Under identical compression level parameters, their compression performance and ratios are mathematically identical. The only minor difference lies in header/footer metadata overhead: Raw DEFLATE has absolutely 0 bytes of overhead, the zlib wrapper adds 2 to 6 bytes, and the gzip envelope adds 18+ bytes of metadata.'
  },
  {
    id: 'faq-2',
    question: 'Why does zlib use Adler-32 while gzip relies on CRC-32 checksums?',
    answer: 'Adler-32 is mathematically simpler and much faster to compute in software compared to standard CRC-32, making zlib ideal for rapid memory-to-memory operations (like in OpenSSL or Git). Gzip was designed for files stored over unreliable network nodes or storage blocks where data corruption can occur, so retrieve systems use CRC-32 to provide stronger error detection against complex multi-bit corruptions.'
  },
  {
    id: 'faq-3',
    question: 'Can I decompress a Gzip stream using standard zlib inflate()?',
    answer: 'Yes! However, you must tell the decompressor to expect a gzip header by initializing it via inflateInit2() with a modified windowBits parameter. Specifying standard 15 is for zlib format streams; specifying 15 + 16 (or 31) instructs zlib to dynamically detect and decode both gzip and zlib wrapper formats.'
  },
  {
    id: 'faq-4',
    question: 'How do I initialize deflate to build raw DEFLATE streams without headers?',
    answer: 'In C or C++, when calling deflateInit2(), pass a negative windowBits value between -8 and -15 (typically -15). This forces the zlib library to bypass the generation of the RFC 1950 header and footer records entirely, outputting raw DEFLATE chunks compatible with formats like PNG and ZIP files.'
  },
  {
    id: 'faq-5',
    question: 'Is there a difference in memory usage between these three formats?',
    answer: 'No. Memory allocation during compression/decompression is dictated entirely by your chosen sliding window size (e.g., windowBits log parameters) and internal hash chain allocations, not by the chosen wrapper container container format.'
  }
];

interface ContentAreaProps {
  activeItem: DocItem;
  setActiveSection: (id: string) => void;
}

export default function ContentArea({
  activeItem,
  setActiveSection,
}: ContentAreaProps) {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [expandedFAQs, setExpandedFAQs] = useState<Record<string, boolean>>({});

  const toggleFAQ = (id: string) => {
    setExpandedFAQs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Safe custom Markdown-like rich renderer with line-level block grouping
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    interface MarkdownSegment {
      type: 'paragraph' | 'ul' | 'ol' | 'heading3' | 'heading4' | 'code' | 'hr' | 'table';
      lines: string[];
      language?: string;
    }

    const rawLines = text.split('\n');
    const segments: MarkdownSegment[] = [];
    let currentSegment: MarkdownSegment | null = null;
    let inCodeBlock = false;
    let codeLanguage = 'code';

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i];
      const trimmed = rawLine.trim();

      // 1. Code block handling
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          currentSegment = null;
        } else {
          inCodeBlock = true;
          codeLanguage = trimmed.replace('```', '').trim() || 'code';
          currentSegment = {
            type: 'code',
            lines: [],
            language: codeLanguage,
          };
          segments.push(currentSegment);
        }
        continue;
      }

      if (inCodeBlock) {
        currentSegment?.lines.push(rawLine);
        continue;
      }

      // 2. Empty line resets grouping
      if (trimmed === '') {
        currentSegment = null;
        continue;
      }

      // 3. Heading 3
      if (trimmed.startsWith('### ')) {
        currentSegment = {
          type: 'heading3',
          lines: [trimmed.replace('### ', '')],
        };
        segments.push(currentSegment);
        currentSegment = null;
        continue;
      }

      // 4. Heading 4
      if (trimmed.startsWith('#### ')) {
        currentSegment = {
          type: 'heading4',
          lines: [trimmed.replace('#### ', '')],
        };
        segments.push(currentSegment);
        currentSegment = null;
        continue;
      }

      // 5. Horizontal Rules
      if (trimmed === '---' || trimmed === '***' || /^-{3,}$/.test(trimmed)) {
        currentSegment = {
          type: 'hr',
          lines: [],
        };
        segments.push(currentSegment);
        currentSegment = null;
        continue;
      }

      // 6. Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentSegment && currentSegment.type === 'ul') {
          currentSegment.lines.push(trimmed);
        } else {
          currentSegment = {
            type: 'ul',
            lines: [trimmed],
          };
          segments.push(currentSegment);
        }
        continue;
      }

      // 7. Numbered lists (ordered lists)
      const startMatch = trimmed.match(/^(\d+)\.\s+/);
      if (startMatch) {
        if (currentSegment && currentSegment.type === 'ol') {
          currentSegment.lines.push(trimmed);
        } else {
          currentSegment = {
            type: 'ol',
            lines: [trimmed],
          };
          segments.push(currentSegment);
        }
        continue;
      }

      // 8. Markdown tables
      if (trimmed.startsWith('|')) {
        if (currentSegment && currentSegment.type === 'table') {
          currentSegment.lines.push(trimmed);
        } else {
          currentSegment = {
            type: 'table',
            lines: [trimmed],
          };
          segments.push(currentSegment);
        }
        continue;
      }

      // 9. Standard paragraphs
      if (currentSegment && currentSegment.type === 'paragraph') {
        currentSegment.lines.push(trimmed);
      } else {
        currentSegment = {
          type: 'paragraph',
          lines: [trimmed],
        };
        segments.push(currentSegment);
      }
    }

    return segments.map((seg, idx) => {
      switch (seg.type) {
        case 'code': {
          const codeContent = seg.lines.join('\n');
          const codeKey = `block-${idx}`;
          const language = seg.language || 'code';

          return (
            <div key={idx} className="relative my-5 overflow-hidden rounded-xl border border-gray-200 bg-zinc-950 text-zinc-100 dark:border-zinc-850">
              {/* Window header banner */}
              <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 font-mono text-[10px] text-zinc-400">
                <span className="uppercase font-semibold tracking-wider">{language} snippet</span>
                <button
                  id={`copy-code-${idx}`}
                  onClick={() => handleCopy(codeContent, codeKey)}
                  className="flex items-center gap-1.5 hover:text-zinc-50"
                >
                  {copied[codeKey] ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100 scrollbar-thin">
                <code>{highlightCode(codeContent, language)}</code>
              </pre>
            </div>
          );
        }

        case 'heading3': {
          const textVal = seg.lines[0];
          const headingId = textVal.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h3 key={idx} id={headingId} className="group relative mt-6 mb-3 font-sans text-base font-bold text-gray-900 dark:text-zinc-50">
              {parseInlineStyles(textVal)}
            </h3>
          );
        }

        case 'heading4': {
          const textVal = seg.lines[0];
          return (
            <h4 key={idx} className="mt-5 mb-2 font-sans text-sm font-bold text-gray-800 dark:text-zinc-100">
              {parseInlineStyles(textVal)}
            </h4>
          );
        }

        case 'hr': {
          return <hr key={idx} className="my-6 border-gray-200 dark:border-zinc-800" />;
        }

        case 'ul': {
          return (
            <ul key={idx} className="my-3 space-y-1.5 pl-5 list-disc text-gray-750 dark:text-zinc-300">
              {seg.lines.map((it, i) => {
                const cleanItem = it.replace(/^[-*]\s+/, '');
                return (
                  <li key={i} className="font-sans text-xs leading-relaxed">
                    {parseInlineStyles(cleanItem)}
                  </li>
                );
              })}
            </ul>
          );
        }

        case 'ol': {
          const firstLine = seg.lines[0];
          const startMatch = firstLine.match(/^(\d+)\.\s+/);
          const startNum = startMatch ? parseInt(startMatch[1], 10) : 1;
          return (
            <ol key={idx} start={startNum} className="my-3 space-y-1.5 pl-5 list-decimal text-gray-750 dark:text-zinc-300 font-sans text-xs leading-relaxed">
              {seg.lines.map((it, i) => {
                const cleanItem = it.replace(/^\d+\.\s+/, '');
                return (
                  <li key={i} className="leading-relaxed">
                    {parseInlineStyles(cleanItem)}
                  </li>
                );
              })}
            </ol>
          );
        }

        case 'table': {
          const rows = seg.lines.map(line =>
            line.split('|')
              .map(cell => cell.trim())
              .filter((_, colIdx, arr) => colIdx > 0 && colIdx < arr.length - 1)
          );

          if (rows.length < 2) return null;
          const headerRow = rows[0];
          const bodyRows = rows.slice(2);

          return (
            <div key={idx} className="my-4 overflow-x-auto rounded-xl border border-gray-100 bg-white/50 dark:border-zinc-800/60 dark:bg-zinc-950/20">
              <table className="w-full border-collapse font-sans text-[11px] text-gray-600 dark:text-zinc-400">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
                    {headerRow.map((cell, colIdx) => (
                      <th key={colIdx} className="px-4 py-2.5 text-left">{parseInlineStyles(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50 dark:divide-zinc-850">
                  {bodyRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20">
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="px-4 py-2.5">{parseInlineStyles(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        case 'paragraph': {
          const flowText = seg.lines.join(' ');
          return (
            <p key={idx} className="font-sans text-xs leading-relaxed text-gray-600 dark:text-zinc-400 my-3">
              {parseInlineStyles(flowText)}
            </p>
          );
        }

        default:
          return null;
      }
    });
  };

  // Helper replacing dynamic inline tags matching `code` and **bold**
  const parseInlineStyles = (line: string) => {
    // Regex splits to extract inline arrays
    const parts = line.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-gray-900 dark:text-zinc-50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] text-teal-600 dark:bg-zinc-900 dark:text-teal-400">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](')) {
        // Simple hyperlink mapper
        const label = part.substring(1, part.indexOf(']'));
        const href = part.substring(part.indexOf('](') + 2, part.length - 1);
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5"
          >
            {label}
          </a>
        );
      }
      return part;
    });
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'Getting Started':
        return 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40';
      case 'Basic Stream API':
        return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-450 dark:border-sky-900/40';
      case 'Advanced Stream API':
        return 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/40';
      case 'Utility Functions':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/40';
      case 'Gzip File I/O':
        return 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/40';
      case 'Checksum Functions':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-800';
    }
  };

  return (
    <article id="doc-main-article" className="max-w-3xl px-4 py-8 md:px-8">
      {/* breadcrumb navigation */}
      <div id="article-breadcrumb" className="mb-4 flex items-center gap-1.5 font-sans text-[10px] font-medium text-gray-400 dark:text-zinc-500">
        <span>zlib docs</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-zinc-400">{activeItem.category}</span>
        <span>/</span>
        <span className="text-teal-600 dark:text-teal-400">{activeItem.name}</span>
      </div>

      {/* Main Title heading */}
      <h1 id="article-title" className="font-sans text-2xl font-bold tracking-tight text-gray-950 dark:text-zinc-50 md:text-3xl">
        {activeItem.name}
      </h1>

      {/* category and item type badges */}
      <div id="article-badges" className="mt-3 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-5 dark:border-zinc-850">
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getBadgeStyle(activeItem.category)}`}>
          {activeItem.category}
        </span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-gray-500 dark:bg-zinc-850 dark:text-zinc-400 col-span-1">
          {activeItem.type}
        </span>
      </div>

      {/* Playground mount point override */}
      {activeItem.id === 'playground' ? (
        <div id="playground-embedded-view" className="mt-6">
          <Playground />
        </div>
      ) : (
        <div id="article-content" className="mt-6 prose prose-slate prose-xs dark:prose-invert">
          {/* If there is signature code block, show elegant card */}
          {activeItem.signature && (
            <div id="c-signature-card" className="relative my-5 overflow-hidden rounded-xl border border-gray-200 bg-neutral-900 shadow-md dark:border-zinc-800">
              <div className="flex items-center justify-between bg-neutral-950 px-4 py-2 font-mono text-[9px] text-gray-400">
                <div className="flex items-center gap-1">
                  <Terminal className="h-3 w-3 text-teal-400" />
                  <span>C/C++ SPECIFICATION</span>
                </div>
                <button
                  id="copy-signature"
                  onClick={() => handleCopy(activeItem.signature!, 'sig')}
                  className="flex items-center gap-1 hover:text-gray-100"
                >
                  {copied['sig'] ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100 scrollbar-thin">
                <code>{highlightCode(activeItem.signature, 'cpp')}</code>
              </pre>
            </div>
          )}

          {/* Render description text using customized Markdown compiler */}
          {renderMarkdown(activeItem.description)}

          {/* Interactive Collapsible FAQ questions in Gzip vs Deflate vs Zlib page */}
          {activeItem.id === 'formats' && (
            <div id="format-faq-section" className="mt-12 border-t border-gray-200 pt-8 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 mb-2">
                <HelpCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-sans text-sm font-bold text-gray-950 dark:text-zinc-50">
                  Gzip, Deflate & Zlib Deep Dive FAQ
                </h3>
              </div>
              <p className="font-sans text-xs text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
                Unlock common developer questions, header overhead counts, dynamic mode checks, and performance characteristics in high-assurance C++ environments. Click a question below to expand the details.
              </p>

              <div id="faq-accordion-container" className="space-y-3">
                {formatFAQs.map((faq) => {
                  const isOpen = !!expandedFAQs[faq.id];
                  return (
                    <div
                      key={faq.id}
                      id={`faq-card-${faq.id}`}
                      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                        isOpen
                          ? 'border-teal-500 bg-teal-50/10 dark:border-teal-500/20 dark:bg-teal-950/10 shadow-xs'
                          : 'border-gray-150 bg-white/40 hover:border-gray-300 dark:border-zinc-800/80 dark:bg-zinc-950/20 dark:hover:border-zinc-700'
                      }`}
                    >
                      <button
                        id={`faq-trigger-${faq.id}`}
                        onClick={() => toggleFAQ(faq.id)}
                        className="flex w-full items-center justify-between p-4 text-left font-sans text-xs font-semibold text-gray-900 transition-colors hover:text-teal-600 dark:text-zinc-100 dark:hover:text-teal-400"
                      >
                        <span className="pr-4">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 shrink-0 text-teal-500 transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200" />
                        )}
                      </button>

                      <div
                        id={`faq-content-wrapper-${faq.id}`}
                        className={`transition-all duration-200 overflow-hidden ${
                          isOpen ? 'max-h-[500px] border-t border-gray-150/60 p-4 dark:border-zinc-850' : 'max-h-0'
                        }`}
                      >
                        <p className="font-sans text-xs leading-relaxed text-gray-600 dark:text-zinc-300">
                          {parseInlineStyles(faq.answer)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parameters Table Grid rendering */}
          {activeItem.parameters && activeItem.parameters.length > 0 && (
            <div id="parameters-section" className="mt-8 border-t border-gray-100 pt-6 dark:border-zinc-850">
              <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-zinc-50 mb-3">
                Parameters
              </h3>
              <div className="space-y-3">
                {activeItem.parameters.map((param, i) => (
                  <div
                    key={i}
                    id={`param-row-${param.name}`}
                    className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/30 p-3.5 dark:border-zinc-850 dark:bg-zinc-950/20"
                  >
                    <div className="flex items-baseline gap-2 shrink-0 md:w-44">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                        {param.name}
                      </span>
                      <span className="font-mono text-[9px] text-gray-400 dark:text-zinc-550 truncate">
                        {param.type}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-gray-600 dark:text-zinc-400 flex-1 leading-normal">
                      {param.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return Values block */}
          {activeItem.returns && (
            <div id="returns-section" className="mt-8 border-t border-gray-100 pt-6 dark:border-zinc-850">
              <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-zinc-50 mb-2">
                Return Value
              </h3>
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/25 p-4 dark:border-zinc-800 dark:bg-zinc-950/10">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded bg-teal-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-850 dark:bg-teal-950/30 dark:text-teal-400">
                    {activeItem.returns.type}
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-gray-600 dark:text-zinc-400">
                    {activeItem.returns.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Node.js Equivalents code tab */}
          {activeItem.equivalents && activeItem.equivalents.length > 0 && (
            <div id="node-equivalent-section" className="mt-8 border-t border-gray-100 pt-6 dark:border-zinc-850">
              <div className="flex items-center gap-1.5 mb-3">
                <CornerDownRight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-zinc-50">
                  Node.js NPM Equivalent
                </h3>
              </div>
              {activeItem.equivalents.map((equiv, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-gray-200 bg-zinc-950 text-zinc-100 dark:border-zinc-850">
                  <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 font-mono text-[9px] text-zinc-400">
                    <span>{equiv.language} implementation</span>
                    <button
                      id={`copy-equivalent-${i}`}
                      onClick={() => handleCopy(equiv.code, `equiv-${i}`)}
                      className="hover:text-zinc-50 flex items-center gap-1.5"
                    >
                      {copied[`equiv-${i}`] ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100 scrollbar-thin">
                    <code>{highlightCode(equiv.code, equiv.language)}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Related Items references listings */}
          {activeItem.relatedIds && activeItem.relatedIds.length > 0 && (
            <div id="related-refs-section" className="mt-10 border-t border-gray-200 pt-6 dark:border-zinc-850">
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3">
                Related API Specifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeItem.relatedIds.map((rid) => (
                  <button
                    key={rid}
                    id={`link-related-${rid}`}
                    onClick={() => setActiveSection(rid)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 shadow-xs transition-colors hover:border-teal-500 hover:text-teal-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-teal-400 dark:hover:text-teal-400"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    <span>{rid}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
