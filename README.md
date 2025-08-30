# 🍎 NutriSnap - Aplicativo de Nutrição e Saúde

Aplicativo móvel completo para controle nutricional, análise de alimentos por IA e acompanhamento de treinos personalizados.

## 📱 Funcionalidades Principais

### 🔐 **Autenticação e Perfil**
- Cadastro e login de usuários
- Perfil personalizado com dados físicos
- Quiz inicial para personalização
- Configurações de conta

### 📸 **Análise Nutricional por IA**
- Captura de fotos de refeições
- Análise automática via Google Gemini
- Identificação de alimentos e nutrientes
- Cálculo automático de calorias e macronutrientes

### 🎯 **Metas Personalizadas**
- Metas de peso e calorias
- Geração automática de planos nutricionais
- Recomendações baseadas no perfil do usuário
- Acompanhamento de progresso

### 💪 **Planos de Treino**
- Geração automática de treinos personalizados
- Baseado no objetivo, nível e acesso à academia
- Acompanhamento de treinos concluídos
- Estatísticas de performance

### 📊 **Dashboard Completo**
- Visão geral do progresso diário
- Registro de refeições e exercícios
- Controle de hidratação
- Histórico de atividades

## 🏗️ Arquitetura

### **Backend (Node.js + Express)**
```
backend/
├── config/          # Configuração do banco MySQL
├── middleware/      # Autenticação JWT
├── routes/          # APIs REST
├── server.js        # Servidor principal
└── setup.js         # Configuração automática
```

### **Mobile (React Native + Expo)**
```
mobile/
├── src/
│   ├── components/  # Componentes reutilizáveis
│   ├── services/    # APIs e autenticação
│   ├── styles/      # Estilos globais
│   ├── Telas/       # Telas do aplicativo
│   └── utils/       # Utilitários
└── App.jsx          # Aplicativo principal
```

## 🚀 Configuração Rápida

### 1. **Backend**
```bash
cd backend
npm install
npm run setup
npm run dev
```

### 2. **Mobile**
```bash
cd mobile
npm install
npx expo start
```

### 3. **Banco de Dados**
- MySQL 8.0+
- Execute `npm run setup` no backend para configuração automática

## 🔧 Configurações

### **Variáveis de Ambiente (.env)**
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=nutrisnap
JWT_SECRET=sua_chave_secreta
GEMINI_API_KEY=sua_chave_gemini
PORT=3000
```

### **IP do Backend (Mobile)**
Edite `mobile/src/services/api.jsx`:
```javascript
export const URL_BASE = 'http://SEU_IP:3000';
```

## 📱 Fluxo do Usuário

### 1. **Primeiro Acesso**
- Splash screen → Welcome → Cadastro/Login
- Quiz inicial para personalização
- Geração automática de metas e treinos

### 2. **Uso Diário**
- Dashboard com visão geral
- Registro de refeições via foto ou manual
- Acompanhamento de treinos
- Controle de hidratação

### 3. **Análise Nutricional**
- Tire foto da refeição
- IA identifica alimentos automaticamente
- Calcula nutrientes e calorias
- Salva no histórico

## 🧠 Inteligência Artificial

### **Análise de Imagens (Gemini)**
- Identifica alimentos em fotos
- Estima valores nutricionais
- Retorna dados estruturados em JSON
- Validação e normalização automática

### **Metas Nutricionais**
- Cálculo de TMB (Mifflin-St Jeor)
- Ajuste baseado no objetivo
- Distribuição de macronutrientes
- Recomendações personalizadas

### **Planos de Treino**
- Baseado no perfil do usuário
- Ajuste de intensidade e frequência
- Exercícios adaptados ao acesso à academia
- Progressão automática

## 🔒 Segurança

- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **Helmet** para headers de segurança
- **Rate limiting** contra spam
- **Validação** com Zod

## 📊 Banco de Dados

### **Tabelas Principais**
- `usuarios` - Dados dos usuários
- `meus_dados` - Respostas do quiz
- `metas` - Metas nutricionais
- `treinos` - Planos de treino
- `refeicoes` - Histórico de refeições

## 🧪 Testes

### **Usuário de Teste**
```bash
npm run setup:test
# Email: teste@nutrisnap.com
# Senha: Teste123
```

### **Teste de Autenticação**
```bash
npm run test:auth
```

## 🌐 APIs Disponíveis

- **Autenticação**: `/api/autenticacao/*`
- **Usuários**: `/api/usuarios/*`
- **Quiz**: `/api/quiz`
- **Metas**: `/api/metas/*`
- **Treinos**: `/api/treinos/*`
- **Refeições**: `/api/refeicoes/*`
- **Análise**: `/api/analise`
- **Saúde**: `/api/saude`

## 📱 Telas do Aplicativo

1. **Splash** - Tela inicial
2. **Welcome** - Boas-vindas
3. **Login/Cadastro** - Autenticação
4. **Quiz** - Personalização inicial
5. **Dashboard** - Visão geral
6. **Diário** - Registro diário
7. **Metas** - Acompanhamento de objetivos
8. **Plano de Treino** - Exercícios personalizados
9. **Refeições** - Análise nutricional
10. **Meus Dados** - Perfil e configurações
11. **Configurações** - Ajustes da conta

## 🚨 Solução de Problemas

### **Backend não inicia**
```bash
# Verificar MySQL
sudo systemctl status mysql

# Verificar porta
lsof -i :3000
```

### **Mobile não conecta**
- Verificar IP no arquivo `api.jsx`
- Confirmar se backend está rodando
- Testar conectividade: `npm run test:auth`

### **Análise de imagens falha**
- Verificar `GEMINI_API_KEY` no `.env`
- Confirmar formato da imagem (JPEG)
- Verificar tamanho (máximo 10MB)

## 📚 Tecnologias

- **Backend**: Node.js, Express, MySQL, JWT
- **Mobile**: React Native, Expo
- **IA**: Google Gemini API
- **Segurança**: bcrypt, helmet, rate-limit
- **Validação**: Zod

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License

## 📞 Suporte

Para suporte, abra uma issue no repositório.
