/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import SearchDialog from './components/SearchDialog';
import { getDocItemById } from './data/zlibDocs';
import { BookOpen, Star, HelpCircle, Laptop, ArrowUp } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Detect system or browser cache preferences safely
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zlib-manual-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [activeSection, setActiveSection] = useState<string>('intro');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync theme string state to DOM documentElement class lists
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('zlib-manual-theme', theme);
  }, [theme]);

  // Read scroll metrics to show Back-To-Top trigger
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeItem = getDocItemById(activeSection) || getDocItemById('intro')!;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compile automatic sub-headings for the contextual "On This Page" index table
  const getTableOfContents = () => {
    const toc = [];
    if (activeItem.signature) {
      toc.push({ id: 'c-signature-card', title: 'C Signature' });
    }
    if (activeItem.description) {
      toc.push({ id: 'article-content', title: 'Description' });
    }
    if (activeItem.parameters && activeItem.parameters.length > 0) {
      toc.push({ id: 'parameters-section', title: 'Parameters' });
    }
    if (activeItem.returns) {
      toc.push({ id: 'returns-section', title: 'Return Value' });
    }
    if (activeItem.equivalents && activeItem.equivalents.length > 0) {
      toc.push({ id: 'node-equivalent-section', title: 'Node.js Equivalent' });
    }
    if (activeItem.relatedIds && activeItem.relatedIds.length > 0) {
      toc.push({ id: 'related-refs-section', title: 'Related Items' });
    }

    // Fallbacks for guides showing key sections
    if (toc.length === 0) {
      toc.push({ id: 'article-title', title: 'Top' });
      if (activeItem.id === 'intro') {
        toc.push({ id: 'what-is-zlib-', title: 'What is zlib?' });
        toc.push({ id: 'the-deflate-algorithm', title: 'Algorithms' });
        toc.push({ id: 'library-architecture', title: 'Architecture' });
      } else if (activeItem.id === 'install') {
        toc.push({ id: 'installing-zlib', title: 'Header Setup' });
        toc.push({ id: 'compiling-your-code', title: 'Linking & CMake' });
      } else if (activeItem.id === 'quickstart-node') {
        toc.push({ id: '1-one-shot-compression-buffer-api-', title: 'Buffer API' });
        toc.push({ id: '2-streaming-files-memory-safe-api-', title: 'File Streaming' });
        toc.push({ id: '3-adding-gzip-to-custom-express-server', title: 'Express Integration' });
      } else if (activeItem.id === 'formats') {
        toc.push({ id: 'formats-compared', title: 'Specs Table' });
        toc.push({ id: '1-raw-deflate', title: 'Raw Payload' });
        toc.push({ id: '2-zlib-format', title: 'zlib Wrapping' });
        toc.push({ id: '3-gzip-format', title: 'gzip Wrapping' });
      }
    }
    return toc;
  };

  const tocItems = getTableOfContents();

  return (
    <div
      id="app-theme-container"
      className={`min-h-screen bg-gray-50/50 text-gray-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Top Header Glassmorphic bar */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onSearchClick={() => setSearchOpen(true)}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Global Hero Landing Banner inside Getting Started home view */}
      {activeSection === 'intro' && (
        <div id="home-immersive-hero" className="border-b border-gray-200/60 bg-white/40 dark:border-zinc-800/60 dark:bg-zinc-950/25">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:py-16">
            <div className="md:flex md:items-center md:justify-between md:gap-8">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100/40 dark:border-teal-900/10">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>C Manual Reference Portal</span>
                </div>
                <h1 className="font-sans text-3xl font-extrabold tracking-tight text-gray-950 dark:text-zinc-50 sm:text-4xl">
                  Modern documentation for <span className="text-teal-600 dark:text-teal-400">zlib</span>
                </h1>
                <p className="font-sans text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  A polished, clean index of variables, compression structures, Adler streams, and quick reference recipes. Made to inspire developers optimizing storage limits.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    id="hero-quick-start-btn"
                    onClick={() => setActiveSection('quickstart-cpp')}
                    className="rounded-lg bg-teal-600 px-4 py-2 font-sans text-xs font-bold text-white shadow-md shadow-teal-500/10 hover:bg-teal-700 transition-all dark:bg-teal-500 dark:hover:bg-teal-600"
                  >
                    C++ Quick Start
                  </button>
                  <button
                    id="hero-playground-btn"
                    onClick={() => setActiveSection('playground')}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-sans text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    Interactive Sandbox
                  </button>
                </div>
              </div>

              {/* Minimal Stats Cards Panel */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-0 md:w-80 shrink-0">
                <div className="rounded-xl border border-gray-250/50 bg-white p-4 shadow-xs dark:border-zinc-850 dark:bg-zinc-905 dark:bg-zinc-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    DEFLATE
                  </div>
                  <div className="mt-1 font-sans text-lg font-extrabold text-gray-900 dark:text-zinc-100 leading-tight">
                    RFC 1951
                  </div>
                  <p className="font-sans text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                    Sliding lookahead LZ77 combined with Huffman entropy indices.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-250/50 bg-white p-4 shadow-xs dark:border-zinc-850 dark:bg-zinc-905 dark:bg-zinc-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    GZIP CONTAINER
                  </div>
                  <div className="mt-1 font-sans text-lg font-extrabold text-gray-900 dark:text-zinc-100 leading-tight">
                    RFC 1952
                  </div>
                  <p className="font-sans text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                    Multi-byte metadata with CRC-32 checksum data safety layers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div id="main-layout-boundaries" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-start gap-0 md:gap-8">
          {/* Sidebar Menu Panel */}
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Center Main Documentation view */}
          <main id="main-content-scroll" className="flex-1 overflow-x-hidden min-h-[calc(100vh-3.5rem)]">
            <ContentArea
              activeItem={activeItem}
              setActiveSection={setActiveSection}
            />
          </main>

          {/* Contextual Table Of Contents Panel (Sticky Right Sidebar) */}
          <aside
            id="toc-stickypanel"
            className="sticky top-20 hidden h-[calc(100vh-10rem)] w-48 shrink-0 overflow-y-auto px-1 py-6 xl:block border-l border-gray-100 dark:border-zinc-900"
          >
            <div className="space-y-4 pl-4">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                On This Page
              </span>
              <ul className="space-y-2">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      id={`toc-lnk-${item.id}`}
                      href={`#${item.id}`}
                      className="group block font-sans text-[11px] font-medium text-gray-500 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog Search Modal popup Overlay */}
      <SearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectItem={(id) => setActiveSection(id)}
      />

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          id="scroll-to-top"
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-700 focus:outline-none transition-all dark:bg-teal-500 dark:hover:bg-teal-600"
          aria-label="Scroll back to top of documentation"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
