// src/app/components/admin/UserTable.tsx
import { Pencil, Trash2 } from 'lucide-react';
import type { User } from '../../../types';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  approver: { bg: '#ede9fe', text: '#6d28d9', label: 'Aprovador' },
  store:    { bg: '#dbeafe', text: '#1d4ed8', label: 'Loja'      },
  viewer:   { bg: '#f3f4f6', text: '#6b7280', label: 'Visualizador' },
};

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {users.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Nenhum usuário encontrado.</div>
      ) : (
        users.map(u => {
          const rs = ROLE_STYLES[u.role] ?? ROLE_STYLES.viewer;
          return (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                {u.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{u.name}</div>
                <div className="text-xs text-gray-400 truncate">{u.email}</div>
              </div>
              <span className="text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: rs.bg, color: rs.text }}>
                {rs.label}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => onEdit(u)} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Editar usuário">
                  <Pencil size={11} className="text-gray-500" />
                </button>
                <button onClick={() => onDelete(u.id)} className="w-7 h-7 rounded-md border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors" aria-label="Excluir usuário">
                  <Trash2 size={11} className="text-red-500" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
