// src/app/components/reports/MonthlyReportPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { reports as reportsApi, stores as storesApi } from '../../../lib/api';
import type { Request, Store } from '../../../types';
import { REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../../../types';
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

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function exportPDF(requests: Request[], month: string) {
  import('jspdf').then(async ({ jsPDF }) => {
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(14);
    doc.text('Óticas Carol — Relatório de Solicitações', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Período: ${month}`, 14, 22);

    const rows = requests.map(r => [
      r.storeName,
      REQUEST_TYPE_LABELS[r.type as keyof typeof REQUEST_TYPE_LABELS] ?? r.type,
      `#${r.osNumber ?? ''}`,
      r.date,
      fmt(r.value ?? 0),
      r.chargedToClient ? 'Sim' : 'Não',
      r.requestedBy,
      REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS] ?? r.status,
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Loja', 'Tipo', 'OS', 'Data', 'Valor', 'Cobrado', 'Solicitante', 'Status']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    const total = requests.reduce((s, r) => s + (r.value ?? 0), 0);
    const finalY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(`Total: ${fmt(total)} (${requests.length} solicitações)`, 14, finalY);

    doc.save(`relatorio-${month}.pdf`);
  });
}

function exportXLS(requests: Request[], month: string) {
  import('xlsx').then(({ utils, writeFile }) => {
    const data = requests.map(r => ({
      Loja: r.storeName,
      Tipo: REQUEST_TYPE_LABELS[r.type as keyof typeof REQUEST_TYPE_LABELS] ?? r.type,
      OS: r.osNumber ?? '',
      Data: r.date,
      Valor: r.value ?? 0,
      'Cobrado do cliente': r.chargedToClient ? 'Sim' : 'Não',
      Solicitante: r.requestedBy,
      Status: REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS] ?? r.status,
    }));

    const ws = utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
      { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 12 },
    ];
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Relatório');
    writeFile(wb, `relatorio-${month}.xlsx`);
  });
}

export function MonthlyReportPage() {
  const [filters, setFilters] = useState<ReportFiltersState>(DEFAULT_FILTERS);
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storesApi.getAll()
      .then(data => setStores(data.stores ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const [year, month] = filters.month.split('-').map(Number);
    reportsApi.getMonthly({
      storeId: filters.storeId || undefined,
      month,
      year,
      type: filters.type || undefined,
    })
      .then((data: MonthlyReportData) => setAllRequests(data.requests ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.storeId, filters.type]);

  const filtered = useMemo(() => {
    if (!filters.status) return allRequests;
    return allRequests.filter(r => r.status === filters.status);
  }, [allRequests, filters.status]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Relatórios</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportXLS(filtered, filters.month)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={12} /> Excel
          </button>
          <button
            onClick={() => exportPDF(filtered, filters.month)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={12} /> PDF
          </button>
        </div>
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
