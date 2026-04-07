import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { CustomPreset } from './theme/custom-preset';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { MessageService } from 'primeng/api';

// Aplica dark mode por padrão ao inicializar o app (antes da hidratação Angular).
// O ThemeService pode remover/adicionar 'app-dark' dinamicamente depois.
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('app-dark');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,  // Loading automático
        errorInterceptor,    // Error handling automático
        authInterceptor      // Auth (já existente)
      ])
    ),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: CustomPreset,
        options: {
          // Selector usado para ativar dark mode — deve coincidir com o que o ThemeService usa
          darkModeSelector: '.app-dark',
          cssLayer: false
        }
      },
      ripple: true,
      inputStyle: 'outlined',
      overlayOptions: {
        appendTo: 'body'
      }
    }),
    MessageService
  ]
};
