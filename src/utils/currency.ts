/**
 * Formata um número para o formato de moeda brasileira (R$ X.XXX,XX)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Converte uma string de moeda brasileira para número
 * Ex: "R$ 1.234,56" -> 1234.56
 */
export function parseCurrency(value: string): number {
  const cleanValue = value
    .replace(/[^\d,]/g, '') // Remove tudo exceto dígitos e vírgula
    .replace(',', '.'); // Substitui vírgula por ponto
  
  return parseFloat(cleanValue) || 0;
}
