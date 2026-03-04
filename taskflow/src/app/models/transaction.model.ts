export interface Transacao {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
}
