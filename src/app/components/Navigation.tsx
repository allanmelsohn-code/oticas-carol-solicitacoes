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

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 sm:space-x-8">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-3xl">👓</div>
                <div className="hidden lg:block border-l border-gray-300 h-10 mx-2"></div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 font-medium">Sistema de Controle</p>
                </div>
              </div>
              <nav className="hidden md:flex space-x-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="whitespace-nowrap relative top-[1px]">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'approver' ? 'Aprovador' : user.role === 'store' ? 'Loja' : 'Visualizador'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('notifications')} 
                title="Notificações"
                className={currentView === 'notifications' ? 'bg-blue-50 text-blue-700' : ''}
              >
                <Bell className="w-4 h-4" />
              </Button>
              {onHelp && (
                <Button variant="ghost" size="sm" onClick={onHelp} title="Ajuda" className="hidden sm:flex">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onLogout} title="Sair" className="hidden sm:flex">
                <LogOut className="w-4 h-4" />
              </Button>
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'approver' ? 'Aprovador' : user.role === 'store' ? 'Loja' : 'Visualizador'}
                </p>
              </div>
              {onHelp && (
                <button
                  onClick={() => {
                    onHelp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Ajuda</span>
                </button>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}