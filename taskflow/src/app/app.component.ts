import { Component } from '@angular/core';
import { CabecalhoComponent } from './shared/components/header/header.component';
import { MenuLateralComponent } from './shared/components/sidebar/sidebar.component';
import { PainelComponent } from './features/dashboard/dashboard.component';
import { TransacoesComponent } from './features/transactions/transactions.component';
import { TransferenciaComponent } from './features/transfer/transfer.component';
import { SimuladorEmprestimoComponent } from './features/loan-simulator/loan-simulator.component';

export enum Visao {
  Painel = 'painel',
  Transacoes = 'transacoes',
  Transferencia = 'transferencia',
  SimuladorEmprestimo = 'simulador-emprestimo'
}

@Component({
  selector: 'app-root',
  imports: [
    CabecalhoComponent,
    MenuLateralComponent,
    PainelComponent,
    TransacoesComponent,
    TransferenciaComponent,
    SimuladorEmprestimoComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  visaoAtual = Visao.Painel;
  menuAberto = false;

  aoNavegar(visao: Visao): void {
    this.visaoAtual = visao;
    
    if (window.innerWidth <= 768) {
      this.menuAberto = false;
    }
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu(): void {
    this.menuAberto = false;
  }
}
