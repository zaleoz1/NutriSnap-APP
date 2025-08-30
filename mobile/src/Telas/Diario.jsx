import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  ScrollView, 
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaDiario({ navigation }) {
  const { usuario } = usarAutenticacao();
  
  // Estados para os dados do diário
  const [dataAtual, setDataAtual] = useState(new Date());
  const [caloriasMeta, setCaloriasMeta] = useState(2290);
  const [caloriasAlimentos, setCaloriasAlimentos] = useState(0);
  const [caloriasExercicio, setCaloriasExercicio] = useState(0);
  const [caloriasRestantes, setCaloriasRestantes] = useState(2290);
  const [aguaConsumida, setAguaConsumida] = useState(0);
  const [metaAgua, setMetaAgua] = useState(2000); // 2L por dia - Meta fixa
  const [modalAguaVisivel, setModalAguaVisivel] = useState(false);
  const [quantidadeAgua, setQuantidadeAgua] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Calcular calorias restantes
  useEffect(() => {
    const restantes = caloriasMeta - caloriasAlimentos + caloriasExercicio;
    setCaloriasRestantes(Math.max(0, restantes));
  }, [caloriasMeta, caloriasAlimentos, caloriasExercicio]);

  // Inicializar animação
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Funções de navegação
  const navegarParaRefeicoes = () => {
    navigation.navigate('Refeicoes');
  };

  const navegarParaExercicios = () => {
    Alert.alert('Exercícios', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaAgua = () => {
    Alert.alert('Controle de Água', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaNutricao = () => {
    Alert.alert('Nutrição', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaObservacoes = () => {
    Alert.alert('Observações', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaJejum = () => {
    Alert.alert('Jejum Intermitente', 'Funcionalidade em desenvolvimento');
  };

  // Funções de adição
  const adicionarAlimento = (refeicao) => {
    Alert.alert(`Adicionar ${refeicao}`, 'Funcionalidade em desenvolvimento');
  };

  const adicionarExercicio = () => {
    Alert.alert('Adicionar Exercício', 'Funcionalidade em desenvolvimento');
  };

  const adicionarAgua = () => {
    setModalAguaVisivel(true);
  };

  const salvarAgua = () => {
    if (quantidadeAgua && !isNaN(quantidadeAgua)) {
      const quantidade = parseInt(quantidadeAgua);
      setAguaConsumida(aguaConsumida + quantidade);
      setQuantidadeAgua('');
    }
    
    setModalAguaVisivel(false);
  };

  const cancelarAgua = () => {
    setModalAguaVisivel(false);
    setQuantidadeAgua('');
  };

  // Formatar data
  const formatarData = (data) => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return data.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  // Navegar entre datas
  const navegarData = (direcao) => {
    const novaData = new Date(dataAtual);
    if (direcao === 'anterior') {
      novaData.setDate(dataAtual.getDate() - 1);
    } else {
      novaData.setDate(dataAtual.getDate() + 1);
    }
    setDataAtual(novaData);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Header moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Diário Nutricional</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Opções do Diário',
                'Escolha uma opção:',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Navegar Data', 
                    onPress: () => {
                      Alert.alert('Navegação de Data', 'Funcionalidade em desenvolvimento');
                    },
                    style: 'default'
                  }
                ]
              );
            }}
          >
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Navegação de data discreta */}
        <View style={styles.navegacaoData}>
          <TouchableOpacity 
            style={styles.botaoNavegacaoDiscreto} 
            onPress={() => navegarData('anterior')}
          >
            <MaterialIcons name="chevron-left" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.selectorDataDiscreto}>
            <Text style={styles.textoDataDiscreto}>{formatarData(dataAtual)}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.neutral[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.botaoNavegacaoDiscreto} 
            onPress={() => navegarData('proximo')}
          >
            <MaterialIcons name="chevron-right" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent.blue]}
            tintColor={colors.accent.blue}
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>


        {/* Seção de Refeições */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Refeições do Dia</Text>
          
          {/* Café da Manhã */}
          <View style={styles.treinoCard}>
            <View style={styles.treinoHeader}>
              <View style={[styles.treinoIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <FontAwesome5 name="coffee" size={24} color="#3B82F6" />
              </View>
              
              <View style={styles.treinoInfo}>
                <Text style={styles.treinoNome}>Café da Manhã</Text>
                <View style={[styles.diaBadge, { backgroundColor: '#3B82F6' + '20' }]}>
                  <Text style={[styles.diaTexto, { color: '#3B82F6' }]}>
                    Manhã
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={styles.textoBotaoAdicionar}>Adicionar Alimento</Text>
            </TouchableOpacity>
          </View>

          {/* Almoço */}
          <View style={styles.treinoCard}>
            <View style={styles.treinoHeader}>
              <View style={[styles.treinoIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                <FontAwesome5 name="utensils" size={24} color="#F59E0B" />
              </View>
              
              <View style={styles.treinoInfo}>
                <Text style={styles.treinoNome}>Almoço</Text>
                <View style={[styles.diaBadge, { backgroundColor: '#F59E0B' + '20' }]}>
                  <Text style={[styles.diaTexto, { color: '#F59E0B' }]}>
                    Meio-dia
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={styles.textoBotaoAdicionar}>Adicionar Alimento</Text>
            </TouchableOpacity>
          </View>

          {/* Jantar */}
          <View style={styles.treinoCard}>
            <View style={styles.treinoHeader}>
              <View style={[styles.treinoIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                <FontAwesome5 name="moon" size={24} color="#8B5CF6" />
              </View>
              
              <View style={styles.treinoInfo}>
                <Text style={styles.treinoNome}>Jantar</Text>
                <View style={[styles.diaBadge, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Text style={[styles.diaTexto, { color: '#8B5CF6' }]}>
                    Noite
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={styles.textoBotaoAdicionar}>Adicionar Alimento</Text>
            </TouchableOpacity>
          </View>

          {/* Lanches */}
          <View style={styles.treinoCard}>
            <View style={styles.treinoHeader}>
              <View style={[styles.treinoIconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <FontAwesome5 name="cookie-bite" size={24} color="#10B981" />
              </View>
              
              <View style={styles.treinoInfo}>
                <Text style={styles.treinoNome}>Lanches</Text>
                <View style={[styles.diaBadge, { backgroundColor: '#10B981' + '20' }]}>
                  <Text style={[styles.diaTexto, { color: '#10B981' }]}>
                    Entre refeições
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={styles.textoBotaoAdicionar}>Adicionar Alimento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Água */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Hidratação</Text>
          <View style={styles.treinoCard}>
            <View style={styles.treinoHeader}>
              <View style={[styles.treinoIconContainer, { backgroundColor: '#06B6D4' + '20' }]}>
                <FontAwesome5 name="tint" size={24} color="#06B6D4" />
              </View>
              
              <View style={styles.treinoInfo}>
                <Text style={styles.treinoNome}>Controle de Água</Text>
                <View style={[styles.diaBadge, { backgroundColor: '#06B6D4' + '20' }]}>
                  <Text style={[styles.diaTexto, { color: '#06B6D4' }]}>
                    Meta: {metaAgua}ml
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressoContainer}>
              <View style={styles.progressoBarra}>
                <View 
                  style={[
                    styles.progressoPreenchido, 
                    { width: `${Math.min((aguaConsumida / metaAgua) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressoTexto}>
                {aguaConsumida}ml / {metaAgua}ml
              </Text>
            </View>
            
            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarAgua}>
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={styles.textoBotaoAdicionar}>Adicionar Água</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Exercícios */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Atividade Física</Text>
          <View style={styles.treinoCard}>
            <View style={styles.treinoHeader}>
              <View style={[styles.treinoIconContainer, { backgroundColor: '#EF4444' + '20' }]}>
                <FontAwesome5 name="dumbbell" size={24} color="#EF4444" />
              </View>
              
              <View style={styles.treinoInfo}>
                <Text style={styles.treinoNome}>Exercícios</Text>
                <View style={[styles.diaBadge, { backgroundColor: '#EF4444' + '20' }]}>
                  <Text style={[styles.diaTexto, { color: '#EF4444' }]}>
                    Queima: {caloriasExercicio} kcal
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarExercicio}>
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={styles.textoBotaoAdicionar}>Adicionar Exercício</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Ferramentas</Text>
          <View style={styles.botoesAcao}>
            <TouchableOpacity style={styles.botaoAcao} onPress={navegarParaNutricao}>
              <View style={styles.iconeBotaoAcao}>
                <FontAwesome5 name="chart-pie" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.textoBotaoAcao}>Nutrição</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.botaoAcao} onPress={navegarParaObservacoes}>
              <View style={styles.iconeBotaoAcao}>
                <FontAwesome5 name="sticky-note" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.textoBotaoAcao}>Observações</Text>
            </TouchableOpacity>
          </View>
        </View>
        </Animated.View>
      </ScrollView>

      {/* Modal de Adicionar Água redesenhado */}
      <Modal
        visible={modalAguaVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelarAgua}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Controle de Água</Text>
              <TouchableOpacity onPress={cancelarAgua} style={styles.botaoFechar}>
                <MaterialIcons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantidade (ml)</Text>
              <TextInput
                style={styles.input}
                value={quantidadeAgua}
                onChangeText={setQuantidadeAgua}
                placeholder="Ex: 250"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaInfo}>
                <FontAwesome5 name="tint" size={16} color={colors.primary[400]} />
                <Text style={styles.metaTexto}>Meta diária: {metaAgua}ml</Text>
              </View>
              <Text style={styles.metaDescricao}>Quantidade recomendada de água por dia</Text>
            </View>
            
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={cancelarAgua}>
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAgua}>
                <Text style={styles.textoBotaoSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  header: {
    backgroundColor: colors.neutral[800],
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borders.radius['2xl'],
    borderBottomRightRadius: borders.radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.xl,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  navegacaoData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  botaoNavegacaoDiscreto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },

  selectorDataDiscreto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[700] + '50',
    borderRadius: borders.radius.full,
    marginHorizontal: spacing.lg,
    opacity: 0.8,
  },

  textoDataDiscreto: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },



  // Estilos das seções do Plano de Treino
  treinosSection: {
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  treinoCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },
  
  treinoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  
  treinoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  treinoInfo: {
    flex: 1,
  },
  
  treinoNome: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  diaBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borders.radius.lg,
  },
  
  diaTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  
  botaoOpcoes: {
    padding: spacing.xs,
  },

  // Progresso
  progressoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  progressoBarra: {
    height: 8,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.sm,
  },
  
  progressoPreenchido: {
    height: '100%',
    borderRadius: borders.radius.full,
    backgroundColor: colors.accent.blue,
  },
  
  progressoTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.blue,
  },

  // Botões
  botaoAdicionar: {
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.lg,
  },

  textoBotaoAdicionar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  botoesAcao: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  botaoAcao: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },

  iconeBotaoAcao: {
    marginBottom: spacing.sm,
  },

  textoBotaoAcao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  modalTitulo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  botaoFechar: {
    padding: spacing.xs,
  },

  inputContainer: {
    marginBottom: spacing.lg,
  },

  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[50],
    marginBottom: spacing.sm,
  },

  input: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  metaContainer: {
    marginBottom: spacing.lg,
  },

  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  metaTexto: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[50],
  },

  metaDescricao: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontStyle: 'italic',
    marginLeft: 28,
  },

  modalBotoes: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  botaoCancelar: {
    flex: 1,
    backgroundColor: colors.neutral[600],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },

  textoBotaoCancelar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  botaoSalvar: {
    flex: 1,
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },

  textoBotaoSalvar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
});
