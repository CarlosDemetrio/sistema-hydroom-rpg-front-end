import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { OAuthCallbackComponent } from './pages/oauth-callback/oauth-callback.component';
import { MainLayoutComponent } from './shared/layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'oauth2/callback',
    component: OAuthCallbackComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // Mestre Routes
      {
        path: 'mestre',
        canActivate: [roleGuard],
        data: { roles: ['MESTRE'] },
        children: [
          {
            path: '',
            redirectTo: 'jogos',
            pathMatch: 'full'
          },
          {
            path: 'jogos',
            loadComponent: () => import('./features/mestre/pages/jogos-list/jogos-list.component').then(m => m.JogosListComponent)
          },
          {
            path: 'jogos/novo',
            loadComponent: () => import('./features/mestre/pages/jogo-form/jogo-form.component').then(m => m.JogoFormComponent)
          },
          {
            path: 'jogos/:id',
            loadComponent: () => import('./features/mestre/pages/jogo-detail/jogo-detail.component').then(m => m.JogoDetailComponent)
          },
          {
            path: 'jogos/:id/edit',
            loadComponent: () => import('./features/mestre/pages/jogo-form/jogo-form.component').then(m => m.JogoFormComponent)
          },
          {
            path: 'config',
            loadComponent: () => import('./features/mestre/pages/config/config.component').then(m => m.ConfigComponent)
          }
        ]
      },

      // Jogador Routes
      {
        path: 'jogador',
        canActivate: [roleGuard],
        data: { roles: ['JOGADOR'] },
        children: [
          {
            path: '',
            redirectTo: 'fichas',
            pathMatch: 'full'
          },
          {
            path: 'fichas',
            loadComponent: () => import('./features/jogador/pages/fichas-list/fichas-list.component').then(m => m.FichasListComponent)
          },
          {
            path: 'fichas/nova',
            loadComponent: () => import('./features/jogador/pages/ficha-form/ficha-form.component').then(m => m.FichaFormComponent)
          },
          {
            path: 'fichas/:id',
            loadComponent: () => import('./features/jogador/pages/ficha-detail/ficha-detail.component').then(m => m.FichaDetailComponent)
          },
          {
            path: 'fichas/:id/edit',
            loadComponent: () => import('./features/jogador/pages/ficha-form/ficha-form.component').then(m => m.FichaFormComponent)
          },
          {
            path: 'jogos',
            loadComponent: () => import('./features/jogador/pages/jogos-disponiveis/jogos-disponiveis.component').then(m => m.JogosDisponiveisComponent)
          }
        ]
      }
    ]
  },

  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
