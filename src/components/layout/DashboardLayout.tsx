'use client';

import { useState } from 'react';

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

import { useUiStore } from '@/src/stores/uiStore';

import { CommandPalette } from './CommandPalette';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

/**
 * Main dashboard shell: a collapsible desktop sidebar, a sticky header, and a
 * scrollable content area, with a mobile drawer and command palette.
 *
 * Keyboard shortcuts:
 * - Ctrl/Cmd+B — toggle the desktop sidebar
 * - Ctrl/Cmd+K — open the command palette
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useKeyboardShortcut('b', toggleSidebar);
  useKeyboardShortcut('k', () => setPaletteOpen(true));

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenCommandPalette={() => setPaletteOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
