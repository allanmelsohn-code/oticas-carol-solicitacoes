// src/app/components/requests/RequestDropdown.tsx
import { Calendar, DollarSign, Hash, User, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { REQUEST_TYPE_LABELS } from '../../../types';
import type { Request } from '../../../types';

interface ApprovalInfo {
  approverName: string;
  observation: string;
  action: string;
  timestamp: string;
}

interface RequestDropdownProps {
  request: Request;
  approval?: ApprovalInfo | null;
}

export function RequestDropdown({ request, approval }: RequestDropdownProps) {
  const isRejected = request.status === 'rejected';
  const isApproved = request.status === 'approved';

  return (
    <div
      className="border-b"
      style={{
        background: isRejected ? '#fff5f5' : isApproved ? '#f8faff' : '#f9fafb',
        borderColor: 'var(--color-border)',
        padding: '0 12px 12px 40px',
      }}
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Detalhes */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Detalhes</div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={Calendar} label={request.date} />
            <Chip icon={DollarSign} label={new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(request.value)} />
            <Chip icon={Hash} label={`OS #${request.osNumber}`} />
            <Chip icon={User} label={request.requestedBy} />
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border"
              style={request.chargedToClient
                ? { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }
                : { background: '#fefce8', borderColor: '#fde68a', color: '#92400e' }}
            >
              {request.chargedToClient ? 'Cobrado do cliente' : 'Não cobrado do cliente'}
            </span>
            <span className="inline-flex items-center text-[10px] px-2 py-1 rounded-md border bg-gray-50 border-gray-200 text-gray-600">
              {REQUEST_TYPE_LABELS[request.type]}
            </span>
          </div>
        </div>

        {/* Justificativa */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            <MessageSquare size={9} /> Justificativa
          </div>
          <p className="text-xs text-gray-600 italic leading-relaxed">"{request.justification}"</p>
        </div>

        {/* Observação do aprovador */}
        {approval && (
          <div className="px-3 py-2.5">
            <div
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: isApproved ? '#16a34a' : '#dc2626' }}
            >
              {isApproved ? <CheckCircle size={9} /> : <XCircle size={9} />}
              {isApproved ? 'Observação do aprovador' : 'Motivo da reprovação'}
            </div>
            <div
              className="rounded-md p-2.5 text-xs leading-relaxed"
              style={isApproved
                ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }
                : { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}
            >
              <div className="font-semibold text-[10px] mb-1">
                {approval.approverName} · {approval.timestamp}
              </div>
              "{approval.observation}"
            </div>
          </div>
        )}
      </div>
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
