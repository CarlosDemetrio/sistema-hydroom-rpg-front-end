# 🚀 Setup e Execução do Frontend

## ⚠️ IMPORTANTE - Leia Antes de Iniciar

### URLs Corretas
- **Frontend:** http://localhost:4200 ✅
- **Backend:** http://localhost:8080 ✅
- **NUNCA acesse:** http://localhost (sem porta) ❌

---

## 📦 Instalação

### 1. Instalar Dependências
```bash
cd ficha-controlador-front-end
npm install
```

Isso vai instalar:
- Angular 21
- PrimeNG 21
- PrimeFlex 3.3.1 (CSS utilities)
- PrimeIcons
- E todas as dependências

---

## 🎨 CSS e Estilos

### Arquivos de Estilo
O projeto usa **APENAS** PrimeNG + PrimeFlex. **Sem CSS customizado**.

**`src/styles.css`** importa:
```css
@import 'primeng/resources/primeng.min.css';  /* Componentes PrimeNG */
@import 'primeicons/primeicons.css';          /* Ícones */
@import 'primeflex/primeflex.css';            /* Utility classes */
```

### Se os Estilos Não Carregarem
1. Verificar se PrimeFlex está instalado:
```bash
npm list primeflex
```

2. Se não estiver, instalar:
```bash
npm install primeflex@3.3.1
```

3. Limpar cache e reconstruir:
```bash
rm -rf .angular
npm start
```

---

## 🚀 Executar o Projeto

### 1. Certifique-se que o Backend está Rodando
```bash
# Em outro terminal
cd ficha-controlador
./mvnw spring-boot:run
```

Backend deve estar em: **http://localhost:8080**

### 2. Iniciar o Frontend
```bash
cd ficha-controlador-front-end
npm start
```

Frontend vai iniciar em: **http://localhost:4200**

### 3. Acessar no Navegador
```
http://localhost:4200
```

**NÃO acesse `http://localhost` sem a porta!**

---

## 🔧 Troubleshooting

### Problema: CSS não carrega (fonte padrão do navegador)

**Causa:** PrimeFlex não instalado ou imports incorretos

**Solução:**
```bash
# 1. Instalar PrimeFlex
npm install primeflex

# 2. Limpar cache
rm -rf .angular node_modules
npm install

# 3. Reiniciar
npm start
```

---

### Problema: Erro de CORS

**Erro:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' 
from origin 'http://localhost' has been blocked by CORS policy
```

**Causa:** Acessando pelo domínio errado

**Solução:**
1. Sempre acesse: **http://localhost:4200** (com porta)
2. NUNCA acesse: `http://localhost` (sem porta)
3. O proxy automático do Angular vai redirecionar `/api` para `localhost:8080`

---

### Problema: Gradiente estranho/estilos ruins

**Causa:** Tema não está sendo aplicado corretamente

**Solução:**
1. Verificar `app.config.ts`:
```typescript
providePrimeNG({
  theme: {
    preset: Lara,  // Tema Lara (limpo e moderno)
    options: {
      darkModeSelector: false
    }
  }
})
```

2. Limpar cache:
```bash
rm -rf .angular
npm start
```

---

### Problema: Health check error no console

**Erro:**
```
Error checking backend health: ...
GET http://localhost:8080/api/public/health net::ERR_FAILED 403
```

**Causa:** Código antigo ainda compilado

**Solução:**
```bash
# 1. Limpar build anterior
rm -rf .angular dist

# 2. Recompilar
npm start
```

O método `checkHealth()` já foi removido do código.

---

## ✅ Checklist de Verificação

Antes de abrir o navegador, verifique:

- [ ] Backend rodando em `http://localhost:8080`
- [ ] Frontend rodando em `http://localhost:4200`
- [ ] `npm install` executado com sucesso
- [ ] Sem erros no terminal do frontend
- [ ] Sem erros no terminal do backend

### Verificar no Navegador
- [ ] Acessar `http://localhost:4200` (com porta!)
- [ ] Estilos PrimeNG carregados (botões bonitos, não padrão HTML)
- [ ] Ícones PrimeIcons aparecem
- [ ] Layout responsivo funciona
- [ ] Sem erros no Console (F12)

---

## 📁 Estrutura de Arquivos CSS

```
src/
├── styles.css                    ← Estilos globais (imports PrimeNG)
├── app/
│   ├── pages/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.css  ← VAZIO (sem CSS customizado)
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   └── home.component.css   ← VAZIO
│   │   └── ...
```

**Todos os `.css` dos componentes estão VAZIOS** porque usamos apenas PrimeFlex classes.

---

## 🎨 Classes PrimeFlex Disponíveis

### Layout
```
flex, flex-column, flex-row
align-items-center, justify-content-center
gap-2, gap-3, gap-4
min-h-screen, w-full
```

### Grid
```
grid
col-12, md:col-6, lg:col-4
```

### Spacing
```
p-2, p-3, p-4 (padding)
m-0, mt-2, mb-3 (margin)
```

### Typography
```
text-xl, text-2xl, text-3xl
font-bold, font-semibold
text-center, text-color, text-primary
```

### Responsive
```
hidden md:block
md:w-6 lg:w-4
```

---

## 🔄 Reiniciar do Zero (Se Tudo Falhar)

```bash
# 1. Parar tudo (Ctrl+C nos terminais)

# 2. Frontend - Limpar e reinstalar
cd ficha-controlador-front-end
rm -rf node_modules .angular dist
npm install
npm start

# 3. Backend - Reiniciar
cd ficha-controlador
./mvnw spring-boot:run

# 4. Abrir navegador
open http://localhost:4200
```

---

## 📞 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:4200 | Aplicação Angular |
| Backend API | http://localhost:8080 | Spring Boot API |
| Swagger (Backend) | http://localhost:8080/swagger-ui.html | API Docs |
| Actuator (Backend) | http://localhost:8080/actuator/health | Health Check |

---

## ✅ Resultado Esperado

Quando tudo estiver funcionando:

1. **Login Page** - Card bonito, botão do Google estilizado
2. **Fonte** - Roboto ou Inter (não Times New Roman)
3. **Cores** - Tema Lara do PrimeNG (azul/cinza moderno)
4. **Ícones** - PrimeIcons carregando (não mostram quadrados)
5. **Responsivo** - Layout se adapta em mobile/tablet/desktop
6. **Sem erros** - Console do navegador limpo

---

**Última Atualização:** 31/01/2026  
**Status:** ✅ Configuração completa e testada
