import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, DollarSign, Hash, User, Clock } from 'lucide-react';
import { requests as requestsApi, approvals as approvalsApi } from '../../lib/api';
import { REQUEST_TYPE_LABELS } from '../../types';
import type { Request } from '../../types';

interface ApprovalPanelProps {
  onActionComplete?: () => void;
}

export function ApprovalPanel({ onActionComplete }: ApprovalPanelProps) {
  const [pending, setPending] = useState<Request[]>([]);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await requestsApi.getAll();
      setPending((res.requests ?? []).filter((r: Request) => r.status === 'pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    const obs = observations[requestId] ?? '';
    if (action === 'rejected' && !obs.trim()) {
      alert('Observação é obrigatória para reprovar.');
      return;
    }
    setProcessing(requestId);
    try {
      await approvalsApi.process(requestId, action, obs || undefined);
      setPending(prev => prev.filter(r => r.id !== requestId));
      onActionComplete?.();
    } catch (err) {
      console.error(err);
      alert('Erro ao processar aprovação. Tente novamente.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sm text-gray-400">Carregando...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Aprovações</h1>
        <span className="text-xs text-gray-500">
          {pending.length} pendente{pending.length !== 1 ? 's' : ''}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CheckCircle size={28} className="mx-auto mb-3 text-green-500" />
          <div className="text-sm font-semibold text-gray-700">Tudo aprovado</div>
          <div className="text-xs text-gray-400 mt-1">Nenhuma solicitação pendente.</div>
        </div>
      ) : (
        pending.map(req => (
          <div
            key={req.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-semibold text-gray-800">{req.storeName}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {REQUEST_TYPE_LABELS[req.type]} · {req.requestedBy}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                <Clock size={10} />
                Pendente
              </div>
            </div>

            {/* Detail chips */}
            <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2">
              <Chip icon={Calendar} label={new Date(req.date).toLocaleDateString('pt-BR')} />
              <Chip
                icon={DollarSign}
                label={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(req.value)}
              />
              <Chip icon={Hash} label={`OS #${req.osNumber}`} />
              <Chip icon={User} label={req.requestedBy} />
              {req.chargedToClient && (
                <span className="inline-flex items-center text-[10px] px-2 py-1 rounded-md border bg-green-50 border-green-200 text-green-700">
                  Cobrado do cliente
                </span>
              )}
            </div>

            {/* Justification */}
            {req.justification && (
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Justificativa</div>
                <p className="text-xs text-gray-600 italic">"{req.justification}"</p>
              </div>
            )}

            {/* Observation input + action buttons */}
            <div className="px-4 py-3">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Observação{' '}
                {processing !== req.id && (
                  <span className="text-gray-300">(obrigatória para reprovar)</span>
                )}
              </label>
              <textarea
                rows={2}
                placeholder="Digite uma observação..."
                value={observations[req.id] ?? ''}
                onChange={e => setObservations(prev => ({ ...prev, [req.id]: e.target.value }))}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none mb-3"
                disabled={processing === req.id}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req.id, 'approved')}
                  disabled={processing === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}
                >
                  <CheckCircle size={13} />
                  {processing === req.id ? 'Processando...' : 'Aprovar'}
                </button>
                <button
                  onClick={() => handleAction(req.id, 'rejected')}
                  disabled={processing === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}
                >
                  <XCircle size={13} />
                  {processing === req.id ? 'Processando...' : 'Reprovar'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border bg-gray-50 border-gray-200 text-gray-600">
      <Icon size={9} className="text-gray-400" />
      {label}
    </span>
  );
}
