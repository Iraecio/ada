import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Visao } from '../../../app.component';

interface ItemMenu {
  id: Visao;
  rotulo: string;
  icone: string;
}

@Component({
  selector: 'app-menu-lateral',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class MenuLateralComponent {
  @Input() visaoAtual = Visao.Painel;
  @Input() menuAberto = false;
  @Output() navegar = new EventEmitter<Visao>();
  @Output() toggleMenu = new EventEmitter<void>();
  
  menuExpandido = true;

  itensMenu: ItemMenu[] = [
    { id: Visao.Painel, rotulo: 'Dashboard', icone: 'bi-speedometer2' },
    { id: Visao.Transacoes, rotulo: 'Extrato', icone: 'bi-list-ul' },
    { id: Visao.Transferencia, rotulo: 'Transferência', icone: 'bi-arrow-left-right' },
    { id: Visao.SimuladorEmprestimo, rotulo: 'Crédito', icone: 'bi-calculator' }
  ];

  aoClicarMenu(visao: Visao): void {
    this.navegar.emit(visao);
  }

  alternarExpansao(): void {
    this.menuExpandido = !this.menuExpandido;
  }
}
