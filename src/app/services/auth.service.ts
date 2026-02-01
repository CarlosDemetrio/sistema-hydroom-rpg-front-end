import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
    return this.http.get<UserInfo>(`${this.apiUrl}/user`, { withCredentials: true }).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  login() {
    // Salvar URL atual para redirecionar após login
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('REDIRECT_URL', currentUrl);

    window.location.href = '/oauth2/authorization/google';
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.setCurrentUser(null))
    );
  }
}
