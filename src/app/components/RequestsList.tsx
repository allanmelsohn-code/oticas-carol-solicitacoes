import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileText, Eye, Edit, Trash2, Filter, X } from 'lucide-react';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);
  
  useEffect(() => {
    // Apply filter when statusFilter changes
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, requests]);
  
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
      loadRequests(); // Reload list
    } catch (error) {
      console.error('Error deleting request:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir solicitação');
    }
  };
  
  // Check if user can edit/delete a request
  const canEditDelete = (request: Request) => {
    return request.status === 'pending';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Minhas Solicitações</h2>
        <p className="text-gray-500 mt-1">Acompanhe o status das suas solicitações</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Solicitações ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Você ainda não criou nenhuma solicitação
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobrado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.osNumber}</td>
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
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetail(true);
                            }}
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canEditDelete(request) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingRequest(request);
                                  setShowEditModal(true);
                                }}
                                title="Editar"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(request)}
                                title="Excluir"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetail && selectedRequest && (
        <RequestDetail
          requestId={selectedRequest.id}
          onClose={() => {
            setShowDetail(false);
            setSelectedRequest(null);
          }}
        />
      )}
      
      {/* Edit Modal Placeholder */}
      {showEditModal && editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Editar Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Funcionalidade de edição em desenvolvimento.
              </p>
              <p className="text-sm text-gray-600">
                OS: <strong>{editingRequest.osNumber}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Valor: <strong>{formatCurrency(editingRequest.value)}</strong>
              </p>
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRequest(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}