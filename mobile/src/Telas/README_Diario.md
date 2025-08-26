# Tela Diário - NutriSnap

## 📱 Visão Geral

A tela Diário é o centro de controle nutricional do aplicativo NutriSnap, permitindo aos usuários acompanhar suas calorias, refeições, exercícios e hidratação diariamente.

## ✨ Funcionalidades Principais

### 🕐 Navegação de Data
- **Seletor de Data**: Permite navegar entre diferentes dias
- **Indicadores Rápidos**: Mostra informações como pontos de atividade e peso
- **Status Bar**: Exibe hora atual e status do dispositivo

### 🔥 Controle de Calorias
- **Cálculo Automático**: Meta - Alimentos + Exercício = Restantes
- **Visualização Clara**: Cada componente tem seu próprio valor e label
- **Destaque**: Calorias restantes são destacadas em azul

### 🍽️ Gestão de Refeições
- **Lanches**: Adicionar lanches entre refeições principais
- **Jantar**: Controle da última refeição do dia
- **Botões de Ação**: Cada seção tem botão "ADICIONAR ALIMENTO"
- **Opções**: Menu de três pontos para cada seção

### 💪 Controle de Exercícios
- **Adição de Exercícios**: Botão dedicado para registrar atividades físicas
- **Cálculo de Calorias**: Exercícios aumentam calorias disponíveis
- **Integração**: Conectado ao sistema de calorias

### 💧 Controle de Água
- **Meta Diária**: 2L por dia (configurável)
- **Registro**: Botão para adicionar água consumida
- **Acompanhamento**: Visualização do progresso

### ⏰ Jejum Intermitente (NOVO)
- **Tag "NOVO"**: Destaca a nova funcionalidade
- **Descrição**: Explica o conceito do jejum intermitente
- **Botão de Ação**: "Veja Como Funciona"
- **Ilustração**: Ampulheta e maçã para representar tempo e alimentação

### 🎯 Botões de Ação
- **NUTRIÇÃO**: Acesso a informações nutricionais detalhadas
- **OBSERVAÇÕES**: Sistema de anotações e observações pessoais

### 📢 Sistema de Anúncios
- **Banner Promocional**: Anúncios do Amazon Prime
- **Botão Premium**: Upgrade para versão sem anúncios
- **Design Integrado**: Mantém a estética do app

## 🎨 Design e UX

### Cores
- **Fundo**: Dark theme com `colors.neutral[900]`
- **Primária**: Azul `colors.primary[600]` para elementos interativos
- **Destaque**: Amarelo `colors.accent.yellow` para botão Premium
- **Texto**: Branco `colors.neutral[50]` para contraste

### Tipografia
- **Títulos**: `typography.fontSize.xl` com peso bold
- **Valores**: `typography.fontSize['2xl']` para números importantes
- **Labels**: `typography.fontSize.sm` para informações secundárias

### Espaçamento
- **Consistente**: Usa sistema de spacing padronizado
- **Hierárquico**: Diferentes níveis de espaçamento para organização
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 🔧 Implementação Técnica

### Estados
```javascript
const [dataAtual, setDataAtual] = useState(new Date());
const [caloriasMeta, setCaloriasMeta] = useState(2290);
const [caloriasAlimentos, setCaloriasAlimentos] = useState(0);
const [caloriasExercicio, setCaloriasExercicio] = useState(0);
const [caloriasRestantes, setCaloriasRestantes] = useState(2290);
```

### Cálculos Automáticos
```javascript
useEffect(() => {
  const restantes = caloriasMeta - caloriasAlimentos + caloriasExercicio;
  setCaloriasRestantes(Math.max(0, restantes));
}, [caloriasMeta, caloriasAlimentos, caloriasExercicio]);
```

### Navegação
- Integrada com React Navigation
- Navegação para outras telas (Refeicoes, Configuracoes, etc.)
- Alertas temporários para funcionalidades em desenvolvimento

## 🚀 Funcionalidades Futuras

### Integração com Backend
- Sincronização de dados com servidor
- Histórico de refeições e exercícios
- Metas personalizáveis por usuário

### Notificações
- Lembretes para beber água
- Alertas de refeições
- Notificações de exercícios

### Análise de Dados
- Gráficos de progresso
- Relatórios semanais/mensais
- Comparativos com metas

### Personalização
- Temas de cores
- Layouts customizáveis
- Metas individuais por categoria

## 📱 Compatibilidade

- **React Native**: Versão 0.70+
- **Expo**: SDK 49+
- **Ícones**: MaterialIcons, Ionicons, FontAwesome5
- **Navegação**: React Navigation 6

## 🔗 Dependências

- `@expo/vector-icons`: Para ícones
- `react-native-safe-area-context`: Para áreas seguras
- `@react-navigation/native`: Para navegação
- `../styles/globalStyles`: Para estilos padronizados
- `../services/AuthContext`: Para autenticação

## 📝 Notas de Desenvolvimento

- A tela segue o padrão de design das outras telas do app
- Usa o sistema de cores e tipografia padronizado
- Implementa navegação funcional para outras telas
- Funcionalidades em desenvolvimento mostram alerts informativos
- Design responsivo e adaptável a diferentes tamanhos de tela
