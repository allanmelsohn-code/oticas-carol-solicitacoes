// src/app/components/requests/RequestsList.tsx
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { requests as requestsApi } from '../../../lib/api';
import type { Request } from '../../../types';
import { RequestRow } from './RequestRow';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: 'Todas'      },
  { id: 'pending',  label: 'Pendentes'  },
  { id: 'approved', label: 'Aprovadas'  },
  { id: 'rejected', label: 'Reprovadas' },
];

interface RequestsListProps {
  statusFilter?: string;
  onNavigate?: (view: string) => void;
}

export function RequestsList({ statusFilter = 'all', onNavigate }: RequestsListProps) {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<Filter>((statusFilter as Filter) ?? 'all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsApi.getAll()
      .then((data: { requests?: Request[] }) => {
        setAllRequests(data.requests ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? allRequests : allRequests.filter(r => r.status === filter);

  const handleToggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Solicitações</h1>
        {onNavigate && (
          <button
            onClick={() => onNavigate('new-request')}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={12} /> Nova Solicitação
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {/* Filter chips + count */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 mr-1">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="text-xs px-3 py-1 rounded-full border transition-colors"
              style={filter === f.id
                ? { background: '#111827', color: 'white', borderColor: '#111827' }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400">
          <span className="w-4"></span>
          <span className="w-20">Loja</span>
          <span className="w-16">Tipo</span>
          <span className="w-14">Valor</span>
          <span className="w-14">Data</span>
          <span className="flex-1">OS</span>
          <span className="w-16">Status</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Nenhuma solicitação encontrada.</div>
        ) : (
          filtered.map(req => (
            <RequestRow
              key={req.id}
              request={req}
              isOpen={openId === req.id}
              onToggle={() => handleToggle(req.id)}
              approval={null}
            />
          ))
        )}
      </div>
    </div>
  );
}
