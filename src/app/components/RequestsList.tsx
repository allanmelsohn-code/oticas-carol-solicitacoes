import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LoadingState, EmptyState } from './ui/empty-state';
import { Eye, Trash2, Search, Calendar, DollarSign, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Request } from '../../types';
import { requests as requestsApi } from '../../lib/api';
import { RequestDetail } from './RequestDetail';
import { formatCurrency } from '../../utils/currency';

interface RequestsListProps {
  statusFilter?: string;
}

export function RequestsList({ statusFilter = 'all' }: RequestsListProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);
  
  useEffect(() => {
    let filtered = requests;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.osNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.justification?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRequests(filtered);
  }, [statusFilter, requests, searchTerm]);
  
  const loadRequests = async () => {
    try {
      const result = await requestsApi.getAll();
      setRequests(result.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (request: Request) => {
    if (request.status !== 'pending') {
      alert('Apenas solicitações pendentes podem ser excluídas');
      return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir a solicitação OS ${request.osNumber}?`)) {
      return;
    }
    
    try {
      await requestsApi.delete(request.id);
      alert('Solicitação excluída com sucesso!');
      loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir solicitação');
    }
  };
  
  const canDelete = (request: Request) => {
    return request.status === 'pending';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pendente', 
          icon: Calendar, 
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200'
        };
      case 'approved':
        return { 
          label: 'Aprovada', 
          icon: CheckCircle, 
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'rejected':
        return { 
          label: 'Reprovada', 
          icon: XCircle, 
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      default:
        return { 
          label: status, 
          icon: Clock, 
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  if (showDetail && selectedRequest) {
    return (
      <RequestDetail
        request={selectedRequest}
        onClose={() => {
          setShowDetail(false);
          setSelectedRequest(null);
        }}
        onUpdate={loadRequests}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Minhas Solicitações</h1>
        <p className="text-gray-500 mt-1">Gerencie suas solicitações de serviço</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por OS, loja ou justificativa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredRequests.length} {filteredRequests.length === 1 ? 'solicitação encontrada' : 'solicitações encontradas'}
        </p>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira solicitação para começar'}
            </p>
          </div>
        ) : (
          filteredRequests.map(request => {
            const status = getStatusConfig(request.status);
            const StatusIcon = status.icon;
            
            return (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.storeName || 'Loja'}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {request.type === 'montagem' ? 'Montagem (Laboratório)' : 'Entrega Motoboy'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetail(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Ver Detalhes
                    </Button>
                    {canDelete(request) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(request)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Data
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(request.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      OS
                    </div>
                    <p className="text-sm font-medium text-gray-900">{request.osNumber}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      Valor
                    </div>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(request.value)}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Cobrado do Cliente</div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.chargedToClient ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>

                {request.justification && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Justificativa</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{request.justification}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}