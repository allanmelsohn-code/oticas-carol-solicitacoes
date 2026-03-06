import { LayoutDashboard, FileText, CheckSquare, BarChart3, LogOut, Plus, HelpCircle, Users, Menu, X, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import type { User } from '../../types';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User;
  onLogout: () => void;
  onHelp?: () => void;
}

export function Navigation({ currentView, onNavigate, user, onLogout, onHelp }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['store', 'approver', 'viewer'] },
    { id: 'new-request', label: 'Nova Solicitação', icon: Plus, roles: ['store'] },
    { id: 'approvals', label: 'Aprovações', icon: CheckSquare, roles: ['approver'] },
    { id: 'report', label: 'Extrato Mensal', icon: BarChart3, roles: ['approver', 'viewer'] },
    { id: 'requests', label: 'Minhas Solicitações', icon: FileText, roles: ['store'] },
    { id: 'user-admin', label: 'Usuários', icon: Users, roles: ['approver'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user.role));
  
  const handleNavigate = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'approver': return 'Aprovador';
      case 'store': return 'Loja';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <>
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-gray-900">ÓTICAS</span>
              <span className="text-lg font-light text-gray-400">|</span>
              <span className="text-xl font-bold text-amber-500">CAROL</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-gray-200 mx-2" />
            <span className="hidden sm:block text-xs text-gray-500 font-medium">Sistema de Controle</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('notifications')}
              className={currentView === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
            </Button>

            <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
              </div>
              
              {onHelp && (
                <Button variant="ghost" size="icon" onClick={onHelp} title="Ajuda">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={onLogout} title="Sair" className="text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 space-y-1">
              {/* User Info */}
              <div className="px-3 py-4 mb-2 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
              </div>

              {/* Menu Items */}
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Help & Logout */}
              {onHelp && (
                <button
                  onClick={() => {
                    onHelp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ajuda</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
