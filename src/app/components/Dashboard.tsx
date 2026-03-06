import { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { LoadingState } from './ui/empty-state';
import { dashboard } from '../../lib/api';
import type { Stats } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DashboardProps {
  onNavigate?: (view: string, filter?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await dashboard.getStats();
      setStats(result.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const statCards = [
    {
      title: 'Total de Solicitações',
      value: stats?.totalRequests || 0,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      filter: 'all',
    },
    {
      title: 'Pendentes',
      value: stats?.pendingRequests || 0,
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      filter: 'pending',
    },
    {
      title: 'Aprovadas',
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      filter: 'approved',
    },
    {
      title: 'Reprovadas',
      value: stats?.rejectedRequests || 0,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      filter: 'rejected',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral das operações</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={() => onNavigate?.('requests', stat.filter)}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Mês Atual</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total de Solicitações</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.thisMonthCount || 0}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">Valor Total</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.thisMonthTotal || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Aprovadas</span>
              </div>
              <span className="font-semibold text-green-600">{stats?.approvedRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-600">Aguardando Aprovação</span>
              </div>
              <span className="font-semibold text-amber-600">{stats?.pendingRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Reprovadas</span>
              </div>
              <span className="font-semibold text-red-600">{stats?.rejectedRequests || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}