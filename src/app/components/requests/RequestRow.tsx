// src/app/components/requests/RequestRow.tsx
import { ChevronRight } from 'lucide-react';
import { REQUEST_TYPE_LABELS } from '../../../types';
import type { Request } from '../../../types';
import { RequestDropdown } from './RequestDropdown';

interface ApprovalInfo {
  approverName: string;
  observation: string;
  action: string;
  timestamp: string;
}

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

export function RequestRow({ request, isOpen, onToggle, approval }: RequestRowProps) {
  const s = STATUS_STYLES[request.status] ?? STATUS_STYLES.pending;
  const isRejected = request.status === 'rejected';

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 select-none"
        style={isRejected && !isOpen ? { background: '#fff9f9' } : undefined}
        onClick={onToggle}
      >
        <ChevronRight
          size={12}
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
        <span className="w-20 text-xs font-medium text-gray-700 truncate">{request.storeName}</span>
        <span className="w-16 text-xs text-gray-500">{REQUEST_TYPE_LABELS[request.type]}</span>
        <span className="w-14 text-xs font-semibold text-gray-900 tabular-nums">
          {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(request.value)}
        </span>
        <span className="w-14 text-xs text-gray-400 hidden sm:block">{request.date}</span>
        <span className="flex-1 text-xs text-gray-400 hidden md:block">OS #{request.osNumber}</span>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: s.bg, color: s.text }}
        >
          {s.label}
        </span>
      </div>
      {isOpen && <RequestDropdown request={request} approval={approval} />}
    </>
  );
}
