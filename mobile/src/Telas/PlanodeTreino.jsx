import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  ScrollView, 
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaPlanoTreino({ navigation }) {
  const { token, usuario } = usarAutenticacao();
  
  // Estados principais
  const [planoAtual, setPlanoAtual] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarPlanoAtual();
  }, []);

  // Carregar plano atual do usuário
  const carregarPlanoAtual = async () => {
    setCarregando(true);
    try {
      const resposta = await buscarApi('/api/treinos/atual', { token });
      if (resposta && resposta.plano) {
        setPlanoAtual(resposta.plano);
      }
    } catch (erro) {
      console.log('Nenhum plano encontrado ou erro ao carregar');
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar plano (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    await carregarPlanoAtual();
    setRefreshing(false);
  };



  // Salvar plano atual
  const salvarPlano = async () => {
    if (!planoAtual) return;
    
    try {
      await buscarApi('/api/treinos/salvar', {
        method: 'POST',
        token,
        body: { plano: planoAtual }
      });
      Alert.alert('Sucesso', 'Plano salvo com sucesso!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar o plano');
    }
  };

  // Marcar treino como concluído
  const marcarTreinoConcluido = async (diaIndex) => {
    if (!planoAtual) return;
    
    const novoPlano = { ...planoAtual };
    if (novoPlano.treinos && novoPlano.treinos[diaIndex]) {
      novoPlano.treinos[diaIndex].concluido = !novoPlano.treinos[diaIndex].concluido;
      setPlanoAtual(novoPlano);
      
      try {
        await buscarApi('/api/treinos/atualizar', {
          method: 'PUT',
          token,
          body: { plano: novoPlano }
        });
      } catch (erro) {
        console.error('Erro ao atualizar treino:', erro);
      }
    }
  };

  // Renderizar card de treino individual
  const renderizarTreino = ({ item, index }) => {
    const getCorIntensidade = (intensidade) => {
      switch (intensidade?.toLowerCase()) {
        case 'baixa': return colors.success;
        case 'média': return colors.accent.yellow;
        case 'alta': return colors.accent.orange;
        case 'máxima': return colors.error;
        default: return colors.neutral[500];
      }
    };

    const getIconeTipo = (tipo) => {
      switch (tipo?.toLowerCase()) {
        case 'cardio': return 'directions-run';
        case 'força': return 'fitness-center';
        case 'flexibilidade': return 'accessibility';
        case 'funcional': return 'sports-soccer';
        default: return 'fitness-center';
      }
    };

    return (
      <TouchableOpacity 
        style={[
          estilos.cardTreino,
          item.concluido && estilos.cardTreinoConcluido
        ]}
        onPress={() => marcarTreinoConcluido(index)}
        activeOpacity={0.8}
      >
        <View style={estilos.cabecalhoTreino}>
          <View style={estilos.infoTreino}>
            <View style={[
              estilos.iconeTipo,
              { backgroundColor: getCorIntensidade(item.intensidade) + '20' }
            ]}>
              <MaterialIcons 
                name={getIconeTipo(item.tipo)} 
                size={20} 
                color={getCorIntensidade(item.intensidade)} 
              />
            </View>
            <View style={estilos.detalhesTreino}>
              <Text style={estilos.nomeTreino}>{item.nome}</Text>
              <Text style={estilos.descricaoTreino}>{item.descricao}</Text>
            </View>
          </View>
          
          <View style={estilos.statusTreino}>
            {item.concluido ? (
              <View style={estilos.badgeConcluido}>
                <MaterialIcons name="check-circle" size={16} color={colors.success} />
                <Text style={estilos.textoBadgeConcluido}>Concluído</Text>
              </View>
            ) : (
              <View style={estilos.badgePendente}>
                <MaterialIcons name="schedule" size={16} color={colors.neutral[400]} />
                <Text style={estilos.textoBadgePendente}>Pendente</Text>
              </View>
            )}
          </View>
        </View>

        <View style={estilos.detalhesAdicionais}>
          <View style={estilos.detalheItem}>
            <MaterialIcons name="timer" size={16} color={colors.neutral[400]} />
            <Text style={estilos.textoDetalhe}>{item.duracao}</Text>
          </View>
          
          <View style={estilos.detalheItem}>
            <View style={[
              estilos.pontoIntensidade,
              { backgroundColor: getCorIntensidade(item.intensidade) }
            ]} />
            <Text style={[
              estilos.textoDetalhe,
              { color: getCorIntensidade(item.intensidade) }
            ]}>
              {item.intensidade}
            </Text>
          </View>
          
          <View style={estilos.detalheItem}>
            <MaterialIcons name="schedule" size={16} color={colors.neutral[400]} />
            <Text style={estilos.textoDetalhe}>{item.horario}</Text>
          </View>
        </View>

        {item.exercicios && (
          <View style={estilos.listaExercicios}>
            <Text style={estilos.tituloExercicios}>Exercícios:</Text>
            {item.exercicios.slice(0, 3).map((exercicio, idx) => (
              <Text key={idx} style={estilos.exercicio}>
                • {exercicio.nome} - {exercicio.series}x{exercicio.repeticoes}
              </Text>
            ))}
            {item.exercicios.length > 3 && (
              <Text style={estilos.maisExercicios}>
                +{item.exercicios.length - 3} exercícios
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar estatísticas do plano
  const renderizarEstatisticas = () => {
    if (!planoAtual?.treinos) return null;
    
    const totalTreinos = planoAtual.treinos.length;
    const treinosConcluidos = planoAtual.treinos.filter(t => t.concluido).length;
    const percentualConcluido = Math.round((treinosConcluidos / totalTreinos) * 100);
    
    return (
      <View style={estilos.secaoEstatisticas}>
        <Text style={estilos.tituloSecao}>Progresso da Semana</Text>
        
        <View style={estilos.cardsEstatisticas}>
          <View style={estilos.cardEstatistica}>
            <View style={estilos.iconeEstatistica}>
              <MaterialIcons name="fitness-center" size={24} color={colors.primary[600]} />
            </View>
            <Text style={estilos.valorEstatistica}>{totalTreinos}</Text>
            <Text style={estilos.labelEstatistica}>Treinos</Text>
          </View>
          
          <View style={estilos.cardEstatistica}>
            <View style={estilos.iconeEstatistica}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
            </View>
            <Text style={estilos.valorEstatistica}>{treinosConcluidos}</Text>
            <Text style={estilos.labelEstatistica}>Concluídos</Text>
          </View>
          
          <View style={estilos.cardEstatistica}>
            <View style={estilos.iconeEstatistica}>
              <MaterialIcons name="trending-up" size={24} color={colors.accent.blue} />
            </View>
            <Text style={estilos.valorEstatistica}>{percentualConcluido}%</Text>
            <Text style={estilos.labelEstatistica}>Progresso</Text>
          </View>
        </View>
        
        <View style={estilos.barraProgresso}>
          <View style={[estilos.progressoPreenchido, { width: `${percentualConcluido}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Header com gradiente */}
      <View style={estilos.header}>
        <View style={estilos.cabecalhoHeader}>
          <TouchableOpacity 
            style={estilos.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.neutral[50]} />
          </TouchableOpacity>
          
          <Text style={estilos.tituloHeader}>Plano de Treino</Text>
          
          <TouchableOpacity 
            style={estilos.botaoConfigurar}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={24} color={colors.neutral[50]} />
          </TouchableOpacity>
        </View>
        
        <Text style={estilos.subtituloHeader}>
          Treinos personalizados por IA baseados no seu perfil
        </Text>
      </View>

      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.conteudoScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        }
      >
        {carregando ? (
          <View style={estilos.containerCarregamento}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={estilos.textoCarregamento}>Carregando seu plano...</Text>
          </View>
        ) : planoAtual ? (
          <>
            {renderizarEstatisticas()}
            
            <View style={estilos.secaoTreinos}>
              <Text style={estilos.tituloSecao}>Treinos da Semana</Text>
              
              <FlatList
                data={planoAtual.treinos || []}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderizarTreino}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
            
            <View style={estilos.botoesAcao}>
              <TouchableOpacity 
                style={estilos.botaoSalvar}
                onPress={salvarPlano}
                activeOpacity={0.8}
              >
                <MaterialIcons name="save" size={20} color={colors.neutral[50]} />
                <Text style={estilos.textoBotaoSalvar}>Salvar Progresso</Text>
              </TouchableOpacity>
              

            </View>
          </>
        ) : (
          <View style={estilos.containerSemPlano}>
            <View style={estilos.iconeSemPlano}>
              <MaterialIcons name="fitness-center" size={64} color={colors.neutral[400]} />
            </View>
            <Text style={estilos.tituloSemPlano}>Nenhum plano encontrado</Text>
            <Text style={estilos.subtituloSemPlano}>
              Configure suas preferências e gere seu primeiro plano de treino personalizado
            </Text>
            
            <TouchableOpacity 
              style={estilos.botaoGerarPrimeiro}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
              <Text style={estilos.textoBotaoGerarPrimeiro}>Gerar Primeiro Plano</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>


    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  scrollView: {
    flex: 1,
  },
  
  conteudoScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  header: {
    backgroundColor: colors.primary[600],
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: spacing.lg,
    borderBottomRightRadius: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  
  cabecalhoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  botaoVoltar: {
    padding: spacing.sm,
  },
  
  tituloHeader: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    textAlign: 'center',
    flex: 1,
  },
  
  botaoConfigurar: {
    padding: spacing.sm,
  },
  
  subtituloHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[200],
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  
  alertContainer: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    marginBottom: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  alertText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  formContainer: {
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  
  formSection: {
    gap: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  inputGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginLeft: spacing.sm,
  },
  
  input: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    fontSize: typography.fontSize.base,
    color: colors.neutral[900],
    ...shadows.sm,
  },
  
  inputFocused: {
    borderColor: colors.primary[500],
    borderWidth: borders.width.base,
    ...shadows.base,
  },
  
  objectiveSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  objectiveOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    ...shadows.sm,
  },
  
  objectiveOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  objectiveOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
  
  objectiveOptionTextSelected: {
    color: colors.neutral[50],
  },
  
  timeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  timeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    ...shadows.sm,
  },
  
  timeOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  timeOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
  
  timeOptionTextSelected: {
    color: colors.neutral[50],
  },
  
  generateButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.lg,
    elevation: 8,
  },
  
  generateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  workoutsContainer: {
    marginBottom: spacing.xl,
  },
  
  workoutsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  
  workoutCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  workoutDay: {
    flex: 1,
  },
  
  workoutDayText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  workoutTime: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  },
  
  workoutDuration: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.lg,
  },
  
  workoutDurationText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  
  workoutName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  
  workoutDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.md,
  },
  
  workoutDetail: {
    alignItems: 'center',
  },
  
  workoutDetailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  workoutDetailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  intensidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  intensidadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  actionButtons: {
    gap: spacing.md,
  },
  
  saveButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  visitorAlert: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  visitorAlertText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },

  // Novos estilos para a nova interface
  containerCarregamento: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  textoCarregamento: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
  },
  containerSemPlano: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral[50],
  },
  iconeSemPlano: {
    marginBottom: spacing.md,
  },
  tituloSemPlano: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  subtituloSemPlano: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  botaoGerarPrimeiro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
    elevation: 8,
  },
  textoBotaoGerarPrimeiro: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginLeft: spacing.sm,
  },

  secaoEstatisticas: {
    marginBottom: spacing.lg,
  },
  cardsEstatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  cardEstatistica: {
    alignItems: 'center',
    flex: 1,
  },
  iconeEstatistica: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  valorEstatistica: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  labelEstatistica: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  },
  barraProgresso: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressoPreenchido: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary[600],
  },
  secaoTreinos: {
    marginBottom: spacing.lg,
  },
  botoesAcao: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  botaoSalvar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
    elevation: 6,
  },
  textoBotaoSalvar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginLeft: spacing.sm,
  },

  cardTreino: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  cardTreinoConcluido: {
    opacity: 0.7,
    borderColor: colors.success + '30',
    borderWidth: borders.width.thin,
  },
  cabecalhoTreino: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTreino: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeTipo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detalhesTreino: {
    flex: 1,
  },
  nomeTreino: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  descricaoTreino: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
  },
  statusTreino: {
    alignItems: 'center',
  },
  badgeConcluido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.success + '30',
  },
  textoBadgeConcluido: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  badgePendente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[200] + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300] + '30',
  },
  textoBadgePendente: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[400],
    marginLeft: spacing.xs,
  },
  detalhesAdicionais: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoDetalhe: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginLeft: spacing.xs,
  },
  pontoIntensidade: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listaExercicios: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
  },
  tituloExercicios: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  exercicio: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  maisExercicios: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
});
