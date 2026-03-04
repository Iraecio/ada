import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxCurrencyDirective } from 'ngx-currency';
import { ServicoConta } from '../../core/services/account.service';
import { ServicoNotificacao } from '../../core/services/notification.service';
import { Transferencia, Conta } from '../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transferencia',
  imports: [CommonModule, ReactiveFormsModule, NgxCurrencyDirective],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
})
export class TransferenciaComponent {
  private fb = inject(FormBuilder);
  private servicoConta = inject(ServicoConta);
  private servicoNotificacao = inject(ServicoNotificacao);

  formularioTransferencia: FormGroup;
  enviado = false;
  mensagemSucesso = '';
  mensagemErro = '';
  processando = false;
  conta$: Observable<Conta | null>;

  opcoesMoeda = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    allowNegative: false,
    nullable: true,
  };

  constructor() {
    this.conta$ = this.servicoConta.conta$;
    this.formularioTransferencia = this.fb.group({
      contaDestino: ['', [Validators.required, Validators.minLength(3)]],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  get f() {
    return this.formularioTransferencia.controls;
  }

  get saldoAtual(): number {
    return this.servicoConta.obterSaldo();
  }

  temSaldoInsuficiente(): boolean {
    const valor = this.formularioTransferencia.get('valor')?.value;
    return valor > 0 && valor > this.saldoAtual;
  }

  podeTransferir(): boolean {
    return this.formularioTransferencia.valid && !this.temSaldoInsuficiente() && !this.processando;
  }

  aoEnviar(): void {
    this.enviado = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.formularioTransferencia.invalid) {
      return;
    }

    if (this.temSaldoInsuficiente()) {
      this.mensagemErro = 'Saldo insuficiente para realizar a transferência';
      return;
    }

    this.processando = true;

    const transferencia: Transferencia = {
      data: new Date().toISOString(),
      contaDestino: this.formularioTransferencia.value.contaDestino,
      valor: this.formularioTransferencia.value.valor,
      descricao: this.formularioTransferencia.value.descricao,
    };

    this.servicoConta.executarTransferencia(transferencia).subscribe({
      next: () => {
        this.mensagemSucesso = 'Transferência realizada com sucesso!';
        
        // Criar notificação de transferência
        this.servicoNotificacao.adicionarNotificacao({
          titulo: 'Transferência Realizada',
          mensagem: `Transferência de ${transferencia.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${transferencia.contaDestino} realizada com sucesso.`,
          tipo: 'sucesso',
          data: new Date().toISOString(),
          lida: false
        }).subscribe();
        
        this.formularioTransferencia.reset();
        this.enviado = false;
        this.processando = false;

        setTimeout(() => {
          this.mensagemSucesso = '';
        }, 5000);
      },
      error: (erro) => {
        if (erro.message && erro.message.includes('Saldo insuficiente')) {
          this.mensagemErro = erro.message;
        } else if (erro.message && erro.message.includes('valor')) {
          this.mensagemErro = erro.message;
        } else {
          this.mensagemErro = 'Erro ao realizar transferência. Tente novamente.';
        }
        console.error('Erro na transferência:', erro);
        this.processando = false;
      },
    });
  }

  redefinir(): void {
    this.formularioTransferencia.reset();
    this.enviado = false;
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }
}
