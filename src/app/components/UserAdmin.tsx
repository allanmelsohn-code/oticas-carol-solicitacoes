import { useState, useEffect } from 'react';
import { Users, UserPlus, RefreshCw, Edit, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Store } from '../../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-b2c42f95`;

interface UserData {
  email: string;
  name: string;
  role: string;
  storeId?: string;
  password?: string;
}

export function UserAdmin() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState<UserData>({
    email: '',
    name: '',
    role: 'store',
    storeId: '',
    password: ''
  });

  useEffect(() => {
    loadStores();
    loadUsers();
  }, []);

  const getSessionId = () => {
    return sessionStorage.getItem('sessionId') || '';
  };

  const loadStores = async () => {
    try {
      const response = await fetch(`${API_BASE}/stores`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-ID': getSessionId()
        }
      });
      const data = await response.json();
      setStores(data.stores || []);
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-ID': getSessionId()
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Load users error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load users`);
      }

      const data = await response.json();
      console.log('✅ Users loaded:', data.users?.length || 0);
      setUsers(data.users || []);
      setSuccess(`✅ ${data.users.length} usuários carregados com sucesso!`);
    } catch (err) {
      console.error('Load error:', err);
      setError(`❌ ${err instanceof Error ? err.message : 'Erro ao carregar usuários'}`);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-ID': getSessionId(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      setSuccess(`✅ Usuário ${newUser.email} criado com sucesso!`);
      setShowCreateModal(false);
      setNewUser({ email: '', name: '', role: 'store', storeId: '', password: '' });
      await loadUsers();
    } catch (err) {
      console.error('Create error:', err);
      setError(`❌ ${err instanceof Error ? err.message : 'Erro ao criar usuário'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/users/${editingUser.email}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-ID': getSessionId(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingUser)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setSuccess(`✅ Usuário ${editingUser.email} atualizado com sucesso!`);
      setShowEditModal(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      console.error('Update error:', err);
      setError(`❌ Erro ao atualizar usuário ${editingUser.email}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (email: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/users/${email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-ID': getSessionId()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      setSuccess(`✅ Usuário ${email} excluído com sucesso!`);
      await loadUsers();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`❌ ${err instanceof Error ? err.message : 'Erro ao excluir usuário'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7" />
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 mt-1">Configure perfis e permissões dos usuários</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadUsers}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Nenhum usuário encontrado. Clique em "Novo Usuário" para criar.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'approver' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'store' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'approver' ? 'Aprovador' : user.role === 'store' ? 'Loja' : 'Visualizador'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.role === 'store' && user.storeId ? (
                      stores.find(s => s.id === user.storeId)?.name || '-'
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        title="Editar"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUser(user.email)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-lg w-full my-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Criar Novo Usuário</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@oticascarol.com.br"
                />
              </div>

              <div>
                <Label htmlFor="new-password">Senha *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Senha inicial"
                />
              </div>

              <div>
                <Label htmlFor="new-name">Nome Completo *</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <Label htmlFor="new-role">Perfil *</Label>
                <select
                  id="new-role"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="approver">Aprovador</option>
                  <option value="store">Loja</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              {newUser.role === 'store' && (
                <div>
                  <Label htmlFor="new-store">Loja Vinculada *</Label>
                  <select
                    id="new-store"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUser.storeId}
                    onChange={(e) => setNewUser({ ...newUser, storeId: e.target.value })}
                  >
                    <option value="">Selecione uma loja</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.code} - {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={createUser} disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-lg w-full my-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Editar Usuário</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="edit-password">Nova Senha (deixe em branco para não alterar)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Nova senha (opcional)"
                />
              </div>

              <div>
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <Label htmlFor="edit-role">Perfil</Label>
                <select
                  id="edit-role"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="approver">Aprovador</option>
                  <option value="store">Loja</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              {editingUser.role === 'store' && (
                <div>
                  <Label htmlFor="edit-store">Loja Vinculada</Label>
                  <select
                    id="edit-store"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingUser.storeId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, storeId: e.target.value })}
                  >
                    <option value="">Selecione uma loja</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.code} - {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={updateUser} disabled={loading}>
                  <Edit className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}