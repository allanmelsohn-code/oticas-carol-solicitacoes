import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { servicePrices as servicePricesApi } from '../../../lib/api';
import type { ServicePrice } from '../../../types';
import { formatCurrency } from '../../../utils/currency';

interface ServicePricePageProps {
  // sem props por enquanto — usa usuário do contexto via API
}

type EditingState = { id: string; description: string; price: string } | null;

interface SectionProps {
  title: string;
  type: 'montagem' | 'motoboy';
  items: ServicePrice[];
  editing: EditingState;
  adding: { type: 'montagem' | 'motoboy'; description: string; price: string } | null;
  onStartAdd: (type: 'montagem' | 'motoboy') => void;
  onCancelAdd: () => void;
  onConfirmAdd: (type: 'montagem' | 'motoboy') => void;
  onAddChange: (field: 'description' | 'price', value: string) => void;
  onStartEdit: (p: ServicePrice) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (field: 'description' | 'price', value: string) => void;
  onDelete: (id: string) => void;
}

function Section({
  title, type, items, editing, adding,
  onStartAdd, onCancelAdd, onConfirmAdd, onAddChange,
  onStartEdit, onCancelEdit, onSaveEdit, onEditChange,
  onDelete,
}: SectionProps) {
  const rowBase = 'flex items-center gap-2 text-xs py-2 border-b border-gray-100 last:border-0';
  const inputCls = 'flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500';
  const btnIcon = 'p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
        <button
          onClick={() => onStartAdd(type)}
          className="flex items-center gap-1 text-xs text-gray-700 font-semibold hover:text-gray-900"
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>

      {items.length === 0 && !(adding?.type === type) && (
        <p className="text-xs text-gray-400 py-2">Nenhum serviço cadastrado.</p>
      )}

      {items.map(p => (
        <div key={p.id} className={rowBase}>
          {editing?.id === p.id ? (
            <>
              <input
                className={inputCls}
                value={editing.description}
                onChange={e => onEditChange('description', e.target.value)}
                placeholder="Descrição"
                autoFocus
              />
              <input
                className="w-24 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500"
                type="number"
                step="0.01"
                value={editing.price}
                onChange={e => onEditChange('price', e.target.value)}
                placeholder="Valor"
              />
              <button onClick={onSaveEdit} className={btnIcon}><Check size={13} className="text-green-600" /></button>
              <button onClick={onCancelEdit} className={btnIcon}><X size={13} /></button>
            </>
          ) : (
            <>
              <span className="flex-1 text-gray-700">{p.description}</span>
              <span className="w-24 font-semibold text-gray-900 tabular-nums">{formatCurrency(p.price)}</span>
              <button onClick={() => onStartEdit(p)} className={btnIcon}><Pencil size={12} /></button>
              <button onClick={() => onDelete(p.id)} className={btnIcon}><Trash2 size={12} /></button>
            </>
          )}
        </div>
      ))}

      {adding?.type === type && (
        <div className={rowBase}>
          <input
            className={inputCls}
            value={adding.description}
            onChange={e => onAddChange('description', e.target.value)}
            placeholder="Descrição do serviço"
            autoFocus
          />
          <input
            className="w-24 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500"
            type="number"
            step="0.01"
            value={adding.price}
            onChange={e => onAddChange('price', e.target.value)}
            placeholder="Valor"
          />
          <button onClick={() => onConfirmAdd(type)} className={btnIcon}><Check size={13} className="text-green-600" /></button>
          <button onClick={onCancelAdd} className={btnIcon}><X size={13} /></button>
        </div>
      )}
    </div>
  );
}

export function ServicePricePage(_props: ServicePricePageProps) {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);
  const [adding, setAdding] = useState<{ type: 'montagem' | 'motoboy'; description: string; price: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicePricesApi.getAll();
      setPrices(data.prices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preços');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (type: 'montagem' | 'motoboy') => {
    if (!adding || !adding.description.trim()) return;
    const parsedPrice = parseFloat(adding.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;
    try {
      await servicePricesApi.create({
        description: adding.description.trim(),
        price: parsedPrice,
        type,
      });
      setAdding(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar preço');
    }
  };

  const handleSaveEdit = async () => {
    if (!editing || !editing.description.trim()) return;
    const parsedPrice = parseFloat(editing.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;
    try {
      await servicePricesApi.update(editing.id, {
        description: editing.description.trim(),
        price: parsedPrice,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar preço');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este preço?')) return;
    try {
      await servicePricesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover preço');
    }
  };

  const handleAddChange = (field: 'description' | 'price', value: string) => {
    setAdding(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleEditChange = (field: 'description' | 'price', value: string) => {
    setEditing(prev => prev ? { ...prev, [field]: value } : null);
  };

  const montagem = prices.filter(p => p.type === 'montagem');
  const motoboy = prices.filter(p => p.type === 'motoboy');

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <span>{error}</span>
          <button 
            onClick={load}
            className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors font-semibold"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
      ) : (
        <>
          <Section
            title="Montagem (Laboratório)"
            type="montagem"
            items={montagem}
            editing={editing}
            adding={adding}
            onStartAdd={(type) => setAdding({ type, description: '', price: '' })}
            onCancelAdd={() => setAdding(null)}
            onConfirmAdd={handleAdd}
            onAddChange={handleAddChange}
            onStartEdit={(p) => setEditing({ id: p.id, description: p.description, price: String(p.price) })}
            onCancelEdit={() => setEditing(null)}
            onSaveEdit={handleSaveEdit}
            onEditChange={handleEditChange}
            onDelete={handleDelete}
          />
          <Section
            title="Entrega Motoboy"
            type="motoboy"
            items={motoboy}
            editing={editing}
            adding={adding}
            onStartAdd={(type) => setAdding({ type, description: '', price: '' })}
            onCancelAdd={() => setAdding(null)}
            onConfirmAdd={handleAdd}
            onAddChange={handleAddChange}
            onStartEdit={(p) => setEditing({ id: p.id, description: p.description, price: String(p.price) })}
            onCancelEdit={() => setEditing(null)}
            onSaveEdit={handleSaveEdit}
            onEditChange={handleEditChange}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
