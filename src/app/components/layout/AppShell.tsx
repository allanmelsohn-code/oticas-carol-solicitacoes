// src/app/components/layout/AppShell.tsx
import type { ReactNode } from 'react';
import type { User } from '../../../types';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  user: User;
  currentView: string;
  pendingCount: number;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({ user, currentView, pendingCount, onNavigate, onLogout, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        currentView={currentView}
        pendingCount={pendingCount}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main
        className="transition-all"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingBottom: 'var(--bottomnav-height)',
        }}
      >
        {/* Remove margin on mobile (sidebar hidden) */}
        <style>{`@media (max-width: 767px) { main { margin-left: 0 !important; } }`}</style>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
      <BottomNav
        user={user}
        currentView={currentView}
        pendingCount={pendingCount}
        onNavigate={onNavigate}
      />
    </div>
  );
}
