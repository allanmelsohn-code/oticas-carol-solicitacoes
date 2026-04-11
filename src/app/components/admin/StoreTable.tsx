// src/app/components/admin/StoreTable.tsx
import { Pencil, Trash2 } from 'lucide-react';
import type { Store } from '../../../types';

interface StoreTableProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (storeId: string) => void;
  readOnly?: boolean;
}

export function StoreTable({ stores, onEdit, onDelete, readOnly = false }: StoreTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {stores.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Nenhuma loja cadastrada.</div>
      ) : (
        stores.map(store => (
          <div key={store.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
              {(store.code ?? store.name).slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{store.name}</div>
              {store.code && <div className="text-xs text-gray-400">Código: {store.code}</div>}
            </div>
            {!readOnly && (
              <div className="flex gap-1.5">
                <button onClick={() => onEdit(store)} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Editar loja">
                  <Pencil size={11} className="text-gray-500" />
                </button>
                <button onClick={() => onDelete(store.id)} className="w-7 h-7 rounded-md border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors" aria-label="Excluir loja">
                  <Trash2 size={11} className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
