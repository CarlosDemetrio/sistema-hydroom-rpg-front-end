import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

interface UsuarioDetalhado {
  id: number;
  nome: string;
  email: string;
  fotoPerfil?: string;
  role: 'MESTRE' | 'JOGADOR';
  ativo: boolean;
  dataCriacao: string;
  dataUltimaAtualizacao?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, AvatarModule, DividerModule, TagModule, InputTextModule, FormsModule],
  template: `
    <div class="flex justify-content-center align-items-center min-h-screen surface-ground p-3">
      <p-card class="w-full md:w-6 lg:w-4">
        <ng-template pTemplate="header">
          <div class="flex flex-column align-items-center pt-4 gap-2">
            <p-avatar
              [image]="usuario()?.fotoPerfil"
              [label]="getInitials()"
              size="xlarge"
              shape="circle"
              class="surface-100"
            ></p-avatar>
            <span class="text-xs text-color-secondary">Foto gerenciada pelo Google</span>
          </div>
        </ng-template>

        <div class="flex flex-column gap-4">
          <!-- Nome com edição inline -->
          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-color-secondary">Nome</label>
            @if (editandoNome()) {
              <div class="flex gap-2 align-items-center">
                <input
                  pInputText
                  [(ngModel)]="nomeEditavel"
                  [maxlength]="100"
                  placeholder="Nome (mínimo 2 caracteres)"
                  class="flex-1"
                  aria-label="Nome do usuário"
                  (keydown.enter)="salvarNome()"
                  (keydown.escape)="cancelarEdicaoNome()"
                />
                <p-button
                  icon="pi pi-check"
                  size="small"
                  [loading]="salvandoNome()"
                  [disabled]="nomeEditavel.trim().length < 2"
                  (onClick)="salvarNome()"
                  aria-label="Confirmar alteração de nome"
                ></p-button>
                <p-button
                  icon="pi pi-times"
                  size="small"
                  severity="secondary"
                  [outlined]="true"
                  [disabled]="salvandoNome()"
                  (onClick)="cancelarEdicaoNome()"
                  aria-label="Cancelar edição de nome"
                ></p-button>
              </div>
            } @else {
              <div class="flex align-items-center gap-2">
                <span class="text-xl font-bold text-color flex-1">{{ usuario()?.nome }}</span>
                <p-button
                  icon="pi pi-pencil"
                  size="small"
                  severity="secondary"
                  [text]="true"
                  (onClick)="iniciarEdicaoNome()"
                  aria-label="Editar nome"
                ></p-button>
              </div>
            }
          </div>

          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-color-secondary">Email</label>
            <div class="text-color">{{ usuario()?.email }}</div>
          </div>

          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-color-secondary">Tipo de Conta</label>
            <div>
              <p-tag [value]="getRoleLabel()" [severity]="getRoleSeverity()" [icon]="getRoleIcon()"></p-tag>
            </div>
          </div>

          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-color-secondary">Status</label>
            <div>
              <p-tag
                [value]="usuario()?.ativo ? 'Ativo' : 'Inativo'"
                [severity]="usuario()?.ativo ? 'success' : 'secondary'"
                [icon]="usuario()?.ativo ? 'pi pi-check' : 'pi pi-times'"
              ></p-tag>
            </div>
          </div>

          <p-divider></p-divider>

          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-color-secondary">Membro desde</label>
            <div class="text-color">{{ formatDate(usuario()?.dataCriacao) }}</div>
          </div>

          @if (usuario()?.dataUltimaAtualizacao) {
            <div class="flex flex-column gap-2">
              <label class="text-sm font-semibold text-color-secondary">Ultima Atualizacao</label>
              <div class="text-color">{{ formatDate(usuario()?.dataUltimaAtualizacao) }}</div>
            </div>
          }
        </div>

        <ng-template pTemplate="footer">
          <div class="flex gap-2 justify-content-end">
            <p-button label="Voltar" icon="pi pi-arrow-left" [outlined]="true" (onClick)="goBack()"></p-button>
            <p-button label="Sair" icon="pi pi-sign-out" (onClick)="logout()"></p-button>
          </div>
        </ng-template>
      </p-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private apiUrl = environment.apiUrl;

  usuario = signal<UsuarioDetalhado | null>(null);
  editandoNome = signal(false);
  salvandoNome = signal(false);
  nomeEditavel = '';

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.http.get<UsuarioDetalhado>(`${this.apiUrl}/usuarios/me`, { withCredentials: true })
      .subscribe({
        next: (data) => this.usuario.set(data),
        error: () => {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  iniciarEdicaoNome(): void {
    this.nomeEditavel = this.usuario()?.nome ?? '';
    this.editandoNome.set(true);
  }

  cancelarEdicaoNome(): void {
    this.editandoNome.set(false);
    this.nomeEditavel = '';
  }

  salvarNome(): void {
    const nome = this.nomeEditavel.trim();
    if (nome.length < 2) return;

    this.salvandoNome.set(true);
    this.http.put<UsuarioDetalhado>(`${this.apiUrl}/usuarios/me`, { nome }, { withCredentials: true })
      .subscribe({
        next: (atualizado) => {
          this.usuario.set(atualizado);
          this.editandoNome.set(false);
          this.nomeEditavel = '';
          this.salvandoNome.set(false);
          this.toastService.success('Nome atualizado com sucesso.');
        },
        error: () => {
          this.salvandoNome.set(false);
        }
      });
  }

  getInitials(): string {
    const nome = this.usuario()?.nome || '';
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRoleLabel(): string {
    return this.usuario()?.role === 'MESTRE' ? 'Mestre' : 'Jogador';
  }

  getRoleSeverity(): 'success' | 'info' | 'secondary' {
    return this.usuario()?.role === 'MESTRE' ? 'success' : 'info';
  }

  getRoleIcon(): string {
    return this.usuario()?.role === 'MESTRE' ? 'pi pi-crown' : 'pi pi-user';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
