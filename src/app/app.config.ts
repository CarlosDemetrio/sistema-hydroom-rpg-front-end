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
import {MessageService} from 'primeng/api';

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
    provideAnimations(), // Animações para PrimeNG e Angular
    providePrimeNG({
      theme: {
        preset: CustomPreset, // Preset customizado com paleta Sky
        options: {
          darkModeSelector: '.app-dark', // Habilita dark mode com classe
          cssLayer: false // Sem CSS Layer para maior especificidade
        }
      },
      ripple: true, // Ativa animações de ripple para melhor UX
      inputStyle: 'outlined' // Estilo outlined para todos os inputs
    }),
    MessageService // MessageService global para toast notifications
  ]
};
