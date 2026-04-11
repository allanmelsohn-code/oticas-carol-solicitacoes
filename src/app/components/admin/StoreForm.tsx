// src/app/components/admin/StoreForm.tsx
import { useState } from 'react';
import type { Store } from '../../../types';

interface StoreFormProps {
  initial?: Partial<Store>;
  onSubmit: (data: Partial<Store>) => Promise<void>;
  onCancel: () => void;
}

export function StoreForm({ initial, onSubmit, onCancel }: StoreFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [saving, setSaving] = useState(false);
  const isNew = !initial?.id;
  const inputCls = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ id: initial?.id, name, code });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-sm font-bold text-gray-900">{isNew ? 'Nova Loja' : 'Editar Loja'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Nome *</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Código *</label>
          <input className={inputCls} value={code} onChange={e => setCode(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="text-xs px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Salvando...' : isNew ? 'Criar loja' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
