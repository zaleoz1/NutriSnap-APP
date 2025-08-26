import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Componente de gráfico circular de progresso
const CircularProgressChart = ({ progress, size = 120, strokeWidth = 8, calories, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Círculo de fundo */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.neutral[700]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Círculo de progresso */}
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
          />
        </G>
        {/* Texto central */}
        <SvgText
          x={size / 2}
          y={size / 2 - 10}
          fontSize={typography.fontSize['2xl']}
          fontWeight="bold"
          fill={colors.neutral[50]}
          textAnchor="middle"
        >
          {calories}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 15}
          fontSize={typography.fontSize.sm}
          fill={colors.neutral[400]}
          textAnchor="middle"
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

  async function carregarDados() {
    try {
      const m = await buscarApi('/api/metas', { token });
      setMeta(m);
      const refeicoes = await buscarApi('/api/refeicoes', { token });
      const hoje = new Date().toDateString();
      const total = refeicoes
        .filter(r => new Date(r.timestamp).toDateString() === hoje)
        .reduce((soma, r) => soma + (r.calorias_totais || 0), 0);
      setConsumido(total);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  const diario = meta?.calorias_diarias || 2290;
  const restantes = diario - consumido;
  const percentual = Math.min(100, Math.round((consumido / diario) * 100));

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
    }
  }

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
      >
        {/* Header elegante com gradiente */}
        <View style={estilos.header}>
          <View style={estilos.headerContent}>
            <View style={estilos.profileSection}>
              <View style={estilos.avatarContainer}>
                <View style={estilos.avatar}>
                  <Text style={estilos.avatarText}>
                    {usuario?.nome?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={estilos.userInfo}>
                  <Text style={estilos.greeting}>Olá!</Text>
                  <Text style={estilos.userName}>{usuario?.nome || 'Usuário'}</Text>
                </View>
              </View>

            </View>
            
            <View style={estilos.appBrand}>
              <Text style={estilos.appName}>NutriSnap</Text>
              <Text style={estilos.appTagline}>Sua saúde em foco</Text>
            </View>
          </View>
        </View>

        {/* Resumo de saúde principal */}
        <View style={estilos.healthSummary}>
          <Text style={estilos.sectionTitle}>Resumo de Hoje</Text>
          
          <View style={estilos.calorieCard}>
            <View style={estilos.calorieHeader}>
              <Text style={estilos.calorieTitle}>Calorias Diárias</Text>
              <View style={estilos.calorieProgress}>
                <Text style={estilos.caloriePercentage}>{percentual}%</Text>
                <Text style={estilos.calorieSubtitle}>da meta atingida</Text>
              </View>
            </View>
            
            <View style={estilos.calorieDisplay}>
              <View style={estilos.calorieMain}>
                <CircularProgressChart
                  progress={percentual}
                  size={130}
                  strokeWidth={10}
                  calories={restantes}
                  label="Restantes"
                />
              </View>
              
              <View style={estilos.calorieBreakdown}>
                <View style={estilos.calorieItem}>
                  <View style={estilos.calorieIcon}>
                    <MaterialIcons name="flag" size={16} color={colors.accent.blue} />
                  </View>
                  <View style={estilos.calorieText}>
                    <Text style={estilos.calorieValue}>{diario}</Text>
                    <Text style={estilos.calorieDesc}>Meta</Text>
                  </View>
                </View>
                
                <View style={estilos.calorieItem}>
                  <View style={estilos.calorieIcon}>
                    <MaterialIcons name="restaurant" size={16} color={colors.accent.green} />
                  </View>
                  <View style={estilos.calorieText}>
                    <Text style={estilos.calorieValue}>{consumido}</Text>
                    <Text style={estilos.calorieDesc}>Consumidas</Text>
                  </View>
                </View>
                
                <View style={estilos.calorieItem}>
                  <View style={estilos.calorieIcon}>
                    <MaterialIcons name="local-fire-department" size={16} color={colors.accent.orange} />
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
              </View>
              <Text style={estilos.progressText}>{consumido} / {diario} calorias</Text>
            </View>
          </View>
        </View>

        {/* Métricas de saúde */}
        <View style={estilos.healthMetrics}>
          <Text style={estilos.sectionTitle}>Métricas de Saúde</Text>
          
          <View style={estilos.metricsGrid}>
            {/* Passos */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <FontAwesome5 name="shoe-prints" size={20} color={colors.accent.pink} />
                </View>
                <Text style={estilos.metricTitle}>Passos</Text>
              </View>
              <Text style={estilos.metricValue}>2,847</Text>
              <Text style={estilos.metricTarget}>Meta: 10.000</Text>
              <View style={estilos.metricProgress}>
                <View style={[estilos.metricProgressFill, { width: '28.5%' }]} />
              </View>
            </View>
            
            {/* Peso */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={colors.accent.blue} />
                </View>
                <Text style={estilos.metricTitle}>Peso</Text>
              </View>
              <Text style={estilos.metricValue}>82.5 kg</Text>
              <Text style={estilos.metricTarget}>Última medição</Text>
              <View style={estilos.weightTrend}>
                <Ionicons name="trending-down" size={16} color={colors.accent.green} />
                <Text style={estilos.trendText}>-0.3 kg</Text>
              </View>
            </View>
            
            {/* Exercício */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <MaterialIcons name="local-fire-department" size={20} color={colors.accent.orange} />
                </View>
                <Text style={estilos.metricTitle}>Exercício</Text>
              </View>
              <Text style={estilos.metricValue}>0 cal</Text>
              <Text style={estilos.metricTarget}>0 min</Text>
              <TouchableOpacity style={estilos.addButton}>
                <Ionicons name="add" size={20} color={colors.neutral[50]} />
              </TouchableOpacity>
            </View>
            
            {/* Água */}
            <View style={estilos.metricCard}>
              <View style={estilos.metricHeader}>
                <View style={estilos.metricIconContainer}>
                  <MaterialCommunityIcons name="cup-water" size={20} color={colors.accent.cyan} />
                </View>
                <Text style={estilos.metricTitle}>Água</Text>
              </View>
              <Text style={estilos.metricValue}>1.2 L</Text>
              <Text style={estilos.metricTarget}>Meta: 2.5 L</Text>
              <View style={estilos.metricProgress}>
                <View style={[estilos.metricProgressFill, { width: '48%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={estilos.quickActions}>
          <Text style={estilos.sectionTitle}>Ações Rápidas</Text>
          
          <View style={estilos.actionsGrid}>
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('alimento')}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.green + '20' }]}>
                <MaterialIcons name="camera-alt" size={24} color={colors.accent.green} />
              </View>
              <Text style={estilos.actionTitle}>Foto da Refeição</Text>
              <Text style={estilos.actionDesc}>Analisar nutrição</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('imc')}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                <MaterialIcons name="analytics" size={24} color={colors.accent.blue} />
              </View>
              <Text style={estilos.actionTitle}>Calcular IMC</Text>
              <Text style={estilos.actionDesc}>Avaliar peso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('treinos')}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.orange + '20' }]}>
                <MaterialIcons name="fitness-center" size={24} color={colors.accent.orange} />
              </View>
              <Text style={estilos.actionTitle}>Treinos</Text>
              <Text style={estilos.actionDesc}>Exercícios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={estilos.actionCard}
              onPress={() => navegarPara('codigo_barras')}
            >
              <View style={[estilos.actionIcon, { backgroundColor: colors.accent.purple + '20' }]}>
                <MaterialIcons name="qr-code-scanner" size={24} color={colors.accent.purple} />
              </View>
              <Text style={estilos.actionTitle}>Escanear</Text>
              <Text style={estilos.actionDesc}>Código de barras</Text>
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* Navegação inferior moderna */}
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
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.navItem}>
          <View style={estilos.navIcon}>
            <MaterialIcons name="trending-up" size={24} color={colors.neutral[400]} />
          </View>
          <Text style={estilos.navLabel}>Progresso</Text>
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

      {/* Modal de opções */}
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
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.green + '20' }]}>
                  <MaterialIcons name="camera-alt" size={28} color={colors.accent.green} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Fotografar Refeição</Text>
                  <Text style={estilos.modalOptionDesc}>Analise a nutrição da sua comida</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('imc')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                  <MaterialIcons name="analytics" size={28} color={colors.accent.blue} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Calcular IMC</Text>
                  <Text style={estilos.modalOptionDesc}>Avalie seu índice de massa corporal</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('codigo_barras')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.purple + '20' }]}>
                  <MaterialIcons name="qr-code-scanner" size={28} color={colors.accent.purple} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Escanear Produto</Text>
                  <Text style={estilos.modalOptionDesc}>Leia códigos de barras</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={estilos.modalOption} 
                onPress={() => navegarPara('treinos')}
                activeOpacity={0.8}
              >
                <View style={[estilos.modalOptionIcon, { backgroundColor: colors.accent.orange + '20' }]}>
                  <MaterialIcons name="fitness-center" size={28} color={colors.accent.orange} />
                </View>
                <View style={estilos.modalOptionContent}>
                  <Text style={estilos.modalOptionTitle}>Plano de Treino</Text>
                  <Text style={estilos.modalOptionDesc}>Gerencie seus exercícios</Text>
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
  
  // Header elegante
  header: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  
  headerContent: {
    padding: spacing.xl,
  },
  
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.base,
  },
  
  avatarText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  
  userInfo: {
    flex: 1,
  },
  
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },
  
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  

  
  appBrand: {
    alignItems: 'center',
  },
  
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent.blue,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  
  appTagline: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    fontStyle: 'italic',
  },
  
  // Seções
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
  },
  
  // Resumo de saúde
  healthSummary: {
    marginBottom: spacing.xl,
  },
  
  calorieCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  calorieTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
  
  calorieProgress: {
    alignItems: 'flex-end',
  },
  
  caloriePercentage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.blue,
  },
  
  calorieSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
  },
  
  calorieDisplay: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  
  calorieMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  
  calorieNumber: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent.blue,
    lineHeight: typography.lineHeight.tight,
  },
  
  calorieLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.neutral[300],
    fontWeight: typography.fontWeight.medium,
  },
  
  calorieBreakdown: {
    flex: 1,
    gap: spacing.md,
  },
  
  calorieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  calorieIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[700],
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
  },
  
  calorieDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
  
  progressContainer: {
    marginTop: spacing.md,
  },
  
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.full,
  },
  
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  
  // Métricas de saúde
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
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    minHeight: 140,
  },
  
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  
  metricTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
  },
  
  metricValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  metricTarget: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  
  metricProgress: {
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
  },
  
  metricProgressFill: {
    height: '100%',
    backgroundColor: colors.accent.pink,
    borderRadius: borders.radius.full,
  },
  
  weightTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  trendText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.green,
    fontWeight: typography.fontWeight.medium,
  },
  
  addButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
  },
  
  // Ações rápidas
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
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    minHeight: 120,
  },
  
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  },
  

  
  // Navegação inferior
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[800],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[700],
    ...shadows.lg,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    ...shadows.xl,
    borderWidth: 4,
    borderColor: colors.neutral[900],
  },
  
  centralButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.neutral[800],
    borderTopLeftRadius: borders.radius['2xl'],
    borderTopRightRadius: borders.radius['2xl'],
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
  },

  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    flex: 1,
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOptions: {
    gap: spacing.md,
  },

  modalOption: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  modalOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});