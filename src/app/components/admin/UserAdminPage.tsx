// src/app/components/admin/UserAdminPage.tsx
import { useEffect, useState } from 'react';
import { Plus, Users, Home, Tag } from 'lucide-react';
import { users as usersApi, stores as storesApi } from '../../../lib/api';
import { ServicePricePage } from './ServicePricePage';
import type { User, Store } from '../../../types';
import { UserTable } from './UserTable';
import { UserForm } from './UserForm';
import { StoreTable } from './StoreTable';
import { StoreForm } from './StoreForm';

type Tab = 'users' | 'stores' | 'prices';

interface UserAdminPageProps {
  currentUser: User;
}

export function UserAdminPage({ currentUser }: UserAdminPageProps) {
  const [tab, setTab] = useState<Tab>('users');
  const [userList, setUserList] = useState<User[]>([]);
  const [storeList, setStoreList] = useState<Store[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editingStore, setEditingStore] = useState<Partial<Store> | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResult, storesResult] = await Promise.all([
        usersApi.getAll(),
        storesApi.getAll(),
      ]);
      setUserList(usersResult.users.filter((u: { id: string }) => u.id !== currentUser.id));
      setStoreList(storesResult.stores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ─── Users ───────────────────────────────────────────────────────────────────

  const handleUserSubmit = async (data: Partial<User> & { password?: string }) => {
    if (data.id) {
      // Update — API uses email as identifier
      const email = data.email!;
      await usersApi.update(email, {
        name: data.name,
        role: data.role,
        storeId: data.storeId,
        password: data.password,
      });
    } else {
      // Create
      await usersApi.create({
        email: data.email!,
        password: data.password!,
        name: data.name!,
        role: data.role!,
        storeId: data.storeId,
      });
    }
    setShowUserForm(false);
    setEditingUser(null);
    await loadData();
  };

  const handleUserDelete = async (userId: string) => {
    const user = userList.find(u => u.id === userId);
    if (!user) return;
    if (!window.confirm(`Excluir o usuário ${user.name}?`)) return;
    await usersApi.delete(user.email);
    await loadData();
  };

  // ─── Stores ──────────────────────────────────────────────────────────────────

  const handleStoreSubmit = async (data: Partial<Store>) => {
    if (data.id) {
      // The current API does not expose a store update endpoint.
      // Show a user-facing message and bail out gracefully.
      alert('Edição de lojas não está disponível na API atual. Por favor, contate o administrador do sistema.');
    } else {
      await storesApi.create(data.code!, data.name!);
    }
    setShowStoreForm(false);
    setEditingStore(null);
    await loadData();
  };

  const handleStoreDelete = async (_storeId: string) => {
    // The current API does not expose a store delete endpoint.
    alert('Exclusão de lojas não está disponível na API atual. Por favor, contate o administrador do sistema.');
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const filteredUsers = userList.filter(u =>
    userSearch === '' ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  const tabBase = 'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors';
  const tabActive = 'bg-gray-900 text-white';
  const tabInactive = 'text-gray-500 hover:bg-gray-100';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-base font-bold text-gray-900">Administração</h1>
          <p className="text-xs text-gray-400 mt-0.5">Gerencie usuários e lojas do sistema</p>
        </div>
        {tab !== 'prices' && (
          <button
            onClick={() => {
              if (tab === 'users') {
                setEditingUser(null);
                setShowUserForm(true);
              } else {
                setEditingStore(null);
                setShowStoreForm(true);
              }
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plus size={13} />
            {tab === 'users' ? 'Novo usuário' : 'Nova loja'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`${tabBase} ${tab === 'users' ? tabActive : tabInactive}`}
          onClick={() => setTab('users')}
        >
          <Users size={13} />
          Usuários
        </button>
        <button
          className={`${tabBase} ${tab === 'stores' ? tabActive : tabInactive}`}
          onClick={() => setTab('stores')}
        >
          <Home size={13} />
          Lojas
        </button>
        <button
          className={`${tabBase} ${tab === 'prices' ? tabActive : tabInactive}`}
          onClick={() => setTab('prices')}
        >
          <Tag size={13} />
          Preços
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
      )}

      {/* Users tab */}
      {!loading && tab === 'users' && (
        <div className="space-y-3">
          {showUserForm && (
            <UserForm
              initial={editingUser ?? undefined}
              stores={storeList}
              onSubmit={handleUserSubmit}
              onCancel={() => { setShowUserForm(false); setEditingUser(null); }}
            />
          )}
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white mb-3"
          />
          <UserTable
            users={filteredUsers}
            onEdit={u => { setEditingUser(u); setShowUserForm(true); }}
            onDelete={handleUserDelete}
          />
        </div>
      )}

      {/* Stores tab */}
      {!loading && tab === 'stores' && (
        <div className="space-y-3">
          {showStoreForm && (
            <StoreForm
              initial={editingStore ?? undefined}
              onSubmit={handleStoreSubmit}
              onCancel={() => { setShowStoreForm(false); setEditingStore(null); }}
            />
          )}
          <StoreTable
            stores={storeList}
            onEdit={s => { setEditingStore(s); setShowStoreForm(true); }}
            onDelete={handleStoreDelete}
            readOnly={true}
          />
        </div>
      )}

      {/* Prices tab */}
      {!loading && tab === 'prices' && (
        <ServicePricePage />
      )}
    </div>
  );
}
