// src/app/components/reports/ReportTable.tsx
import type { Request } from '../../../types';
import { REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../../../types';

interface ReportTableProps {
  requests: Request[];
  approvalsMap: Record<string, { observation?: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  montagem: '#6366f1',
  motoboy:  '#f59e0b',
  sedex:    '#10b981',
};

export function ReportTable({ requests, approvalsMap }: ReportTableProps) {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
  const total = requests.reduce((s, r) => s + (r.value ?? 0), 0);

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    pending:  { bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending-text)' },
    approved: { bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved-text)' },
    rejected: { bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected-text)' },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Table header */}
      <div className="hidden md:grid text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-2.5 bg-gray-50 border-b border-gray-100 gap-3"
        style={{ gridTemplateColumns: 'minmax(120px,1.5fr) 90px 70px 80px 90px 70px minmax(100px,1fr) minmax(120px,2fr) 80px' }}>
        <span>Loja</span><span>Tipo</span><span>OS</span><span>Data</span>
        <span>Valor</span><span>Cobrado</span>
        <span>Solicitante</span><span>Justificativa</span><span>Status</span>
      </div>

      {requests.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Nenhum registro para os filtros selecionados.
        </div>
      ) : (
        requests.map(req => {
          const ss = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending;
          return (
            <div key={req.id}
              className="hidden md:grid items-center px-4 py-2.5 border-b border-gray-50 last:border-0 text-xs gap-3"
              style={{ gridTemplateColumns: 'minmax(120px,1.5fr) 90px 70px 80px 90px 70px minmax(100px,1fr) minmax(120px,2fr) 80px' }}>
              <span className="font-medium text-gray-800 truncate">{req.storeName}</span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[req.type] ?? '#9ca3af' }} />
                {REQUEST_TYPE_LABELS[req.type]}
              </span>
              <span className="text-gray-400">#{req.osNumber}</span>
              <span className="text-gray-400">{req.date}</span>
              <span className="text-right font-semibold text-gray-900 tabular-nums">{fmt(req.value ?? 0)}</span>
              <span style={{ color: req.chargedToClient ? '#16a34a' : '#9ca3af' }}>
                {req.chargedToClient ? 'Sim' : 'Não'}
              </span>
              <span className="text-gray-500 truncate">{req.requestedBy}</span>
              <span className="text-gray-400 italic truncate text-[10px]">{req.justification || '—'}</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ background: ss.bg, color: ss.text }}>
                {REQUEST_STATUS_LABELS[req.status as keyof typeof REQUEST_STATUS_LABELS] ?? req.status}
              </span>
            </div>
          );
        })
      )}

      {/* Mobile cards */}
      {requests.map(req => {
        const ss = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending;
        return (
          <div key={`m-${req.id}`} className="md:hidden px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800">{req.storeName}</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: ss.bg, color: ss.text }}>
                {REQUEST_STATUS_LABELS[req.status as keyof typeof REQUEST_STATUS_LABELS] ?? req.status}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              {REQUEST_TYPE_LABELS[req.type]} · OS #{req.osNumber} · {req.date} · {fmt(req.value ?? 0)}
            </div>
          </div>
        );
      })}

      {/* Footer total */}
      {requests.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">{requests.length} registro{requests.length !== 1 ? 's' : ''}</span>
          <span className="text-xs font-bold text-gray-900">Total: {fmt(total)}</span>
        </div>
      )}
    </div>
  );
}
