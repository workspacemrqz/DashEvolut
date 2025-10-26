# Guia de Implantação - Easypanel com Heroku Buildpacks

## Configuração Completa

O projeto agora está configurado corretamente para implantação no Easypanel usando Heroku Buildpacks.

### Arquivos Criados

1. **Procfile** - Define como o Heroku buildpack inicia a aplicação
2. **.buildpacks** - Especifica o buildpack do Node.js
3. **.slugignore** - Otimiza o deploy excluindo arquivos desnecessários
4. **app.json** - Configurações do aplicativo para Heroku

### Configuração do package.json

- **heroku-postbuild**: Script que compila o projeto automaticamente após instalação
- **engines**: Node.js versão 20.x especificado

## Passos para Implantação no Easypanel

### 1. Variáveis de Ambiente Necessárias

Configure estas variáveis no Easypanel:

```
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=sua-chave-secreta-aqui
NODE_ENV=production
PORT=80
```

**Importante**: O Easypanel geralmente define a porta automaticamente, mas certifique-se de que `PORT` esteja disponível.

### 2. Configurações do Easypanel

**Método de Construção**: Buildpacks  
**Construtor**: `heroku/builder:24`  

### 3. Processo de Build

O Heroku buildpack irá:

1. Detectar Node.js
2. Instalar dependências (`npm install`)
3. Executar `heroku-postbuild` (compila client e server)
4. Iniciar aplicação usando o `Procfile` (`npm run start`)

### 4. Após o Deploy

A aplicação irá:
- Servir na porta definida pela variável `PORT`
- Conectar ao PostgreSQL usando `DATABASE_URL`
- Iniciar o serviço de notificações automaticamente

## Troubleshooting

### Porta Incorreta
Se o app não responder, verifique se a variável `PORT` está definida corretamente no Easypanel.

### Erro de Build
Verifique os logs do buildpack. Se o build falhar:
- Confirme que todas as dependências estão listadas no `package.json`
- Verifique se a versão do Node.js é compatível (20.x)

### Banco de Dados
O script `db:push` pode ser executado manualmente após o deploy se necessário:
```bash
npm run db:push
```

## Estrutura de Arquivos

```
/
├── Procfile              # Define comando de start
├── .buildpacks          # Especifica buildpack Node.js
├── .slugignore          # Arquivos a ignorar no slug
├── app.json             # Configurações do app
├── package.json         # Scripts e dependências
├── dist/                # Build compilado (gerado)
└── server/              # Código fonte servidor
```

## Comandos Úteis

- **Build local**: `npm run build`
- **Start local**: `npm run start`
- **Migração DB**: `npm run db:push`

## Nota de Segurança

Certifique-se de que:
- `SESSION_SECRET` é uma string aleatória e segura
- `DATABASE_URL` está corretamente configurado
- Variáveis sensíveis não estão no código fonte
