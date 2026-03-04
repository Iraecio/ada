import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxCurrencyDirective } from 'ngx-currency';
import { ServicoEmprestimo } from '../../core/services/loan.service';
import { CalculoEmprestimo } from '../../models';
import { ServicoApi } from '../../core/services/api.service';
import { ServicoConta } from '../../core/services/account.service';
import { ServicoNotificacao } from '../../core/services/notification.service';

@Component({
  selector: 'app-simulador-emprestimo',
  imports: [CommonModule, ReactiveFormsModule, NgxCurrencyDirective],
  templateUrl: './loan-simulator.component.html',
  styleUrl: './loan-simulator.component.scss',
})
export class SimuladorEmprestimoComponent {
  private fb = inject(FormBuilder);
  private servicoEmprestimo = inject(ServicoEmprestimo);
  private servicoApi = inject(ServicoApi);
  private servicoConta = inject(ServicoConta);
  private servicoNotificacao = inject(ServicoNotificacao);

  formularioEmprestimo: FormGroup;
  calculo: CalculoEmprestimo | null = null;
  enviado = false;
  mostrarResultados = false;
  mensagemSucesso = '';

  opcoesMoeda = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: false,
    nullable: true,
  };
  mensagensErro: string[] = [];

  constructor() {
    this.formularioEmprestimo = this.fb.group({
      valor: [
        '',
        [Validators.required, Validators.min(100), Validators.max(100000)],
      ],
      parcelas: [
        '',
        [Validators.required, Validators.min(1), Validators.max(60)],
      ],
      taxaJuros: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
  }

  get f() {
    return this.formularioEmprestimo.controls;
  }

  aoCalcular(): void {
    this.enviado = true;
    this.mensagensErro = [];
    this.mensagemSucesso = '';

    if (this.formularioEmprestimo.invalid) {
      return;
    }

    const { valor, parcelas, taxaJuros } = this.formularioEmprestimo.value;

    const validacao = this.servicoEmprestimo.validarEmprestimo(
      valor,
      parcelas,
      taxaJuros,
    );

    if (!validacao.valido) {
      this.mensagensErro = validacao.erros;
      this.mostrarResultados = false;
      return;
    }

    this.calculo = this.servicoEmprestimo.calcularEmprestimo(
      valor,
      parcelas,
      taxaJuros,
    );
    this.mostrarResultados = true;
  }

  aoContratar(): void {
    if (!this.calculo || !this.formularioEmprestimo.valid) {
      return;
    }

    const emprestimo = {
      valor: this.formularioEmprestimo.value.valor,
      parcelas: this.formularioEmprestimo.value.parcelas,
      taxaJuros: this.formularioEmprestimo.value.taxaJuros,
      valorParcela: this.calculo.valorParcela,
      valorTotal: this.calculo.valorTotal,
      data: new Date().toISOString(),
    };

    this.servicoApi.adicionarEmprestimo(emprestimo).subscribe({
      next: () => {
        const saldoAtual = this.servicoConta.obterSaldo();
        const novoSaldo = saldoAtual + emprestimo.valor;
        this.servicoConta.atualizarSaldo(novoSaldo);

        this.servicoConta
          .adicionarTransacao({
            data: emprestimo.data,
            descricao: `Empréstimo contratado - ${emprestimo.parcelas}x de R$ ${emprestimo.valorParcela.toFixed(2)}`,
            valor: emprestimo.valor,
            tipo: 'receita',
          })
          .subscribe();

        this.servicoNotificacao
          .adicionarNotificacao({
            titulo: 'Empréstimo Aprovado',
            mensagem: `Empréstimo de ${emprestimo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} aprovado! ${emprestimo.parcelas}x de ${emprestimo.valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
            tipo: 'sucesso',
            data: new Date().toISOString(),
            lida: false,
          })
          .subscribe();

        this.mensagemSucesso = 'Empréstimo contratado com sucesso!';
        this.redefinir();

        setTimeout(() => {
          this.mensagemSucesso = '';
        }, 5000);
      },
      error: (erro) => {
        this.mensagensErro = ['Erro ao contratar empréstimo. Tente novamente.'];
        console.error('Erro ao contratar empréstimo:', erro);
      },
    });
  }

  redefinir(): void {
    this.formularioEmprestimo.reset();
    this.calculo = null;
    this.enviado = false;
    this.mostrarResultados = false;
    this.mensagensErro = [];
  }
}
