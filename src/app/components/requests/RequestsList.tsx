// src/app/components/requests/RequestsList.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { requests as requestsApi, approvals as approvalsApi } from '../../../lib/api';
import type { Request, ApprovalInfo } from '../../../types';
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
  highlightId?: string;
  onNavigate?: (view: string) => void;
}

export function RequestsList({ statusFilter = 'all', highlightId, onNavigate }: RequestsListProps) {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<Filter>((statusFilter as Filter) ?? 'all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalsMap, setApprovalsMap] = useState<Record<string, ApprovalInfo | null>>({});
  const [glareId, setGlareId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    const atTop = (containerRef.current?.scrollTop ?? 0) === 0;
    if (delta > 70 && atTop) {
      setLoading(true);
      requestsApi.getAll()
        .then((data: { requests?: Request[] }) => setAllRequests(data.requests ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    requestsApi.getAll()
      .then((data: { requests?: Request[] }) => setAllRequests(data.requests ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (statusFilter && statusFilter !== filter) {
      setFilter(statusFilter as Filter);
    }
  }, [statusFilter]);

  // Scroll to and highlight the target request
  useEffect(() => {
    if (!highlightId || loading) return;

    // Open the row
    setOpenId(highlightId);
    setGlareId(highlightId);

    // Fetch approval for highlighted row if not yet loaded
    if (approvalsMap[highlightId] === undefined) {
      approvalsApi.get(highlightId)
        .then((data: { approval?: ApprovalInfo | null }) =>
          setApprovalsMap(prev => ({ ...prev, [highlightId]: data.approval ?? null }))
        )
        .catch(() =>
          setApprovalsMap(prev => ({ ...prev, [highlightId]: null }))
        );
    }

    // Scroll after a short delay to allow render
    const t = setTimeout(() => {
      const el = rowRefs.current[highlightId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Remove glare after 2.5s
      setTimeout(() => setGlareId(null), 2500);
    }, 150);

    return () => clearTimeout(t);
  }, [highlightId, loading]);

  const filtered = filter === 'all' ? allRequests : allRequests.filter(r => r.status === filter);
  const handleToggle = async (id: string) => {
    setOpenId(prev => prev === id ? null : id);

    // Busca approval apenas uma vez por request
    if (approvalsMap[id] === undefined) {
      try {
        const data = await approvalsApi.get(id);
        setApprovalsMap(prev => ({ ...prev, [id]: data.approval ?? null }));
      } catch (err) {
        console.error('[RequestsList] Failed to fetch approval for', id, err);
        setApprovalsMap(prev => ({ ...prev, [id]: null }));
      }
    }
  };

  const setRowRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    rowRefs.current[id] = el;
  }, []);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="space-y-5"
    >
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
              className="text-xs px-3 py-1 rounded-full border transition-colors icon-btn-compact"
              style={filter === f.id
                ? { background: '#111827', color: 'white', borderColor: '#111827' }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div
          className="hidden sm:grid items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400"
          style={{ gridTemplateColumns: '16px minmax(100px,1.5fr) 80px 80px 80px minmax(80px,1fr) 80px' }}
        >
          <span></span>
          <span>Loja</span>
          <span>Tipo</span>
          <span>Valor</span>
          <span>Data</span>
          <span>OS</span>
          <span className="justify-self-end">Status</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Nenhuma solicitação encontrada.</div>
        ) : (
          filtered.map(req => (
            <div key={req.id} ref={setRowRef(req.id)}
              style={glareId === req.id ? {
                animation: 'glare-pulse 2.5s ease-out forwards',
              } : undefined}
            >
              <RequestRow
                request={req}
                isOpen={openId === req.id}
                onToggle={() => handleToggle(req.id)}
                approval={approvalsMap[req.id] ?? null}
              />
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes glare-pulse {
          0%   { background: #fefce8; box-shadow: 0 0 0 2px #fbbf24; border-radius: 4px; }
          30%  { background: #fef9c3; box-shadow: 0 0 0 2px #f59e0b; border-radius: 4px; }
          100% { background: transparent; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}
