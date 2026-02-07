import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';
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
      console.log('🔄 Loading dashboard stats...');
      const result = await dashboard.getStats();
      console.log('✅ Stats loaded successfully:', result);
      setStats(result.stats);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Show user-friendly error
      alert('Erro ao carregar estatísticas. Por favor, faça login novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Solicitações',
      value: stats?.totalRequests || 0,
      icon: FileText,
      color: 'bg-blue-500',
      filter: 'all',
    },
    {
      title: 'Pendentes',
      value: stats?.pendingRequests || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      filter: 'pending',
    },
    {
      title: 'Aprovadas',
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      filter: 'approved',
    },
    {
      title: 'Reprovadas',
      value: stats?.rejectedRequests || 0,
      icon: XCircle,
      color: 'bg-red-500',
      filter: 'rejected',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visão geral das operações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={() => onNavigate?.('requests', stat.filter)}
              className="relative group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Mês Atual</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Solicitações</span>
                <span className="text-2xl font-bold text-gray-900">{stats?.thisMonthCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor Total</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.thisMonthTotal || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Resumo Financeiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Solicitações Aprovadas</span>
                <span className="font-semibold text-green-600">{stats?.approvedRequests || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Aguardando Aprovação</span>
                <span className="font-semibold text-yellow-600">{stats?.pendingRequests || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Reprovadas</span>
                <span className="font-semibold text-red-600">{stats?.rejectedRequests || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}