import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface UserInfo {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  role?: 'MESTRE' | 'JOGADOR';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private backendUrl = environment.backendUrl; // ✅ URL absoluta para OAuth2

  // ✅ SEGURO - Usar Signals ao invés de BehaviorSubject
  private currentUserSignal = signal<UserInfo | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  // Computed signals para roles
  public isAuthenticated = computed(() => this.currentUser() !== null);
  public isMestre = computed(() => this.currentUser()?.role === 'MESTRE');
  public isJogador = computed(() => this.currentUser()?.role === 'JOGADOR');

  constructor(private http: HttpClient) {}

  setCurrentUser(user: UserInfo | null) {
    this.currentUserSignal.set(user);
    // ✅ NÃO salvar em localStorage - estado vem do backend via session cookie
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser();
  }

  getUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/auth/me`, { withCredentials: true }).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  login() {
    // Salvar URL atual para redirecionar após login
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('REDIRECT_URL', currentUrl);

    // ✅ FIX: Usar URL absoluta do backend para OAuth2
    // Navegador acessa diretamente localhost:8080, não passa pelo proxy Docker
    // Isso garante que o Host header seja "localhost:8080" e não "backend:8080"
    window.location.href = `${this.backendUrl}/oauth2/authorization/google`;
  }

  logout(): Observable<any> {
    const url = `${this.apiUrl}/auth/logout`;
    console.log('[LOGOUT] Iniciando logout para:', url);

    return this.http.post(url, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log('[LOGOUT] Requisição completada com sucesso');
        this.setCurrentUser(null);
      })
    );
  }
}
