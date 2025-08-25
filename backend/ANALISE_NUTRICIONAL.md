# 📸 Análise Nutricional com IA

## Visão Geral

A funcionalidade de análise nutricional permite que os usuários fotografem suas refeições e recebam informações nutricionais detalhadas através da inteligência artificial do Google Gemini.

## 🚀 Como Funciona

### 1. Captura da Imagem
- Usuário tira foto da refeição usando a câmera do app
- Ou seleciona uma imagem da galeria
- A imagem é convertida para base64

### 2. Análise pela IA
- Imagem é enviada para o Google Gemini
- IA identifica os alimentos presentes
- Estima valores nutricionais para cada item

### 3. Resposta Estruturada
- Dados são validados e normalizados
- Totais são calculados automaticamente
- Resposta é formatada em JSON

## 🔧 Configuração

### Variável de Ambiente
```bash
# Adicione no arquivo .env
GEMINI_API_KEY=sua_chave_gemini_aqui
```

### Obter Chave Gemini
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

## 📊 Estrutura de Dados

### Requisição
```json
{
  "dadosImagemBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

### Resposta
```json
{
  "itens": [
    {
      "nome": "Arroz Integral",
      "calorias": 120,
      "proteinas": 2.5,
      "carboidratos": 25.0,
      "gorduras": 0.8
    },
    {
      "nome": "Frango Grelhado",
      "calorias": 180,
      "proteinas": 35.0,
      "carboidratos": 0.0,
      "gorduras": 4.0
    }
  ],
  "caloriasTotais": 300,
  "proteinasTotais": 37.5,
  "carboidratosTotais": 25.0,
  "gordurasTotais": 4.8
}
```

## 🧪 Testando

### Teste Automático
```bash
npm run test:analyze
```

### Teste Manual
```bash
# 1. Inicie o servidor
npm run dev

# 2. Faça uma requisição POST
curl -X POST http://localhost:3000/api/analise \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token" \
  -d '{"dadosImagemBase64":"dados_base64_aqui"}'
```

## 🔍 Validação de Dados

### Campos Obrigatórios
- `nome`: String não vazia
- `calorias`: Número >= 0
- `proteinas`: Número >= 0
- `carboidratos`: Número >= 0
- `gorduras`: Número >= 0

### Normalização
- Valores numéricos são convertidos para float
- Valores inválidos são definidos como 0
- Nomes vazios são substituídos por "Alimento não identificado"

### Cálculo de Totais
- Se não fornecidos, são calculados automaticamente
- Soma de todos os itens da refeição

## 📱 Integração Mobile

### Tela de Refeições
- Exibe informações nutricionais para cada alimento
- Mostra totais da refeição
- Calcula percentuais de macronutrientes
- Permite adição manual de alimentos

### Campos de Entrada
- Nome do alimento
- Calorias
- Proteínas (g)
- Carboidratos (g)
- Gorduras (g)

## 🚨 Solução de Problemas

### Erro: "GEMINI_API_KEY não configurada"
```bash
# Verifique se a variável está definida
echo $GEMINI_API_KEY

# Adicione no arquivo .env
GEMINI_API_KEY=sua_chave_aqui
```

### Erro: "Resposta inválida do modelo"
- A IA pode não ter conseguido identificar os alimentos
- Tente com uma imagem mais clara
- Verifique se a chave Gemini está válida

### Erro: "Token expirado"
- Faça login novamente no app
- Verifique se o token JWT está válido

## 📈 Melhorias Futuras

### Funcionalidades Planejadas
- [ ] Histórico de análises
- [ ] Comparação com metas nutricionais
- [ ] Sugestões de alimentos similares
- [ ] Análise de porções
- [ ] Integração com banco de dados nutricional

### Otimizações Técnicas
- [ ] Cache de análises similares
- [ ] Processamento em lote
- [ ] Compressão de imagens
- [ ] Análise offline

## 🔒 Segurança

### Proteções Implementadas
- Autenticação obrigatória (JWT)
- Rate limiting (100 req/15min por IP)
- Validação de entrada
- Sanitização de dados

### Boas Práticas
- Chave Gemini nunca é exposta ao cliente
- Imagens são processadas apenas no backend
- Dados são validados antes do processamento
- Logs não incluem dados sensíveis

## 📚 Recursos Adicionais

### Documentação Gemini
- [API Reference](https://ai.google.dev/api/gemini_api)
- [Modelos Disponíveis](https://ai.google.dev/models/gemini)
- [Melhores Práticas](https://ai.google.dev/docs/best_practices)

### Exemplos de Uso
- [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [React Native Camera](https://react-native-camera.github.io/react-native-camera/)

### Ferramentas de Teste
- [Base64 Image Converter](https://base64.guru/converter/encode/image)
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
