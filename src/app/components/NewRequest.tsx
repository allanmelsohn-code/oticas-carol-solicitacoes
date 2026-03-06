import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Plus, CheckCircle, Printer, FileText } from 'lucide-react';
import type { User, Store } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { stores, requests, auth } from '../../lib/api';
import { notifyNewRequest } from '../../lib/notifications';

interface NewRequestProps {
  onCancel?: () => void;
}

export function NewRequest({ onCancel }: NewRequestProps) {
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [requestNumber, setRequestNumber] = useState('');
  const [createdRequestData, setCreatedRequestData] = useState<any>(null);

  const [formData, setFormData] = useState({
    storeId: '',
    requestedBy: '',
    type: 'montagem' as 'montagem' | 'motoboy',
    justification: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    osNumber: '',
    chargedToClient: false,
  });

  useEffect(() => {
    loadUserAndStores();
  }, []);

  const loadUserAndStores = async () => {
    try {
      const userResult = await auth.getMe();
      setCurrentUser(userResult.user);
      
      const result = await stores.getAll();
      setStoresList(result.stores);
      
      if (userResult.user.role === 'store' && userResult.user.storeId) {
        const store = result.stores.find(s => s.id === userResult.user.storeId);
        if (store) {
          setUserStore(store);
          setFormData(prev => ({ ...prev, storeId: store.id }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await requests.create({
        ...formData,
        value: parseFloat(formData.value),
      });
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const requestId = result.request?.id || crypto.randomUUID();
      const shortId = requestId.substring(0, 5).toUpperCase();
      const generatedNumber = `SOL-${dateStr}-${shortId}`;
      
      setSuccess(true);
      setRequestNumber(generatedNumber);
      setCreatedRequestData({
        ...result.request,
        requestNumber: generatedNumber,
      });
      
      const selectedStore = storesList.find(s => s.id === formData.storeId);
      const storeName = selectedStore ? `${selectedStore.code} - ${selectedStore.name}` : 'Loja';
      const typeLabel = formData.type === 'montagem' ? 'Montagem' : 'Motoboy';
      notifyNewRequest(storeName, typeLabel, parseFloat(formData.value));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNewRequest = () => {
    const resetData = {
      storeId: currentUser?.role === 'store' && userStore ? userStore.id : '',
      requestedBy: '',
      type: 'montagem' as 'montagem' | 'motoboy',
      justification: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
      osNumber: '',
      chargedToClient: false,
    };
    setFormData(resetData);
    setSuccess(false);
    setRequestNumber('');
    setCreatedRequestData(null);
  };
  
  const handlePrint = () => {
    window.print();
  };

  // Success Screen
  if (success && createdRequestData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-8 py-12 text-center border-b border-green-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Criada!</h2>
            <p className="text-gray-600">Sua solicitação foi enviada para aprovação</p>
          </div>

          {/* Request Number */}
          <div className="px-8 py-6 bg-blue-50 border-b border-blue-100">
            <div className="text-center">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Número da Solicitação</p>
              <p className="text-3xl font-mono font-bold text-blue-900">{requestNumber}</p>
            </div>
          </div>

          {/* Request Details */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Loja</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{createdRequestData.storeName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {createdRequestData.type === 'montagem' ? 'Montagem (Laboratório)' : 'Entrega Motoboy'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</label>
                <p className="mt-1 text-lg font-bold text-green-600">{formatCurrency(createdRequestData.value)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data</label>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {new Date(createdRequestData.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Número OS</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{createdRequestData.osNumber}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cobrado do Cliente</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{createdRequestData.chargedToClient ? 'Sim' : 'Não'}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Justificativa</label>
              <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {createdRequestData.justification}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex gap-3 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleNewRequest} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nova Solicitação</h1>
        <p className="text-gray-500 mt-1">Preencha os dados para criar uma nova solicitação</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-8 py-6 space-y-6">
          {/* Store Selection */}
          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Loja *
            </label>
            {currentUser?.role === 'store' && userStore ? (
              <div className="flex h-11 items-center px-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-900">
                  {userStore.code} - {userStore.name}
                </span>
              </div>
            ) : (
              <Select
                id="storeId"
                value={formData.storeId}
                onChange={(e) => handleChange('storeId', e.target.value)}
                required
                className="h-11"
              >
                <option value="">Selecione uma loja</option>
                {storesList.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.code} - {store.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de Serviço *
              </label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
                className="h-11"
              >
                <option value="montagem">Montagem (Laboratório)</option>
                <option value="motoboy">Entrega Motoboy</option>
              </Select>
            </div>

            {/* OS Number */}
            <div>
              <label htmlFor="osNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                Número da OS *
              </label>
              <Input
                id="osNumber"
                placeholder="Ex: 12345"
                value={formData.osNumber}
                onChange={(e) => handleChange('osNumber', e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Value */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1.5">
                Valor (R$) *
              </label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
                Data *
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          {/* Charged to Client */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="chargedToClient"
              checked={formData.chargedToClient}
              onChange={(e) => handleChange('chargedToClient', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="chargedToClient" className="text-sm font-medium text-gray-700">
              Cobrado do cliente
            </label>
          </div>

          {/* Justification */}
          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-1.5">
              Justificativa *
            </label>
            <Textarea
              id="justification"
              placeholder="Descreva o motivo da solicitação..."
              value={formData.justification}
              onChange={(e) => handleChange('justification', e.target.value)}
              required
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Criando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Criar Solicitação
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}