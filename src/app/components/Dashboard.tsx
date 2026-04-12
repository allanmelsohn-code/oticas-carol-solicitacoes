// src/app/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, DollarSign, Plus, ChevronRight } from 'lucide-react';
import { requests as requestsApi } from '../../lib/api';
import { REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../../types';
import type { Request } from '../../types';

interface DashboardProps {
  onNavigate: (view: string, filter?: string, highlightId?: string) => void;
}

interface DashStats {
  pending: number;
  approved: number;
  rejected: number;
  thisMonthTotal: number;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashStats>({ pending: 0, approved: 0, rejected: 0, thisMonthTotal: 0 });
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsApi.getAll()
      .then((data: { requests?: Request[] }) => {
        const all: Request[] = data.requests ?? [];
        const now = new Date();
        const thisMonth = all.filter(r => {
          const d = new Date(r.date ?? r.createdAt ?? '');
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        setStats({
          pending: all.filter(r => r.status === 'pending').length,
          approved: all.filter(r => r.status === 'approved').length,
          rejected: all.filter(r => r.status === 'rejected').length,
          thisMonthTotal: thisMonth.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.value ?? 0), 0),
        });
        setRecentRequests(all.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Pendentes',  value: stats.pending,  icon: Clock,        color: '#d97706', borderColor: '#fde68a', bg: '#fffbeb', filter: 'pending' },
    { label: 'Aprovados',  value: stats.approved, icon: CheckCircle,  color: '#16a34a', borderColor: '#e5e7eb', bg: 'white',   filter: 'approved' },
    { label: 'Reprovados', value: stats.rejected, icon: XCircle,      color: '#dc2626', borderColor: '#e5e7eb', bg: 'white',   filter: 'rejected' },
    {
      label: 'Total mês',
      value: stats.thisMonthTotal > 0
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.thisMonthTotal)
        : '—',
      icon: DollarSign,
      color: '#6b7280',
      borderColor: '#e5e7eb',
      bg: 'white',
      filter: 'all',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => onNavigate('new-request')}
          className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={12} />
          Nova Solicitação
        </button>
      </div>

      {/* Stat cards — clicáveis, abrem lista filtrada */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate('requests', card.filter)}
              className="rounded-xl p-4 border text-left transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] icon-btn-compact"
              style={{ background: card.bg, borderColor: card.borderColor, boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {card.label}
                </span>
                <Icon size={13} style={{ color: card.color }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            </button>
          );
        })}
      </div>

      {/* Recent requests table */}
      <div
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Últimas solicitações</span>
          <button
            onClick={() => onNavigate('requests', 'all')}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 icon-btn-compact"
          >
            Ver todas <ChevronRight size={12} />
          </button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Nenhuma solicitação ainda.
          </div>
        ) : (
          recentRequests.map(req => (
            <button
              key={req.id}
              onClick={() => onNavigate('requests', 'all', req.id)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left icon-btn-compact"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{req.storeName}</div>
                <div className="text-xs text-gray-400">
                  {REQUEST_TYPE_LABELS[req.type]} · OS #{req.osNumber}
                </div>
              </div>
              <div className="text-xs font-semibold text-gray-900 tabular-nums">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(req.value ?? 0)}
              </div>
              <StatusBadge status={req.status} />
              <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    pending:  { bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending-text)' },
    approved: { bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved-text)' },
    rejected: { bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected-text)' },
  };
  const s = styles[status] ?? styles.pending;
  return (
    <span
      className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {REQUEST_STATUS_LABELS[status as keyof typeof REQUEST_STATUS_LABELS] ?? status}
    </span>
  );
}
