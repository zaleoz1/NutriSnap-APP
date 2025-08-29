# NutriSnap Backend

Backend API para o aplicativo NutriSnap, desenvolvido em Node.js com Express e MySQL.

## 🚀 Configuração Rápida

### 1. Pré-requisitos
- Node.js 16+ 
- MySQL 8.0+
- npm ou yarn

### 2. Instalação Automática
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd NutriSnap-APP/backend

# Execute o script de configuração automática
npm run setup

# Para criar usuário de teste também
npm run setup:test
```

### 3. Configuração Manual (se necessário)

#### Variáveis de Ambiente
Copie o arquivo de exemplo e configure:
```bash
cp env.example .env
```

Edite o arquivo `.env`:
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

# Chave da API Gemini (para análise de imagens)
GEMINI_API_KEY=sua_chave_gemini_aqui
```

#### Banco de Dados
```bash
# Conecte ao MySQL
mysql -u root -p

# Execute o schema
mysql -u root -p < schema.sql
```
Get-Content "C:\Users\Isaléo Guimarães\OneDrive\Documentos\Projetos\NutriSnap-APP\backend\schema.sql" | mysql -u root -p


### 4. Instalação de Dependências
```bash
npm install
```

### 5. Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Estrutura do Banco

O banco `nutrisnap` contém as seguintes tabelas:

- **usuarios**: Dados dos usuários (id, nome, email, senha)
- **refeicoes**: Registro de refeições (id, id_usuario, itens, calorias_totais, timestamp)
- **metas**: Metas de peso e calorias (id, id_usuario, peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais)
- **treinos**: Planos de treino (id, id_usuario, plano, criado_em)

## 🔌 Endpoints da API

### Autenticação
- `POST /api/autenticacao/registrar` - Criar conta
- `POST /api/autenticacao/entrar` - Fazer login
- `GET /api/autenticacao/verificar` - Verificar token

### Refeições
- `GET /api/refeicoes` - Listar refeições (requer auth)
- `POST /api/refeicoes` - Criar refeição (requer auth)
- `DELETE /api/refeicoes/:id` - Deletar refeição (requer auth)

### Metas
- `GET /api/metas` - Listar metas (requer auth)
- `POST /api/metas` - Criar meta (requer auth)
- `POST /api/metas/gerar-ia` - Gerar metas nutricionais com IA (requer auth)

**🧠 Metas Nutricionais com IA:**
A API de metas utiliza inteligência artificial para gerar recomendações nutricionais personalizadas baseadas nos dados do quiz:

**Dados analisados pelo sistema:**
- Idade, sexo, altura, peso atual e meta
- Objetivo (emagrecer, ganhar massa, manter peso)
- Nível de atividade física
- Frequência de treinos
- Preferências alimentares
- Restrições médicas
- Hábitos alimentares

**Metas geradas automaticamente:**
- **Calorias diárias** calculadas com fórmula Mifflin-St Jeor
- **Macronutrientes** (proteínas, carboidratos, gorduras) otimizados para o objetivo
- **Micronutrientes** (vitaminas, minerais, fibras) com recomendações personalizadas
- **Estratégias nutricionais** (horários, frequência de refeições)
- **Dicas personalizadas** baseadas no perfil
- **Progresso esperado** em diferentes períodos de tempo

**Exemplo de resposta:**
```json
{
  "calorias_diarias": 1850,
  "macronutrientes": {
    "proteinas": {
      "gramas": 162,
      "percentual": 35,
      "fontes": ["Carnes magras", "Ovos", "Leguminosas"]
    },
    "carboidratos": {
      "gramas": 185,
      "percentual": 40,
      "fontes": ["Arroz integral", "Batata doce", "Aveia"]
    },
    "gorduras": {
      "gramas": 51,
      "percentual": 25,
      "fontes": ["Azeite", "Castanhas", "Abacate"]
    }
  },
  "micronutrientes": {
    "fibras": { "gramas": 26, "fontes": ["Frutas", "Vegetais"] },
    "agua": { "litros": 2.3, "copos": 10 },
    "vitamina_d": { "quantidade": "15-20 mcg/dia", "importancia": "Saúde óssea" }
  },
  "estrategias": {
    "frequencia_refeicoes": 5,
    "pre_treino": "1-2 horas antes",
    "hidratacao": "Beber 2.3L de água por dia"
  },
  "dicas": [
    "Mantenha déficit calórico de 300-500 calorias por dia",
    "Priorize proteínas para manter massa muscular"
  ],
  "progresso_esperado": {
    "primeiro_mes": { "peso": -2, "energia": "Aumento significativo" },
    "tres_meses": { "peso": -6, "composicao_corporal": "Melhora significativa" }
  }
}
```

### Treinos
- `GET /api/treinos` - Listar treinos (requer auth)
- `POST /api/treinos` - Criar treino (requer auth)

### Quiz de Perfil
- `GET /api/quiz` - Buscar respostas do quiz (requer auth)
- `POST /api/quiz` - Salvar/atualizar respostas do quiz (requer auth)
- `DELETE /api/quiz` - Deletar respostas do quiz (requer auth)

### Análise Nutricional
- `POST /api/analise` - Analisar imagem de alimento (requer auth)

**📸 Análise de Imagens com IA:**
A API de análise utiliza o Google Gemini para identificar alimentos e estimar informações nutricionais completas:

**Dados retornados para cada alimento:**
- `nome`: Nome do alimento identificado
- `calorias`: Calorias em kcal
- `proteinas`: Proteínas em gramas
- `carboidratos`: Carboidratos em gramas
- `gorduras`: Gorduras em gramas

**Resposta da API:**
```json
{
  "itens": [
    {
      "nome": "Arroz Integral",
      "calorias": 120,
      "proteinas": 2.5,
      "carboidratos": 25.0,
      "gorduras": 0.8
    }
  ],
  "caloriasTotais": 120,
  "proteinasTotais": 2.5,
  "carboidratosTotais": 25.0,
  "gordurasTotais": 0.8
}
```

### Saúde
- `GET /api/saude` - Status do servidor e banco

## 🔒 Segurança

- **JWT**: Autenticação baseada em tokens
- **bcrypt**: Hash de senhas com salt
- **Helmet**: Headers de segurança
- **Rate Limiting**: Proteção contra spam
- **CORS**: Configuração de origens permitidas
- **Validação**: Schema validation com Zod

## 🧪 Usuário de Teste

Se você executou `npm run setup:test`, um usuário de teste foi criado:

- **Email**: teste@nutrisnap.com
- **Senha**: Teste123

## 🌐 Configuração do Mobile

No arquivo `mobile/src/services/api.js`, ajuste o IP para o seu ambiente:

```javascript
// Para desenvolvimento local
export const URL_BASE = 'http://192.168.0.135:3000';

// Para emulador Android
export const URL_BASE = 'http://10.0.2.2:3000';

// Para produção
export const URL_BASE = 'https://seu-dominio.com';
```

## 📝 Logs

O servidor registra todas as requisições e erros:
- Requisições: `[timestamp] METHOD /path - IP`
- Erros: `❌ Descrição do erro`
- Sucessos: `✅ Ação realizada`

## 🚨 Solução de Problemas

### Erro de Conexão com MySQL
```bash
# Verifique se o MySQL está rodando
sudo systemctl status mysql

# Teste a conexão
mysql -u root -p

# Verifique as permissões do usuário
SHOW GRANTS FOR 'root'@'localhost';
```

### Erro de Porta em Uso
```bash
# Verifique qual processo está usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>
```

### Erro de Dependências
```bash
# Limpe o cache
npm cache clean --force

# Delete node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Problemas com a API de Análise
```bash
# Verifique se a chave Gemini está configurada
echo $GEMINI_API_KEY

# Teste a API manualmente
curl -X POST http://localhost:3000/api/analise \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token" \
  -d '{"dadosImagemBase64":"dados_base64_aqui"}'
```

### Problemas com Metas Nutricionais
```bash
# Verifique se o quiz foi completado
curl -X GET http://localhost:3000/api/quiz \
  -H "Authorization: Bearer seu_token"

# Teste a geração de metas
curl -X POST http://localhost:3000/api/metas/gerar-ia \
  -H "Authorization: Bearer seu_token"
```

## 📚 Desenvolvimento

### Estrutura de Arquivos
```
backend/
├── config/          # Configurações (banco, etc.)
├── middleware/      # Middlewares (auth, etc.)
├── routes/          # Rotas da API
├── server.jsx       # Servidor principal
├── setup.jsx        # Script de configuração
├── schema.sql       # Estrutura do banco
├── env.example      # Exemplo de variáveis de ambiente
├── ANALISE_NUTRICIONAL.md  # Documentação da análise nutricional
└── package.json     # Dependências e scripts
```

### Adicionando Novas Rotas
1. Crie o arquivo em `routes/`
2. Implemente a lógica
3. Importe e registre em `server.js`
4. Adicione middleware de autenticação se necessário

### Middleware de Autenticação
```javascript
import { requerAutenticacao } from '../middleware/auth.js';

// Rota protegida
router.get('/protegida', requerAutenticacao, (req, res) => {
  // req.idUsuario contém o ID do usuário autenticado
  res.json({ mensagem: 'Rota protegida' });
});
```

### Testando a API de Análise
```bash
# Teste manualmente com uma imagem real
# 1. Capture uma foto de comida
# 2. Converta para base64
# 3. Faça uma requisição POST para /api/analise
```

### Testando Metas Nutricionais
```bash
# 1. Complete o quiz primeiro
curl -X POST http://localhost:3000/api/quiz \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{"idade": 25, "sexo": "masculino", ...}'

# 2. Gere metas nutricionais
curl -X POST http://localhost:3000/api/metas/gerar-ia \
  -H "Authorization: Bearer seu_token"

# 3. Visualize as metas geradas
curl -X GET http://localhost:3000/api/metas \
  -H "Authorization: Bearer seu_token"
```

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe.



