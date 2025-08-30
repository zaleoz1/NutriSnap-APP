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
  ActivityIndicator,
  RefreshControl,
  Animated
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaPlanoTreino({ navigation }) {
  const { token, usuario } = usarAutenticacao();
  
  // Estados principais
  const [planoAtual, setPlanoAtual] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    carregarPlanoAtual();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Carregar plano atual do usuário
  const carregarPlanoAtual = async () => {
    setCarregando(true);
    try {
      console.log('🔄 Carregando plano atual...');
      const resposta = await buscarApi('/api/treinos', { token });
      console.log('📋 Resposta da API:', resposta);
      
      if (resposta && resposta.plano) {
        setPlanoAtual(resposta.plano);
      } else if (resposta && resposta.length > 0) {
        setPlanoAtual({ treinos: resposta });
      } else if (resposta && typeof resposta === 'object') {
        setPlanoAtual(resposta);
      } else {
        setPlanoAtual(null);
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar plano:', erro);
      setPlanoAtual(null);
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

  // Gerar primeiro plano de treino
  const gerarPrimeiroPlano = async () => {
    setGerandoPlano(true);
    try {
      const resposta = await buscarApi('/api/treinos/gerar', {
        method: 'POST',
        token,
        body: {}
      });
      
      if (resposta && resposta.plano) {
        setPlanoAtual(resposta.plano);
        Alert.alert(
          'Plano Gerado!', 
          'Seu plano de treino personalizado foi criado com sucesso!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Aviso', 'Plano gerado mas formato inesperado. Tente novamente.');
      }
    } catch (erro) {
      if (erro.message?.includes('Complete o quiz primeiro')) {
        Alert.alert(
          'Quiz Necessário',
          'Para gerar um plano personalizado, complete o quiz de perfil primeiro.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Fazer Quiz', onPress: () => navigation.navigate('Quiz') }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível gerar o plano de treino. Tente novamente.');
      }
    } finally {
      setGerandoPlano(false);
    }
  };

  // Gerar novo treino substituindo o atual
  const gerarNovoTreino = async () => {
    if (!planoAtual) {
      Alert.alert('Aviso', 'Nenhum plano atual para substituir.');
      return;
    }

    Alert.alert(
      'Confirmar Novo Treino',
      'Isso irá substituir completamente seu plano atual. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, Gerar Novo', 
          onPress: async () => {
            setGerandoPlano(true);
            try {
              const resposta = await buscarApi('/api/treinos/gerar', {
                method: 'POST',
                token,
                body: {}
              });
              
              if (resposta && resposta.plano) {
                setPlanoAtual(resposta.plano);
                Alert.alert(
                  'Novo Plano Gerado!', 
                  'Seu plano de treino foi atualizado com sucesso!',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Aviso', 'Novo plano gerado mas formato inesperado. Tente novamente.');
              }
            } catch (erro) {
              if (erro.message?.includes('Complete o quiz primeiro')) {
                Alert.alert(
                  'Quiz Necessário',
                  'Para gerar um novo plano personalizado, complete o quiz de perfil primeiro.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Fazer Quiz', onPress: () => navigation.navigate('Quiz') }
                  ]
                );
              } else {
                Alert.alert('Erro', 'Não foi possível gerar o novo plano de treino. Tente novamente.');
              }
            } finally {
              setGerandoPlano(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Marcar treino como concluído
  const marcarTreinoConcluido = async (diaIndex) => {
    if (!planoAtual) return;
    
    const novoPlano = { ...planoAtual };
    if (novoPlano.treinos && novoPlano.treinos[diaIndex]) {
      novoPlano.treinos[diaIndex].concluido = !novoPlano.treinos[diaIndex].concluido;
      setPlanoAtual(novoPlano);
      
      try {
        await buscarApi('/api/treinos', {
          method: 'PUT',
          token,
          body: { plano: novoPlano }
        });
      } catch (erro) {
        console.error('Erro ao atualizar treino:', erro);
      }
    }
  };

  // Funções auxiliares para tipos de treino
  const getConfiguracaoTreino = (tipo) => {
    const configs = {
      'a': {
        nome: 'Cardio',
        descricao: 'Resistência cardiovascular',
        cor: colors.accent.blue,
        icone: 'directions-run',
        gradiente: [colors.accent.blue, colors.primary[400]]
      },
      'b': {
        nome: 'Força',
        descricao: 'Desenvolvimento muscular',
        cor: colors.accent.purple,
        icone: 'fitness-center',
        gradiente: [colors.accent.purple, colors.accent.pink]
      },
      'c': {
        nome: 'Flexibilidade',
        descricao: 'Mobilidade articular',
        cor: colors.accent.green,
        icone: 'accessibility',
        gradiente: [colors.accent.green, colors.success]
      },
      'd': {
        nome: 'Funcional',
        descricao: 'Movimentos integrados',
        cor: colors.accent.orange,
        icone: 'sports-soccer',
        gradiente: [colors.accent.orange, colors.warning]
      }
    };
    return configs[tipo?.toLowerCase()] || configs['a'];
  };

  // Função para obter nome do dia da semana
  const getNomeDia = (numeroDia) => {
    const dias = {
      1: 'Segunda-feira',
      2: 'Terça-feira', 
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      7: 'Domingo'
    };
    return dias[numeroDia] || `Dia ${numeroDia}`;
  };

  // Renderizar card de treino individual
  const renderizarTreino = (treino, index) => {
    const config = getConfiguracaoTreino(treino.tipo);
    const nomeDia = getNomeDia(treino.dia);
    
    return (
      <TouchableOpacity 
        key={index}
        style={[
          styles.treinoCard,
          treino.concluido && styles.treinoCardConcluido
        ]}
        onPress={() => marcarTreinoConcluido(index)}
        activeOpacity={0.9}
      >
        <View style={styles.treinoHeader}>
          <View style={[styles.treinoIconContainer, { backgroundColor: config.cor + '20' }]}>
            <MaterialIcons name={config.icone} size={24} color={config.cor} />
          </View>
          
                     <View style={styles.treinoInfo}>
             <Text style={styles.treinoNome}>{config.nome}</Text>
             <View style={[styles.diaBadge, { backgroundColor: config.cor + '20' }]}>
               <Text style={[styles.diaTexto, { color: config.cor }]}>
                 {nomeDia}
               </Text>
             </View>
           </View>
          
          <View style={styles.treinoStatus}>
            {treino.concluido ? (
              <View style={styles.statusConcluido}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
              </View>
            ) : (
              <View style={styles.statusPendente}>
                <MaterialIcons name="radio-button-unchecked" size={20} color="#9CA3AF" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.treinoDetalhes}>
          <View style={styles.detalheItem}>
            <MaterialIcons name="timer" size={16} color="#6B7280" />
            <Text style={styles.detalheTexto}>{treino.duracao}</Text>
          </View>
          
          <View style={styles.detalheItem}>
            <View style={[styles.intensidadeDot, { backgroundColor: treino.intensidade === 'alta' ? colors.accent.red : colors.accent.orange }]} />
            <Text style={styles.detalheTexto}>{treino.intensidade}</Text>
          </View>
          
          <View style={styles.detalheItem}>
            <MaterialIcons name="fitness-center" size={16} color="#6B7280" />
            <Text style={styles.detalheTexto}>
              {treino.exercicios?.length || 0} exercícios
            </Text>
          </View>
        </View>

        {/* Lista completa de exercícios */}
        {treino.exercicios && treino.exercicios.length > 0 ? (
          <View style={styles.exerciciosContainer}>
            <Text style={styles.exerciciosTitulo}>Exercícios do Treino:</Text>
            
            {treino.exercicios.map((exercicio, idx) => (
              <View key={idx} style={styles.exercicioItem}>
                <View style={styles.exercicioHeader}>
                  <Text style={styles.exercicioBullet}>•</Text>
                  <Text style={styles.exercicioNome}>{exercicio.nome}</Text>
                </View>
                
                <View style={styles.exercicioDetalhes}>
                  <View style={styles.exercicioSerie}>
                    <MaterialIcons name="repeat" size={14} color="#3730A3" />
                    <Text style={styles.exercicioSerieTexto}>
                      {exercicio.series} série{exercicio.series > 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.exercicioRepeticao}>
                    <MaterialIcons name="fitness-center" size={14} color="#065F46" />
                    <Text style={styles.exercicioRepeticaoTexto}>
                      {exercicio.repeticoes} {typeof exercicio.repeticoes === 'number' ? 'reps' : ''}
                    </Text>
                  </View>
                </View>
                

              </View>
            ))}
          </View>
        ) : (
          <View style={styles.semExercicios}>
            <MaterialIcons name="info-outline" size={16} color="#9CA3AF" />
            <Text style={styles.semExerciciosTexto}>Exercícios serão configurados</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar estatísticas
  const renderizarEstatisticas = () => {
    if (!planoAtual?.treinos) return null;
    
    const totalTreinos = planoAtual.treinos.length;
    const treinosConcluidos = planoAtual.treinos.filter(t => t.concluido).length;
    const percentual = Math.round((treinosConcluidos / totalTreinos) * 100);
    
    return (
      <View style={styles.estatisticasContainer}>
        <Text style={styles.estatisticasTitulo}>Progresso da Semana</Text>
        
        <View style={styles.estatisticasGrid}>
          <View style={styles.estatisticaCard}>
            <View style={styles.estatisticaIcone}>
              <MaterialIcons name="fitness-center" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.estatisticaValor}>{totalTreinos}</Text>
            <Text style={styles.estatisticaLabel}>Total</Text>
          </View>
          
          <View style={styles.estatisticaCard}>
            <View style={styles.estatisticaIcone}>
              <MaterialIcons name="check-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.estatisticaValor}>{treinosConcluidos}</Text>
            <Text style={styles.estatisticaLabel}>Concluídos</Text>
          </View>
          
          <View style={styles.estatisticaCard}>
            <View style={styles.estatisticaIcone}>
              <MaterialIcons name="trending-up" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.estatisticaValor}>{percentual}%</Text>
            <Text style={styles.estatisticaLabel}>Progresso</Text>
          </View>
        </View>
        
        <View style={styles.progressoContainer}>
          <View style={styles.progressoBarra}>
            <View style={[styles.progressoPreenchido, { width: `${percentual}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>{percentual}% concluído</Text>
        </View>
      </View>
    );
  };

  // Renderizar resumo do plano
  const renderizarResumoPlano = () => {
    if (!planoAtual?.treinos) return null;
    
    const tiposUnicos = [...new Set(planoAtual.treinos.map(t => t.tipo))];
    
    return (
      <View style={styles.resumoContainer}>
        <Text style={styles.resumoTitulo}>Resumo do Plano</Text>
        
        <View style={styles.resumoGrid}>
          <View style={styles.resumoCard}>
            <MaterialIcons name="calendar-today" size={20} color="#3B82F6" />
            <Text style={styles.resumoLabel}>Duração</Text>
            <Text style={styles.resumoValor}>{planoAtual.treinos.length} dias</Text>
          </View>
          
          <View style={styles.resumoCard}>
            <MaterialIcons name="speed" size={20} color="#F59E0B" />
            <Text style={styles.resumoLabel}>Intensidade</Text>
            <Text style={styles.resumoValor}>
              {planoAtual.treinos[0]?.intensidade || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.resumoCard}>
            <MaterialIcons name="timer" size={20} color="#10B981" />
            <Text style={styles.resumoLabel}>Sessão</Text>
            <Text style={styles.resumoValor}>
              {planoAtual.treinos[0]?.duracao || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.resumoCard}>
            <MaterialIcons name="category" size={20} color="#8B5CF6" />
            <Text style={styles.resumoLabel}>Tipos</Text>
            <Text style={styles.resumoValor}>
              {tiposUnicos.join(', ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
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
             <Text style={styles.headerTitle}>Plano de Treino</Text>
           </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Opções do Plano',
                'Escolha uma opção:',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Novo Treino', 
                    onPress: () => gerarNovoTreino(),
                    style: 'default'
                  }
                ]
              );
            }}
          >
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
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
          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.blue} />
              <Text style={styles.loadingText}>Carregando seu plano...</Text>
            </View>
          ) : planoAtual ? (
            <>
              {renderizarResumoPlano()}
              {renderizarEstatisticas()}
              
              <View style={styles.treinosSection}>
                <Text style={styles.sectionTitle}>Treinos da Semana</Text>
                
                {planoAtual.treinos && planoAtual.treinos.length > 0 ? (
                  planoAtual.treinos.map((treino, index) => 
                    renderizarTreino(treino, index)
                  )
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="fitness-center" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyStateTitle}>Nenhum treino configurado</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Os treinos aparecerão aqui após a configuração
                    </Text>
                    
                    <View style={styles.emptyStateSpacer} />
                    
                    <TouchableOpacity 
                      style={[styles.generateButton, gerandoPlano && styles.generateButtonDisabled]}
                      onPress={gerarNovoTreino}
                      disabled={gerandoPlano}
                    >
                      {gerandoPlano ? (
                        <ActivityIndicator size="small" color={colors.neutral[50]} />
                      ) : (
                        <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
                      )}
                      <Text style={styles.generateButtonText}>
                        {gerandoPlano ? 'Gerando...' : 'Gerar Treino'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.noPlanContainer}>
              <View style={styles.noPlanIcon}>
                <MaterialIcons name="fitness-center" size={80} color="#9CA3AF" />
              </View>
              <Text style={styles.noPlanTitle}>Nenhum plano encontrado</Text>
              <Text style={styles.noPlanSubtitle}>
                Configure suas preferências e gere seu primeiro plano personalizado
              </Text>
              
              <TouchableOpacity 
                style={[styles.generateButton, gerandoPlano && styles.generateButtonDisabled]}
                onPress={gerarPrimeiroPlano}
                disabled={gerandoPlano}
              >
                {gerandoPlano ? (
                  <ActivityIndicator size="small" color={colors.neutral[50]} />
                ) : (
                  <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
                )}
                <Text style={styles.generateButtonText}>
                  {gerandoPlano ? 'Gerando...' : 'Gerar Primeiro Plano'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: spacing.xl,
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
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral[500],
    fontWeight: typography.fontWeight.medium,
  },
  
  resumoContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },
  
  resumoTitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  resumoCard: {
    width: '48%',
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  resumoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  
  resumoValor: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
  },
  
  estatisticasContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },
  
  estatisticasTitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  estatisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  
  estatisticaCard: {
    alignItems: 'center',
    flex: 1,
  },
  
  estatisticaIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  estatisticaValor: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  estatisticaLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  
  progressoContainer: {
    alignItems: 'center',
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
  
  treinoCardConcluido: {
    borderColor: colors.accent.green,
    borderWidth: 2,
    backgroundColor: colors.accent.green + '10',
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
  
  treinoStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  
  statusConcluido: {
    alignItems: 'center',
  },
  
  statusPendente: {
    alignItems: 'center',
  },
  
  statusTexto: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  
  treinoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[700],
  },
  
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  
  detalheTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginLeft: spacing.xs,
  },
  
  intensidadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  
  exerciciosContainer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[700],
  },
  
  exerciciosTitulo: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginBottom: spacing.sm,
  },
  
  exercicioItem: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    ...shadows.sm,
  },
  
  exercicioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  exercicioBullet: {
    fontSize: typography.fontSize.base,
    color: colors.accent.blue,
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  
  exercicioNome: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    flex: 1,
  },
  
  exercicioDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  
  exercicioSerie: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  exercicioSerieTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.blue,
    marginLeft: spacing.xs,
  },
  
  exercicioRepeticao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  exercicioRepeticaoTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.green,
    marginLeft: spacing.xs,
  },
  
  semExercicios: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[700],
  },
  
  semExerciciosTexto: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginLeft: spacing.sm,
    fontStyle: 'italic',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[400],
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  
  emptyStateSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  
  emptyStateSpacer: {
    height: spacing.xl,
  },
  
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingVertical: 80,
  },
  
  noPlanIcon: {
    marginBottom: spacing.xl,
    opacity: 0.6,
  },
  
  noPlanTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  noPlanSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.normal,
    paddingHorizontal: spacing.lg,
  },
  
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadows.lg,
  },
  
  generateButtonDisabled: {
    backgroundColor: colors.neutral[400],
    shadowOpacity: 0.1,
  },
  
  generateButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginLeft: spacing.sm,
  },
});
