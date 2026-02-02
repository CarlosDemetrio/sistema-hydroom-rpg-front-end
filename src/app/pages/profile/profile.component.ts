import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  imports: [CardModule, ButtonModule, AvatarModule, DividerModule, TagModule],
  template: `
    <div class="flex justify-content-center align-items-center min-h-screen surface-ground p-3">
      <p-card class="w-full md:w-6 lg:w-4">
        <ng-template pTemplate="header">
          <div class="flex justify-content-center pt-4">
            <p-avatar
              [image]="usuario()?.fotoPerfil"
              [label]="getInitials()"
              [size]="'xlarge'"
              [shape]="'circle'"
              class="surface-100"
            ></p-avatar>
          </div>
        </ng-template>

        <div class="flex flex-column gap-4">
          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-color-secondary">Nome</label>
            <div class="text-xl font-bold text-color">{{ usuario()?.nome }}</div>
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
  private apiUrl = environment.apiUrl;

  usuario = signal<UsuarioDetalhado | null>(null);

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.http.get<UsuarioDetalhado>(`${this.apiUrl}/auth/me`, { withCredentials: true })
      .subscribe({
        next: (data) => this.usuario.set(data),
        error: (error) => {
          console.error('Erro ao carregar perfil:', error);
          this.router.navigate(['/dashboard']);
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
    console.log('ProfileComponent: Iniciando logout...');
    this.authService.logout().subscribe(() => {
      console.log('ProfileComponent: Logout concluído, redirecionando para /login');
      this.router.navigate(['/login']);
    });
  }
}
