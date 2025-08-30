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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarRefeicoes, buscarMetas } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaDiario({ navigation }) {
  const { usuario, token } = usarAutenticacao();
  
  // Estados para os dados do diário
  const [dataAtual, setDataAtual] = useState(new Date());
  const [caloriasMeta, setCaloriasMeta] = useState(2290);
  const [caloriasAlimentos, setCaloriasAlimentos] = useState(0);
  const [caloriasExercicio, setCaloriasExercicio] = useState(0);
  const [caloriasRestantes, setCaloriasRestantes] = useState(2290);
  const [aguaConsumida, setAguaConsumida] = useState(0);
  const [metaAgua, setMetaAgua] = useState(2000); // Meta padrão - será atualizada pelas metas nutricionais
  const [modalAguaVisivel, setModalAguaVisivel] = useState(false);
  const [quantidadeAgua, setQuantidadeAgua] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Estados para dados das refeições
  const [refeicoes, setRefeicoes] = useState([]);
  const [refeicoesCarregando, setRefeicoesCarregando] = useState(false);
  const [metasCarregando, setMetasCarregando] = useState(false);
  const [totaisNutricionais, setTotaisNutricionais] = useState({
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0
  });

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

  // Carregar dados quando a tela é montada ou a data muda
  useEffect(() => {
    if (token) {
      carregarDadosDiario();
    }
  }, [dataAtual, token]);

  // Carregar água específica quando a data mudar
  useEffect(() => {
    carregarAguaDoStorage();
  }, [dataAtual]);

  // Função para formatar data para busca na API
  const formatarDataParaAPI = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Função para gerar chave única para armazenamento da água por data
  const gerarChaveAgua = (data) => {
    const dataFormatada = formatarDataParaAPI(data);
    return `agua_consumida_${dataFormatada}`;
  };

  // Função para salvar quantidade de água no AsyncStorage
  const salvarAguaNoStorage = async (quantidade) => {
    try {
      const chave = gerarChaveAgua(dataAtual);
      await AsyncStorage.setItem(chave, quantidade.toString());
      console.log('💾 Água salva no storage:', quantidade, 'ml para', formatarDataParaAPI(dataAtual));
    } catch (erro) {
      console.error('❌ Erro ao salvar água no storage:', erro);
    }
  };

  // Função para carregar quantidade de água do AsyncStorage
  const carregarAguaDoStorage = async () => {
    try {
      const chave = gerarChaveAgua(dataAtual);
      const aguaSalva = await AsyncStorage.getItem(chave);
      if (aguaSalva && !isNaN(aguaSalva)) {
        const quantidade = parseInt(aguaSalva);
        setAguaConsumida(quantidade);
        console.log('💧 Água carregada do storage:', quantidade, 'ml para', formatarDataParaAPI(dataAtual));
        return quantidade;
      }
      return 0;
    } catch (erro) {
      console.error('❌ Erro ao carregar água do storage:', erro);
      return 0;
    }
  };

  // Função para carregar dados do dia
  const carregarDadosDiario = async () => {
    try {
      setRefeicoesCarregando(true);
      setMetasCarregando(true);

      // Carregar refeições do dia
      const refeicoesData = await buscarRefeicoes(token);
      const dataFormatada = formatarDataParaAPI(dataAtual);
      
      // Filtrar refeições do dia atual
      const refeicoesDoDia = refeicoesData.filter(refeicao => {
        const dataRefeicao = new Date(refeicao.timestamp);
        return formatarDataParaAPI(dataRefeicao) === dataFormatada;
      });

      setRefeicoes(refeicoesDoDia);

      // Calcular totais nutricionais
      const totais = refeicoesDoDia.reduce((acc, refeicao) => {
        acc.calorias += parseFloat(refeicao.calorias_totais) || 0;
        acc.proteinas += parseFloat(refeicao.proteinas_totais) || 0;
        acc.carboidratos += parseFloat(refeicao.carboidratos_totais) || 0;
        acc.gorduras += parseFloat(refeicao.gorduras_totais) || 0;
        return acc;
      }, { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 });

      setTotaisNutricionais(totais);
      setCaloriasAlimentos(totais.calorias);

      // Carregar metas do usuário
      const metasData = await buscarMetas(token);
      if (metasData) {
        // Definir meta de calorias
        if (metasData.calorias_diarias) {
          setCaloriasMeta(metasData.calorias_diarias);
        }

        // Extrair meta de água das metas nutricionais
        if (metasData.metas_nutricionais) {
          try {
            const metasNutricionais = typeof metasData.metas_nutricionais === 'string' 
              ? JSON.parse(metasData.metas_nutricionais) 
              : metasData.metas_nutricionais;

            // Verificar se existe meta de água nos micronutrientes
            if (metasNutricionais.micronutrientes && metasNutricionais.micronutrientes.agua) {
              const aguaLitros = metasNutricionais.micronutrientes.agua.litros;
              if (aguaLitros && !isNaN(aguaLitros)) {
                // Converter litros para ml (1L = 1000ml)
                const aguaMl = Math.round(aguaLitros * 1000);
                setMetaAgua(aguaMl);
                console.log('💧 Meta de água carregada das metas:', aguaMl, 'ml');
              }
            }
          } catch (erro) {
            console.error('❌ Erro ao processar metas nutricionais para água:', erro);
          }
        }
      }

      // Carregar quantidade de água consumida do storage
      await carregarAguaDoStorage();

    } catch (erro) {
      console.error('Erro ao carregar dados do diário:', erro);
      Alert.alert('Erro', 'Não foi possível carregar os dados do diário');
    } finally {
      setRefeicoesCarregando(false);
      setMetasCarregando(false);
    }
  };

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosDiario();
    setRefreshing(false);
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
    navigation.navigate('PlanoTreino');
  };

  const adicionarAgua = () => {
    setModalAguaVisivel(true);
  };

  const salvarAgua = async () => {
    if (quantidadeAgua && !isNaN(quantidadeAgua)) {
      const quantidade = parseInt(quantidadeAgua);
      const novaQuantidade = aguaConsumida + quantidade;
      setAguaConsumida(novaQuantidade);
      
      // Salvar no AsyncStorage
      await salvarAguaNoStorage(novaQuantidade);
      
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

  // Função para classificar refeição por horário e ordem
  const classificarRefeicaoPorHorario = (timestamp, todasRefeicoes = []) => {
    const data = new Date(timestamp);
    const hora = data.getHours();
    
    // Café da manhã: 4h às 10h
    if (hora >= 4 && hora < 10) {
      return 'cafe_da_manha';
    }
    // Faixa de almoço/lanche: 10h às 14h
    else if (hora >= 10 && hora < 14) {
      // Filtrar refeições na mesma faixa de horário (10h-14h)
      const refeicoesMesmoHorario = todasRefeicoes.filter(refeicao => {
        const dataRefeicao = new Date(refeicao.timestamp);
        const horaRefeicao = dataRefeicao.getHours();
        return horaRefeicao >= 10 && horaRefeicao < 14;
      });
      
      // Ordenar por timestamp para determinar a ordem
      const refeicoesOrdenadas = refeicoesMesmoHorario.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Encontrar o índice da refeição atual
      const indiceAtual = refeicoesOrdenadas.findIndex(refeicao => 
        new Date(refeicao.timestamp).getTime() === data.getTime()
      );
      
      // Se for o primeiro item (índice 0), é almoço
      // Se for o segundo ou mais, é lanche
      return indiceAtual === 0 ? 'almoco' : 'lanches';
    }
    // Jantar: 16h às 22h
    else if (hora >= 16 && hora <= 22) {
      return 'jantar';
    }
    // Lanches: outros horários (14h-16h e 22h-4h)
    else {
      return 'lanches';
    }
  };

  // Função para agrupar refeições por tipo baseado no horário e ordem
  const agruparRefeicoesPorTipo = () => {
    const grupos = {
      'cafe_da_manha': [],
      'almoco': [],
      'jantar': [],
      'lanches': [],
      'outros': []
    };

    refeicoes.forEach(refeicao => {
      // Classificar por horário e ordem, passando todas as refeições para análise
      const tipo = classificarRefeicaoPorHorario(refeicao.timestamp, refeicoes);
      grupos[tipo].push(refeicao);
    });

    // Ordenar refeições por horário dentro de cada grupo
    Object.keys(grupos).forEach(tipo => {
      grupos[tipo].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    return grupos;
  };

  // Função para calcular totais de um tipo de refeição
  const calcularTotaisRefeicao = (refeicoesTipo) => {
    return refeicoesTipo.reduce((acc, refeicao) => {
      acc.calorias += parseFloat(refeicao.calorias_totais) || 0;
      acc.proteinas += parseFloat(refeicao.proteinas_totais) || 0;
      acc.carboidratos += parseFloat(refeicao.carboidratos_totais) || 0;
      acc.gorduras += parseFloat(refeicao.gorduras_totais) || 0;
      return acc;
    }, { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 });
  };

  // Função para formatar horário da refeição
  const formatarHorarioRefeicao = (timestamp) => {
    const data = new Date(timestamp);
    return data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Função para obter lista de itens da refeição
  const obterItensRefeicao = (refeicao) => {
    try {
      const itens = typeof refeicao.itens === 'string' ? JSON.parse(refeicao.itens) : refeicao.itens;
      if (Array.isArray(itens) && itens.length > 0) {
        return itens.map(item => item.nome || 'Item não identificado').join(', ');
      }
      return 'Itens não disponíveis';
    } catch (error) {
      return 'Itens não disponíveis';
    }
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

        {/* Resumo Nutricional do Dia */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Resumo do Dia</Text>
          <View style={styles.resumoCard}>
            <View style={styles.resumoHeader}>
              <Text style={styles.resumoTitulo}>Consumo Total</Text>
              <Text style={styles.resumoData}>{formatarData(dataAtual)}</Text>
            </View>
            
            <View style={styles.resumoGrid}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{Math.round(totaisNutricionais.calorias)}</Text>
                <Text style={styles.resumoLabel}>Calorias</Text>
                <Text style={styles.resumoMeta}>Meta: {caloriasMeta}</Text>
              </View>
              
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{Math.round(totaisNutricionais.proteinas)}g</Text>
                <Text style={styles.resumoLabel}>Proteínas</Text>
              </View>
              
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{Math.round(totaisNutricionais.carboidratos)}g</Text>
                <Text style={styles.resumoLabel}>Carboidratos</Text>
              </View>
              
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{Math.round(totaisNutricionais.gorduras)}g</Text>
                <Text style={styles.resumoLabel}>Gorduras</Text>
              </View>
            </View>
            
            <View style={styles.progressoCalorias}>
              <View style={styles.progressoBarra}>
                <View 
                  style={[
                    styles.progressoPreenchido, 
                    { 
                      width: `${Math.min((totaisNutricionais.calorias / caloriasMeta) * 100, 100)}%`,
                      backgroundColor: totaisNutricionais.calorias > caloriasMeta ? colors.accent.red : colors.accent.blue
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressoTexto}>
                {Math.round(totaisNutricionais.calorias)} / {caloriasMeta} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Seção de Refeições */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Refeições do Dia</Text>
          
          {refeicoesCarregando ? (
            <View style={styles.carregandoContainer}>
              <ActivityIndicator size="large" color={colors.accent.blue} />
              <Text style={styles.carregandoTexto}>Carregando refeições...</Text>
            </View>
          ) : (
            <>
              {/* Café da Manhã */}
              {(() => {
                const grupos = agruparRefeicoesPorTipo();
                const cafeManha = grupos.cafe_da_manha;
                const totaisCafe = calcularTotaisRefeicao(cafeManha);
                
                return (
                  <View style={styles.treinoCard}>
                    <View style={styles.treinoHeader}>
                      <View style={[styles.treinoIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                        <FontAwesome5 name="coffee" size={24} color="#3B82F6" />
                      </View>
                      
                      <View style={styles.treinoInfo}>
                        <Text style={styles.treinoNome}>Café da Manhã</Text>
                        <View style={[styles.diaBadge, { backgroundColor: '#3B82F6' + '20' }]}>
                          <Text style={[styles.diaTexto, { color: '#3B82F6' }]}>
                            {cafeManha.length > 0 ? `${cafeManha.length} refeição(ões)` : '4h - 10h'}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity style={styles.botaoOpcoes}>
                        <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
                      </TouchableOpacity>
                    </View>
                    
                    {cafeManha.length > 0 && (
                      <View style={styles.refeicoesLista}>
                        {cafeManha.map((refeicao, index) => (
                          <View key={refeicao.id} style={styles.refeicaoItem}>
                            <View style={styles.refeicaoInfo}>
                              <Text style={styles.refeicaoHorario}>
                                {formatarHorarioRefeicao(refeicao.timestamp)}
                              </Text>
                              <Text style={styles.refeicaoCalorias}>
                                {Math.round(refeicao.calorias_totais)} kcal
                              </Text>
                            </View>
                            <Text style={styles.refeicaoItens}>
                              {obterItensRefeicao(refeicao)}
                            </Text>
                            {refeicao.observacoes && (
                              <Text style={styles.refeicaoObservacoes}>
                                {refeicao.observacoes}
                              </Text>
                            )}
                          </View>
                        ))}
                        <View style={styles.totalRefeicao}>
                          <Text style={styles.totalTexto}>
                            Total: {Math.round(totaisCafe.calorias)} kcal
                          </Text>
                        </View>
                      </View>
                    )}
                    

                  </View>
                );
              })()}

              {/* Almoço */}
              {(() => {
                const grupos = agruparRefeicoesPorTipo();
                const almoco = grupos.almoco;
                const totaisAlmoco = calcularTotaisRefeicao(almoco);
                
                return (
                  <View style={styles.treinoCard}>
                    <View style={styles.treinoHeader}>
                      <View style={[styles.treinoIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                        <FontAwesome5 name="utensils" size={24} color="#F59E0B" />
                      </View>
                      
                      <View style={styles.treinoInfo}>
                        <Text style={styles.treinoNome}>Almoço</Text>
                        <View style={[styles.diaBadge, { backgroundColor: '#F59E0B' + '20' }]}>
                          <Text style={[styles.diaTexto, { color: '#F59E0B' }]}>
                            {almoco.length > 0 ? `${almoco.length} refeição(ões)` : '10h - 14h'}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity style={styles.botaoOpcoes}>
                        <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
                      </TouchableOpacity>
                    </View>
                    
                    {almoco.length > 0 && (
                      <View style={styles.refeicoesLista}>
                        {almoco.map((refeicao, index) => (
                          <View key={refeicao.id} style={styles.refeicaoItem}>
                            <View style={styles.refeicaoInfo}>
                              <Text style={styles.refeicaoHorario}>
                                {formatarHorarioRefeicao(refeicao.timestamp)}
                              </Text>
                              <Text style={styles.refeicaoCalorias}>
                                {Math.round(refeicao.calorias_totais)} kcal
                              </Text>
                            </View>
                            <Text style={styles.refeicaoItens}>
                              {obterItensRefeicao(refeicao)}
                            </Text>
                            {refeicao.observacoes && (
                              <Text style={styles.refeicaoObservacoes}>
                                {refeicao.observacoes}
                              </Text>
                            )}
                          </View>
                        ))}
                        <View style={styles.totalRefeicao}>
                          <Text style={styles.totalTexto}>
                            Total: {Math.round(totaisAlmoco.calorias)} kcal
                          </Text>
                        </View>
                      </View>
                    )}
                    

                  </View>
                );
              })()}

              {/* Jantar */}
              {(() => {
                const grupos = agruparRefeicoesPorTipo();
                const jantar = grupos.jantar;
                const totaisJantar = calcularTotaisRefeicao(jantar);
                
                return (
                  <View style={styles.treinoCard}>
                    <View style={styles.treinoHeader}>
                      <View style={[styles.treinoIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                        <FontAwesome5 name="moon" size={24} color="#8B5CF6" />
                      </View>
                      
                      <View style={styles.treinoInfo}>
                        <Text style={styles.treinoNome}>Jantar</Text>
                        <View style={[styles.diaBadge, { backgroundColor: '#8B5CF6' + '20' }]}>
                          <Text style={[styles.diaTexto, { color: '#8B5CF6' }]}>
                            {jantar.length > 0 ? `${jantar.length} refeição(ões)` : '16h - 22h'}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity style={styles.botaoOpcoes}>
                        <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
                      </TouchableOpacity>
                    </View>
                    
                    {jantar.length > 0 && (
                      <View style={styles.refeicoesLista}>
                        {jantar.map((refeicao, index) => (
                          <View key={refeicao.id} style={styles.refeicaoItem}>
                            <View style={styles.refeicaoInfo}>
                              <Text style={styles.refeicaoHorario}>
                                {formatarHorarioRefeicao(refeicao.timestamp)}
                              </Text>
                              <Text style={styles.refeicaoCalorias}>
                                {Math.round(refeicao.calorias_totais)} kcal
                              </Text>
                            </View>
                            <Text style={styles.refeicaoItens}>
                              {obterItensRefeicao(refeicao)}
                            </Text>
                            {refeicao.observacoes && (
                              <Text style={styles.refeicaoObservacoes}>
                                {refeicao.observacoes}
                              </Text>
                            )}
                          </View>
                        ))}
                        <View style={styles.totalRefeicao}>
                          <Text style={styles.totalTexto}>
                            Total: {Math.round(totaisJantar.calorias)} kcal
                          </Text>
                        </View>
                      </View>
                    )}
                    

                  </View>
                );
              })()}

              {/* Lanches */}
              {(() => {
                const grupos = agruparRefeicoesPorTipo();
                const lanches = grupos.lanches;
                const totaisLanches = calcularTotaisRefeicao(lanches);
                
                return (
                  <View style={styles.treinoCard}>
                    <View style={styles.treinoHeader}>
                      <View style={[styles.treinoIconContainer, { backgroundColor: '#10B981' + '20' }]}>
                        <FontAwesome5 name="cookie-bite" size={24} color="#10B981" />
                      </View>
                      
                      <View style={styles.treinoInfo}>
                        <Text style={styles.treinoNome}>Lanches</Text>
                        <View style={[styles.diaBadge, { backgroundColor: '#10B981' + '20' }]}>
                          <Text style={[styles.diaTexto, { color: '#10B981' }]}>
                            {lanches.length > 0 ? `${lanches.length} lanche(s)` : '14h-16h / 22h-4h'}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity style={styles.botaoOpcoes}>
                        <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
                      </TouchableOpacity>
                    </View>
                    
                    {lanches.length > 0 && (
                      <View style={styles.refeicoesLista}>
                        {lanches.map((refeicao, index) => (
                          <View key={refeicao.id} style={styles.refeicaoItem}>
                            <View style={styles.refeicaoInfo}>
                              <Text style={styles.refeicaoHorario}>
                                {formatarHorarioRefeicao(refeicao.timestamp)}
                              </Text>
                              <Text style={styles.refeicaoCalorias}>
                                {Math.round(refeicao.calorias_totais)} kcal
                              </Text>
                            </View>
                            <Text style={styles.refeicaoItens}>
                              {obterItensRefeicao(refeicao)}
                            </Text>
                            {refeicao.observacoes && (
                              <Text style={styles.refeicaoObservacoes}>
                                {refeicao.observacoes}
                              </Text>
                            )}
                          </View>
                        ))}
                        <View style={styles.totalRefeicao}>
                          <Text style={styles.totalTexto}>
                            Total: {Math.round(totaisLanches.calorias)} kcal
                          </Text>
                        </View>
                      </View>
                    )}
                    

                  </View>
                );
              })()}
            </>
          )}
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
              <Text style={styles.textoBotaoAdicionar}>Fazer Exercícios</Text>
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
              <Text style={styles.metaDescricao}>
                {metaAgua === 2000 ? 'Meta padrão recomendada' : 'Meta personalizada baseada no seu perfil'}
              </Text>
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

  // Estilos para carregamento
  carregandoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  carregandoTexto: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginTop: spacing.md,
  },

  // Estilos para resumo nutricional
  resumoCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },

  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  resumoTitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  resumoData: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    textTransform: 'capitalize',
  },

  resumoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  resumoItem: {
    alignItems: 'center',
    flex: 1,
  },

  resumoValor: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.blue,
    marginBottom: spacing.xs,
  },

  resumoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },

  resumoMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },

  progressoCalorias: {
    alignItems: 'center',
  },

  // Estilos para lista de refeições
  refeicoesLista: {
    marginBottom: spacing.md,
  },

  refeicaoItem: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  refeicaoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  refeicaoHorario: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[300],
    fontWeight: typography.fontWeight.medium,
  },

  refeicaoCalorias: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.blue,
    fontWeight: typography.fontWeight.semibold,
  },

  refeicaoItens: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[200],
    marginBottom: spacing.xs,
    lineHeight: 18,
  },

  refeicaoObservacoes: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontStyle: 'italic',
  },

  totalRefeicao: {
    backgroundColor: colors.neutral[600],
    borderRadius: borders.radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  totalTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
});
