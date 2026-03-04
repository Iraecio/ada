import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicoConta } from '../../../core/services/account.service';
import { ServicoNotificacao } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { Conta, Notificacao } from '../../../models';

@Component({
  selector: 'app-cabecalho',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class CabecalhoComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  conta$: Observable<Conta | null>;
  emFullscreen = false;
  notificacoes$: Observable<Notificacao[]>;
  notificacoesNaoLidas$: Observable<number>;
  mostrarNotificacoes = false;

  constructor(
    private servicoConta: ServicoConta,
    private servicoNotificacao: ServicoNotificacao
  ) {
    this.conta$ = this.servicoConta.conta$;
    this.notificacoes$ = this.servicoNotificacao.notificacoes$;
    this.notificacoesNaoLidas$ = this.servicoNotificacao.notificacoesNaoLidas$;
  }

  ngOnInit(): void {
    this.servicoNotificacao.carregarNotificacoes();
  }

  alternarNotificacoes(): void {
    this.mostrarNotificacoes = !this.mostrarNotificacoes;
  }

  marcarComoLida(notificacao: Notificacao): void {
    if (!notificacao.lida) {
      this.servicoNotificacao.marcarComoLida(notificacao.id).subscribe({
        next: () => {
          // A atualização já é feita pelo serviço
        },
        error: (err) => console.error('Erro ao marcar notificação:', err)
      });
    }
  }

  obterIconeNotificacao(tipo: string): string {
    const icones: Record<string, string> = {
      'info': 'bi-info-circle',
      'sucesso': 'bi-check-circle',
      'alerta': 'bi-exclamation-triangle',
      'erro': 'bi-x-circle'
    };
    return icones[tipo] || 'bi-info-circle';
  }

  obterCorNotificacao(tipo: string): string {
    const cores: Record<string, string> = {
      'info': 'info',
      'sucesso': 'sucesso',
      'alerta': 'alerta',
      'erro': 'erro'
    };
    return cores[tipo] || 'info';
  }

  @HostListener('document:click', ['$event'])
  fecharDropdownAoClicarFora(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isNotificacaoButton = target.closest('.container-notificacoes');
    
    if (!isNotificacaoButton && this.mostrarNotificacoes) {
      this.mostrarNotificacoes = false;
    }
  }

  alternarFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.emFullscreen = true;
      }).catch(err => {
        console.error('Erro ao entrar em fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.emFullscreen = false;
      }).catch(err => {
        console.error('Erro ao sair do fullscreen:', err);
      });
    }
  }
}
