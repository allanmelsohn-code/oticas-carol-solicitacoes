import { LayoutDashboard, ClipboardList, CheckSquare, BarChart2, Settings } from 'lucide-react';
import type React from 'react';

export type AppView = 'dashboard' | 'requests' | 'approvals' | 'report' | 'user-admin';

export interface NavItemDef {
  id: AppView;
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
