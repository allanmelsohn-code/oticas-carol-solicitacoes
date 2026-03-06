import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { NewRequest } from './components/NewRequest';
import { ApprovalPanel } from './components/ApprovalPanel';
import { MonthlyReport } from './components/MonthlyReport';
import { RequestsList } from './components/RequestsList';
import { UserAdmin } from './components/UserAdmin';
import { NotificationSettings } from './components/NotificationSettings';
import { Help } from './components/Help';
import { auth, getSessionId, clearSessionId } from '../lib/api';
import { initializePushNotifications, setupPushListeners } from '../lib/pushNotifications';
import type { User } from '../types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    checkAuth();
    // Check if setup should be shown (in URL params)
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'true') {
      setShowSetup(true);
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a session
      const sid = getSessionId();
      
      if (!sid) {
        console.log('ℹ️  No session found');
        setLoading(false);
        return;
      }

      console.log('🔍 Validating session...');
      
      // Try to get user info with current session
      const result = await auth.getMe();
      console.log('✅ Session valid, user:', result.user);
      setUser(result.user);
      
      // Redirect approvers to approvals page on session restore
      if (result.user.role === 'approver') {
        setCurrentView('approvals');
      }
    } catch (error) {
      console.log('❌ Session invalid:', error);
      clearSessionId();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    console.log('✅ User logged in:', user);
    setUser(user);
    
    // Redirect approvers to approvals page
    if (user.role === 'approver') {
      setCurrentView('approvals');
    } else {
      setCurrentView('dashboard');
    }
    
    // Initialize web push notifications (optional)
    console.log('🌐 Aplicação web - notificações disponíveis via navegador');
  };

  const handleLogout = () => {
    auth.signout();
    setUser(null);
    setCurrentView('dashboard');
  };
  
  const handleNavigate = (view: string, filter?: string) => {
    setCurrentView(view);
    if (filter) {
      setStatusFilter(filter);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (showSetup) {
    return <Setup />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        onHelp={() => setShowHelp(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentView === 'new-request' && <NewRequest onCancel={() => setCurrentView('dashboard')} />}
        {currentView === 'approvals' && <ApprovalPanel />}
        {currentView === 'report' && <MonthlyReport />}
        {currentView === 'requests' && <RequestsList statusFilter={statusFilter} />}
        {currentView === 'user-admin' && <UserAdmin />}
        {currentView === 'notifications' && <NotificationSettings />}
      </main>

      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
}