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
  TextInput
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

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

  // Calcular calorias restantes
  useEffect(() => {
    const restantes = caloriasMeta - caloriasAlimentos + caloriasExercicio;
    setCaloriasRestantes(Math.max(0, restantes));
  }, [caloriasMeta, caloriasAlimentos, caloriasExercicio]);

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
      
      {/* Header elegante com gradiente visual */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.navegacaoData}>
            <TouchableOpacity 
              style={styles.botaoNavegacao} 
              onPress={() => navegarData('anterior')}
            >
              <MaterialIcons name="chevron-left" size={24} color={colors.neutral[100]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.selectorData}>
              <Text style={styles.textoData}>{formatarData(dataAtual)}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.neutral[100]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.botaoNavegacao} 
              onPress={() => navegarData('proximo')}
            >
              <MaterialIcons name="chevron-right" size={24} color={colors.neutral[100]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudoScroll}
      >
        {/* Seção de Calorias com design moderno */}
        <View style={styles.secaoCalorias}>
          <View style={styles.cabecalhoCalorias}>
            <Text style={styles.tituloCalorias}>Resumo Calórico</Text>
            <View style={styles.badgeCalorias}>
              <Text style={styles.badgeTexto}>{caloriasRestantes}</Text>
              <Text style={styles.badgeLabel}>kcal restantes</Text>
            </View>
          </View>
          
          <View style={styles.calculoCalorias}>
            <View style={styles.itemCaloria}>
              <View style={styles.circuloCaloria}>
                <Text style={styles.valorCaloria}>{caloriasMeta}</Text>
              </View>
              <Text style={styles.labelCaloria}>Meta</Text>
            </View>
            
            <View style={styles.linhaConectora}>
              <View style={styles.pontoConector} />
              <View style={styles.linha} />
              <View style={styles.pontoConector} />
            </View>
            
            <View style={styles.itemCaloria}>
              <View style={styles.circuloCaloria}>
                <Text style={styles.valorCaloria}>{caloriasAlimentos}</Text>
              </View>
              <Text style={styles.labelCaloria}>Alimentos</Text>
            </View>
            
            <View style={styles.linhaConectora}>
              <View style={styles.pontoConector} />
              <View style={styles.linha} />
              <View style={styles.pontoConector} />
            </View>
            
            <View style={styles.itemCaloria}>
              <View style={styles.circuloCaloria}>
                <Text style={styles.valorCaloria}>{caloriasExercicio}</Text>
              </View>
              <Text style={styles.labelCaloria}>Exercício</Text>
            </View>
          </View>
        </View>

        {/* Seção de Refeições com design elegante */}
        <View style={styles.secaoRefeicoes}>
          <Text style={styles.tituloSecao}>Refeições do Dia</Text>
          
          {/* Café da Manhã */}
          <View style={styles.cardRefeicao}>
            <View style={styles.cabecalhoRefeicao}>
              <View style={styles.infoRefeicao}>
                <View style={styles.iconeRefeicao}>
                  <FontAwesome5 name="coffee" size={16} color={colors.primary[400]} />
                </View>
                <Text style={styles.tituloRefeicao}>Café da Manhã</Text>
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
          <View style={styles.cardRefeicao}>
            <View style={styles.cabecalhoRefeicao}>
              <View style={styles.infoRefeicao}>
                <View style={styles.iconeRefeicao}>
                  <FontAwesome5 name="utensils" size={16} color={colors.primary[400]} />
                </View>
                <Text style={styles.tituloRefeicao}>Almoço</Text>
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
          <View style={styles.cardRefeicao}>
            <View style={styles.cabecalhoRefeicao}>
              <View style={styles.infoRefeicao}>
                <View style={styles.iconeRefeicao}>
                  <FontAwesome5 name="moon" size={16} color={colors.primary[400]} />
                </View>
                <Text style={styles.tituloRefeicao}>Jantar</Text>
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
          <View style={styles.cardRefeicao}>
            <View style={styles.cabecalhoRefeicao}>
              <View style={styles.infoRefeicao}>
                <View style={styles.iconeRefeicao}>
                  <FontAwesome5 name="cookie-bite" size={16} color={colors.primary[400]} />
                </View>
                <Text style={styles.tituloRefeicao}>Lanches</Text>
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

        {/* Seção de Água com design moderno */}
        <View style={styles.secaoAgua}>
          <Text style={styles.tituloSecao}>Hidratação</Text>
          <View style={styles.cardRefeicao}>
            <View style={styles.cabecalhoRefeicao}>
              <View style={styles.infoRefeicao}>
                <View style={styles.iconeRefeicao}>
                  <FontAwesome5 name="tint" size={16} color={colors.primary[400]} />
                </View>
                <Text style={styles.tituloRefeicao}>Água</Text>
              </View>
              <TouchableOpacity style={styles.botaoOpcoes}>
                <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressoAgua}>
              <View style={styles.barraProgresso}>
                <View 
                  style={[
                    styles.progressoPreenchido, 
                    { width: `${Math.min((aguaConsumida / metaAgua) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.textoProgresso}>
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
        <View style={styles.secaoExercicios}>
          <Text style={styles.tituloSecao}>Atividade Física</Text>
          <View style={styles.cardRefeicao}>
            <View style={styles.cabecalhoRefeicao}>
              <View style={styles.infoRefeicao}>
                <View style={styles.iconeRefeicao}>
                  <FontAwesome5 name="dumbbell" size={16} color={colors.primary[400]} />
                </View>
                <Text style={styles.tituloRefeicao}>Exercício</Text>
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

        {/* Botões de Ação com design moderno */}
        <View style={styles.secaoBotoes}>
          <Text style={styles.tituloSecao}>Ferramentas</Text>
          <View style={styles.botoesAcao}>
            <TouchableOpacity style={styles.botaoAcao} onPress={navegarParaNutricao}>
              <View style={styles.iconeBotaoAcao}>
                <FontAwesome5 name="chart-pie" size={20} color={colors.primary[400]} />
              </View>
              <Text style={styles.textoBotaoAcao}>Nutrição</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.botaoAcao} onPress={navegarParaObservacoes}>
              <View style={styles.iconeBotaoAcao}>
                <FontAwesome5 name="sticky-note" size={20} color={colors.primary[400]} />
              </View>
              <Text style={styles.textoBotaoAcao}>Observações</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...shadows.lg,
  },

  headerContent: {
    paddingHorizontal: spacing.lg,
  },

  navegacaoData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botaoNavegacao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },

  selectorData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    ...shadows.sm,
  },

  textoData: {
    fontSize: typography.fontSize.lg,
    color: colors.neutral[50],
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },

  scrollView: {
    flex: 1,
  },

  conteudoScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Seção de Calorias
  secaoCalorias: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  cabecalhoCalorias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  tituloCalorias: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  badgeCalorias: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.full,
    alignItems: 'center',
    ...shadows.sm,
  },

  badgeTexto: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  badgeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[100],
    fontWeight: typography.fontWeight.medium,
  },

  calculoCalorias: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    ...shadows.base,
  },

  itemCaloria: {
    alignItems: 'center',
    flex: 1,
  },

  circuloCaloria: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },

  valorCaloria: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  labelCaloria: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[300],
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },

  linhaConectora: {
    alignItems: 'center',
    flex: 1,
  },

  pontoConector: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[600],
    marginVertical: spacing.xs,
  },

  linha: {
    width: 2,
    height: 20,
    backgroundColor: colors.neutral[600],
  },

  // Seções de conteúdo
  tituloSecao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },

  secaoRefeicoes: {
    marginBottom: spacing.lg,
  },

  secaoAgua: {
    marginBottom: spacing.lg,
  },

  secaoExercicios: {
    marginBottom: spacing.lg,
  },

  secaoBotoes: {
    marginBottom: spacing.xl,
  },

  // Cards de refeição
  cardRefeicao: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
  },

  cabecalhoRefeicao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  infoRefeicao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconeRefeicao: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },

  tituloRefeicao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  botaoOpcoes: {
    padding: spacing.xs,
  },

  // Progresso de água
  progressoAgua: {
    marginBottom: spacing.md,
  },

  barraProgresso: {
    height: 8,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },

  progressoPreenchido: {
    height: '100%',
    backgroundColor: colors.primary[400],
    borderRadius: borders.radius.full,
  },

  textoProgresso: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[300],
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },

  // Botões
  botaoAdicionar: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.sm,
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
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.sm,
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
    borderRadius: borders.radius.md,
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
    borderRadius: borders.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

  textoBotaoCancelar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  botaoSalvar: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

  textoBotaoSalvar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
});
