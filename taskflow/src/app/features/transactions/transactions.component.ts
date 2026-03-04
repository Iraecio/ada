import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxCurrencyDirective } from 'ngx-currency';
import { ServicoConta } from '../../core/services/account.service';
import { ServicoNotificacao } from '../../core/services/notification.service';
import { Transacao } from '../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transacoes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxCurrencyDirective],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransacoesComponent {
  private readonly servicoConta = inject(ServicoConta);
  private readonly servicoNotificacao = inject(ServicoNotificacao);
  private readonly fb = inject(FormBuilder);
  
  transacoes$: Observable<Transacao[]>;
  tipoFiltro: 'todas' | 'receita' | 'despesa' = 'todas';
  private todasTransacoes: Transacao[] = [];
  
  mostrarFormularioDeposito = false;
  formularioDeposito: FormGroup;
  processando = false;
  mensagemSucesso = '';
  mensagemErro = '';

  opcoesMoeda = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: false,
    nullable: true,
  };

  constructor() {
    this.transacoes$ = this.servicoConta.transacoes$;
    this.servicoConta.transacoes$.subscribe((transacoes) => {
      this.todasTransacoes = transacoes;
    });
    
    this.formularioDeposito = this.fb.group({
      valor: ['', [Validators.required, Validators.min(0.01)]],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  get transacoesFiltradas(): Transacao[] {
    if (this.tipoFiltro === 'todas') {
      return this.todasTransacoes;
    }

    return this.todasTransacoes.filter(
      (t: Transacao) => t.tipo === this.tipoFiltro,
    );
  }

  definirFiltro(tipo: 'todas' | 'receita' | 'despesa'): void {
    this.tipoFiltro = tipo;
  }

  alternarFormularioDeposito(): void {
    this.mostrarFormularioDeposito = !this.mostrarFormularioDeposito;
    if (!this.mostrarFormularioDeposito) {
      this.formularioDeposito.reset();
      this.mensagemSucesso = '';
      this.mensagemErro = '';
    }
  }

  realizarDeposito(): void {
    if (this.formularioDeposito.invalid) {
      return;
    }

    this.processando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const { valor, descricao } = this.formularioDeposito.value;
    const dataAtual = new Date().toISOString();

    // Atualiza o saldo
    const saldoAtual = this.servicoConta.obterSaldo();
    const novoSaldo = saldoAtual + valor;
    this.servicoConta.atualizarSaldo(novoSaldo);

    // Adiciona transação de receita
    this.servicoConta.adicionarTransacao({
      data: dataAtual,
      descricao: descricao,
      valor: valor,
      tipo: 'receita',
    }).subscribe({
      next: () => {
        // Cria notificação
        this.servicoNotificacao.adicionarNotificacao({
          titulo: 'Depósito Realizado',
          mensagem: `Depósito de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} realizado com sucesso.`,
          tipo: 'sucesso',
          data: dataAtual,
          lida: false
        }).subscribe();

        this.mensagemSucesso = 'Depósito realizado com sucesso!';
        this.formularioDeposito.reset();
        this.processando = false;

        setTimeout(() => {
          this.mensagemSucesso = '';
          this.mostrarFormularioDeposito = false;
        }, 3000);
      },
      error: (erro) => {
        this.mensagemErro = 'Erro ao realizar depósito. Tente novamente.';
        console.error('Erro ao realizar depósito:', erro);
        this.processando = false;
      }
    });
  }
}
