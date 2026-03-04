import { Injectable } from '@angular/core';
import { CalculoEmprestimo } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ServicoEmprestimo {
  
  calcularEmprestimo(valor: number, parcelas: number, taxaAnual: number): CalculoEmprestimo {
    const taxaMensal = taxaAnual / 100 / 12;

    let valorParcela: number;
    
    if (taxaMensal === 0) {
      valorParcela = valor / parcelas;
    } else {
      const fator = Math.pow(1 + taxaMensal, parcelas);
      valorParcela = valor * (taxaMensal * fator) / (fator - 1);
    }

    const valorTotal = valorParcela * parcelas;
    const jurosTotal = valorTotal - valor;

    return {
      valorParcela: Math.round(valorParcela * 100) / 100,
      valorTotal: Math.round(valorTotal * 100) / 100,
      jurosTotal: Math.round(jurosTotal * 100) / 100
    };
  }

  validarEmprestimo(valor: number, parcelas: number, taxa: number): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    if (valor <= 0) {
      erros.push('O valor do empréstimo deve ser maior que zero');
    }

    if (valor > 100000) {
      erros.push('O valor máximo do empréstimo é R$ 100.000,00');
    }

    if (parcelas < 1) {
      erros.push('O número de parcelas deve ser no mínimo 1');
    }

    if (parcelas > 60) {
      erros.push('O número máximo de parcelas é 60');
    }

    if (taxa < 0) {
      erros.push('A taxa de juros não pode ser negativa');
    }

    if (taxa > 100) {
      erros.push('A taxa de juros não pode ser maior que 100%');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }
}
