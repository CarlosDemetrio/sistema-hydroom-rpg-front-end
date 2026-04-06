# Deploy Frontend — OCI Free Tier

> Guia específico do deploy do **frontend** (Angular SPA) no OCI.
> Para infraestrutura compartilhada (VM, Caddy, segurança), veja o repositório
> `ficha-controlador` → `docs/DEPLOY-OCI.md`.

---

## Arquitetura do Deploy

```
GitHub Actions (manual)
   │
   ├─ 1. Roda testes (npm test)
   ├─ 2. npm ci + ng build --configuration production
   ├─ 3. Backup da versão anterior na VM
   ├─ 4. SCP dos arquivos para /opt/frontend/
   └─ 5. Verifica que index.html existe
         │
         v
   ┌─────────────────────────────────────────┐
   │  VM OCI                                 │
   │                                         │
   │  Caddy (seu-dominio.com)                │
   │    → /opt/frontend/ (arquivos estáticos)│
   │    → gzip + zstd (compressão nativa)    │
   │    → Cache imutável para assets c/ hash │
   │    → try_files fallback para SPA        │
   └─────────────────────────────────────────┘

Tempo: ~2-4 min
Downtime: ZERO (Caddy serve novos arquivos instantaneamente)
```

> **Não usa Docker.** Caddy serve os arquivos estáticos diretamente,
> economizando ~200MB de RAM que seriam gastos com um container nginx.

---

## Arquivos Relevantes

```
ficha-controlador-front-end/
  .github/workflows/
    deploy.yml                  ← Workflow de deploy (manual)
  angular.json                  ← Configurações de build (otimizações prod)
  src/environments/
    environment.ts              ← Dev (proxy local)
    environment.prod.ts         ← Produção (API URL dinâmica)
```

---

## Otimizações de Build (Produção)

### angular.json — Configuração de Produção

O build de produção (`ng build --configuration production`) aplica:

| Otimização | Efeito |
|------------|--------|
| `optimization: true` | Minifica JS, CSS e remove código morto (tree-shaking) |
| `outputHashing: "all"` | Cache busting — força download de novos arquivos a cada deploy |
| `sourceMap: false` | Reduz drasticamente o tamanho do pacote final |
| `namedChunks: false` | Nomes de chunks otimizados (menores) |
| `extractLicenses: true` | Extrai licenças para arquivo separado |
| Budget `initial` max 500kB/1MB | Alerta se o app ficar pesado demais |
| Budget `anyComponentStyle` max 4kB/8kB | Evita CSS excessivo por componente |

> **Nota**: O builder `@angular/build:application` (esbuild) já aplica AOT e
> build optimizer automaticamente. Opções como `aot`, `vendorChunk` e
> `buildOptimizer` não são necessárias (eram do builder legado `@angular-devkit/build-angular:browser`).

### environment.prod.ts — API URL Dinâmica

```typescript
export const environment = {
  production: true,
  apiUrl: `https://api.${window.location.hostname.replace(/^www\./, '')}/api/v1`,
  backendUrl: `https://api.${window.location.hostname.replace(/^www\./, '')}`
};
```

O frontend **não precisa de variáveis de ambiente** no deploy — a URL do backend
é derivada automaticamente do hostname do frontend (`domain.com` → `api.domain.com`).

---

## Compressão no Servidor (Caddy) — O Pulo do Gato

O maior ganho de performance na entrega dos arquivos vem da compressão do Caddy.
Com `outputHashing: "all"` no Angular, os assets têm hash no nome, permitindo
cache imutável + compressão agressiva.

### Caddy suporta nativamente:

| Algoritmo | Compressão | Velocidade | Suporte |
|-----------|-----------|------------|---------|
| **Zstd** | Excelente (~92%) | Muito rápida | Chrome 123+, Firefox 126+ |
| **Gzip** | Boa (~85%) | Rápida | Universal |

O Caddy negocia automaticamente o melhor algoritmo via `Accept-Encoding`.

### Configuração do Caddyfile (Frontend)

```caddyfile
seu-dominio.com, www.seu-dominio.com {
    # Servir arquivos estáticos do Angular
    root * /opt/frontend

    # SPA fallback: rotas desconhecidas → index.html
    # (Angular Router cuida do roteamento client-side)
    try_files {path} /index.html
    file_server

    # ── Compressão (gzip + zstd) ──────────────────────
    # Caddy comprime on-the-fly e faz cache do resultado.
    # Zstd é ~30% mais eficiente que gzip e muito mais rápido.
    encode gzip zstd

    # ── Cache agressivo para assets com hash (imutáveis) ──
    # Arquivos como main.abc12345.js NUNCA mudam — cache de 1 ano.
    @hashed path_regexp hashed \.[a-f0-9]{8,}\.(js|css|woff2?|ttf|eot|svg|png|jpg|ico)$
    header @hashed Cache-Control "public, max-age=31536000, immutable"

    # ── Cache curto para index.html ──
    # Sempre buscar a versão mais recente (garante que o browser
    # veja os novos hashes de assets após deploy).
    @html path *.html /
    header @html Cache-Control "no-cache, no-store, must-revalidate"

    # ── Redirect www → non-www (SEO) ──
    @www host www.seu-dominio.com
    redir @www https://seu-dominio.com{uri} permanent

    # ── Headers de segurança ──
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
        -X-Powered-By
    }

    log {
        output file /var/log/caddy/frontend-access.log {
            roll_size 10mb
            roll_keep 5
        }
        format json
    }
}
```

### Como funciona o fluxo de cache:

```
1. Deploy: ng build gera main.abc12345.js (hash novo)
2. Caddy serve index.html SEM cache (no-store)
3. Browser carrega novo index.html → vê novo hash no <script>
4. Browser baixa main.abc12345.js → Caddy comprime com zstd
5. Header: Cache-Control: public, max-age=31536000, immutable
6. Próxima visita: browser usa cache local (zero requests!)
7. Próximo deploy: hash muda → browser busca novo arquivo
```

**Resultado**: Após o primeiro carregamento, as visitas seguintes são
quase instantâneas — apenas `index.html` (~1KB) é verificado no servidor.

---

## Workflow de Deploy

**`.github/workflows/deploy.yml`** — trigger manual com opções:

| Input | Descrição | Default |
|-------|-----------|---------|
| `skip_tests` | Pular testes? | `false` |

### Jobs

1. **🧪 Testes** — `npm test --watch=false` (pula se `skip_tests`)
2. **🏗️ Build & Deploy** — `npm ci` + `ng build --configuration production` + SCP

### Fluxo Detalhado

```
1. npm ci (instala dependências)
2. ng build --configuration production
   → Minifica, tree-shake, output hashing
   → Resultado em dist/ficha-controlador-front-end/browser/
3. SSH: backup da versão anterior (/opt/frontend-backup/)
4. SCP: copia dist/* → /opt/frontend/
5. SSH: verifica que index.html existe
```

### Secrets Necessários (GitHub)

| Secret | Valor |
|--------|-------|
| `OCI_VM_HOST` | IP ou hostname da VM |
| `OCI_VM_USER` | `deploy` |
| `OCI_SSH_PRIVATE_KEY` | Chave privada SSH (ed25519) |

---

## Primeiro Deploy

1. Certifique-se que a VM está configurada (ver `ficha-controlador` → `docs/DEPLOY-OCI.md`)
2. No GitHub: **Actions** → **Deploy Frontend to OCI** → **Run workflow**

### Verificar

```bash
curl -I https://seu-dominio.com
# Deve retornar 200 com Content-Type: text/html

# Verificar compressão zstd
curl -I -H "Accept-Encoding: zstd,gzip" https://seu-dominio.com
# Deve ter header: Content-Encoding: zstd (ou gzip)

# Verificar cache de assets
curl -I https://seu-dominio.com/main.abc12345.js
# Deve ter: Cache-Control: public, max-age=31536000, immutable
```

---

## Rollback

```bash
ssh deploy@seu-dominio.com

# Listar backups disponíveis
ls /opt/frontend-backup/

# Restaurar versão anterior
rm -rf /opt/frontend/*
cp -r /opt/frontend-backup/frontend-20260406-143022/* /opt/frontend/
```

> O Caddy serve os novos arquivos instantaneamente — sem restart necessário.

As últimas 3 versões são mantidas automaticamente.

---

## Análise de Tamanho do Bundle

Após o build, verifique o tamanho do bundle:

```bash
# Local
ng build --configuration production
du -sh dist/ficha-controlador-front-end/browser/

# Detalhamento por arquivo
ls -lhS dist/ficha-controlador-front-end/browser/*.js
```

### Budgets Configurados

| Tipo | Warning | Erro |
|------|---------|------|
| `initial` (bundle principal) | 500kB | 1MB |
| `anyComponentStyle` | 4kB | 8kB |

Se o build falhar por budget, otimize:
- Lazy loading de módulos/rotas
- Remover imports desnecessários do PrimeNG
- Verificar dependências pesadas com `npx webpack-bundle-analyzer`

---

## Dependências: Produção vs Dev

As dependências de teste (`@testing-library/angular`, `@vitest/coverage-v8`)
estão em `devDependencies` e **não são incluídas** no build de produção.
O `npm ci` no workflow instala todas, mas o `ng build` faz tree-shaking
e inclui apenas o que é importado no código de produção.

---

## Checklist Pre-Deploy

- [ ] VM OCI configurada (ver `ficha-controlador` → `docs/DEPLOY-OCI.md`)
- [ ] Caddy configurado com domínio real
- [ ] GitHub Secrets configurados (OCI_VM_HOST, OCI_VM_USER, OCI_SSH_PRIVATE_KEY)
- [ ] Environment "production" criado no GitHub
- [ ] Build local funciona: `ng build --configuration production`
- [ ] Testes passando: `npm test -- --watch=false`
- [ ] Bundle dentro dos budgets (< 1MB initial)
