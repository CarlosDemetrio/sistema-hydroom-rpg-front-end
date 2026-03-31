import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="flex flex-column align-items-center justify-content-center min-h-screen surface-ground gap-4">
      <p-progressSpinner />
      <h2 class="text-3xl font-semibold text-color m-0">Autenticando...</h2>
      <p class="text-xl text-color-secondary m-0">Por favor, aguarde enquanto completamos seu login.</p>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Pegar URL de redirect salva antes do OAuth2
    const redirectUrl = sessionStorage.getItem('REDIRECT_URL') || '/dashboard';
    sessionStorage.removeItem('REDIRECT_URL');

    // Após o OAuth2, verificamos se o usuário está autenticado
    setTimeout(() => {
      this.authService.getUserInfo().subscribe({
        next: (user) => {
          console.log('User authenticated:', user);
          this.router.navigateByUrl(redirectUrl);
        },
        error: (error) => {
          console.error('Authentication failed:', error);
          this.router.navigate(['/login']);
        }
      });
    }, 1000);
  }
}
