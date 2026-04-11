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
      <main className="transition-all md:pl-[210px] pb-14 md:pb-0">
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
