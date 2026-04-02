import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { currentGameGuard } from './guards/current-game.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
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
      {
        path: 'profile',
        component: ProfileComponent
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
            loadComponent: () => import('./features/mestre/pages/config/config-layout.component').then(m => m.ConfigLayoutComponent),
            canActivate: [currentGameGuard],
            children: [
              {
                path: '',
                redirectTo: 'atributos',
                pathMatch: 'full'
              },
              {
                path: 'atributos',
                loadComponent: () => import('./features/mestre/pages/config/configs/atributos-config/atributos-config.component').then(m => m.AtributosConfigComponent)
              },
              {
                path: 'aptidoes',
                loadComponent: () => import('./features/mestre/pages/config/configs/aptidoes-config/aptidoes-config.component').then(m => m.AptidoesConfigComponent)
              },
              {
                path: 'niveis',
                loadComponent: () => import('./features/mestre/pages/config/configs/niveis-config/niveis-config.component').then(m => m.NiveisConfigComponent)
              },
              {
                path: 'tipos-aptidao',
                loadComponent: () => import('./features/mestre/pages/config/configs/tipos-aptidao-config/tipos-aptidao-config.component').then(m => m.TiposAptidaoConfigComponent)
              },
              {
                path: 'classes',
                loadComponent: () => import('./features/mestre/pages/config/configs/classes-config/classes-config.component').then(m => m.ClassesConfigComponent)
              },
              {
                path: 'vantagens',
                loadComponent: () => import('./features/mestre/pages/config/configs/vantagens-config/vantagens-config.component').then(m => m.VantagensConfigComponent)
              },
              {
                path: 'racas',
                loadComponent: () => import('./features/mestre/pages/config/configs/racas-config/racas-config.component').then(m => m.RacasConfigComponent)
              },
              {
                path: 'prospeccao',
                loadComponent: () => import('./features/mestre/pages/config/configs/prospeccao-config/prospeccao-config.component').then(m => m.ProspeccaoConfigComponent)
              },
              {
                path: 'presencas',
                loadComponent: () => import('./features/mestre/pages/config/configs/presencas-config/presencas-config.component').then(m => m.PresencasConfigComponent)
              },
              {
                path: 'generos',
                loadComponent: () => import('./features/mestre/pages/config/configs/generos-config/generos-config.component').then(m => m.GenerosConfigComponent)
              },
              {
                path: 'indoles',
                loadComponent: () => import('./features/mestre/pages/config/configs/indoles-config/indoles-config.component').then(m => m.IndolesConfigComponent)
              },
              {
                path: 'membros-corpo',
                loadComponent: () => import('./features/mestre/pages/config/configs/membros-corpo-config/membros-corpo-config.component').then(m => m.MembrosCorpoConfigComponent)
              },
              {
                path: 'bonus',
                loadComponent: () => import('./features/mestre/pages/config/configs/bonus-config/bonus-config.component').then(m => m.BonusConfigComponent)
              }
            ]
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
