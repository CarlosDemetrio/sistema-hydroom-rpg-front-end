# Configuração OAuth2 - Solução de Problemas de Sessão

## Problema Identificado

O sistema estava redirecionando para `/home` mas não mantinha a sessão do usuário autenticado.

## Causas do Problema

1. **Backend estava configurado como OAuth2 Resource Server (JWT)** - Isso é incompatível com autenticação baseada em sessão
2. **CORS não estava configurado para credentials** - Cookies não eram enviados entre domínios
3. **Sessão não estava configurada corretamente** - Faltavam configurações de cookie e timeout
4. **Redirecionamento direto para /home** - Não dava tempo para o frontend processar a autenticação

## Soluções Implementadas

### 1. Backend - SecurityConfig.java

**Antes (ERRADO):**
```java
.oauth2Login(oauth2 -> oauth2
    .defaultSuccessUrl("http://localhost:4200/home", true)
)
.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {})) // ❌ ISSO CAUSAVA O PROBLEMA
```

**Depois (CORRETO):**
```java
.oauth2Login(oauth2 -> oauth2
    .successHandler(oauth2SuccessHandler())  // ✅ Handler customizado
)
// ✅ Removido oauth2ResourceServer - não precisamos de JWT
```

### 2. Backend - application.properties

Adicionadas configurações de sessão:

```properties
# Session Configuration
server.servlet.session.cookie.name=SESSIONID
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.max-age=86400
server.servlet.session.timeout=24h
spring.session.store-type=none
```

### 3. Frontend - Fluxo de Autenticação

**Novo fluxo:**
1. Usuário clica em "Login com Google"
2. Frontend redireciona para: `http://localhost:8080/oauth2/authorization/google`
3. Backend redireciona para Google OAuth2
4. Google autentica e retorna para: `http://localhost:8080/login/oauth2/code/google`
5. Backend processa e redireciona para: `http://localhost:4200/oauth2/callback`
6. Frontend chama `/api/user` para obter dados do usuário
7. Frontend armazena dados e redireciona para `/home`

## Configuração do Google Cloud Console

Para que funcione, você precisa configurar no Google Cloud Console:

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou use um existente
3. Vá em "APIs & Services" > "Credentials"
4. Crie "OAuth 2.0 Client ID"
5. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**:
     - `http://localhost:4200`
     - `http://localhost:8080`
   - **Authorized redirect URIs**:
     - `http://localhost:8080/login/oauth2/code/google`

6. Copie o Client ID e Client Secret
7. Configure as variáveis de ambiente:

```bash
export GOOGLE_CLIENT_ID="seu-client-id"
export GOOGLE_CLIENT_SECRET="seu-client-secret"
```

Ou adicione ao `application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=seu-client-id
spring.security.oauth2.client.registration.google.client-secret=seu-client-secret
```

## Testando a Configuração

1. **Inicie o backend:**
```bash
cd ficha-controlador
./mvnw spring-boot:run
```

2. **Inicie o frontend:**
```bash
cd ficha-controlador-front-end
npm start
```

3. **Teste o fluxo:**
   - Acesse: http://localhost:4200
   - Clique em "Entrar com Google"
   - Autorize a aplicação no Google
   - Deve redirecionar para `/oauth2/callback` e então para `/home`
   - A sessão deve ser mantida (pode recarregar a página)

## Verificando a Sessão

Abra o DevTools do navegador:

1. **Application > Cookies > http://localhost:4200**
   - Deve haver um cookie `SESSIONID`

2. **Network > /api/user**
   - Status: 200 OK
   - Response: `{ name, email, picture }`
   - Headers: `Cookie: SESSIONID=...`

## Problemas Comuns

### Cookie não está sendo enviado
- ✅ Verifique `withCredentials: true` no interceptor
- ✅ CORS deve permitir credentials
- ✅ Cookie deve ter `SameSite: Lax`

### Redireciona mas não autentica
- ✅ Verifique se o backend está processando `/api/user` corretamente
- ✅ Verifique se a sessão está sendo criada no backend

### Erro de CORS
- ✅ Adicione `http://localhost:4200` às origens permitidas
- ✅ Configure `allowCredentials: true` no CORS

## Arquitetura Final

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Browser   │                    │   Backend   │                    │   Google    │
│ localhost:  │                    │ localhost:  │                    │   OAuth2    │
│    4200     │                    │    8080     │                    │             │
└─────────────┘                    └─────────────┘                    └─────────────┘
       │                                  │                                  │
       │ 1. /login                        │                                  │
       │                                  │                                  │
       │ 2. Click "Login com Google"     │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │                                  │ 3. Redireciona                   │
       │                                  │─────────────────────────────────>│
       │                                  │                                  │
       │                                  │ 4. Google OAuth Screen           │
       │<─────────────────────────────────┼──────────────────────────────────│
       │                                  │                                  │
       │                                  │ 5. Callback com código           │
       │                                  │<─────────────────────────────────│
       │                                  │                                  │
       │ 6. Redireciona /oauth2/callback  │                                  │
       │<─────────────────────────────────│                                  │
       │ (Com cookie SESSIONID)           │                                  │
       │                                  │                                  │
       │ 7. GET /api/user                 │                                  │
       │─────────────────────────────────>│                                  │
       │ (Envia cookie SESSIONID)         │                                  │
       │                                  │                                  │
       │ 8. { name, email, picture }      │                                  │
       │<─────────────────────────────────│                                  │
       │                                  │                                  │
       │ 9. Navega para /home             │                                  │
       │ (Sessão mantida)                 │                                  │
```

## Checklist de Configuração

- [ ] Google Cloud Console configurado com redirect URIs corretos
- [ ] Variáveis de ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET definidas
- [ ] Backend rodando na porta 8080
- [ ] Frontend rodando na porta 4200
- [ ] CORS configurado corretamente
- [ ] Interceptor com withCredentials: true
- [ ] SecurityConfig sem oauth2ResourceServer
- [ ] Configurações de sessão no application.properties
