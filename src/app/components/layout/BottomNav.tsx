// src/app/components/layout/BottomNav.tsx
import React from 'react';
import { LayoutDashboard, ClipboardList, CheckSquare, BarChart2, Settings } from 'lucide-react';
import type { User } from '../../../types';

interface BottomNavProps {
  user: User;
  currentView: string;
  pendingCount: number;
  onNavigate: (view: string) => void;
}

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: Array<'store' | 'approver' | 'viewer'>;
}

const ALL_ITEMS: BottomNavItem[] = [
  { id: 'dashboard',  label: 'Início',    icon: LayoutDashboard, roles: ['store','approver','viewer'] },
  { id: 'requests',   label: 'Pedidos',   icon: ClipboardList,   roles: ['store','approver','viewer'] },
  { id: 'approvals',  label: 'Aprovar',   icon: CheckSquare,     roles: ['approver'] },
  { id: 'report',     label: 'Relatório', icon: BarChart2,       roles: ['approver','viewer'] },
  { id: 'user-admin', label: 'Admin',     icon: Settings,        roles: ['approver'] },
];

export function BottomNav({ user, currentView, pendingCount, onNavigate }: BottomNavProps) {
  const items = ALL_ITEMS.filter(i => i.roles.includes(user.role));

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex"
      style={{
        borderColor: 'var(--color-border)',
        height: 'var(--bottomnav-height)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const showBadge = item.id === 'requests' && pendingCount > 0;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            style={{ minHeight: 44 }}
          >
            <Icon size={18} style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)' }} />
            {showBadge && (
              <span className="absolute top-1.5 right-[calc(50%-14px)] w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
            <span
              className="text-[8px] font-medium"
              style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
