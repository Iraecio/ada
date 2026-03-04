import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicoConta } from '../../core/services/account.service';
import { Observable } from 'rxjs';
import { Conta, Transacao } from '../../models';

@Component({
  selector: 'app-painel',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class PainelComponent {
  private servicoConta = inject(ServicoConta);
  
  conta$: Observable<Conta | null>;
  transacoes$: Observable<Transacao[]>;
  carregando$: Observable<boolean>;
  transacaoSelecionada: Transacao | null = null;
  mostrarModal = false;

  constructor() {
    this.conta$ = this.servicoConta.conta$;
    this.transacoes$ = this.servicoConta.transacoes$;
    this.carregando$ = this.servicoConta.carregando$;
  }

  get totalReceitas(): number {
    return this.servicoConta.obterTotalReceitas();
  }

  get totalDespesas(): number {
    return this.servicoConta.obterTotalDespesas();
  }

  get totalTransacoes(): number {
    return this.servicoConta.obterTotalTransacoes();
  }

  atualizarDados(): void {
    this.servicoConta.atualizarDados();
  }

  abrirDetalhesTransacao(transacao: Transacao): void {
    this.transacaoSelecionada = transacao;
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.transacaoSelecionada = null;
  }
}
