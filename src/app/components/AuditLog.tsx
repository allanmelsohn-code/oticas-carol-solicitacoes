import { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, User, FileText, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiCall } from '../../lib/api';

interface AuditEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: any;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  'request.create':   { label: 'Nova solicitação',  color: 'text-blue-600 bg-blue-50',   icon: FileText },
  'request.approve':  { label: 'Aprovação',          color: 'text-green-600 bg-green-50', icon: CheckCircle },
  'request.reject':   { label: 'Reprovação',         color: 'text-red-600 bg-red-50',     icon: XCircle },
  'request.delete':   { label: 'Exclusão',           color: 'text-gray-600 bg-gray-100',  icon: Trash2 },
  'request.edit':     { label: 'Edição',             color: 'text-yellow-600 bg-yellow-50', icon: Edit },
  'user.create':      { label: 'Criou usuário',      color: 'text-purple-600 bg-purple-50', icon: User },
  'user.update':      { label: 'Editou usuário',     color: 'text-purple-600 bg-purple-50', icon: Edit },
  'user.delete':      { label: 'Removeu usuário',    color: 'text-red-600 bg-red-50',     icon: Trash2 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filtered, setFiltered] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadAudit();
  }, []);

  useEffect(() => {
    let result = entries;
    if (filterType !== 'all') {
      result = result.filter(e => e.targetType === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.userName.toLowerCase().includes(q) ||
        e.userEmail.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        (e.details && JSON.stringify(e.details).toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [entries, search, filterType]);

  const loadAudit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/audit');
      setEntries(data.audit || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar auditoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Auditoria</h1>
            <p className="text-sm text-gray-500">Registro de todas as ações realizadas no sistema</p>
          </div>
        </div>
        <Button onClick={loadAudit} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuário, ação..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="request">Solicitações</option>
              <option value="user">Usuários</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-3">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
              {filtered.map(entry => {
                const meta = ACTION_LABELS[entry.action] || { label: entry.action, color: 'text-gray-600 bg-gray-100', icon: FileText };
                const Icon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900">{entry.userName}</span>
                        <span className="text-xs text-gray-400">{entry.userEmail}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                      </div>
                      {entry.details && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(entry.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}