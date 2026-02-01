#!/bin/bash

echo "🧹 Limpando cache e node_modules..."
rm -rf node_modules .angular dist

echo "📦 Instalando dependências..."
npm install

echo "✅ Instalação completa!"
echo ""
echo "📋 Verificações:"
echo ""

# Verificar se primeflex está instalado
if npm list primeflex > /dev/null 2>&1; then
  echo "✅ PrimeFlex instalado"
else
  echo "❌ PrimeFlex NÃO instalado - instalando..."
  npm install primeflex@3.3.1
fi

# Verificar se @primeng/themes está instalado
if npm list @primeng/themes > /dev/null 2>&1; then
  echo "✅ @primeng/themes instalado"
else
  echo "❌ @primeng/themes NÃO instalado"
fi

echo ""
echo "🚀 Pronto! Execute: npm start"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Acesse: http://localhost:4200 (COM a porta)"
echo "   - Backend deve estar em: http://localhost:8080"
echo "   - NUNCA acesse http://localhost sem porta"
