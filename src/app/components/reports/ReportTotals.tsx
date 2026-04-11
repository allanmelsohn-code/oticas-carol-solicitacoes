// src/app/components/reports/ReportTotals.tsx
import type { Request } from '../../../types';

interface ReportTotalsProps {
  requests: Request[];
}

const TYPE_CONFIG = [
  { key: 'montagem', label: 'Montagem', color: '#6366f1' },
  { key: 'motoboy',  label: 'Motoboy',  color: '#f59e0b' },
  { key: 'sedex',    label: 'Sedex',    color: '#10b981' },
] as const;

export function ReportTotals({ requests }: ReportTotalsProps) {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
  const total = requests.reduce((s, r) => s + (r.value ?? 0), 0);
  const totalCount = requests.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {TYPE_CONFIG.map(({ key, label, color }) => {
        const items = requests.filter(r => r.type === key);
        const sum = items.reduce((s, r) => s + (r.value ?? 0), 0);
        return (
          <div key={key} className="bg-white border border-gray-200 rounded-xl p-4"
            style={{ borderLeft: `3px solid ${color}`, boxShadow: 'var(--shadow-card)' }}>
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </div>
            <div className="text-base font-bold text-gray-900">{fmt(sum)}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {items.length} solicitaç{items.length !== 1 ? 'ões' : 'ão'}
            </div>
          </div>
        );
      })}
      <div className="bg-white border border-gray-200 rounded-xl p-4"
        style={{ borderLeft: '3px solid #111827', boxShadow: 'var(--shadow-card)' }}>
        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Total</div>
        <div className="text-base font-bold text-gray-900">{fmt(total)}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          {totalCount} solicitaç{totalCount !== 1 ? 'ões' : 'ão'}
        </div>
      </div>
    </div>
  );
}
