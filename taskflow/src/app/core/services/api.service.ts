import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Conta,
  Transacao,
  Transferencia,
  Emprestimo,
  Notificacao,
} from '../../models';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ServicoApi {
  private readonly http = inject(HttpClient);

  private readonly urlApi = environment.apiUrl;
 
  obterConta(): Observable<Conta> {
    return this.http.get<Conta>(`${this.urlApi}/account`);
  }

  atualizarSaldoConta(saldo: number): Observable<Conta> {
    return this.http.patch<Conta>(`${this.urlApi}/account`, { saldo });
  }

  obterTransacoes(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.urlApi}/transactions`);
  }

  adicionarTransacao(transacao: Omit<Transacao, 'id'>): Observable<Transacao> {
    return this.http.post<Transacao>(`${this.urlApi}/transactions`, transacao);
  }

  obterTransferencias(): Observable<Transferencia[]> {
    return this.http.get<Transferencia[]>(`${this.urlApi}/transfers`);
  }

  adicionarTransferencia(
    transferencia: Transferencia,
  ): Observable<Transferencia> {
    return this.http.post<Transferencia>(
      `${this.urlApi}/transfers`,
      transferencia,
    );
  }

  obterEmprestimos(): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(`${this.urlApi}/loans`);
  }

  adicionarEmprestimo(emprestimo: Emprestimo): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${this.urlApi}/loans`, emprestimo);
  }

  obterNotificacoes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.urlApi}/notificacoes`);
  }

  marcarNotificacaoComoLida(id: string): Observable<Notificacao> {
    return this.http.patch<Notificacao>(`${this.urlApi}/notificacoes/${id}`, {
      lida: true,
    });
  }

  adicionarNotificacao(notificacao: Omit<Notificacao, 'id'>): Observable<Notificacao> {
    return this.http.post<Notificacao>(`${this.urlApi}/notificacoes`, notificacao);
  }
}
