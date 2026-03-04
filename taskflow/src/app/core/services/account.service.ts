import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { Conta, Transacao, Transferencia } from '../../models';
import { ServicoApi } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ServicoConta {
  private servicoApi = inject(ServicoApi);

  private contaSubject = new BehaviorSubject<Conta | null>(null);
  private transacoesSubject = new BehaviorSubject<Transacao[]>([]);
  private carregandoSubject = new BehaviorSubject<boolean>(false);

  public conta$ = this.contaSubject.asObservable();
  public transacoes$ = this.transacoesSubject.asObservable();
  public carregando$ = this.carregandoSubject.asObservable();

  constructor() {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    this.carregandoSubject.next(true);

    this.servicoApi
      .obterConta()
      .pipe(finalize(() => this.carregandoSubject.next(false)))
      .subscribe({
        next: (conta) => this.contaSubject.next(conta),
        error: (erro) => console.error('Erro ao carregar conta:', erro),
      });

    this.servicoApi.obterTransacoes().subscribe({
      next: (transacoes) => {
        // Ordena transações por data decrescente (mais recentes primeiro)
        const transacoesOrdenadas = [...transacoes].sort((a, b) => {
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        });
        this.transacoesSubject.next(transacoesOrdenadas);
      },
      error: (erro) => console.error('Erro ao carregar transações:', erro),
    });
  }

  obterSaldo(): number {
    return this.contaSubject.value?.saldo || 0;
  }

  atualizarSaldo(novoSaldo: number): void {
    const contaAtual = this.contaSubject.value;
    if (contaAtual) {
      this.servicoApi.atualizarSaldoConta(novoSaldo).subscribe({
        next: (conta) => this.contaSubject.next(conta),
        error: (erro) => console.error('Erro ao atualizar saldo:', erro),
      });
    }
  }

  adicionarTransacao(transacao: Omit<Transacao, 'id'>): Observable<Transacao> {
    return this.servicoApi.adicionarTransacao(transacao).pipe(
      tap((novaTransacao) => {
        const transacoesAtuais = this.transacoesSubject.value;
        this.transacoesSubject.next([novaTransacao, ...transacoesAtuais]);
      }),
    );
  }

  executarTransferencia(
    transferencia: Transferencia,
  ): Observable<Transferencia> {
    const saldoAtual = this.obterSaldo();
    
    // Validação de saldo insuficiente
    if (transferencia.valor > saldoAtual) {
      throw new Error(`Saldo insuficiente. Saldo disponível: R$ ${saldoAtual.toFixed(2)}`);
    }
    
    if (transferencia.valor <= 0) {
      throw new Error('O valor da transferência deve ser maior que zero');
    }
    
    const novoSaldo = saldoAtual - transferencia.valor;

    this.atualizarSaldo(novoSaldo);

    this.adicionarTransacao({
      data: transferencia.data,
      descricao: `Transferência para ${transferencia.contaDestino}`,
      valor: -transferencia.valor,
      tipo: 'despesa',
    }).subscribe();

    return this.servicoApi.adicionarTransferencia(transferencia);
  }

  atualizarDados(): void {
    this.carregarDadosIniciais();
  }

  obterTotalReceitas(): number {
    return this.transacoesSubject.value
      .filter((t) => t.tipo === 'receita')
      .reduce((soma, t) => soma + t.valor, 0);
  }

  obterTotalDespesas(): number {
    return this.transacoesSubject.value
      .filter((t) => t.tipo === 'despesa')
      .reduce((soma, t) => soma + Math.abs(t.valor), 0);
  }

  obterTotalTransacoes(): number {
    return this.transacoesSubject.value.length;
  }
}
