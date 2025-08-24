# 🍎 NutriSnap - Aplicativo de Nutrição e Saúde


## 📱 Sobre o Projeto

O **NutriSnap** é um aplicativo completo de nutrição e saúde que permite aos usuários:

- 📸 **Analisar alimentos** através de fotos usando IA (Gemini)
- 🎯 **Definir metas** de peso e calorias diárias
- 💪 **Criar planos de treino** personalizados
- 📊 **Acompanhar progresso** com dashboard interativo
- 🍽️ **Registrar refeições** e calcular calorias
- 📈 **Monitorar IMC** e saúde geral

## 🏗️ Arquitetura do Sistema

O projeto é dividido em duas partes principais:

### 🔧 Backend (Node.js + Express + MySQL)
- **API RESTful** com autenticação JWT
- **Banco de dados MySQL** para persistência
- **Middleware de segurança** (Helmet, Rate Limiting, CORS)
- **Validação de dados** com Zod
- **Análise de imagens** via API Gemini

### 📱 Mobile (React Native + Expo)
- **Interface nativa** para iOS e Android
- **Navegação por stack** com React Navigation
- **Gerenciamento de estado** com Context API
- **Armazenamento local** com AsyncStorage
- **Design responsivo** e animações fluidas

## 🚀 Funcionalidades Principais

### 🔐 Autenticação e Usuários
- Registro e login seguro
- Tokens JWT com expiração
- Validação de dados robusta
- Criptografia de senhas com bcrypt

### 📸 Análise de Alimentos
- Captura de fotos via câmera
- Seleção de imagens da galeria
- Análise automática com IA
- Identificação de alimentos e calorias
- Formato JSON estruturado

### 🎯 Metas e Objetivos
- Cálculo de calorias diárias
- Definição de metas de peso
- Cronograma personalizado
- Acompanhamento de progresso

### 💪 Planos de Treino
- Geração automática de rotinas
- Personalização por objetivos
- Diferentes níveis de intensidade
- Cronograma semanal flexível

### 📊 Dashboard e Métricas
- Visão geral de calorias
- Acompanhamento de passos
- Registro de exercícios
- Monitoramento de peso e água

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver de banco de dados
- **JWT** - Autenticação por tokens
- **bcryptjs** - Criptografia de senhas
- **Zod** - Validação de schemas
- **Helmet** - Segurança de headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra spam

### Mobile
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **AsyncStorage** - Armazenamento local
- **Expo Image Picker** - Captura de imagens
- **React Native Reanimated** - Animações

## 📁 Estrutura do Projeto

```
NutriSnap-APP/
├── 📁 backend/                    # Servidor Node.js
│   ├── 📁 config/                # Configurações
│   │   └── db.js                 # Conexão com MySQL
│   ├── 📁 middleware/            # Middlewares
│   │   └── auth.js               # Autenticação JWT
│   ├── 📁 routes/                # Rotas da API
│   │   ├── auth.js               # Autenticação
│   │   ├── analyze.js            # Análise de imagens
│   │   ├── goals.js              # Metas
│   │   ├── meals.js              # Refeições
│   │   └── workouts.js           # Treinos
│   ├── server.js                 # Servidor principal
│   ├── setup.js                  # Script de configuração
│   ├── schema.sql                # Estrutura do banco
│   └── package.json              # Dependências
│
├── 📁 mobile/                     # Aplicativo React Native
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes reutilizáveis
│   │   │   └── NavigationHandler.js
│   │   ├── 📁 services/          # Serviços e APIs
│   │   │   ├── api.js            # Cliente HTTP
│   │   │   └── AuthContext.js    # Contexto de autenticação
│   │   ├── 📁 styles/            # Estilos globais
│   │   │   └── globalStyles.js   # Sistema de design
│   │   ├── 📁 Telas/             # Telas do aplicativo
│   │   │   ├── Splash.js         # Tela inicial
│   │   │   ├── Welcome.js        # Boas-vindas
│   │   │   ├── Login.js          # Login
│   │   │   ├── Cadastro.js       # Registro
│   │   │   ├── Dashboard.js      # Painel principal
│   │   │   ├── IMC.js            # Calculadora de IMC
│   │   │   ├── Metas.js          # Definição de metas
│   │   │   ├── PlanodeTreino.js  # Planos de treino
│   │   │   ├── Refeicoes.js      # Registro de refeições
│   │   │   └── Quiiz.js          # Onboarding
│   │   └── 📁 utils/             # Utilitários
│   │       └── iconUtils.js      # Gerenciamento de ícones
│   ├── App.js                    # Componente raiz
│   └── package.json              # Dependências
│
└── README.md                      # Este arquivo
```

## 🚀 Configuração Rápida

### Pré-requisitos
- **Node.js** 16+ 
- **MySQL** 8.0+
- **npm** ou **yarn**
- **Expo CLI** (para mobile)

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd NutriSnap-APP
```

### 2. Configurar Backend
```bash
cd backend

# Instalar dependências
npm install

# Configuração automática
npm run setup

# Para criar usuário de teste
npm run setup:test

# Iniciar servidor
npm run dev
```

### 3. Configurar Mobile
```bash
cd mobile

# Instalar dependências
npm install

# Iniciar aplicativo
npm start
```

## ⚙️ Configuração Detalhada

### Backend

#### Variáveis de Ambiente
Copie e configure o arquivo `.env`:
```bash
cp env.example .env
```

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha_mysql
DB_NAME=nutrisnap

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Servidor
PORT=3000
HOST=0.0.0.0

# Ambiente
NODE_ENV=development

# Gemini API (opcional)
GEMINI_API_KEY=sua_chave_gemini
```

#### Banco de Dados
```bash
# Conectar ao MySQL
mysql -u root -p

# Executar schema
mysql -u root -p < schema.sql
```

### Mobile

#### Configuração de IP
No arquivo `mobile/src/services/api.js`, ajuste o IP:
```javascript
// Para desenvolvimento local
export const URL_BASE = 'http://192.168.0.135:3000';

// Para emulador Android
export const URL_BASE = 'http://10.0.2.2:3000';

// Para produção
export const URL_BASE = 'https://seu-dominio.com';
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/autenticacao/registrar` - Criar conta
- `POST /api/autenticacao/entrar` - Fazer login
- `GET /api/autenticacao/verificar` - Verificar token

### Refeições
- `GET /api/refeicoes` - Listar refeições
- `POST /api/refeicoes` - Criar refeição
- `DELETE /api/refeicoes/:id` - Deletar refeição

### Metas
- `GET /api/metas` - Listar metas
- `POST /api/metas` - Criar meta

### Treinos
- `GET /api/treinos` - Listar treinos
- `POST /api/treinos` - Criar treino

### Análise
- `POST /api/analise` - Analisar imagem de alimento

### Saúde
- `GET /api/saude` - Status do servidor

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **usuarios**: Dados dos usuários
- **refeicoes**: Registro de refeições
- **metas**: Metas de peso e calorias
- **treinos**: Planos de treino

### Schema SQL
```sql
CREATE DATABASE nutrisnap;
USE nutrisnap;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outras tabelas...
```

## 🔒 Segurança

- **JWT**: Autenticação baseada em tokens
- **bcrypt**: Hash de senhas com salt
- **Helmet**: Headers de segurança
- **Rate Limiting**: Proteção contra spam
- **CORS**: Configuração de origens permitidas
- **Validação**: Schema validation com Zod

## 🧪 Usuário de Teste

Se você executou `npm run setup:test`:
- **Email**: teste@nutrisnap.com
- **Senha**: Teste123

## 📱 Telas do Aplicativo

### 1. **Splash** - Tela inicial com animações
### 2. **Welcome** - Boas-vindas e introdução
### 3. **Onboarding** - Quiz de personalização
### 4. **Login** - Autenticação de usuário
### 5. **Cadastro** - Criação de conta
### 6. **Dashboard** - Painel principal com métricas
### 7. **IMC** - Calculadora de índice de massa corporal
### 8. **Metas** - Definição de objetivos
### 9. **Plano de Treino** - Rotinas de exercícios
### 10. **Refeições** - Registro e análise de alimentos

## 🎨 Sistema de Design

### Cores
- **Primária**: Azul (#00C9FF)
- **Sucesso**: Verde (#10b981)
- **Erro**: Vermelho (#ef4444)
- **Aviso**: Amarelo (#f59e0b)

### Tipografia
- **Títulos**: 24px, Bold
- **Subtítulos**: 20px, Semibold
- **Corpo**: 16px, Regular
- **Legendas**: 14px, Medium

### Espaçamento
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

## 🚨 Solução de Problemas

### Erro de Conexão com MySQL
```bash
# Verificar status
sudo systemctl status mysql

# Testar conexão
mysql -u root -p

# Verificar permissões
SHOW GRANTS FOR 'root'@'localhost';
```

### Erro de Porta em Uso
```bash
# Verificar processo
lsof -i :3000

# Encerrar processo
kill -9 <PID>
```

### Erro de Dependências
```bash
# Limpar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Desenvolvimento

### Estrutura de Arquivos
```
backend/
├── config/          # Configurações
├── middleware/      # Middlewares
├── routes/          # Rotas da API
├── server.js        # Servidor principal
├── setup.js         # Script de configuração
└── schema.sql       # Estrutura do banco

mobile/
├── src/
│   ├── components/  # Componentes
│   ├── services/    # Serviços
│   ├── styles/      # Estilos
│   ├── Telas/       # Telas
│   └── utils/       # Utilitários
└── App.js           # Componente raiz
```

### Adicionando Novas Rotas
1. Crie o arquivo em `routes/`
2. Implemente a lógica
3. Importe e registre em `server.js`
4. Adicione middleware de autenticação se necessário

### Middleware de Autenticação
```javascript
import { requerAutenticacao } from '../middleware/auth.js';

router.get('/protegida', requerAutenticacao, (req, res) => {
  // req.idUsuario contém o ID do usuário autenticado
  res.json({ mensagem: 'Rota protegida' });
});
```

## 🌐 Configuração de Rede

### Desenvolvimento Local
- **Backend**: http://localhost:3000
- **Mobile**: Expo DevTools
- **IP Local**: http://192.168.0.135:3000

### Emuladores
- **Android**: http://10.0.2.2:3000
- **iOS Simulator**: http://localhost:3000

### Produção
- **Backend**: https://seu-dominio.com
- **Mobile**: Build nativo

## 📝 Logs e Monitoramento

### Backend
- Requisições: `[timestamp] METHOD /path - IP`
- Erros: `❌ Descrição do erro`
- Sucessos: `✅ Ação realizada`

### Mobile
- API Requests: `🌐 API Request: METHOD URL`
- API Responses: `📡 API Response: STATUS`
- Erros: `❌ Erro na API: mensagem`

## 🔄 Fluxo de Dados

### Autenticação
1. Usuário faz login/registro
2. Backend valida credenciais
3. Gera token JWT
4. Mobile armazena token
5. Token usado em requisições

### Análise de Imagens
1. Usuário tira foto/seleciona imagem
2. Imagem convertida para base64
3. Enviada para API Gemini
4. Backend processa resposta
5. Dados retornados ao mobile

### Sincronização
1. Dados salvos localmente
2. Enviados para backend
3. Armazenados no MySQL
4. Sincronizados entre dispositivos

## 🚀 Deploy

### Backend
```bash
# Produção
NODE_ENV=production npm start

# PM2
pm2 start server.js --name nutrisnap

# Docker (futuro)
docker build -t nutrisnap .
docker run -p 3000:3000 nutrisnap
```

### Mobile
```bash
# Build Android
expo build:android

# Build iOS
expo build:ios

# EAS Build
eas build --platform all
```

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- **Backend**: ES6+, async/await, try/catch
- **Mobile**: React Hooks, functional components
- **Estilo**: Prettier, ESLint (futuro)
- **Commits**: Conventional Commits (futuro)

## 📞 Suporte

- **Issues**: [GitHub Issues](link-para-issues)
- **Documentação**: [Wiki](link-para-wiki)
- **Email**: suporte@nutrisnap.com
- **Discord**: [Servidor da Comunidade](link-para-discord)

## 🙏 Agradecimentos

- **Expo** pela plataforma de desenvolvimento
- **React Native** pela base do aplicativo
- **Node.js** pelo runtime do backend
- **MySQL** pelo banco de dados
- **Gemini** pela análise de imagens
- **Comunidade open source** por todas as bibliotecas

## 📈 Roadmap

### Versão 1.1
- [ ] Notificações push
- [ ] Sincronização offline
- [ ] Backup na nuvem
- [ ] Temas personalizáveis

### Versão 1.2
- [ ] Integração com wearables
- [ ] Receitas personalizadas
- [ ] Comunidade de usuários
- [ ] Gamificação

### Versão 2.0
- [ ] IA avançada para nutrição
- [ ] Análise de progresso
- [ ] Integração com profissionais
- [ ] Marketplace de produtos

---

<div align="center">

**Desenvolvido com ❤️ pela Equipe NutriSnap**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nutrisnap)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/nutrisnap)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/nutrisnap)

</div>
