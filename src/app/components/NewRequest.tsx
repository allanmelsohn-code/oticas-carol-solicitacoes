import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Calendar, DollarSign, FileText, Check, CheckCircle } from 'lucide-react';
import type { User, Store, Request } from '../../types';
import { REQUEST_TYPE_LABELS } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { stores, requests, auth } from '../../lib/api';
import { notifyNewRequest } from '../../lib/notifications';

// Select component
interface SelectProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  children: React.ReactNode;
}

const Select = ({ id, value, onChange, required, children }: SelectProps) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    required={required}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </select>
);

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
  const [createdRequestData, setCreatedRequestData] = useState<(Request & { requestNumber?: string }) | null>(null);

  const [formData, setFormData] = useState({
    storeId: '',
    requestedBy: '',
    type: 'montagem' as 'montagem' | 'motoboy' | 'sedex',
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
      // Get current user
      const userResult = await auth.getMe();
      setCurrentUser(userResult.user);
      
      // Load all stores
      const result = await stores.getAll();
      setStoresList(result.stores);
      
      // If user is a store user, find their store and pre-select it
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
      
      // Generate request number (format: SOL-YYYYMMDD-XXXXX where XXXXX is first 5 chars of ID)
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
      
      // Send notification to approvers about new request
      const selectedStore = storesList.find(s => s.id === formData.storeId);
      const storeName = selectedStore ? `${selectedStore.code} - ${selectedStore.name}` : 'Loja';
      const typeLabel = REQUEST_TYPE_LABELS[formData.type];
      notifyNewRequest(storeName, typeLabel, parseFloat(formData.value));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNewRequest = () => {
    const resetData = {
      storeId: currentUser?.role === 'store' && userStore ? userStore.id : '',
      requestedBy: '',
      type: 'montagem' as 'montagem' | 'motoboy' | 'sedex',
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

  if (success && createdRequestData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2 border-green-500">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl text-green-800">
              Solicitação Criada com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6 text-center">
              <p className="text-sm text-blue-600 font-medium mb-2">NÚMERO DA SOLICITAÇÃO</p>
              <p className="text-3xl font-bold text-blue-900 tracking-wider">{requestNumber}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Loja</p>
                  <p className="font-semibold">{createdRequestData.storeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-semibold">
                    {REQUEST_TYPE_LABELS[createdRequestData.type as keyof typeof REQUEST_TYPE_LABELS] ?? createdRequestData.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-semibold text-green-600">{formatCurrency(createdRequestData.value)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-semibold">
                    {new Date(createdRequestData.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">OS</p>
                  <p className="font-semibold">{createdRequestData.osNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cobrado do Cliente</p>
                  <p className="font-semibold">{createdRequestData.chargedToClient ? 'Sim' : 'Não'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Justificativa</p>
                <p className="text-sm bg-gray-50 p-3 rounded border">{createdRequestData.justification}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center print:hidden">
              <Button onClick={handlePrint} variant="outline" className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </Button>
              <Button onClick={handleNewRequest} className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Pedido
              </Button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Sua solicitação será enviada para aprovação
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Nova Solicitação</h2>
        <p className="text-gray-500 mt-1">Preencha os dados para solicitar um serviço</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Solicitação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="store">Loja *</Label>
                {currentUser?.role === 'store' && userStore ? (
                  // Store users see their store as read-only
                  <Input
                    id="store"
                    value={`${userStore.code} - ${userStore.name}`}
                    disabled
                    className="bg-gray-50 text-gray-700"
                  />
                ) : (
                  // Approvers can select any store
                  <Select
                    id="store"
                    value={formData.storeId}
                    onChange={(e) => handleChange('storeId', e.target.value)}
                    required
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

              <div className="space-y-2">
                <Label htmlFor="requestedBy">Solicitante *</Label>
                <Input
                  id="requestedBy"
                  value={formData.requestedBy}
                  onChange={(e) => handleChange('requestedBy', e.target.value)}
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="osNumber">Número da OS *</Label>
                <Input
                  id="osNumber"
                  value={formData.osNumber}
                  onChange={(e) => handleChange('osNumber', e.target.value)}
                  placeholder="Ex: 12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Solicitação *</Label>
                <div className="flex space-x-4 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="montagem"
                      checked={formData.type === 'montagem'}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Montagem (Laboratório)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="motoboy"
                      checked={formData.type === 'motoboy'}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Entrega Motoboy</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="sedex"
                      checked={formData.type === 'sedex'}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Sedex</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justificativa *</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => handleChange('justification', e.target.value)}
                placeholder="Descreva o motivo da solicitação"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chargedToClient">Cobrado do cliente *</Label>
              <Select
                id="chargedToClient"
                value={formData.chargedToClient === true ? 'sim' : formData.chargedToClient === false && formData.chargedToClient !== ('' as unknown as boolean) ? 'nao' : ''}
                onChange={(e) => {
                  if (e.target.value === 'sim') handleChange('chargedToClient', true);
                  else if (e.target.value === 'nao') handleChange('chargedToClient', false);
                }}
                required
              >
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onCancel ? onCancel() : window.location.reload()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="whitespace-nowrap">
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}