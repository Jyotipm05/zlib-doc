/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Terminal, Hash, Settings, Code, FileCode, CheckSquare, Layers } from 'lucide-react';
import { sidebarStructure } from '../data/zlibDocs';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  isOpen,
  onClose,
}: SidebarProps) {
  const getIcon = (type: 'guide' | 'function' | 'constant' | 'type') => {
    switch (type) {
      case 'guide':
        return <BookOpen className="h-4 w-4" />;
      case 'function':
        return <Terminal className="h-4 w-4" />;
      case 'type':
        return <Layers className="h-4 w-4" />;
      case 'constant':
        return <Hash className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    onClose(); // Close mobile drawer if open
  };

  const content = (
    <div id="sidebar-scroller" className="h-full overflow-y-auto px-4 py-6 scrollbar-thin">
      {/* Sidebar title / quick disclaimer */}
      <div className="mb-6 px-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          zlib reference manual
        </span>
        <h2 className="font-sans text-xs font-bold text-gray-500 dark:text-zinc-400">
          ANSI C Library Specification
        </h2>
      </div>

      <nav className="space-y-6">
        {sidebarStructure.map((group) => (
          <div key={group.id} id={`group-${group.id}`} className="space-y-1">
            <h3 className="px-2 font-sans text-xs font-semibold text-gray-900 dark:text-zinc-100">
              {group.title}
            </h3>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id} id={`nav-item-${item.id}`}>
                    <button
                      id={`btn-${item.id}`}
                      onClick={() => handleItemClick(item.id)}
                      className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50'
                      }`}
                    >
                      <div
                        className={`transition-colors ${
                          isActive
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-zinc-500 dark:group-hover:text-zinc-400'
                        }`}
                      >
                        {getIcon(item.type)}
                      </div>
                      <span className="truncate">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          id="sidebar-overlay-backdrop"
          className="fixed inset-0 z-40 bg-zinc-900/45 backdrop-blur-xs transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Side Drawer Layout */}
      <aside
        id="sidebar-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-200 md:hidden dark:border-zinc-800 dark:bg-zinc-950 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>

      {/* Desktop Sidebar Layout */}
      <aside
        id="sidebar-desktop"
        className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-gray-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950"
      >
        {content}
      </aside>
    </>
  );
}
