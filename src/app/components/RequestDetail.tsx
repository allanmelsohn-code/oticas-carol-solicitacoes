import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Request, Approval } from '../../types';
import { requests as requestsApi } from '../../lib/api';
import { formatCurrency } from '../../utils/currency';

interface RequestDetailProps {
  requestId: string;
  onClose: () => void;
}

export function RequestDetail({ requestId, onClose }: RequestDetailProps) {
  const [request, setRequest] = useState<Request | null>(null);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const result = await requestsApi.getById(requestId);
      setRequest(result.request);
      setApproval(result.approval || null);
    } catch (error) {
      console.error('Error loading request:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhes da Solicitação</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : request ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {request.type === 'montagem' ? 'Montagem (Laboratório)' : 'Entrega Motoboy'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-gray-900">Informações da Loja</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loja</p>
                    <p className="mt-1 text-sm text-gray-900">{request.storeName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Solicitante</p>
                    <p className="mt-1 text-sm text-gray-900">{request.requestedBy}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-gray-900">Detalhes do Serviço</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número da OS</p>
                    <p className="mt-1 text-sm text-gray-900">{request.osNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(request.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valor</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(request.value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cobrado do Cliente</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {request.chargedToClient ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Justificativa</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {request.justification}
                </p>
              </div>

              {approval && (
                <div className="border-t pt-4 bg-blue-50 -mx-6 -mb-6 p-6 rounded-b-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações de Aprovação</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Aprovador</p>
                      <p className="mt-1 text-sm text-gray-900">{approval.approverName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Aprovação</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(approval.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {approval.observation && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-500 mb-1">Observação</p>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-md">
                        {approval.observation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Solicitação não encontrada</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}