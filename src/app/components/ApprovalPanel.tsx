import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Modal, ModalActions } from './ui/modal';
import { LoadingState, EmptyState } from './ui/empty-state';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import type { Request } from '../../types';
import { requests as requestsApi, approvals } from '../../lib/api';
import { formatCurrency } from '../../utils/currency';
import { notifyRequestApproved, notifyRequestRejected } from '../../lib/notifications';
import { RequestDetail } from './RequestDetail';

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

  const handleApproval = async (request: Request, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalMode(action);
    setObservation('');
  };

  const confirmApproval = async () => {
    if (!selectedRequest || !approvalMode) return;

    // Validate observation for rejection
    if (approvalMode === 'reject' && !observation.trim()) {
      alert('Por favor, adicione uma observação para reprovar a solicitação.');
      return;
    }

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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return <LoadingState message="Carregando solicitações..." />;
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Aprovações</h1>
        <p className="text-gray-500 mt-1">Gerencie as solicitações pendentes de aprovação</p>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Pendentes de Aprovação <span className="text-amber-600">({pendingRequests.length})</span>
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="Tudo em dia!"
            description="Não há solicitações pendentes de aprovação no momento."
          />
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.storeName || 'Loja'}
                      </h3>
                      <Badge variant="pending">Pendente</Badge>
                      <Badge variant="default">
                        {request.type === 'montagem' ? 'Montagem' : 'Motoboy'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Solicitado por: {request.requestedBy}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Data</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(request.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Número OS</p>
                    <p className="text-sm font-medium text-gray-900">{request.osNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Valor</p>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(request.value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cobrado do Cliente</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.chargedToClient ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>

                {/* Justification */}
                {request.justification && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Justificativa</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {request.justification}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetail(true);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApproval(request, 'approve')}
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleApproval(request, 'reject')}
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reprovar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Processadas <span className="text-gray-500">({processedRequests.length})</span>
        </h2>

        {processedRequests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma solicitação processada"
            description="As solicitações aprovadas ou reprovadas aparecerão aqui."
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Loja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">OS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
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
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={request.status === 'approved' ? 'approved' : 'rejected'}>
                          {request.status === 'approved' ? 'Aprovada' : 'Reprovada'}
                        </Badge>
                      </td>
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
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={!!approvalMode && !!selectedRequest}
        onClose={() => {
          setApprovalMode(null);
          setSelectedRequest(null);
          setObservation('');
        }}
        title={approvalMode === 'approve' ? 'Aprovar Solicitação' : 'Reprovar Solicitação'}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Request Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loja:</span>
                <span className="text-sm font-medium text-gray-900">{selectedRequest.storeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tipo:</span>
                <Badge variant="default">
                  {selectedRequest.type === 'montagem' ? 'Montagem' : 'Motoboy'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OS:</span>
                <span className="text-sm font-medium text-gray-900">{selectedRequest.osNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valor:</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(selectedRequest.value)}</span>
              </div>
            </div>

            {/* Observation Field */}
            <div>
              <Label htmlFor="observation">
                Observação {approvalMode === 'reject' ? '(Obrigatória)' : '(Opcional)'}
              </Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder={approvalMode === 'approve' 
                  ? "Adicione uma observação (opcional)..." 
                  : "Explique o motivo da reprovação..."}
                rows={4}
                className="mt-1.5"
              />
            </div>

            {/* Actions */}
            <ModalActions>
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
                disabled={processing || (approvalMode === 'reject' && !observation.trim())}
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    {approvalMode === 'approve' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reprovar
                      </>
                    )}
                  </>
                )}
              </Button>
            </ModalActions>
          </div>
        )}
      </Modal>
    </div>
  );
}
