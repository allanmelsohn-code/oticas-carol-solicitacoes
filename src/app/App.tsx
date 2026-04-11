import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { Dashboard } from './components/Dashboard';
import { NewRequest } from './components/NewRequest';
import { ApprovalPanel } from './components/ApprovalPanel';
import { MonthlyReport } from './components/MonthlyReport';
import { RequestsList } from './components/RequestsList';
import { UserAdmin } from './components/UserAdmin';
import { NotificationSettings } from './components/NotificationSettings';
import { AppShell } from './components/layout/AppShell';
import { auth, getSessionId, clearSessionId, requests } from '../lib/api';
import { initializePushNotifications, setupPushListeners, isNativePlatform, refreshFCMTokenIfNeeded, setupDeepLinkFromNotification } from '../lib/pushNotifications';
import type { User } from '../types';
import type { AppView } from './components/layout/navItems';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkAuth();
    // Check if setup should be shown (in URL params)
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'true') {
      setShowSetup(true);
    }
  }, []);

  const fetchPendingCount = async () => {
    try {
      const result = await requests.getAll();
      const pending = result.requests.filter((r: { status: string }) => r.status === 'pending');
      setPendingCount(pending.length);
    } catch {
      // silently ignore — not critical
    }
  };

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
      fetchPendingCount();
      if (isNativePlatform()) {
        refreshFCMTokenIfNeeded(); // check and update token if changed
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
    setCurrentView('dashboard');
    fetchPendingCount();
    
    // Initialize push notifications for mobile app
    if (isNativePlatform()) {
      console.log('📱 App nativo detectado, inicializando notificações push...');
      initializePushNotifications().then(result => {
        if (result.success) {
          console.log('✅ Notificações push configuradas com sucesso!');
          console.log('🔑 FCM Token:', result.token);
          
          // Setup listeners for incoming notifications
          setupPushListeners();
          setupDeepLinkFromNotification((requestId) => {
            // Navigate to requests list when notification tapped
            handleNavigate('requests');
          });
        } else {
          console.log('⚠️ Falha ao configurar notificações:', result.error);
        }
      });
    } else {
      console.log('🌐 Versão web detectada, notificações push não disponíveis');
    }
  };

  const handleLogout = () => {
    auth.signout();
    setUser(null);
    setCurrentView('dashboard');
    setPendingCount(0);
  };

  const handleNavigate = (view: AppView, filter?: string) => {
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
    <AppShell
      user={user}
      currentView={currentView}
      pendingCount={pendingCount}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentView === 'new-request' && <NewRequest onCancel={() => setCurrentView('dashboard')} />}
      {currentView === 'approvals' && <ApprovalPanel />}
      {currentView === 'report' && <MonthlyReport />}
      {currentView === 'requests' && <RequestsList statusFilter={statusFilter} />}
      {currentView === 'user-admin' && user && <UserAdmin currentUser={user} />}
      {currentView === 'notifications' && <NotificationSettings />}
    </AppShell>
  );
}