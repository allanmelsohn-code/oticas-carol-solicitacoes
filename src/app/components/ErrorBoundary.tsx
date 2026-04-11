// src/app/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full shadow-sm text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Algo deu errado</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message ?? 'Erro inesperado. Tente recarregar a página.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={14} />
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
