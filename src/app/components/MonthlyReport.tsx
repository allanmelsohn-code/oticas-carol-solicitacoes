import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Download, FileSpreadsheet } from 'lucide-react';
import { reports, stores as storesApi } from '../../lib/api';
import type { Request, Store } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../../utils/currency';

// Native select component for better reliability
const NativeSelect = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
);

export function MonthlyReport() {
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'month' | 'period'>('month');

  const currentDate = new Date();
  const [filters, setFilters] = useState({
    storeId: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadReport();
  }, [filters, filterMode]);

  const loadStores = async () => {
    try {
      const result = await storesApi.getAll();
      setStoresList(result.stores);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const result = await reports.getMonthly(filters);
      
      // Filter by date range if in period mode
      let filteredRequests = result.requests;
      
      if (filterMode === 'period' && filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        
        filteredRequests = result.requests.filter((req: Request) => {
          const reqDate = new Date(req.date);
          return reqDate >= startDate && reqDate <= endDate;
        });
      } else if (filterMode === 'month' && filters.month === 0) {
        // "Todos os meses" selected - filter by year only
        filteredRequests = result.requests.filter((req: Request) => {
          const reqDate = new Date(req.date);
          return reqDate.getFullYear() === filters.year;
        });
      }
      
      // Recalculate totals for filtered requests
      const recalculatedTotals = {
        total: filteredRequests.reduce((sum: number, r: Request) => sum + r.value, 0),
        chargedToClient: filteredRequests.filter((r: Request) => r.chargedToClient).reduce((sum: number, r: Request) => sum + r.value, 0),
        notChargedToClient: filteredRequests.filter((r: Request) => !r.chargedToClient).reduce((sum: number, r: Request) => sum + r.value, 0),
        montagem: filteredRequests.filter((r: Request) => r.type === 'montagem').reduce((sum: number, r: Request) => sum + r.value, 0),
        motoboy: filteredRequests.filter((r: Request) => r.type === 'motoboy').reduce((sum: number, r: Request) => sum + r.value, 0),
      };
      
      setRequests(filteredRequests);
      setTotals(recalculatedTotals);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getPeriodText = () => {
    if (filterMode === 'period' && filters.startDate && filters.endDate) {
      return `${new Date(filters.startDate).toLocaleDateString('pt-BR')} a ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`;
    } else if (filterMode === 'month' && filters.month === 0) {
      return `Ano Completo: ${filters.year}`;
    } else {
      const monthName = months.find(m => m.value === filters.month)?.label || '';
      return `${monthName}/${filters.year}`;
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Óticas Carol - Extrato Mensal', 14, 20);
    
    // Filters info
    doc.setFontSize(10);
    const storeName = filters.storeId 
      ? storesList.find(s => s.id === filters.storeId)?.name || 'Todas'
      : 'Todas as lojas';
    doc.text(`Loja: ${storeName}`, 14, 30);
    doc.text(`Período: ${getPeriodText()}`, 14, 35);
    if (filters.type) {
      doc.text(`Tipo: ${filters.type === 'montagem' ? 'Montagem' : 'Motoboy'}`, 14, 40);
    }

    // Table with Loja and OS columns
    const tableData = requests.map(req => [
      new Date(req.date).toLocaleDateString('pt-BR'),
      req.osNumber,
      req.storeName || '-',
      req.type === 'montagem' ? 'Montagem' : 'Motoboy',
      formatCurrency(req.value),
      req.chargedToClient ? 'Sim' : 'Não',
      req.status === 'approved' ? 'Aprovado' : req.status === 'pending' ? 'Pendente' : 'Reprovado',
    ]);

    autoTable(doc, {
      head: [['Data', 'OS', 'Loja', 'Tipo', 'Valor', 'Cobrado', 'Status']],
      body: tableData,
      startY: filters.type ? 45 : 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Geral: R$ ${totals.total.toFixed(2)}`, 14, finalY);
    doc.text(`Total Cobrado do Cliente: R$ ${totals.chargedToClient.toFixed(2)}`, 14, finalY + 5);
    doc.text(`Total Não Cobrado: R$ ${totals.notChargedToClient.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Montagem: R$ ${totals.montagem.toFixed(2)}`, 14, finalY + 15);
    doc.text(`Total Motoboy: R$ ${totals.motoboy.toFixed(2)}`, 14, finalY + 20);

    const filename = filterMode === 'period' 
      ? `extrato_${filters.startDate}_${filters.endDate}.pdf`
      : filters.month === 0
      ? `extrato_ano_${filters.year}.pdf`
      : `extrato_${filters.month}_${filters.year}.pdf`;
    
    doc.save(filename);
  };

  const exportToExcel = () => {
    // Create CSV content
    let csv = 'Data,OS,Loja,Tipo,Valor,Cobrado,Status\n';
    
    requests.forEach(req => {
      csv += `${new Date(req.date).toLocaleDateString('pt-BR')},`;
      csv += `${req.osNumber},`;
      csv += `${req.storeName || '-'},`;
      csv += `${req.type === 'montagem' ? 'Montagem' : 'Motoboy'},`;
      csv += `${req.value.toFixed(2)},`;
      csv += `${req.chargedToClient ? 'Sim' : 'Não'},`;
      csv += `${req.status === 'approved' ? 'Aprovado' : req.status === 'pending' ? 'Pendente' : 'Reprovado'}\n`;
    });

    csv += '\n';
    csv += `Total Geral,,,${totals.total.toFixed(2)}\n`;
    csv += `Total Cobrado do Cliente,,,${totals.chargedToClient.toFixed(2)}\n`;
    csv += `Total Não Cobrado,,,${totals.notChargedToClient.toFixed(2)}\n`;
    csv += `Total Montagem,,,${totals.montagem.toFixed(2)}\n`;
    csv += `Total Motoboy,,,${totals.motoboy.toFixed(2)}\n`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    const filename = filterMode === 'period' 
      ? `extrato_${filters.startDate}_${filters.endDate}.csv`
      : filters.month === 0
      ? `extrato_ano_${filters.year}.csv`
      : `extrato_${filters.month}_${filters.year}.csv`;
    
    link.download = filename;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'pending' | 'approved' | 'rejected'> = {
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected',
    };
    
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Reprovado',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const months = [
    { value: 0, label: 'Todos os Meses' },
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Extrato Mensal</h2>
        <p className="text-gray-500 mt-1">Relatório financeiro para conciliação</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Mode Toggle */}
          <div className="space-y-2">
            <Label>Modo de Filtro</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filterMode === 'month' ? 'default' : 'outline'}
                onClick={() => setFilterMode('month')}
                className="flex-1"
              >
                Por Mês/Ano
              </Button>
              <Button
                type="button"
                variant={filterMode === 'period' ? 'default' : 'outline'}
                onClick={() => setFilterMode('period')}
                className="flex-1"
              >
                Por Período
              </Button>
            </div>
          </div>

          {/* Filters based on mode */}
          {filterMode === 'month' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store">Loja</Label>
                <NativeSelect
                  id="store"
                  value={filters.storeId}
                  onChange={(e) => handleFilterChange('storeId', e.target.value)}
                >
                  <option value="">Todas as lojas</option>
                  {storesList.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.code} - {store.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Mês</Label>
                <NativeSelect
                  id="month"
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <NativeSelect
                  id="year"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Serviço</Label>
                <NativeSelect
                  id="type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="montagem">Montagem</option>
                  <option value="motoboy">Motoboy</option>
                </NativeSelect>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-period">Loja</Label>
                <NativeSelect
                  id="store-period"
                  value={filters.storeId}
                  onChange={(e) => handleFilterChange('storeId', e.target.value)}
                >
                  <option value="">Todas as lojas</option>
                  {storesList.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.code} - {store.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-period">Tipo de Serviço</Label>
                <NativeSelect
                  id="type-period"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="montagem">Montagem</option>
                  <option value="motoboy">Motoboy</option>
                </NativeSelect>
              </div>
            </div>
          )}

          {/* Period Info Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>Período selecionado:</strong> {getPeriodText()}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Geral</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Cobrado do Cliente</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.chargedToClient)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Não Cobrado</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.notChargedToClient)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Montagem</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.montagem)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Motoboy</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totals.motoboy)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registros ({requests.length})</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportToPDF} disabled={requests.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel} disabled={requests.length === 0}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum registro encontrado para os filtros selecionados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobrado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.osNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{request.storeName}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="default">
                          {request.type === 'montagem' ? 'Montagem' : 'Motoboy'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(request.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {request.chargedToClient ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(request.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}