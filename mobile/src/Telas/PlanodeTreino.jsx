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
        cor: '#FF6B6B',
        icone: 'directions-run',
        gradiente: ['#FF6B6B', '#FF8E8E']
      },
      'b': {
        nome: 'Força',
        descricao: 'Desenvolvimento muscular',
        cor: '#4ECDC4',
        icone: 'fitness-center',
        gradiente: ['#4ECDC4', '#7FDBDA']
      },
      'c': {
        nome: 'Flexibilidade',
        descricao: 'Mobilidade articular',
        cor: '#45B7D1',
        icone: 'accessibility',
        gradiente: ['#45B7D1', '#6BC5E0']
      },
      'd': {
        nome: 'Funcional',
        descricao: 'Movimentos integrados',
        cor: '#96CEB4',
        icone: 'sports-soccer',
        gradiente: ['#96CEB4', '#B8E6B8']
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
            <Text style={styles.treinoDescricao}>{config.descricao}</Text>
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
                <Text style={styles.statusTexto}>✓</Text>
              </View>
            ) : (
              <View style={styles.statusPendente}>
                <MaterialIcons name="radio-button-unchecked" size={20} color="#9CA3AF" />
                <Text style={styles.statusTexto}>○</Text>
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
            <View style={[styles.intensidadeDot, { backgroundColor: treino.intensidade === 'alta' ? '#EF4444' : '#F59E0B' }]} />
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
                
                {exercicio.descricao && (
                  <Text style={styles.exercicioDescricao}>{exercicio.descricao}</Text>
                )}
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
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      
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
            <Text style={styles.headerSubtitle}>Treinos personalizados por IA</Text>
          </View>
          
          <TouchableOpacity style={styles.menuButton}>
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
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
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
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
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
    backgroundColor: '#F8FAFC',
  },
  
  header: {
    backgroundColor: '#1E293B',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  
  resumoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  resumoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  resumoCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  
  resumoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  
  resumoValor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  
  estatisticasContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  estatisticasTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  estatisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  
  estatisticaCard: {
    alignItems: 'center',
    flex: 1,
  },
  
  estatisticaIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  estatisticaValor: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  
  estatisticaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  
  progressoContainer: {
    alignItems: 'center',
  },
  
  progressoBarra: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  
  progressoPreenchido: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  
  progressoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  
  treinosSection: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  treinoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  
  treinoCardConcluido: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  
  treinoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  treinoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  treinoInfo: {
    flex: 1,
  },
  
  treinoNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  
  treinoDescricao: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  
  diaBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  
  diaTexto: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  
  treinoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  
  detalheTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 6,
  },
  
  intensidadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  
  exerciciosContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  
  exerciciosTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  exercicioItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  exercicioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  exercicioBullet: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  
  exercicioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  
  exercicioDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  
  exercicioSerie: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  exercicioSerieTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3730A3',
    marginLeft: 6,
  },
  
  exercicioRepeticao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  exercicioRepeticaoTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065F46',
    marginLeft: 6,
  },
  
  exercicioDescricao: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 18,
  },
  
  semExercicios: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  
  semExerciciosTexto: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 20,
    textAlign: 'center',
  },
  
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingVertical: 80,
  },
  
  noPlanIcon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  
  noPlanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  noPlanSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  generateButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});
