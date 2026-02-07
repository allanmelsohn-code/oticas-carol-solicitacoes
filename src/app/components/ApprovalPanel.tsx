import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckSquare, Clock, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import type { Request } from '../../types';
import { requests as requestsApi, approvals } from '../../lib/api';
import { formatCurrency } from '../../utils/currency';
import { notifyRequestApproved, notifyRequestRejected } from '../../lib/notifications';

export function ApprovalPanel() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject' | null>(null);
  const [observation, setObservation] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

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

  const handleApproval = async (request: Request, action: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setApprovalMode(action === 'approved' ? 'approve' : 'reject');
    setObservation('');
  };

  const confirmApproval = async () => {
    if (!selectedRequest || !approvalMode) return;

    setProcessing(true);
    try {
      await approvals.process(
        selectedRequest.id,
        approvalMode === 'approve' ? 'approved' : 'rejected',
        observation || undefined
      );
      
      // Send notification to store
      const typeLabel = selectedRequest.type === 'montagem' ? 'Montagem' : 'Motoboy';
      if (approvalMode === 'approve') {
        notifyRequestApproved(typeLabel, selectedRequest.value, observation);
      } else {
        notifyRequestRejected(typeLabel, selectedRequest.value, observation || 'Sem observação');
      }
      
      // Reload requests
      await loadRequests();
      
      // Close modal
      setApprovalMode(null);
      setSelectedRequest(null);
      setObservation('');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Erro ao processar aprovação');
    } finally {
      setProcessing(false);
    }
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

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
        <h2 className="text-3xl font-bold text-gray-900">Aprovações</h2>
        <p className="text-gray-500 mt-1">Gerencie as solicitações pendentes</p>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pendentes de Aprovação ({pendingRequests.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma solicitação pendente
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobrado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{request.storeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.requestedBy}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="default">
                          {request.type === 'montagem' ? 'Montagem' : 'Motoboy'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.osNumber}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(request.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(request.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {request.chargedToClient ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetail(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproval(request, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleApproval(request, 'rejected')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Processadas ({processedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma solicitação processada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{request.storeName}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="default">
                          {request.type === 'montagem' ? 'Montagem' : 'Motoboy'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.osNumber}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(request.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(request.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetail(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {approvalMode && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {approvalMode === 'approve' ? 'Aprovar Solicitação' : 'Reprovar Solicitação'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm"><strong>Loja:</strong> {selectedRequest.storeName}</p>
                <p className="text-sm"><strong>OS:</strong> {selectedRequest.osNumber}</p>
                <p className="text-sm"><strong>Valor:</strong> {formatCurrency(selectedRequest.value)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observation">
                  Observação {approvalMode === 'reject' ? '(Obrigatória)' : '(Opcional)'}
                </Label>
                <Textarea
                  id="observation"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Adicione uma observação..."
                  rows={3}
                  required={approvalMode === 'reject'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setApprovalMode(null);
                    setSelectedRequest(null);
                    setObservation('');
                  }}
                  disabled={processing}
                >
                  Cancelar
                </Button>
                <Button
                  variant={approvalMode === 'approve' ? 'success' : 'destructive'}
                  onClick={confirmApproval}
                  disabled={processing || (approvalMode === 'reject' && !observation)}
                >
                  {processing ? 'Processando...' : approvalMode === 'approve' ? 'Aprovar' : 'Reprovar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
    </div>
  );
}