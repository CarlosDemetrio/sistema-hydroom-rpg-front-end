import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { retry, timer } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';

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
  private toastService = inject(ToastService);

  ngOnInit() {
    const redirectUrl = sessionStorage.getItem('REDIRECT_URL') || '/dashboard';
    sessionStorage.removeItem('REDIRECT_URL');

    this.authService.getUserInfo().pipe(
      retry({
        count: 2,
        delay: (_, retryCount) => timer(retryCount * 300)
      })
    ).subscribe({
      next: () => {
        this.router.navigateByUrl(redirectUrl);
      },
      error: () => {
        this.toastService.error('Não foi possível completar o login. Tente novamente.');
        this.router.navigate(['/login']);
      }
    });
  }
}
