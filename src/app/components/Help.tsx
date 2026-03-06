import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

interface HelpProps {
  onClose: () => void;
}

export function Help({ onClose }: HelpProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-4xl w-full my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ajuda - Sistema Óticas Carol</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Guide */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>Guia Rápido</span>
            </h3>
            <div className="bg-blue-50 p-4 rounded-md space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Para Lojas:</strong> Acesse "Nova Solicitação" para criar pedidos de montagem ou motoboy.
                Acompanhe o status em "Minhas Solicitações".
              </p>
              <p className="text-sm text-gray-700">
                <strong>Para Aprovadores:</strong> Acesse "Aprovações" para revisar e aprovar/reprovar solicitações.
                Use "Extrato Mensal" para gerar relatórios financeiros.
              </p>
            </div>
          </div>

          {/* Creating Requests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Como Criar uma Solicitação</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Clique em "Nova Solicitação" no menu</li>
              <li>Selecione a loja e preencha o nome do solicitante</li>
              <li>Escolha o tipo: Montagem (Laboratório) ou Entrega Motoboy</li>
              <li>Informe o número da OS e o valor do serviço</li>
              <li>Escreva a justificativa detalhada</li>
              <li>Marque se o valor foi cobrado do cliente</li>
              <li>Clique em "Enviar para Aprovação"</li>
            </ol>
            <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-md flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Todos os campos marcados com * são obrigatórios. A solicitação será enviada com status "Pendente".
              </p>
            </div>
          </div>

          {/* Approving Requests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Como Aprovar/Reprovar Solicitações</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Acesse "Aprovações" no menu (apenas para aprovadores)</li>
              <li>Visualize todas as solicitações pendentes</li>
              <li>Clique no ícone do olho para ver detalhes completos</li>
              <li>Clique no botão verde ✓ para aprovar ou vermelho ✕ para reprovar</li>
              <li>Para reprovação, adicione uma observação obrigatória explicando o motivo</li>
              <li>Confirme a ação</li>
            </ol>
            <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Todas as aprovações/reprovações ficam registradas com data, hora e responsável.
              </p>
            </div>
          </div>

          {/* Monthly Reports */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Como Gerar Extrato Mensal</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Acesse "Extrato Mensal" no menu</li>
              <li>Selecione os filtros desejados (loja, mês/ano, tipo de serviço)</li>
              <li>Visualize os totais calculados automaticamente</li>
              <li>Clique em "PDF" para exportar relatório formatado</li>
              <li>Ou clique em "Excel" para exportar planilha CSV</li>
            </ol>
            <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Use o extrato em PDF para enviar ao laboratório e motoboy.
                Use o Excel para análises internas e conferências detalhadas.
              </p>
            </div>
          </div>

          {/* Status Guide */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Status das Solicitações</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Pendente
                </div>
                <span className="text-sm text-gray-700">Aguardando aprovação</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Aprovado
                </div>
                <span className="text-sm text-gray-700">Solicitação aprovada pelo aprovador</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Reprovado
                </div>
                <span className="text-sm text-gray-700">Solicitação reprovada (verifique a observação)</span>
              </div>
            </div>
          </div>

          {/* Notifications Guide */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Como Ativar Notificações</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Clique no ícone de <strong>sino (🔔)</strong> no canto superior direito</li>
              <li>Clique em <strong>"Ativar Notificações"</strong></li>
              <li>Quando o navegador pedir permissão, clique em <strong>"Permitir"</strong></li>
              <li>Pronto! Você receberá alertas em tempo real</li>
            </ol>
            <div className="mt-3 bg-orange-50 border border-orange-200 p-3 rounded-md">
              <p className="text-sm text-orange-900">
                <strong>⚠️ Bloqueou por engano?</strong><br />
                Clique no ícone de cadeado 🔒 na barra de endereços → 
                Localize "Notificações" → Altere para "Permitir" → 
                Recarregue a página e tente novamente.
              </p>
            </div>
            <div className="mt-2 bg-green-50 border border-green-200 p-3 rounded-md">
              <p className="text-sm text-green-800">
                <strong>✅ Você será notificado quando:</strong>
              </p>
              <ul className="mt-1 space-y-1 text-xs text-green-700 ml-4">
                <li>• <strong>Lojistas:</strong> Sua solicitação for aprovada ou reprovada</li>
                <li>• <strong>Aprovadores:</strong> Uma nova solicitação for criada</li>
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dicas Importantes</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Preencha sempre a justificativa de forma clara e detalhada</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Confira os dados antes de enviar - não é possível editar após o envio</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Marque corretamente se o valor foi cobrado do cliente para relatórios precisos</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Aprovadores: revise os detalhes completos antes de aprovar</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Gere os extratos mensais no início de cada mês para conciliação</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Mantenha a aba aberta em segundo plano para receber notificações</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={onClose} className="w-full">
              Entendi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}