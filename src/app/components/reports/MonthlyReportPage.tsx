// src/app/components/reports/MonthlyReportPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { reports as reportsApi, stores as storesApi } from '../../../lib/api';
import type { Request, Store } from '../../../types';
import { ReportFilters, type ReportFiltersState } from './ReportFilters';
import { ReportTotals } from './ReportTotals';
import { ReportTable } from './ReportTable';

const now = new Date();
const DEFAULT_FILTERS: ReportFiltersState = {
  month: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,
  storeId: '',
  type: '',
  status: '',
};

interface MonthlyReportData {
  requests?: Request[];
}

export function MonthlyReportPage() {
  const [filters, setFilters] = useState<ReportFiltersState>(DEFAULT_FILTERS);
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stores once on mount
  useEffect(() => {
    storesApi.getAll()
      .then(data => setStores(data.stores ?? []))
      .catch(console.error);
  }, []);

  // Fetch report data when month/storeId/type filter changes
  useEffect(() => {
    setLoading(true);
    const [year, month] = filters.month.split('-').map(Number);
    reportsApi.getMonthly({
      storeId: filters.storeId || undefined,
      month,
      year,
      type: filters.type || undefined,
    })
      .then((data: MonthlyReportData) => {
        setAllRequests(data.requests ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.storeId, filters.type]);

  // Filter status client-side (not supported by API)
  const filtered = useMemo(() => {
    if (!filters.status) return allRequests;
    return allRequests.filter(r => r.status === filters.status);
  }, [allRequests, filters.status]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Relatórios</h1>
        <button
          onClick={() => alert('Exportação PDF — disponível em breve')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={12} /> PDF
        </button>
      </div>
      <ReportFilters filters={filters} stores={stores} onChange={setFilters} />
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
      ) : (
        <>
          <ReportTotals requests={filtered} />
          <ReportTable requests={filtered} approvalsMap={{}} />
        </>
      )}
    </div>
  );
}
