import { LayoutDashboard, ClipboardList, CheckSquare, BarChart2, Settings } from 'lucide-react';
import type React from 'react';

// The nav-visible views (appear in sidebar/bottom nav)
export type NavView = 'dashboard' | 'requests' | 'approvals' | 'report' | 'user-admin';

// All routable views (includes non-nav views)
export type AppView = NavView | 'new-request' | 'notifications';

export interface NavItemDef {
  id: NavView;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  roles: Array<'store' | 'approver' | 'viewer'>;
}

export const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard',  label: 'Dashboard',    shortLabel: 'Início',    icon: LayoutDashboard, roles: ['store', 'approver', 'viewer'] },
  { id: 'requests',   label: 'Solicitações', shortLabel: 'Pedidos',   icon: ClipboardList,   roles: ['store', 'approver', 'viewer'] },
  { id: 'approvals',  label: 'Aprovações',   shortLabel: 'Aprovar',   icon: CheckSquare,     roles: ['approver'] },
  { id: 'report',     label: 'Relatórios',   shortLabel: 'Relatório', icon: BarChart2,       roles: ['approver', 'viewer'] },
  { id: 'user-admin', label: 'Admin',        shortLabel: 'Admin',     icon: Settings,        roles: ['approver'] },
];
