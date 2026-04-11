// src/app/components/layout/Sidebar.tsx
import { LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../../../types';
import { NAV_ITEMS, type AppView } from './navItems';

const ROLE_LABELS: Record<string, string> = {
  store: 'Loja',
  approver: 'Aprovador',
  viewer: 'Visualizador',
};

interface SidebarProps {
  user: User;
  currentView: AppView;
  pendingCount: number;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export function Sidebar({ user, currentView, pendingCount, onNavigate, onLogout }: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside
      className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40"
      style={{ width: 'var(--sidebar-width)', background: 'var(--color-sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gray-900 text-xs font-bold">ÓC</span>
        </div>
        <div>
          <div className="text-white text-xs font-bold leading-tight">Óticas Carol</div>
          <div className="text-xs leading-tight" style={{ color: 'var(--color-sidebar-text)' }}>Gestão de Franquias</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showBadge = item.id === 'requests' && pendingCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left"
              style={{
                background: isActive ? 'var(--color-sidebar-item-active)' : 'transparent',
                color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
              }}
            >
              <Icon size={14} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sidebar-item-active)' }}>
            <UserIcon size={12} style={{ color: 'var(--color-sidebar-text)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-sidebar-text)' }}>{ROLE_LABELS[user.role]}</div>
          </div>
          <button onClick={onLogout} aria-label="Sair" className="p-1 rounded hover:bg-gray-700 transition-colors" title="Sair">
            <LogOut size={13} style={{ color: 'var(--color-sidebar-text)' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
