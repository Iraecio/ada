import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notificacao } from '../../models';
import { ServicoApi } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ServicoNotificacao {
  private servicoApi = inject(ServicoApi);
  
  private notificacoesSubject = new BehaviorSubject<Notificacao[]>([]);
  private notificacoesNaoLidasSubject = new BehaviorSubject<number>(0);
  
  public notificacoes$ = this.notificacoesSubject.asObservable();
  public notificacoesNaoLidas$ = this.notificacoesNaoLidasSubject.asObservable();

  carregarNotificacoes(): void {
    this.servicoApi.obterNotificacoes().subscribe({
      next: (notificacoes) => {
        const notificacoesOrdenadas = notificacoes.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        this.notificacoesSubject.next(notificacoesOrdenadas);
        this.notificacoesNaoLidasSubject.next(
          notificacoes.filter(n => !n.lida).length
        );
      },
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  adicionarNotificacao(notificacao: Omit<Notificacao, 'id'>): Observable<Notificacao> {
    return this.servicoApi.adicionarNotificacao(notificacao).pipe(
      tap(() => {
        // Recarrega as notificações após adicionar uma nova
        this.carregarNotificacoes();
      })
    );
  }

  marcarComoLida(id: string): Observable<Notificacao> {
    return this.servicoApi.marcarNotificacaoComoLida(id).pipe(
      tap(() => {
        // Atualiza a lista local
        const notificacoesAtuais = this.notificacoesSubject.value;
        const notificacoesAtualizadas = notificacoesAtuais.map(n => 
          n.id === id ? { ...n, lida: true } : n
        );
        this.notificacoesSubject.next(notificacoesAtualizadas);
        this.notificacoesNaoLidasSubject.next(
          notificacoesAtualizadas.filter(n => !n.lida).length
        );
      })
    );
  }

  obterNotificacoesNaoLidas(): number {
    return this.notificacoesNaoLidasSubject.value;
  }
}
