import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Dimensions, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi, buscarTreinos, buscarMetas } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Componente de gráfico circular de progresso aprimorado
const CircularProgressChart = ({ progress, size = 120, strokeWidth = 8, calories, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Círculo de fundo com gradiente sutil */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.neutral[700]}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.3}
          />
          {/* Círculo de progresso com gradiente */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.accent.blue}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity={0.9}
          />
        </G>
        {/* Texto central com melhor tipografia */}
        <SvgText
          x={size / 2}
          y={size / 2 - 12}
          fontSize={typography.fontSize['2xl']}
          fontWeight="800"
          fill={colors.neutral[50]}
          textAnchor="middle"
          fontFamily="System"
        >
          {calories}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 18}
          fontSize={typography.fontSize.sm}
          fill={colors.neutral[400]}
          textAnchor="middle"
          fontFamily="System"
          fontWeight="500"
        >
          {label}
        </SvgText>
      </Svg>
    </View>
  );
};

export default function TelaPrincipal({ navigation }) {
  const { usuario, token, sair } = usarAutenticacao();
  const [meta, setMeta] = useState(null);
  const [consumido, setConsumido] = useState(0);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [planoTreino, setPlanoTreino] = useState(null);
  const [carregando, setCarregando] = useState(true);
  async function carregarDados() {
    try {
      setCarregando(true);
      
      // Carregar metas
      const m = await buscarMetas(token);
      setMeta(m);
      
      // Carregar plano de treino
      const treinos = await buscarTreinos(token);
      setPlanoTreino(treinos);
      
      // Carregar refeições do dia
      const refeicoes = await buscarApi('/api/refeicoes', { token });
      const hoje = new Date().toDateString();
      const total = refeicoes
        .filter(r => new Date(r.timestamp).toDateString() === hoje)
        .reduce((soma, r) => soma + (r.calorias_totais || 0), 0);
      setConsumido(total);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      // Não mostrar alerta para erros de carregamento inicial
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { 
    carregarDados(); 
  }, []);

  // Atualizar dados quando a tela receber foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados();
    });

    return unsubscribe;
  }, [navigation]);

  const diario = meta?.calorias_diarias || 2290;
  const restantes = Math.max(0, diario - consumido);
  const percentual = Math.min(100, Math.round((consumido / diario) * 100));
  
  // Dados do plano de treino
  const treinosSemana = planoTreino?.plano?.treinos || [];
  const treinosConcluidos = treinosSemana.filter(t => t.concluido).length;
  const totalTreinos = treinosSemana.length;
  const percentualTreinos = totalTreinos > 0 ? Math.round((treinosConcluidos / totalTreinos) * 100) : 0;
  
  // Dados de peso e progresso
  const pesoAtual = meta?.peso_atual || 0;
  const pesoMeta = meta?.peso_meta || 0;
  const diferencaPeso = pesoAtual - pesoMeta;
  const progressoPeso = pesoAtual > 0 && pesoMeta > 0 ? Math.abs(diferencaPeso) : 0;

  function lidarComSair() {
    sair();
    navigation.replace('Login');
  }

  function abrirModal() {
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
  }

  function navegarPara(opcao) {
    fecharModal();
    switch (opcao) {
      case 'alimento':
        navigation.navigate('Refeicoes');
        break;
      case 'imc':
        navigation.navigate('IMC');
        break;
      case 'codigo_barras':
        navigation.navigate('Refeicoes');
        break;
      case 'treinos':
        navigation.navigate('PlanoTreino');
        break;
      case 'dados':
        navigation.navigate('MeusDados');
        break;
    }
  }

  // Função auxiliar para configuração de tipos de treino
  function getConfiguracaoTreino(tipo) {
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
  }

  return (
    <View style={estilos.container}>
      
      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregarDados}
            colors={[colors.accent.blue]}
            tintColor={colors.accent.blue}
          />
        }
      >
        {/* Indicador de carregamento */}
        {carregando && (
          <View style={estilos.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.blue} />
            <Text style={estilos.loadingText}>Carregando dados...</Text>
          </View>
        )}

        {/* Header premium com design sofisticado */}
        <View style={estilos.header}>
          <View style={estilos.headerGradient}>
            <View style={estilos.headerContent}>
              <View style={estilos.profileSection}>
                <View style={estilos.avatarContainer}>
                  <View style={estilos.avatarRing}>
                    <View style={estilos.avatar}>
                      <Text style={estilos.avatarText}>
                        {usuario?.nome?.charAt(0) || 'U'}
                      </Text>
                    </View>
                  </View>
                  <View style={estilos.userInfo}>
                    <Text style={estilos.greeting}>Bem-vindo de volta</Text>
                    <Text style={estilos.userName}>{usuario?.nome || 'Usuário'}</Text>
                    <Text style={estilos.userStatus}>Ativo • Hoje</Text>
                  </View>
                </View>
              </View>
              
              <View style={estilos.appBrand}>
                <View style={estilos.brandContainer}>
                  <Text style={estilos.appName}>NutriSnap</Text>
                  <Text style={estilos.appTagline}>Transformando sua saúde</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Resumo de saúde com design premium */}
        <View style={estilos.healthSummary}>
          <View style={estilos.sectionHeader}>
            <Text style={estilos.sectionTitle}>Resumo de Hoje</Text>
            <View style={estilos.dateIndicator}>
              <MaterialIcons name="today" size={16} color={colors.neutral[400]} />
              <Text style={estilos.dateText}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            </View>
          </View>
          
          <View style={estilos.calorieCard}>
            <View style={estilos.calorieHeader}>
              <View style={estilos.calorieTitleSection}>
                <Text style={estilos.calorieTitle}>Calorias Diárias</Text>
                <Text style={estilos.calorieSubtitle}>Acompanhe seu progresso</Text>
              </View>
              <View style={estilos.calorieProgress}>
                <View style={estilos.percentageContainer}>
                  <Text style={estilos.caloriePercentage}>{percentual}%</Text>
                </View>
                <Text style={estilos.progressLabel}>Meta atingida</Text>
              </View>
            </View>
            
            <View style={estilos.calorieDisplay}>
              <View style={estilos.calorieMain}>
                <CircularProgressChart
                  progress={percentual}
                  size={140}
                  strokeWidth={12}
                  calories={restantes}
                  label="Restantes"
                />
              </View>
              
              <View style={estilos.calorieBreakdown}>
                <View style={estilos.calorieItem}>
                  <View style={estilos.calorieIcon}>
                    <MaterialIcons name="flag" size={18} color={colors.accent.blue} />
                  </View>
                  <View style={estilos.calorieText}>
                    <Text style={estilos.calorieValue}>{diario}</Text>
                    <Text style={estilos.calorieDesc}>Meta diária</Text>
                  </View>
                </View>
                
                <View style={estilos.calorieItem}>
                  <View style={estilos.calorieIcon}>
                    <MaterialIcons name="restaurant" size={18} color={colors.accent.green} />
                  </View>
                  <View style={estilos.calorieText}>
                    <Text style={estilos.calorieValue}>{consumido}</Text>
                    <Text style={estilos.calorieDesc}>Consumidas</Text>
                  </View>
                </View>
                
                <View style={estilos.calorieItem}>
                  <View style={estilos.calorieIcon}>
                    <MaterialIcons name="local-fire-department" size={18} color={colors.accent.orange} />
                  </View>
                  <View style={estilos.calorieText}>
                    <Text style={estilos.calorieValue}>0</Text>
                    <Text style={estilos.calorieDesc}>Exercício</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Barra de progresso elegante */}
            <View style={estilos.progressContainer}>
              <View style={estilos.progressBar}>
                <View style={[estilos.progressFill, { width: `${percentual}%` }]} />
                <View style={estilos.progressGlow} />
              </View>
              <View style={estilos.progressInfo}>
                <Text style={estilos.progressText}>{consumido} / {diario} calorias</Text>
                <Text style={estilos.progressRemaining}>{restantes} restantes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informações Nutricionais */}
        {meta?.metas_nutricionais ? (
          <View style={estilos.nutritionInfo}>
            <View style={estilos.sectionHeader}>
              <Text style={estilos.sectionTitle}>Informações Nutricionais</Text>
              <TouchableOpacity 
                style={estilos.viewAllButton}
                onPress={() => navigation.navigate('Metas')}
              >
                <Text style={estilos.viewAllText}>Ver metas</Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color={colors.accent.blue} />
              </TouchableOpacity>
            </View>
            
            <View style={estilos.nutritionCard}>
              <View style={estilos.nutritionGrid}>
                {/* Proteínas */}
                <View style={estilos.nutritionItem}>
                  <View style={estilos.nutritionIcon}>
                    <MaterialCommunityIcons name="food-steak" size={20} color={colors.accent.green} />
                  </View>
                  <Text style={estilos.nutritionValue}>
                    {meta.metas_nutricionais.proteinas?.gramas || '--'}g
                  </Text>
                  <Text style={estilos.nutritionLabel}>Proteínas</Text>
                  <Text style={estilos.nutritionPercent}>
                    {meta.metas_nutricionais.proteinas?.percentual || '--'}%
                  </Text>
                </View>
                
                {/* Carboidratos */}
                <View style={estilos.nutritionItem}>
                  <View style={estilos.nutritionIcon}>
                    <MaterialCommunityIcons name="bread-slice" size={20} color={colors.accent.orange} />
                  </View>
                  <Text style={estilos.nutritionValue}>
                    {meta.metas_nutricionais.carboidratos?.gramas || '--'}g
                  </Text>
                  <Text style={estilos.nutritionLabel}>Carboidratos</Text>
                  <Text style={estilos.nutritionPercent}>
                    {meta.metas_nutricionais.carboidratos?.percentual || '--'}%
                  </Text>
                </View>
                
                {/* Gorduras */}
                <View style={estilos.nutritionItem}>
                  <View style={estilos.nutritionIcon}>
                    <MaterialCommunityIcons name="oil" size={20} color={colors.accent.purple} />
                  </View>
                  <Text style={estilos.nutritionValue}>
                    {meta.metas_nutricionais.gorduras?.gramas || '--'}g
                  </Text>
                  <Text style={estilos.nutritionLabel}>Gorduras</Text>
                  <Text style={estilos.nutritionPercent}>
                    {meta.metas_nutricionais.gorduras?.percentual || '--'}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={estilos.emptyState}>
            <View style={estilos.emptyStateContent}>
              <MaterialIcons name="restaurant-menu" size={48} color={colors.neutral[500]} />
              <Text style={estilos.emptyStateTitle}>Complete seu perfil</Text>
              <Text style={estilos.emptyStateText}>
                Faça o quiz para receber metas nutricionais personalizadas
              </Text>
              <TouchableOpacity 
                style={estilos.emptyStateButton}
                onPress={() => navigation.navigate('Quiz')}
              >
                <Text style={estilos.emptyStateButtonText}>Fazer Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Métricas de saúde com design moderno */}
        <View style={estilos.healthMetrics}>
          <View style={estilos.sectionHeader}>
            <Text style={estilos.sectionTitle}>Métricas de Saúde</Text>
            <TouchableOpacity style={estilos.viewAllButton}>
              <Text style={estilos.viewAllText}>Ver todas</Text>
              <MaterialIcons name="arrow-forward-ios" size={14} color={colors.accent.blue} />
            </TouchableOpacity>
          </View>
          
          <View style={estilos.metricsGrid}>
            {/* Peso */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <MaterialCommunityIcons name="scale-bathroom" size={22} color={colors.accent.blue} />
                </View>
                <Text style={estilos.metricTitle}>Peso Atual</Text>
              </View>
              <Text style={estilos.metricValue}>
                {pesoAtual > 0 ? `${pesoAtual.toFixed(1)} kg` : '-- kg'}
              </Text>
              <Text style={estilos.metricTarget}>
                {pesoMeta > 0 ? `Meta: ${pesoMeta.toFixed(1)} kg` : 'Meta não definida'}
              </Text>
              {pesoAtual > 0 && pesoMeta > 0 && (
                <View style={estilos.weightTrend}>
                  <View style={estilos.trendIcon}>
                    <Ionicons 
                      name={diferencaPeso > 0 ? "trending-down" : "trending-up"} 
                      size={16} 
                      color={diferencaPeso > 0 ? colors.accent.green : colors.accent.orange} 
                    />
                  </View>
                  <Text style={estilos.trendText}>
                    {diferencaPeso > 0 ? `-${diferencaPeso.toFixed(1)} kg` : `+${Math.abs(diferencaPeso).toFixed(1)} kg`} para meta
                  </Text>
                </View>
              )}
            </View>
            
            {/* Exercício */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <MaterialIcons name="local-fire-department" size={22} color={colors.accent.orange} />
                </View>
                <Text style={estilos.metricTitle}>Treinos</Text>
              </View>
              <Text style={estilos.metricValue}>
                {totalTreinos > 0 ? `${treinosConcluidos}/${totalTreinos}` : '0/0'}
              </Text>
              <Text style={estilos.metricTarget}>
                {totalTreinos > 0 ? `${percentualTreinos}% concluídos` : 'Nenhum treino'}
              </Text>
              {totalTreinos > 0 && (
                <View style={estilos.metricProgress}>
                  <View style={[estilos.metricProgressFill, { width: `${percentualTreinos}%` }]} />
                  <View style={estilos.metricProgressGlow} />
                </View>
              )}
              <TouchableOpacity 
                style={estilos.addButton}
                onPress={() => navigation.navigate('PlanoTreino')}
              >
                <Ionicons name="add" size={22} color={colors.neutral[50]} />
              </TouchableOpacity>
            </View>
            
            {/* Água */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <MaterialCommunityIcons name="cup-water" size={22} color={colors.accent.cyan} />
                </View>
                <Text style={estilos.metricTitle}>Hidratação</Text>
              </View>
              <Text style={estilos.metricValue}>
                {meta?.metas_nutricionais?.agua?.litros ? `${meta.metas_nutricionais.agua.litros} L` : '2.0 L'}
              </Text>
              <Text style={estilos.metricTarget}>
                Meta: {meta?.metas_nutricionais?.agua?.litros ? `${meta.metas_nutricionais.agua.litros} L` : '2.0 L'}
              </Text>
              <View style={estilos.metricProgress}>
                <View style={[estilos.metricProgressFill, { width: '60%' }]} />
                <View style={estilos.metricProgressGlow} />
              </View>
            </View>
          </View>
        </View>

        {/* Próximo Treino */}
        {totalTreinos > 0 && (
          <View style={estilos.nextWorkout}>
            <View style={estilos.sectionHeader}>
              <Text style={estilos.sectionTitle}>Próximo Treino</Text>
              <TouchableOpacity 
                style={estilos.viewAllButton}
                onPress={() => navigation.navigate('PlanoTreino')}
              >
                <Text style={estilos.viewAllText}>Ver plano completo</Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color={colors.accent.blue} />
              </TouchableOpacity>
            </View>
            
            <View style={estilos.workoutCard}>
              {(() => {
                const proximoTreino = treinosSemana.find(t => !t.concluido);
                if (!proximoTreino) {
                  return (
                    <View style={estilos.workoutComplete}>
                      <MaterialIcons name="check-circle" size={48} color={colors.accent.green} />
                      <Text style={estilos.workoutCompleteText}>Todos os treinos concluídos!</Text>
                      <Text style={estilos.workoutCompleteSubtext}>Parabéns pela dedicação</Text>
                    </View>
                  );
                }
                
                const config = getConfiguracaoTreino(proximoTreino.tipo);
                return (
                  <View style={estilos.workoutInfo}>
                    <View style={[estilos.workoutIcon, { backgroundColor: config.cor + '15' }]}>
                      <MaterialIcons name={config.icone} size={28} color={config.cor} />
                    </View>
                    <View style={estilos.workoutDetails}>
                      <Text style={estilos.workoutTitle}>{config.nome}</Text>
                      <Text style={estilos.workoutDesc}>{config.descricao}</Text>
                      <Text style={estilos.workoutDuration}>
                        {proximoTreino.duracao || '45 min'} • {proximoTreino.intensidade || 'Média'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[estilos.workoutButton, { backgroundColor: config.cor }]}
                      onPress={() => navigation.navigate('PlanoTreino')}
                    >
                      <Text style={estilos.workoutButtonText}>Iniciar</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>
          </View>
        )}

        {/* Ações rápidas com design intuitivo */}
        <View style={estilos.quickActions}>
          <View style={estilos.sectionHeader}>
            <Text style={estilos.sectionTitle}>Ações Rápidas</Text>
          </View>
          
          <View style={estilos.actionsGrid}>
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('alimento')}
              activeOpacity={0.8}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.green + '15' }]}>
                <MaterialIcons name="camera-alt" size={26} color={colors.accent.green} />
              </View>
              <Text style={estilos.actionTitle}>Foto da Refeição</Text>
              <Text style={estilos.actionDesc}>Analise a nutrição</Text>
              <View style={estilos.actionArrow}>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.neutral[500]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('imc')}
              activeOpacity={0.8}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.blue + '15' }]}>
                <MaterialIcons name="analytics" size={26} color={colors.accent.blue} />
              </View>
              <Text style={estilos.actionTitle}>Calcular IMC</Text>
              <Text style={estilos.actionDesc}>Avalie seu peso</Text>
              <View style={estilos.actionArrow}>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.neutral[500]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('dados')}
              activeOpacity={0.8}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.purple + '15' }]}>
                <MaterialIcons name="person" size={26} color={colors.accent.purple} />
              </View>
              <Text style={estilos.actionTitle}>Meus Dados</Text>
              <Text style={estilos.actionDesc}>Visualize perfil</Text>
              <View style={estilos.actionArrow}>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.neutral[500]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('treinos')}
              activeOpacity={0.8}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.orange + '15' }]}>
                <MaterialIcons name="fitness-center" size={26} color={colors.accent.orange} />
              </View>
              <Text style={estilos.actionTitle}>Plano de Treino</Text>
              <Text style={estilos.actionDesc}>Gerencie exercícios</Text>
              <View style={estilos.actionArrow}>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.neutral[500]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Navegação inferior premium */}
      <View style={estilos.bottomNavigation}>
        <TouchableOpacity style={estilos.navItem}>
          <View style={estilos.navIcon}>
            <MaterialIcons name="dashboard" size={24} color={colors.accent.blue} />
          </View>
          <Text style={estilos.navLabel}>Painel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={estilos.navItem}
          onPress={() => navigation.navigate('Diario')}
        >
          <View style={estilos.navIcon}>
            <MaterialIcons name="book" size={24} color={colors.neutral[400]} />
          </View>
          <Text style={estilos.navLabel}>Diário</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.centralButton} onPress={abrirModal}>
          <View style={estilos.centralButtonInner}>
            <Ionicons name="add" size={32} color={colors.neutral[50]} />
          </View>
          <View style={estilos.centralButtonGlow} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={estilos.navItem}
          onPress={() => navigation.navigate('Metas')}
        >
          <View style={estilos.navIcon}>
            <MaterialIcons name="flag" size={24} color={colors.neutral[400]} />
          </View>
          <Text style={estilos.navLabel}>Metas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={estilos.navItem}
          onPress={() => navigation.navigate('Configuracoes')}
        >
          <View style={estilos.navIcon}>
            <MaterialIcons name="more-horiz" size={24} color={colors.neutral[400]} />
          </View>
          <Text style={estilos.navLabel}>Mais</Text>
        </TouchableOpacity>
      </View>

      {/* Modal premium */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <TouchableOpacity 
          style={estilos.modalOverlay} 
          activeOpacity={1} 
          onPress={fecharModal}
        >
          <View style={estilos.modalContent}>
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitle}>O que você quer fazer?</Text>
              <TouchableOpacity onPress={fecharModal} style={estilos.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={estilos.modalOptions}>
              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('alimento')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.green + '15' }]}>
                  <MaterialIcons name="camera-alt" size={28} color={colors.accent.green} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Fotografar Refeição</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('imc')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.blue + '15' }]}>
                  <MaterialIcons name="analytics" size={28} color={colors.accent.blue} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Calcular IMC</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('dados')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.purple + '15' }]}>
                  <MaterialIcons name="person" size={28} color={colors.accent.purple} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Meus Dados</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('treinos')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.orange + '15' }]}>
                  <MaterialIcons name="fitness-center" size={28} color={colors.accent.orange} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Plano de Treino</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  
  // Indicador de carregamento
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginTop: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Header premium com gradiente
  header: {
    marginBottom: spacing.xl,
    borderRadius: borders.radius['2xl'],
    overflow: 'hidden',
    ...shadows.xl,
  },
  
  headerGradient: {
    backgroundColor: colors.neutral[800],
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  headerContent: {
    padding: spacing.xl,
  },
  
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent.blue + '40',
  },
  
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  
  avatarText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
  },
  
  userInfo: {
    flex: 1,
  },
  
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  userStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.green,
    fontWeight: typography.fontWeight.medium,
  },
  
  appBrand: {
    alignItems: 'center',
  },
  
  brandContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent.blue,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  
  appTagline: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontStyle: 'italic',
    fontWeight: typography.fontWeight.medium,
  },
  
  // Seções com headers aprimorados
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  dateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral[800],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent.blue + '15',
    borderRadius: borders.radius.lg,
    borderWidth: 1,
    borderColor: colors.accent.blue + '30',
  },
  
  viewAllText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.blue,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Resumo de saúde premium
  healthSummary: {
    marginBottom: spacing.xl,
  },
  
  calorieCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius['2xl'],
    padding: spacing.xl,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  
  calorieTitleSection: {
    flex: 1,
  },
  
  calorieTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  calorieSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  calorieProgress: {
    alignItems: 'flex-end',
  },
  
  percentageContainer: {
    backgroundColor: colors.accent.blue + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.xl,
    borderWidth: 1,
    borderColor: colors.accent.blue + '30',
    marginBottom: spacing.xs,
  },
  
  caloriePercentage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent.blue,
  },
  
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  calorieDisplay: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.xl,
  },
  
  calorieMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  
  calorieBreakdown: {
    flex: 1,
    gap: spacing.lg,
  },
  
  calorieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  calorieIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  calorieText: {
    flex: 1,
  },
  
  calorieValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  calorieDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  progressContainer: {
    marginTop: spacing.md,
  },
  
  progressBar: {
    height: 10,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.full,
  },
  
  progressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: '100%',
    backgroundColor: colors.accent.blue + '40',
    borderRadius: borders.radius.full,
  },
  
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  progressRemaining: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.blue,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Informações nutricionais
  nutritionInfo: {
    marginBottom: spacing.xl,
  },
  
  nutritionCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius['2xl'],
    padding: spacing.xl,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  
  nutritionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  nutritionValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  nutritionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  nutritionPercent: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.blue,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Estado vazio
  emptyState: {
    marginBottom: spacing.xl,
  },
  
  emptyStateContent: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.medium,
  },
  
  emptyStateButton: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.lg,
    ...shadows.lg,
  },
  
  emptyStateButtonText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Métricas de saúde modernas
  healthMetrics: {
    marginBottom: spacing.xl,
  },
  
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  
  metricCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    minHeight: 160,
    position: 'relative',
  },
  
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  metricTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
  },
  
  metricValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  metricTarget: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
  
  metricProgress: {
    height: 6,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  
  metricProgressFill: {
    height: '100%',
    backgroundColor: colors.accent.cyan,
    borderRadius: borders.radius.full,
  },
  
  metricProgressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: '100%',
    backgroundColor: colors.accent.cyan + '40',
    borderRadius: borders.radius.full,
  },
  
  weightTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent.green + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.lg,
    borderWidth: 1,
    borderColor: colors.accent.green + '30',
  },
  
  trendIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.green + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  trendText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.green,
    fontWeight: typography.fontWeight.medium,
  },
  
  addButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    borderWidth: 2,
    borderColor: colors.neutral[900],
  },
  
  // Próximo treino
  nextWorkout: {
    marginBottom: spacing.xl,
  },
  
  workoutCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius['2xl'],
    padding: spacing.xl,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  workoutComplete: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  
  workoutCompleteText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  
  workoutCompleteSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  
  workoutIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  workoutDetails: {
    flex: 1,
  },
  
  workoutTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  workoutDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  workoutDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    fontWeight: typography.fontWeight.medium,
  },
  
  workoutButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.lg,
    ...shadows.lg,
  },
  
  workoutButtonText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Ações rápidas intuitivas
  quickActions: {
    marginBottom: spacing.xl,
  },
  
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  
  actionCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    minHeight: 140,
    position: 'relative',
  },
  
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  
  actionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  
  actionArrow: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  // Navegação inferior premium
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[800],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[700],
    ...shadows.xl,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  navIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  navLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  centralButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    ...shadows.xl,
    borderWidth: 4,
    borderColor: colors.neutral[900],
    position: 'relative',
  },
  
  centralButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  centralButtonGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 42,
    backgroundColor: colors.accent.blue + '30',
    zIndex: -1,
  },

  // Modal premium
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.neutral[800],
    borderTopLeftRadius: borders.radius['3xl'],
    borderTopRightRadius: borders.radius['3xl'],
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },

  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    flex: 1,
  },

  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  modalOptions: {
    gap: spacing.md,
  },

  modalOption: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  modalOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  modalOptionContent: {
    flex: 1,
  },

  modalOptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },

  modalOptionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.medium,
  },
});