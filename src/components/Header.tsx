/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Sun, Moon, ExternalLink, Menu, FileText } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onSearchClick: () => void;
  onSidebarToggle: () => void;
}

export default function Header({
  theme,
  setTheme,
  onSearchClick,
  onSidebarToggle,
}: HeaderProps) {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-sm transition-all duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/80"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Left Side: Brand & Menu */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onSidebarToggle}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none md:hidden dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 font-mono text-sm font-bold text-white shadow-md shadow-teal-500/20 dark:bg-teal-500 dark:shadow-teal-900/30">
              z
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-semibold tracking-tight text-gray-950 dark:text-zinc-50">
                zlib Manual
              </span>
              <span className="font-mono text-[9px] font-medium text-gray-400 dark:text-zinc-500">
                v1.3.1 (Stable)
              </span>
            </div>
          </div>
        </div>

        {/* Middle/Right: Action controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* High-Performance Search Button Trigger */}
          <button
            id="global-search-trigger"
            onClick={onSearchClick}
            className="group flex w-40 items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-left text-xs text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none sm:w-60 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-500 dark:text-zinc-500 dark:group-hover:text-zinc-400" />
              <span className="truncate">Search manual...</span>
            </div>
            <kbd className="hidden rounded bg-gray-200/80 px-1.5 font-mono text-[9px] font-semibold text-gray-500 shadow-sm sm:inline dark:bg-zinc-800 dark:text-zinc-400">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Toggle theme color"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {/* External zlib Portal */}
          <a
            id="official-site-link"
            href="https://www.zlib.net"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:flex dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            <span>Official Site</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
}
