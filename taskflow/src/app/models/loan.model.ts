export interface Emprestimo {
  id?: string;
  valor: number;
  parcelas: number;
  taxaJuros: number;
  valorParcela?: number;
  valorTotal?: number;
  data?: string;
}

export interface CalculoEmprestimo {
  valorParcela: number;
  valorTotal: number;
  jurosTotal: number;
}
