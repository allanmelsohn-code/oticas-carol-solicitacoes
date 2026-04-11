// src/app/components/requests/RequestRow.tsx
import { ChevronRight } from 'lucide-react';
import { REQUEST_TYPE_LABELS } from '../../../types';
import type { Request, ApprovalInfo } from '../../../types';
import { RequestDropdown } from './RequestDropdown';

interface RequestRowProps {
  request: Request;
  isOpen: boolean;
  onToggle: () => void;
  approval?: ApprovalInfo | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending-text)',  label: 'Pendente'  },
  approved: { bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved-text)', label: 'Aprovado'  },
  rejected: { bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected-text)', label: 'Reprovado' },
};

const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export function RequestRow({ request, isOpen, onToggle, approval }: RequestRowProps) {
  const s = STATUS_STYLES[request.status] ?? STATUS_STYLES.pending;
  const isRejected = request.status === 'rejected';

  return (
    <>
      <div
        className="grid items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 select-none gap-3"
        style={{
          gridTemplateColumns: '16px minmax(100px,1.5fr) 80px 80px 80px minmax(80px,1fr) 80px',
          background: isRejected && !isOpen ? 'var(--color-status-rejected-row)' : undefined,
        }}
        onClick={onToggle}
      >
        <ChevronRight
          size={12}
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
        <span className="text-xs font-medium text-gray-700 truncate">{request.storeName}</span>
        <span className="text-xs text-gray-500">{REQUEST_TYPE_LABELS[request.type]}</span>
        <span className="text-xs font-semibold text-gray-900 tabular-nums">
          {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(request.value)}
        </span>
        <span className="text-xs text-gray-400">{fmtDate(request.date)}</span>
        <span className="text-xs text-gray-400">OS #{request.osNumber}</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full justify-self-end"
          style={{ background: s.bg, color: s.text }}
        >
          {s.label}
        </span>
      </div>
      {isOpen && <RequestDropdown request={request} approval={approval} />}
    </>
  );
}
