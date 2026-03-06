import { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertTriangle, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { apiCall } from '../../lib/api';
import type { Request } from '../../types';

interface StorePending {
  storeId: string;
  storeName: string;
  storeCode: string;
  count: number;
  totalValue: number;
  oldestDate: string;
  requests: Request[];
}

interface PendingTotals {
  totalPending: number;
  totalValue: number;
  storesWithPending: number;
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'hoje';
  if (days === 1) return '1 dia atrás';
  return `${days} dias atrás`;
}

function urgencyColor(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 3) return 'text-red-600 bg-red-50 border-red-200';
  if (days >= 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
}

export function PendingReport() {
  const [summary, setSummary] = useState<StorePending[]>([]);
  const [totals, setTotals] = useState<PendingTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/reports/pending');
      setSummary(data.summary || []);
      setTotals(data.totals || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pendências');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitações Pendentes</h1>
            <p className="text-sm text-gray-500">Pendências por loja ordenadas por antiguidade</p>
          </div>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-gray-500">Total de Pendências</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{totals.totalPending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-gray-500">Valor Total em Aberto</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(totals.totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-gray-500">Lojas com Pendência</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{totals.storesWithPending}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Carregando...</div>
      ) : summary.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="text-lg font-medium text-gray-700">Nenhuma pendência!</p>
            <p className="text-sm text-gray-400 mt-1">Todas as solicitações foram processadas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {summary.map(store => {
            const isOpen = expanded === store.storeId;
            const urg = urgencyColor(store.oldestDate);
            return (
              <Card key={store.storeId} className={`border ${urg}`}>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(isOpen ? null : store.storeId)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full border ${urg}`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{store.storeName}</CardTitle>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Mais antiga: {formatDate(store.oldestDate)} ({daysAgo(store.oldestDate)})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{store.count} pendente{store.count > 1 ? 's' : ''}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(store.totalValue)}</p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent>
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {store.requests.map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm py-2 px-3 bg-white rounded border border-gray-100">
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 font-medium ${r.type === 'montagem' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                              {r.type === 'montagem' ? 'Montagem' : 'Motoboy'}
                            </span>
                            <span className="text-gray-700">{r.justification}</span>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="font-medium text-gray-900">{formatCurrency(r.value)}</p>
                            <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}