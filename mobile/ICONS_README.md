# 📱 Biblioteca de Ícones - NutriSnap

Este projeto utiliza a biblioteca `@expo/vector-icons` para fornecer ícones consistentes e profissionais em toda a aplicação.

## 🚀 Instalação

A biblioteca já está instalada no projeto:

```bash
npm install @expo/vector-icons
```

## 📚 Bibliotecas Disponíveis

### MaterialIcons
- **Família**: Material Design Icons
- **Uso**: Ícones principais da interface
- **Exemplo**: `dashboard`, `restaurant`, `fitness-center`

### Ionicons
- **Família**: Ionicons
- **Uso**: Ícones de ação e navegação
- **Exemplo**: `add`, `notifications`, `arrow-back`

### FontAwesome5
- **Família**: Font Awesome 5
- **Uso**: Ícones específicos e especializados
- **Exemplo**: `shoe-prints`, `running`

### MaterialCommunityIcons
- **Família**: Material Community Icons
- **Uso**: Ícones adicionais do Material Design
- **Exemplo**: `food-apple`, `dumbbell`

## 🎯 Como Usar

### 1. Importação Direta (Recomendado para uso simples)

```jsx
import { MaterialIcons } from '@expo/vector-icons';

<MaterialIcons name="dashboard" size={24} color="#3b82f6" />
```

### 2. Usando o Utilitário de Ícones (Recomendado para consistência)

```jsx
import { renderIcon } from '../utils/iconUtils';

{renderIcon('dashboard', 24, colors.primary[600])}
```

### 3. Usando o Mapeamento de Ícones

```jsx
import { iconMap, getIconComponent, getIconName } from '../utils/iconUtils';

const IconComponent = getIconComponent('dashboard');
const iconName = getIconName('dashboard');

<IconComponent name={iconName} size={24} color="#3b82f6" />
```

## 🎨 Tamanhos Padrão

Utilize as constantes definidas em `globalStyles.js`:

```jsx
import { iconSizes } from '../styles/globalStyles';

// Tamanhos disponíveis:
iconSizes.xs      // 12px
iconSizes.sm      // 16px
iconSizes.base    // 20px
iconSizes.lg      // 24px
iconSizes.xl      // 32px
iconSizes['2xl']  // 40px
iconSizes['3xl']  // 48px
```

## 🌈 Cores Padrão

Utilize as constantes definidas em `globalStyles.js`:

```jsx
import { iconConfig } from '../styles/globalStyles';

// Cores disponíveis:
iconConfig.defaultColor   // Cor padrão
iconConfig.primaryColor   // Cor primária
iconConfig.successColor   // Cor de sucesso
iconConfig.errorColor     // Cor de erro
iconConfig.warningColor   // Cor de aviso
```

## 📋 Ícones Comuns Mapeados

### Navegação
- `dashboard` - Painel principal
- `book` - Diário
- `restaurant` - Refeições
- `trending` - Progresso
- `settings` - Configurações
- `more` - Mais opções

### Ações
- `add` - Adicionar
- `edit` - Editar
- `delete` - Excluir
- `save` - Salvar
- `search` - Pesquisar
- `camera` - Câmera

### Status
- `notifications` - Notificações
- `flag` - Meta/bandeira
- `fire` - Exercício/calorias
- `time` - Tempo
- `check` - Verificado
- `close` - Fechar

### Categorias
- `analytics` - Análises/gráficos
- `fitness` - Fitness/treino
- `car` - Carro/transporte
- `shoe` - Passos/caminhada
- `qrCode` - Leitor QR

## 🔧 Exemplos de Implementação

### Botão com Ícone

```jsx
<TouchableOpacity style={styles.button}>
  <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
  <Text style={styles.buttonText}>Adicionar</Text>
</TouchableOpacity>
```

### Ícone com Estado

```jsx
<MaterialIcons 
  name={isActive ? "favorite" : "favorite-border"} 
  size={24} 
  color={isActive ? colors.error : colors.neutral[400]} 
/>
```

### Ícone Responsivo

```jsx
<MaterialIcons 
  name="dashboard" 
  size={width > 400 ? 32 : 24} 
  color={colors.primary[600]} 
/>
```

## 📱 Melhores Práticas

1. **Consistência**: Use sempre os mesmos ícones para as mesmas ações
2. **Tamanhos**: Mantenha proporções consistentes (24px para botões, 20px para navegação)
3. **Cores**: Use as cores do sistema para manter a identidade visual
4. **Acessibilidade**: Forneça sempre um `Text` alternativo para leitores de tela
5. **Performance**: Importe apenas os componentes de ícone que você precisa

## 🐛 Solução de Problemas

### Ícone não aparece
- Verifique se o nome do ícone está correto
- Confirme se a biblioteca está instalada
- Verifique se não há conflitos de importação

### Ícone muito grande/pequeno
- Use as constantes `iconSizes` para tamanhos consistentes
- Ajuste proporcionalmente ao tamanho da tela

### Cor não aplicada
- Verifique se a cor está sendo passada corretamente
- Use as constantes `iconConfig` para cores padrão

## 📚 Recursos Adicionais

- [Documentação Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- [Material Icons](https://fonts.google.com/icons)
- [Ionicons](https://ionic.io/ionicons)
- [Font Awesome](https://fontawesome.com/)

## 🤝 Contribuição

Para adicionar novos ícones ao mapeamento:

1. Adicione o ícone ao objeto `iconMap` em `iconUtils.js`
2. Use o padrão: `chave: { component: Biblioteca, name: 'nome-do-icone' }`
3. Documente o uso no README
4. Teste em diferentes tamanhos de tela
