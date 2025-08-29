import { MaterialIcons } from '@expo/vector-icons';

// Mapeamento de ícones para diferentes funcionalidades
export const iconMap = {
  // Navegação
  home: 'home',
  dashboard: 'dashboard',
  profile: 'person',
  settings: 'settings',
  
  // Nutrição
  food: 'restaurant',
  nutrition: 'local-dining',
  water: 'local-drink',
  calories: 'whatshot',
  
  // Exercícios
  workout: 'fitness-center',
  cardio: 'directions-run',
  strength: 'fitness-center',
  yoga: 'self-improvement',
  
  // Metas
  goal: 'flag',
  target: 'gps-fixed',
  progress: 'trending-up',
  achievement: 'emoji-events',
  
  // Saúde
  health: 'favorite',
  bmi: 'monitor-weight',
  heart: 'favorite-border',
  sleep: 'bedtime',
  
  // Utilitários
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  search: 'search',
  camera: 'camera-alt',
  gallery: 'photo-library',
  share: 'share',
  download: 'download',
  upload: 'upload',
  close: 'close',
  check: 'check',
  warning: 'warning',
  error: 'error',
  info: 'info',
  
  // Tempo
  time: 'access-time',
  date: 'event',
  calendar: 'calendar-today',
  clock: 'schedule',
  
  // Comunicação
  message: 'message',
  notification: 'notifications',
  email: 'email',
  phone: 'phone',
  
  // Financeiro
  payment: 'payment',
  wallet: 'account-balance-wallet',
  credit: 'credit-card',
  money: 'attach-money',
};

// Função para renderizar ícone com configurações padrão
export const renderIcon = (iconName, size = 24, color = '#666') => {
  const iconKey = iconMap[iconName] || iconName;
  
  return (
    <MaterialIcons
      name={iconKey}
      size={size}
      color={color}
    />
  );
};

// Função para renderizar ícone com estilo específico
export const renderStyledIcon = (iconName, style = {}) => {
  const iconKey = iconMap[iconName] || iconName;
  
  return (
    <MaterialIcons
      name={iconKey}
      style={style}
    />
  );
};

// Função para obter nome do ícone
export const getIconName = (iconKey) => {
  return iconMap[iconKey] || iconKey;
};

// Função para verificar se ícone existe
export const iconExists = (iconName) => {
  return iconMap.hasOwnProperty(iconName);
};
