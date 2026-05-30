/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Search, CornerDownLeft, Eye, BookOpen, Terminal, Layers, Hash, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { searchDocs } from '../data/zlibDocs';
import { DocItem } from '../types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (id: string) => void;
}

const POPULAR_SEARCHES = [
  { id: 'intro', name: 'Introduction to zlib', type: 'guide' },
  { id: 'z_stream', name: 'z_stream', type: 'type' },
  { id: 'deflateInit', name: 'deflateInit', type: 'function' },
  { id: 'inflateInit2', name: 'inflateInit2', type: 'function' },
  { id: 'gzopen', name: 'gzopen', type: 'function' },
  { id: 'compress', name: 'compress', type: 'function' },
];

export default function SearchDialog({
  isOpen,
  onClose,
  onSelectItem,
}: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Bind Keyboard Shortcut Ctrl+K & /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k') || e.key === '/') {
        if (e.key === '/' && (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA')) {
          return;
        }
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger click or manual state control
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle auto focus
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Execute Dynamic Score-ranking Search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const filtered = searchDocs(query);
    setResults(filtered.slice(0, 8)); // Max 8 results for premium visibility
    setSelectedIndex(0);
  }, [query]);

  // Handle standard lists arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    const maxItems = query ? results.length : POPULAR_SEARCHES.length;
    if (maxItems === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) >= maxItems ? 0 : prev + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1) < 0 ? maxItems - 1 : prev - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query && results[selectedIndex]) {
        handleSelect(results[selectedIndex].id);
      } else if (!query && POPULAR_SEARCHES[selectedIndex]) {
        handleSelect(POPULAR_SEARCHES[selectedIndex].id);
      }
    }
  };

  const handleSelect = (id: string) => {
    onSelectItem(id);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'function':
        return <Terminal className="h-4 w-4 text-teal-500" />;
      case 'type':
        return <Layers className="h-4 w-4 text-violet-500" />;
      case 'constant':
        return <Hash className="h-4 w-4 text-amber-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper to highlight simple matched texts safely
  const highlightMatch = (text: string, search: string) => {
    if (!search || !text) return <>{text}</>;
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return <>{text}</>;
    
    const prefix = text.substring(0, index);
    const match = text.substring(index, index + search.length);
    const suffix = text.substring(index + search.length);

    return (
      <>
        {prefix}
        <mark className="rounded bg-teal-100 p-0.5 font-semibold text-teal-950 dark:bg-teal-950/80 dark:text-teal-300">
          {match}
        </mark>
        {suffix}
      </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="search-dialog-portal" className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            id="search-overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:p-20">
            <motion.div
              id="search-dialog-modal"
              initial={{ scale: 0.97, opacity: 0, y: -8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
              onKeyDown={handleKeyDown}
            >
              {/* Input Area */}
              <div className="flex items-center border-b border-gray-100 px-4 dark:border-zinc-800">
                <Search className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                <input
                  id="search-dialog-input"
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Type a function name, type, constant, or topic..."
                  className="h-12 w-full border-0 bg-transparent px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <button
                  id="search-dialog-close"
                  onClick={onClose}
                  className="rounded bg-gray-50 p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Suggestions / Results Area */}
              <div id="search-results-viewport" ref={listRef} className="max-h-96 overflow-y-auto p-2 scrollbar-thin">
                {query ? (
                  results.length > 0 ? (
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        Search Results
                      </div>
                      {results.map((item, idx) => {
                        const isSelected = selectedIndex === idx;
                        return (
                          <button
                            key={item.id}
                            id={`search-item-${item.id}`}
                            onClick={() => handleSelect(item.id)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                              isSelected
                                ? 'bg-teal-500/10 text-teal-900 dark:bg-teal-500/20 dark:text-teal-200'
                                : 'hover:bg-gray-50 text-gray-700 dark:hover:bg-zinc-800/40 dark:text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 w-4/5">
                              <div className="shrink-0">{getIcon(item.type)}</div>
                              <div className="truncate">
                                <div className="text-xs font-semibold font-mono leading-none">
                                  {highlightMatch(item.name, query)}
                                </div>
                                <span className="text-[11px] text-gray-400 leading-normal">
                                  {item.summary}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400">
                                <span className="font-mono">Open</span>
                                <CornerDownLeft className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-gray-500 dark:text-zinc-400">
                      No results found for "<span className="font-semibold">{query}</span>"
                    </div>
                  )
                ) : (
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                      Popular Direct Access
                    </div>
                    {POPULAR_SEARCHES.map((item, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={item.id}
                          id={`popular-item-${item.id}`}
                          onClick={() => handleSelect(item.id)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-teal-500/10 text-teal-900 dark:bg-teal-500/20 dark:text-teal-200'
                              : 'hover:bg-gray-50 text-gray-700 dark:hover:bg-zinc-800/40 dark:text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div>{getIcon(item.type)}</div>
                            <span className="font-sans text-xs font-medium">
                              {item.name}
                            </span>
                          </div>
                          {isSelected && (
                            <CornerDownLeft className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Panel */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 h-10 text-[10px] text-gray-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-500">
                <div className="flex gap-4">
                  <span>
                    <kbd className="font-sans font-bold">↑↓</kbd> to navigate
                  </span>
                  <span>
                    <kbd className="font-sans font-bold">Enter</kbd> to select
                  </span>
                </div>
                <span>
                  <kbd className="font-sans font-bold">ESC</kbd> to close
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
