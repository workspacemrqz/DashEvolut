#!/bin/bash

# Script de inicialização para produção
echo "🚀 Starting production server..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL não está definida"
    exit 1
fi

# Executar migrações do banco de dados se necessário
echo "📊 Running database migrations..."
npm run db:push

# Iniciar o servidor
echo "🌟 Starting server on port ${PORT:-3000}..."
npm start