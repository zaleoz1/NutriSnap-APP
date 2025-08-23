# NutriSnap - Aplicativo de Fitness e Nutrição

## Visão Geral

NutriSnap é um aplicativo móvel completo de fitness e nutrição inspirado no design do MyFitnessPal, com um fluxo de onboarding moderno e funcionalidades avançadas de rastreamento de saúde.

## 🎨 Design e Interface

### Tema Visual
- **Modo Escuro**: Interface moderna com tema escuro predominante
- **Cores**: Paleta azul moderna com acentos em amarelo e verde
- **Tipografia**: Sistema de fontes hierárquico e legível
- **Sombras**: Sistema de elevação consistente para profundidade visual

### Fluxo de Navegação

#### 1. Tela de Carregamento (SplashScreen)
- Logo animado com efeito de rotação
- Transição suave para a próxima tela
- Duração: 3 segundos

#### 2. Tela de Boas-vindas (WelcomeScreen)
- Carrossel de 3 slides apresentando funcionalidades
- Botões de ação principais:
  - "ENTRAR NA MINHA CONTA" (Login)
  - "Experimentar Agora" (Modo Visitante)
  - "Primeira vez? Criar conta" (Registro)

#### 3. Fluxo de Onboarding (OnboardingScreen)
Quiz em 7 etapas para coletar informações do usuário:

1. **Metas**: Seleção de até 3 objetivos principais
2. **Planos de Refeição**: Preferência por planos semanais
3. **Obstáculos**: Identificação de desafios anteriores
4. **Nível de Atividade**: Avaliação da rotina diária
5. **Informações Pessoais**: Sexo, idade, país, CEP
6. **Medidas**: Altura, peso atual e meta
7. **Meta Semanal**: Objetivo de perda de peso

#### 4. Dashboard Principal (DashboardScreen)
Interface completa inspirada no MyFitnessPal:

- **Header**: Avatar, saudação personalizada, notificações
- **Card de Calorias**: Círculo de progresso com breakdown detalhado
- **Banner de Anúncio**: Sistema de anúncios com carrossel
- **Call-to-Action Premium**: Upgrade para versão sem anúncios
- **Métricas**: Passos, exercício, peso e água
- **Refeições**: Seções para café, almoço e jantar
- **Ações Rápidas**: Botões para registrar alimentos e código de barras
- **Navegação Inferior**: 5 abas principais

## 🚀 Funcionalidades Principais

### Modo Visitante
- Acesso completo a todas as funcionalidades
- Dados simulados para demonstração
- Sem persistência de dados

### Usuários Registrados
- Login e registro completo
- Sincronização com backend
- Histórico de refeições e treinos
- Metas personalizadas

### Recursos de Nutrição
- Análise de refeições por foto
- Cálculo de calorias e macronutrientes
- Rastreamento de água e peso
- Planos de refeição semanais

### Recursos de Fitness
- Calculadora de IMC
- Planos de treino personalizados
- Rastreamento de exercícios
- Metas de peso e atividade

## 🛠️ Tecnologias Utilizadas

- **React Native** com Expo
- **React Navigation** para navegação
- **AsyncStorage** para persistência local
- **Animated API** para animações
- **Expo Image Picker** para captura de fotos

## 📱 Estrutura de Arquivos

```
src/
├── components/
│   └── NavigationHandler.js
├── screens/
│   ├── SplashScreen.js          # Tela de carregamento
│   ├── WelcomeScreen.js         # Boas-vindas com carrossel
│   ├── OnboardingScreen.js      # Quiz de onboarding
│   ├── DashboardScreen.js       # Dashboard principal
│   ├── LoginScreen.js           # Tela de login
│   ├── RegisterScreen.js        # Tela de registro
│   ├── BMIScreen.js            # Calculadora de IMC
│   ├── GoalScreen.js           # Configuração de metas
│   ├── WorkoutPlanScreen.js    # Planos de treino
│   └── MealsScreen.js          # Análise de refeições
├── services/
│   ├── AuthContext.js          # Contexto de autenticação
│   └── api.js                  # Serviços de API
└── styles/
    └── globalStyles.js         # Sistema de design
```

## 🎯 Características do Design

### Sistema de Cores
- **Primárias**: Azuis (#2563eb, #1d4ed8)
- **Neutras**: Escalas de cinza (#111827 a #f9fafb)
- **Acentos**: Verde, amarelo, laranja, vermelho
- **Estados**: Sucesso, erro, aviso

### Tipografia
- **Tamanhos**: xs (12px) a 6xl (60px)
- **Pesos**: normal (400) a black (900)
- **Alturas de linha**: tight (1.25) a loose (2.0)

### Espaçamento
- **Sistema**: Baseado em múltiplos de 4px
- **Escala**: xs (4px) a 5xl (128px)

### Bordas e Sombras
- **Raio**: sm (4px) a full (9999px)
- **Sombras**: 4 níveis de elevação
- **Elevação**: 1 a 12 (Android)

## 🔄 Fluxo de Usuário

```
Splash → Welcome → Onboarding → Dashboard
   ↓         ↓         ↓          ↓
Carregamento → Apresentação → Quiz → App Principal
   ↓         ↓         ↓          ↓
  3s      Carrossel  7 etapas  Funcionalidades
```

## 📋 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o projeto**:
   ```bash
   npx expo start
   ```

3. **Executar no dispositivo**:
   - Escanear QR code com Expo Go
   - Ou pressionar 'a' para Android, 'i' para iOS

## 🎨 Personalização

### Cores
Edite `src/styles/globalStyles.js` para alterar:
- Paleta de cores
- Esquemas de tema
- Estados visuais

### Componentes
Cada tela pode ser personalizada independentemente:
- Estilos específicos
- Animações customizadas
- Layout responsivo

### Fluxo
Modifique `App.js` para:
- Alterar ordem das telas
- Adicionar novas rotas
- Configurar navegação

## 🔮 Próximos Passos

- [ ] Implementar modo claro/escuro
- [ ] Adicionar mais animações
- [ ] Integração com APIs externas
- [ ] Sistema de notificações
- [ ] Modo offline
- [ ] Sincronização em nuvem

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração.
