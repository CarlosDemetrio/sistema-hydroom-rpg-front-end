# Deploy Firebase Hosting — Domínio Customizado + DNS + SSL

> Guia de configuração de domínio customizado para o frontend Angular no Firebase Hosting.

---

## Arquitetura de Domínios

```
seu-dominio.com           → Firebase Hosting (A records → Firebase IPs)
www.seu-dominio.com       → Redirect para seu-dominio.com
api.seu-dominio.com       → Cloud Run backend (CNAME → ghs.googlehosted.com)
```

O SSL é provisionado **automaticamente** pelo Google — sem configuração manual de certificados.

---

## Pré-requisitos

1. Domínio registrado (Namecheap, GoDaddy, Registro.br, etc.)
2. Projeto Firebase criado (`ficha-controlador-rpg` ou similar)
3. Firebase Hosting inicializado (`firebase.json` presente no repo)
4. `firebase-tools` instalado: `npm install -g firebase-tools`

---

## 1. Adicionar domínio no Firebase Console

1. Acessar [Firebase Console](https://console.firebase.google.com) → projeto `ficha-controlador-rpg`
2. **Hosting** → **Custom domains** → **Add custom domain**
3. Inserir: `seu-dominio.com`
4. Firebase exibe os registros DNS necessários (A records + TXT de verificação)
5. Repetir para `www.seu-dominio.com` (configurar como redirect)

---

## 2. Configurar DNS no registrador

Adicionar os seguintes registros no painel DNS do seu registrador:

```
Tipo: A      Nome: @      Valor: 199.36.158.100   TTL: 300
Tipo: A      Nome: @      Valor: 199.36.158.101   TTL: 300
Tipo: TXT    Nome: @      Valor: (token de verificação do Firebase Console)
Tipo: CNAME  Nome: www    Valor: seu-dominio.com   TTL: 300
```

> ⚠️ Os IPs acima são os padrão do Firebase Hosting. O Firebase Console mostrará os valores exatos.

---

## 3. Aguardar propagação

| Etapa | Tempo estimado |
|-------|---------------|
| Verificação DNS | 5-10 minutos |
| Provisionamento SSL | 10-30 minutos |
| Status "Connected" no Console | Até 1 hora |

Verificar status no Firebase Console → Hosting → Custom domains.

---

## 4. Verificar redirect www → non-www

No Firebase Console:
- **Hosting** → **Custom domains** → `www.seu-dominio.com`
- Selecionar **Redirect to** → `seu-dominio.com`

---

## 5. Validar SSL e redirect

```bash
# Verificar HTTPS
curl -I https://seu-dominio.com
# Esperado: HTTP/2 200

# Verificar redirect www
curl -I https://www.seu-dominio.com
# Esperado: HTTP/2 301 Location: https://seu-dominio.com/

# Verificar certificado
openssl s_client -connect seu-dominio.com:443 -servername seu-dominio.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
# Esperado: datas válidas (renovação automática pelo Google)

# Verificar SPA routing
curl -I https://seu-dominio.com/jogos
# Esperado: HTTP/2 200 (retorna index.html via rewrite)

# Verificar headers de segurança
curl -I https://seu-dominio.com | grep -E "X-Frame|X-Content|Cache-Control"
# Esperado: X-Frame-Options: DENY, X-Content-Type-Options: nosniff
```

---

## 6. Atualizar environment.prod.ts

Após configurar o domínio, atualizar a URL da API no frontend:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.seu-dominio.com/api/v1'
};
```

---

## Estrutura de Domínios: Backend + Frontend

| Subdomínio | Destino | Configurado em |
|-----------|---------|----------------|
| `seu-dominio.com` | Firebase Hosting | DNS: A records |
| `www.seu-dominio.com` | Redirect → `seu-dominio.com` | Firebase Console |
| `api.seu-dominio.com` | Cloud Run (backend) | DNS: CNAME → `ghs.googlehosted.com` |

> Veja também: `ficha-controlador` → `docs/deploy/DEPLOY-GCP-BACKEND.md` para configuração do backend.

---

## GitHub Actions: secret FIREBASE_SERVICE_ACCOUNT

Para habilitar o deploy automático via GitHub Actions (`.github/workflows/deploy-firebase.yml`):

1. Firebase Console → **Project Settings** (engrenagem)
2. Aba **Service Accounts**
3. **Generate new private key** → baixar JSON
4. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
5. **New repository secret**:
   - Nome: `FIREBASE_SERVICE_ACCOUNT`
   - Valor: conteúdo completo do JSON baixado

---

## Rollback

```bash
# Via Firebase CLI
firebase hosting:rollback

# Ou via Console: Firebase Console → Hosting → Release History → Rollback
```

---

*Spec 019: `docs/specs/019-deploy-frontend-firebase/` | Atualizado: 2026-04-07*
