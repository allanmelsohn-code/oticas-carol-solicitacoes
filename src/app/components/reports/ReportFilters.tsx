// src/app/components/reports/ReportFilters.tsx
import type { Store } from '../../../types';

export interface ReportFiltersState {
  month: string;    // 'YYYY-MM'
  storeId: string;  // '' = all
  type: string;     // '' = all
  status: string;   // '' = all
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  stores: Store[];
  onChange: (filters: ReportFiltersState) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return {
    value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
    label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  };
});

export function ReportFilters({ filters, stores, onChange }: ReportFiltersProps) {
  const set = (key: keyof ReportFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  const selectCls = "text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400 text-gray-700";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Mês</label>
        <select className={selectCls} value={filters.month} onChange={e => set('month', e.target.value)}>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Loja</label>
        <select className={selectCls} value={filters.storeId} onChange={e => set('storeId', e.target.value)}>
          <option value="">Todas as lojas</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tipo</label>
        <select className={selectCls} value={filters.type} onChange={e => set('type', e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="montagem">Montagem</option>
          <option value="motoboy">Motoboy</option>
          <option value="sedex">Sedex</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Status</label>
        <select className={selectCls} value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">Todos</option>
          <option value="approved">Aprovadas</option>
          <option value="rejected">Reprovadas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>
    </div>
  );
}
