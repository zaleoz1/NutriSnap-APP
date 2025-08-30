import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { iconSizes, iconConfig } from '../styles/globalStyles';

// Mapeamento de ícones comuns para facilitar o uso
export const iconMap = {
  // Navegação
  dashboard: { component: MaterialIcons, name: 'dashboard' },
  book: { component: MaterialIcons, name: 'book' },
  restaurant: { component: MaterialIcons, name: 'restaurant' },
  trending: { component: MaterialIcons, name: 'trending-up' },
  settings: { component: MaterialIcons, name: 'settings' },
  more: { component: MaterialIcons, name: 'more-horiz' },
  
  // Ações
  add: { component: Ionicons, name: 'add' },
  edit: { component: MaterialIcons, name: 'edit' },
  delete: { component: MaterialIcons, name: 'delete' },
  save: { component: MaterialIcons, name: 'save' },
  search: { component: MaterialIcons, name: 'search' },
  camera: { component: MaterialIcons, name: 'camera-alt' },
  
  // Status
  notifications: { component: Ionicons, name: 'notifications' },
  flag: { component: MaterialIcons, name: 'flag' },
  fire: { component: MaterialIcons, name: 'local-fire-department' },
  time: { component: MaterialIcons, name: 'access-time' },
  check: { component: MaterialIcons, name: 'check' },
  close: { component: MaterialIcons, name: 'close' },
  
  // Categorias
  analytics: { component: MaterialIcons, name: 'analytics' },
  fitness: { component: MaterialIcons, name: 'fitness-center' },
  car: { component: MaterialIcons, name: 'directions-car' },
  shoe: { component: FontAwesome5, name: 'shoe-prints' },
  qrCode: { component: MaterialIcons, name: 'qr-code-scanner' },
  
  // Direções
  arrowBack: { component: Ionicons, name: 'arrow-back' },
  arrowForward: { component: Ionicons, name: 'arrow-forward' },
  arrowUp: { component: Ionicons, name: 'arrow-up' },
  arrowDown: { component: Ionicons, name: 'arrow-down' },
  
  // Outros
  user: { component: Ionicons, name: 'person' },
  home: { component: Ionicons, name: 'home' },
  heart: { component: Ionicons, name: 'heart' },
  star: { component: Ionicons, name: 'star' },
};

// Função para renderizar ícones de forma consistente
export function renderIcon(iconKey, size = iconSizes.base, color = iconConfig.defaultColor, style = {}) {
  const iconData = iconMap[iconKey];
  if (!iconData) {
    console.warn(`Ícone não encontrado: ${iconKey}`);
    return null;
  }
  
  const IconComponent = iconData.component;
  return <IconComponent name={iconData.name} size={size} color={color} style={style} />;
}

// Função para obter componente de ícone
export function getIconComponent(iconKey) {
  const iconData = iconMap[iconKey];
  return iconData ? iconData.component : MaterialIcons;
}

// Função para obter nome do ícone
export function getIconName(iconKey) {
  const iconData = iconMap[iconKey];
  return iconData ? iconData.name : 'help';
}

// Exportar componentes individuais para uso direto
export { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons, AntDesign };
