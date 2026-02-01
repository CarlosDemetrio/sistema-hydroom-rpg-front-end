# Frontend - Estrutura Básica Criada

## 📁 Estrutura de Pastas

```
src/app/
├── guards/
│   ├── auth.guard.ts          # Guard para proteger rotas autenticadas
│   └── role.guard.ts          # Guard para validar roles (Mestre/Jogador)
├── interceptors/
│   └── auth.interceptor.ts    # Interceptor para adicionar credenciais
├── pages/
│   ├── login/                 # Página de login com OAuth2
│   ├── home/                  # Página inicial após login
│   ├── not-found/             # Página 404
│   ├── unauthorized/          # Página 403 (sem permissão)
│   └── oauth-callback/        # Callback do OAuth2
├── services/
│   └── auth.service.ts        # Serviço de autenticação
└── app.routes.ts              # Configuração de rotas
```

## 🔐 Sistema de Autenticação

### OAuth2 com Google
- **Login**: Redireciona para Google OAuth2
- **Callback**: Processa retorno e autentica usuário
- **Session**: Mantida via cookies httpOnly do backend

### Guards Implementados

#### AuthGuard
Protege rotas que requerem autenticação:
```typescript
canActivate: [authGuard]
```

#### RoleGuard
Protege rotas por role (Mestre/Jogador):
```typescript
canActivate: [roleGuard],
data: { role: 'MESTRE' }
```

## 🎨 Páginas Criadas

### 1. Login (`/login`)
- Interface moderna com PrimeNG
- Botão de login com Google
- Features do sistema
- Design responsivo

### 2. Home (`/home`)
- Dashboard principal
- Menu lateral com navegação
- Cards de ações rápidas
- Avatar e info do usuário
- Diferenciação visual Mestre/Jogador

### 3. 404 - Not Found (`/404`)
- Design amigável
- Botões de navegação
- Animação no ícone

### 4. 403 - Unauthorized (`/unauthorized`)
- Mensagem clara de acesso negado
- Navegação de retorno

### 5. OAuth Callback (`/oauth2/callback`)
- Loading durante autenticação
- Redirecionamento automático

## 🔄 Fluxo de Autenticação

1. Usuário acessa qualquer rota protegida
2. AuthGuard verifica autenticação
3. Se não autenticado → redireciona para `/login`
4. Usuário clica em "Entrar com Google"
5. Redireciona para backend OAuth2
6. Google autentica e retorna para `/oauth2/callback`
7. Callback busca dados do usuário
8. Redireciona para `/home`

## 📝 Tipos de Usuário

### Mestre (Admin)
- Acesso total ao sistema
- Pode criar/editar/deletar jogos
- Gerencia jogadores
- Cria fichas de NPCs

### Jogador (User)
- Acessa apenas seus jogos
- Gerencia suas fichas
- Visualiza perfil

## 🚀 Rotas Configuradas

```typescript
/                    → Redireciona para /login
/login               → Página de login (pública)
/oauth2/callback     → Callback OAuth2 (pública)
/home                → Dashboard (protegida)
/unauthorized        → Sem permissão (pública)
/404                 → Not found (pública)
/**                  → Redireciona para /404
```

## 🎯 Próximos Passos

### Páginas a Criar:
- [ ] `/jogos` - Lista de jogos
- [ ] `/jogos/novo` - Criar jogo (Mestre)
- [ ] `/jogos/:id` - Detalhes do jogo
- [ ] `/fichas` - Lista de fichas
- [ ] `/fichas/nova` - Criar ficha
- [ ] `/fichas/:id` - Editar ficha
- [ ] `/perfil` - Perfil do usuário
- [ ] `/admin` - Painel admin (Mestre)

### Funcionalidades:
- [ ] CRUD de Jogos
- [ ] CRUD de Fichas
- [ ] Gerenciamento de Jogadores
- [ ] Sistema de convites
- [ ] Chat em tempo real
- [ ] Dados virtuais

## 🛠️ Tecnologias Usadas

- **Angular 21** - Framework
- **PrimeNG 21** - Componentes UI
- **RxJS** - Programação reativa
- **OAuth2** - Autenticação
- **TypeScript** - Linguagem

## 📦 Componentes PrimeNG Utilizados

- `Button` - Botões
- `Card` - Cards
- `Avatar` - Avatar do usuário
- `Menu` - Menu de navegação
- `ProgressSpinner` - Loading

## 🎨 Tema

- **Preset**: Lara (PrimeNG)
- **Cores**: Roxo/Violeta (#667eea → #764ba2)
- **Design**: Moderno e responsivo
