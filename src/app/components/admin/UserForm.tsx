// src/app/components/admin/UserForm.tsx
import { useState } from 'react';
import type { User, Store } from '../../../types';

interface UserFormProps {
  initial?: Partial<User>;
  stores: Store[];
  onSubmit: (data: Partial<User> & { password?: string }) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ initial, stores, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState<User['role']>(initial?.role ?? 'store');
  const [storeId, setStoreId] = useState(initial?.storeId ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isNew = !initial?.id;
  const inputCls = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSaving(true);
    try {
      await onSubmit({
        id: initial?.id,
        name,
        email,
        role,
        storeId: (role === 'store' || role === 'approver_store') ? storeId : undefined,
        password: password || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-sm font-bold text-gray-900">{isNew ? 'Novo Usuário' : 'Editar Usuário'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Nome *</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Email *</label>
          <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Perfil *</label>
          <select className={inputCls} value={role} onChange={e => setRole(e.target.value as User['role'])}>
            <option value="store">Loja (solicitante)</option>
            <option value="approver">Aprovador</option>
            <option value="approver_store">Aprovador + Solicitante</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>
        {(role === 'store' || role === 'approver_store') && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Loja</label>
            <select className={inputCls} value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value="">Selecionar loja...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
            Senha {isNew ? '*' : '(deixe em branco para não alterar)'}
          </label>
          <input
            className={inputCls}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={isNew}
            placeholder={isNew ? '' : 'Nova senha...'}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="text-xs px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Salvando...' : isNew ? 'Criar usuário' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
