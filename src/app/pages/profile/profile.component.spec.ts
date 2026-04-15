import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProfileComponent } from './profile.component';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { MessageService } from 'primeng/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const mockUsuario = {
  id: 1,
  nome: 'Carlos Demétrio',
  email: 'carlos@test.com',
  fotoPerfil: undefined,
  role: 'MESTRE' as const,
  ativo: true,
  dataCriacao: '2024-01-15T10:00:00',
  dataUltimaAtualizacao: '2024-06-01T12:00:00',
};

describe('ProfileComponent', () => {
  let http: { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let authService: { logout: ReturnType<typeof vi.fn>; currentUser: ReturnType<typeof vi.fn> };
  let toastService: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    http = { get: vi.fn(), put: vi.fn() };
    router = { navigate: vi.fn() };
    authService = {
      logout: vi.fn().mockReturnValue(of(null)),
      currentUser: vi.fn().mockReturnValue(null),
    };
    toastService = { success: vi.fn(), error: vi.fn() };

    http.get.mockReturnValue(of(mockUsuario));

    TestBed.configureTestingModule({
      imports: [ProfileComponent, NoopAnimationsModule],
      providers: [
        { provide: HttpClient, useValue: http },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService },
        MessageService,
      ],
    });
  });

  // ---------------------------------------------------------------------------
  // Carregamento do perfil
  // ---------------------------------------------------------------------------

  it('carrega o perfil via GET /usuarios/me ao inicializar', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/me'),
      expect.objectContaining({ withCredentials: true })
    );
  });

  it('exibe o nome do usuário após carregar', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Carlos Demétrio');
  });

  it('exibe o email do usuário', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('carlos@test.com');
  });

  it('exibe nota de foto gerenciada pelo Google', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Foto gerenciada pelo Google');
  });

  it('navega para /dashboard se o carregamento do perfil falhar', () => {
    http.get.mockReturnValue(throwError(() => new Error('403')));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ---------------------------------------------------------------------------
  // Edição de nome — iniciar / cancelar
  // ---------------------------------------------------------------------------

  it('inicia edição de nome ao chamar iniciarEdicaoNome()', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.detectChanges();

    expect(fixture.componentInstance.editandoNome()).toBe(true);
    expect(fixture.componentInstance.nomeEditavel).toBe('Carlos Demétrio');
  });

  it('cancela edição de nome ao chamar cancelarEdicaoNome()', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.cancelarEdicaoNome();
    fixture.detectChanges();

    expect(fixture.componentInstance.editandoNome()).toBe(false);
    expect(fixture.componentInstance.nomeEditavel).toBe('');
  });

  // ---------------------------------------------------------------------------
  // Salvar nome — caminho feliz
  // ---------------------------------------------------------------------------

  it('chama PUT /usuarios/me com o novo nome ao salvar', () => {
    const usuarioAtualizado = { ...mockUsuario, nome: 'Carlos Novo' };
    http.put.mockReturnValue(of(usuarioAtualizado));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = 'Carlos Novo';
    fixture.componentInstance.salvarNome();
    fixture.detectChanges();

    expect(http.put).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/me'),
      { nome: 'Carlos Novo' },
      expect.objectContaining({ withCredentials: true })
    );
  });

  it('atualiza o nome exibido após salvar com sucesso', () => {
    const usuarioAtualizado = { ...mockUsuario, nome: 'Carlos Novo' };
    http.put.mockReturnValue(of(usuarioAtualizado));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = 'Carlos Novo';
    fixture.componentInstance.salvarNome();
    fixture.detectChanges();

    expect(fixture.componentInstance.usuario()?.nome).toBe('Carlos Novo');
    expect(fixture.componentInstance.editandoNome()).toBe(false);
  });

  it('exibe toast de sucesso após salvar nome', () => {
    http.put.mockReturnValue(of({ ...mockUsuario, nome: 'Carlos Novo' }));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = 'Carlos Novo';
    fixture.componentInstance.salvarNome();

    expect(toastService.success).toHaveBeenCalledWith('Nome atualizado com sucesso.');
  });

  // ---------------------------------------------------------------------------
  // Salvar nome — validação client-side
  // ---------------------------------------------------------------------------

  it('não chama PUT se o nome tiver menos de 2 caracteres', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = 'A';
    fixture.componentInstance.salvarNome();

    expect(http.put).not.toHaveBeenCalled();
  });

  it('não chama PUT se o nome estiver em branco (só espaços)', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = '   ';
    fixture.componentInstance.salvarNome();

    expect(http.put).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Salvar nome — erro HTTP (sem toast duplicado — interceptor cuida disso)
  // ---------------------------------------------------------------------------

  it('desativa salvandoNome ao receber erro HTTP', () => {
    http.put.mockReturnValue(throwError(() => ({ status: 500 })));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = 'Carlos Novo';
    fixture.componentInstance.salvarNome();
    fixture.detectChanges();

    expect(fixture.componentInstance.salvandoNome()).toBe(false);
  });

  it('não chama toastService.error no handler de erro (interceptor cuida dos toasts de erro)', () => {
    http.put.mockReturnValue(throwError(() => ({ status: 500 })));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.iniciarEdicaoNome();
    fixture.componentInstance.nomeEditavel = 'Carlos Novo';
    fixture.componentInstance.salvarNome();

    expect(toastService.error).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  it('chama authService.logout() e navega para /login', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    fixture.componentInstance.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  it('getInitials() retorna as iniciais do nome', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.getInitials()).toBe('CD');
  });

  it('getRoleLabel() retorna "Mestre" para role MESTRE', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.getRoleLabel()).toBe('Mestre');
  });

  it('formatDate() formata data no padrão pt-BR', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const resultado = fixture.componentInstance.formatDate('2024-01-15T10:00:00');
    expect(resultado).toContain('2024');
    expect(resultado).toContain('15');
  });

  it('formatDate() retorna string vazia para entrada undefined', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formatDate(undefined)).toBe('');
  });
});
