# 🎲 Ficha Controlador — Frontend

Interface web para gerenciamento de fichas de personagens de RPG de mesa, com suporte a configurações totalmente customizáveis pelo Mestre.

[![Angular](https://img.shields.io/badge/Angular-21-red)]()
[![PrimeNG](https://img.shields.io/badge/PrimeNG-21-blue)]()
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Execução Local](#execução-local)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy (Produção)](#deploy-produção)

---

## 🎯 Sobre o Projeto

Frontend Angular para o sistema **Ficha Controlador**, que permite ao Mestre configurar regras do jogo e aos Jogadores gerenciarem suas fichas de personagem. Autenticação via Google OAuth2.

---

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Angular 21 (Standalone Components, Signals, Control Flow) |
| UI | PrimeNG 21 + PrimeFlex + PrimeIcons |
| State | NgRx Signals Store (`@ngrx/signals`) |
| Testes | Vitest + @testing-library/angular |
| Linting | ESLint |
| Build | Angular CLI 21 |
| Deploy | Firebase Hosting |

---

## ✅ Pré-requisitos

- **Node.js 20+**
- **npm 10+**
- Backend rodando (local ou remoto) — ver [ficha-controlador](../ficha-controlador)

---

## 🚀 Instalação

```bash
git clone https://github.com/seu-usuario/ficha-controlador-front-end.git
cd ficha-controlador-front-end
npm install
```

---

## ▶️ Execução Local

### Com backend local (porta 8081)
```bash
npm run start:local
```

### Com backend via Docker Compose
```bash
npm start
```

A aplicação roda em **http://localhost:4201**. O proxy redireciona `/api`, `/oauth2` e `/login` para o backend.

---

## 🧪 Testes

```bash
# Executar testes
npm test

# Com cobertura
npm run test:coverage

# Lint
npm run lint
```

---

## 📁 Estrutura do Projeto

```
src/app/
├── core/          # Serviços globais, interceptors, guards, estados (Signals)
├── shared/        # Componentes reutilizáveis (dumb components), pipes, diretivas
├── features/      # Módulos de funcionalidade
│   ├── dashboard/ # Dashboard principal
│   ├── jogador/   # Área do jogador (fichas)
│   └── mestre/    # Área do mestre (configurações)
├── pages/         # Páginas de rota
│   ├── home/
│   ├── login/
│   ├── profile/
│   ├── oauth-callback/
│   ├── unauthorized/
│   └── not-found/
├── models/        # Interfaces e types TypeScript
├── guards/        # Route guards
├── interceptors/  # HTTP interceptors
└── services/      # Serviços de aplicação
```

### Fluxo de dados
```
Component → inject(Store) → Signal → computed() → Template
               ↓
           Service → HTTP → Backend API
```

> Cálculos de fórmulas (BBA, Ímpeto, etc.) são feitos no **backend** (fonte da verdade). O frontend pode calcular previews temporários para UX responsiva, mas sempre substitui pelos valores oficiais retornados após salvar.

---

## 🚀 Deploy (Produção)

O frontend é deployado no **Firebase Hosting (CDN Global)** via GitHub Actions.

| Recurso | Detalhes |
|---------|----------|
| Plataforma | Firebase Hosting |
| Projeto Firebase | `hydroon-rpg-2bedc` |
| URL | `https://hydroon.com.br` |
| URL fallback | `https://hydroon-rpg-2bedc.web.app` |
| CI/CD | `.github/workflows/deploy-firebase.yml` |
| Trigger | Manual via `workflow_dispatch` (GitHub Actions) |

### Secrets (GitHub Actions)

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase (`hydroon-rpg-2bedc`) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da service account com permissão de deploy |

### Deploy manual
```bash
npm run build:prod
firebase deploy --only hosting --project hydroon-rpg-2bedc
```

### Rollback
```bash
firebase hosting:rollback --project hydroon-rpg-2bedc
```

### API URL em produção
O `environment.prod.ts` deriva a URL da API dinamicamente do hostname — não há URL hardcoded:
```
hydroon.com.br  →  api.hydroon.com.br
```

---

<p align="center">
  Feito com ❤️ para a comunidade de RPG
</p>

