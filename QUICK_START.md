# 🚀 Guia de Início Rápido - OAuth2 Fix

## ✅ O Que Foi Corrigido

1. **Backend**: Removido OAuth2 Resource Server (JWT) que conflitava com autenticação por sessão
2. **Backend**: Configuração de sessão com cookies httpOnly
3. **Backend**: Handler customizado para redirecionar para `/oauth2/callback`
4. **Frontend**: Proxy configurado para evitar problemas de CORS
5. **Frontend**: URLs relativas ao invés de absolutas
6. **Frontend**: Fluxo de callback corrigido

## 📋 Pré-requisitos

1. **Configurar Google OAuth2**:
   - Acesse: https://console.cloud.google.com/
   - Crie um projeto
   - Vá em "APIs & Services" > "Credentials"
   - Crie "OAuth 2.0 Client ID"
   - Configure redirect URI: `http://localhost:8080/login/oauth2/code/google`
   - Copie Client ID e Client Secret

2. **Configurar Variáveis de Ambiente**:
   ```bash
   export GOOGLE_CLIENT_ID="seu-client-id-aqui"
   export GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
   ```

## 🏃 Como Executar

### Terminal 1 - Backend
```bash
cd ficha-controlador
./mvnw spring-boot:run
```

Aguarde até ver: `Started FichaControladorApplication`

### Terminal 2 - Frontend
```bash
cd ficha-controlador-front-end/ficha-controlador-front-end
npm install  # apenas na primeira vez
npm start
```

Aguarde até ver: `Compiled successfully`

## 🧪 Testar o Sistema

1. Abra o navegador em: **http://localhost:4200**
2. Clique em "Entrar com Google"
3. Autorize a aplicação no Google
4. Você deve ser redirecionado para a página Home
5. **Teste importante**: Recarregue a página (F5)
   - ✅ Se continuar logado = Sessão funcionando!
   - ❌ Se voltar para login = Problema de sessão

## 🔍 Debug

### Verificar Cookies no Navegador

1. Abra DevTools (F12)
2. Vá em **Application** > **Cookies** > **http://localhost:4200**
3. Deve haver um cookie chamado `SESSIONID`
4. Verifique se tem:
   - `HttpOnly`: true
   - `Secure`: false
   - `SameSite`: Lax

### Verificar Requisição API

1. DevTools > **Network**
2. Faça login e vá para Home
3. Procure a requisição `user`
4. Verifique:
   - **Status**: 200 OK
   - **Response**: `{ name: "...", email: "...", picture: "..." }`
   - **Request Headers** > **Cookie**: Deve conter `SESSIONID=...`

### Logs do Backend

Se algo não funcionar, verifique os logs do backend:

```
# Login bem-sucedido deve mostrar:
DEBUG o.s.security.web.FilterChainProxy : Secured GET /api/user
DEBUG o.s.s.w.c.SecurityContextPersistenceFilter : Set SecurityContextHolder to ...

# Se estiver falhando:
DEBUG o.s.security.web.FilterChainProxy : Securing GET /api/user
DEBUG o.s.s.w.a.AnonymousAuthenticationFilter : Set SecurityContextHolder to anonymous
```

## ❌ Problemas Comuns

### Erro: "Cookie não é enviado"
**Causa**: CORS não configurado corretamente
**Solução**: 
- Verifique se `withCredentials: true` está no interceptor
- Backend deve ter `allowCredentials: true` no CORS

### Erro: "Redireciona mas não autentica"
**Causa**: Backend não está criando sessão
**Solução**:
- Verifique se removeu `oauth2ResourceServer` do SecurityConfig
- Verifique se `SessionCreationPolicy.IF_REQUIRED` está configurado

### Erro: "CORS policy error"
**Causa**: Backend não permite origem do frontend
**Solução**:
- Adicione `http://localhost:4200` em `app.cors.allowed-origins`
- Reinicie o backend

### Erro: "redirect_uri_mismatch" do Google
**Causa**: URI de redirecionamento não está configurado no Google Console
**Solução**:
- Adicione `http://localhost:8080/login/oauth2/code/google` nas URIs autorizadas
- Aguarde alguns minutos (Google demora para propagar)

### Frontend não inicia
**Solução**:
```bash
cd ficha-controlador-front-end/ficha-controlador-front-end
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📊 Fluxo Completo

```
1. User clicks "Entrar com Google"
   ↓
2. Frontend: window.location.href = '/oauth2/authorization/google'
   ↓
3. Proxy redireciona para Backend: http://localhost:8080/oauth2/authorization/google
   ↓
4. Backend redireciona para: https://accounts.google.com/...
   ↓
5. Google: User autoriza
   ↓
6. Google redireciona para: http://localhost:8080/login/oauth2/code/google?code=...
   ↓
7. Backend: Processa OAuth2, cria sessão, define cookie SESSIONID
   ↓
8. Backend: Redireciona para http://localhost:4200/oauth2/callback
   ↓
9. Frontend: OAuthCallbackComponent chama /api/user
   ↓
10. Backend: Retorna dados do usuário (usando sessão/cookie)
   ↓
11. Frontend: Armazena dados e redireciona para /home
   ↓
12. ✅ User está logado com sessão ativa
```

## 🎯 Checklist Final

- [ ] Google OAuth2 configurado
- [ ] Variáveis GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET definidas
- [ ] Backend iniciado sem erros
- [ ] Frontend iniciado sem erros
- [ ] Login funciona
- [ ] Cookie SESSIONID está presente
- [ ] Requisição /api/user retorna dados
- [ ] Recarregar página mantém login
- [ ] Logout funciona (se implementado)

## 📚 Arquivos Modificados

### Backend:
- `SecurityConfig.java` - Configuração OAuth2 corrigida
- `application.properties` - Configuração de sessão adicionada

### Frontend:
- `auth.service.ts` - URL relativa para login
- `environment.ts` - API URL relativa
- `proxy.conf.json` - Proxy criado
- `package.json` - Script start atualizado

## 🆘 Ainda não funciona?

1. Verifique se TODAS as variáveis de ambiente estão definidas
2. Reinicie AMBOS backend e frontend
3. Limpe cookies do navegador (DevTools > Application > Clear storage)
4. Teste em modo anônimo do navegador
5. Verifique os logs do backend para erros

## 📞 Próximos Passos

Depois que o login funcionar:
1. Implementar logout
2. Criar página de perfil
3. Adicionar roles (Mestre/Jogador)
4. Implementar CRUD de jogos e fichas
