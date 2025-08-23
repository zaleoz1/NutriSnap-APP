# 🚀 NutriSnap - Instruções de Configuração

Este documento contém instruções completas para configurar e executar o projeto NutriSnap.

## 📋 Pré-requisitos

### Sistema Operacional
- **Windows 10/11** ✅ (Testado)
- **macOS 10.15+** ✅
- **Linux (Ubuntu 20.04+)** ✅

### Software Necessário
- **Node.js 16.0.0+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** (para mobile) - `npm install -g @expo/cli`

### Verificações
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar MySQL
mysql --version

# Verificar Git
git --version
```

## 🏗️ Configuração do Backend

### 1. Navegar para o Backend
```bash
cd NutriSnap-APP/backend
```

### 2. Configuração Automática (Recomendado)
```bash
# Instalar dependências e configurar banco
npm run setup

# Para criar usuário de teste também
npm run setup:test
```

### 3. Configuração Manual (se necessário)

#### A. Criar arquivo de ambiente
```bash
# Windows
copy env.example .env

# macOS/Linux
cp env.example .env
```

#### B. Editar arquivo .env
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha_mysql
DB_NAME=nutrisnap

# Configurações do JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Configurações do Servidor
PORT=3000
HOST=0.0.0.0

# Configurações de Segurança
NODE_ENV=development
```

#### C. Configurar MySQL
```bash
# Conectar ao MySQL
mysql -u root -p

# Criar banco (se não existir)
CREATE DATABASE IF NOT EXISTS nutrisnap;

# Executar schema
mysql -u root -p nutrisnap < schema.sql

# Verificar tabelas
USE nutrisnap;
SHOW TABLES;
```

#### D. Instalar dependências
```bash
npm install
```

### 4. Executar Backend
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 5. Verificar Funcionamento
- Acesse: http://localhost:3000
- Deve mostrar: `{"mensagem":"NutriSnap Backend API","status":"online"}`
- Teste saúde: http://localhost:3000/api/saude

## 📱 Configuração do Mobile

### 1. Navegar para o Mobile
```bash
cd NutriSnap-APP/mobile
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar IP do Backend

Edite o arquivo `src/services/api.js`:

```javascript
// Para desenvolvimento local (Windows)
export const URL_BASE = 'http://192.168.0.135:3000';

// Para emulador Android
export const URL_BASE = 'http://10.0.2.2:3000';

// Para dispositivo físico na mesma rede
export const URL_BASE = 'http://SEU_IP_LOCAL:3000';

// Para produção
export const URL_BASE = 'https://seu-dominio.com';
```

#### Como descobrir seu IP local:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# ou
ip addr
```

### 4. Executar Mobile
```bash
# Iniciar Expo
npx expo start

# Ou usar npm
npm start
```

### 5. Conectar Dispositivo
- **Android**: Instale Expo Go e escaneie o QR code
- **iOS**: Use a câmera para escanear o QR code
- **Emulador**: Pressione 'a' para Android ou 'i' para iOS

## 🔧 Solução de Problemas Comuns

### Backend não inicia
```bash
# Verificar se a porta está livre
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Matar processo se necessário
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Erro de conexão com MySQL
```bash
# Verificar se MySQL está rodando
# Windows
net start mysql

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Testar conexão
mysql -u root -p
```

### Mobile não conecta ao Backend
1. **Verificar IP**: Confirme se o IP no `api.js` está correto
2. **Verificar Firewall**: Permita conexões na porta 3000
3. **Verificar Rede**: Dispositivo e computador devem estar na mesma rede
4. **Testar API**: Acesse http://SEU_IP:3000 no navegador do dispositivo

### Erro de dependências
```bash
# Limpar cache
npm cache clean --force

# Deletar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

## 🧪 Testando o Sistema

### 1. Usuário de Teste
Se você executou `npm run setup:test`:
- **Email**: teste@nutrisnap.com
- **Senha**: Teste123

### 2. Fluxo de Teste
1. **Registro**: Crie uma nova conta
2. **Login**: Faça login com a conta criada
3. **Funcionalidades**: Teste as diferentes telas do app
4. **API**: Verifique se os dados são salvos no banco

### 3. Verificar Banco de Dados
```sql
-- Conectar ao MySQL
mysql -u root -p nutrisnap

-- Ver usuários criados
SELECT id, nome, email, criado_em FROM usuarios;

-- Ver refeições (se houver)
SELECT * FROM refeicoes;

-- Ver metas (se houver)
SELECT * FROM metas;
```

## 📱 Funcionalidades do App

### Telas Disponíveis
- **Splash**: Tela de carregamento
- **Welcome**: Boas-vindas e introdução
- **Login**: Autenticação de usuário
- **Registro**: Criação de nova conta
- **Home**: Tela principal com métricas
- **Dashboard**: Painel de controle
- **Metas**: Definição de objetivos
- **Plano de Treino**: Criação de rotinas
- **Refeições**: Registro de alimentação
- **BMI**: Calculadora de IMC
- **Integração**: Onboarding personalizado

### Modo Visitante
- Funciona sem conta
- Dados não são salvos
- Ideal para testar funcionalidades

## 🔒 Segurança

### JWT Tokens
- Expiração: 7 dias
- Renovação automática no login
- Validação em todas as rotas protegidas

### Validação de Dados
- **Nome**: 2-100 caracteres, apenas letras e espaços
- **Email**: Formato válido, máximo 100 caracteres
- **Senha**: 6-255 caracteres, maiúscula + minúscula + número

### Rate Limiting
- 100 requisições por IP a cada 15 minutos
- Proteção contra spam e ataques

## 📊 Monitoramento

### Logs do Backend
- Todas as requisições são logadas
- Erros são registrados com detalhes
- Timestamps em formato ISO

### Status da API
- Endpoint `/api/saude` para verificar status
- Verificação automática de conectividade
- Indicadores visuais no mobile

## 🚀 Deploy em Produção

### Backend
1. Configure variáveis de ambiente para produção
2. Use PM2 ou similar para gerenciar processos
3. Configure HTTPS com certificado SSL
4. Configure firewall e segurança

### Mobile
1. Build para produção com EAS Build
2. Configure URLs de produção
3. Teste em dispositivos reais
4. Publique nas lojas (Google Play/App Store)

## 📞 Suporte

### Problemas Comuns
- Verifique os logs do console
- Confirme configurações de rede
- Teste conectividade manualmente
- Verifique versões das dependências

### Recursos Adicionais
- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do Express](https://expressjs.com/)
- [Documentação do MySQL](https://dev.mysql.com/doc/)
- [Documentação do Node.js](https://nodejs.org/docs/)

## 🎯 Próximos Passos

1. **Teste todas as funcionalidades**
2. **Personalize para suas necessidades**
3. **Configure para produção**
4. **Monitore e mantenha atualizado**

---

**🎉 Parabéns!** Seu projeto NutriSnap está configurado e funcionando!

Para dúvidas ou problemas, consulte este documento ou abra uma issue no repositório.
