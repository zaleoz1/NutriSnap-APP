import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaPrincipal({ navigation }) {
  const { usuario, token, modoVisitante, sair, sairModoVisitante } = usarAutenticacao();
  const [meta, setMeta] = useState(null);
  const [consumido, setConsumido] = useState(0);

  async function carregarDados() {
    if (modoVisitante) {
      // Dados simulados para modo visitante
      setMeta({ calorias_diarias: 2290 });
      setConsumido(0);
      return;
    }

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
    if (modoVisitante) {
      sairModoVisitante();
      navigation.replace('Login');
    } else {
      sair();
      navigation.replace('Login');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header com branding */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileText}>
              {modoVisitante ? 'V' : (usuario?.nome?.charAt(0) || 'U')}
            </Text>
          </View>
          
          <View style={styles.brandingContainer}>
            <Text style={styles.appName}>nutrisnap</Text>
          </View>
          
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Seção "Hoje" */}
        <View style={styles.todaySection}>
          <Text style={styles.todayTitle}>Hoje</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal de calorias */}
        <View style={styles.caloriesCard}>
          <Text style={styles.caloriesTitle}>Calorias</Text>
          <Text style={styles.caloriesFormula}>
            Restantes = Meta - Alimentos + Exercício
          </Text>
          
          <View style={styles.caloriesMainDisplay}>
            <View style={styles.caloriesCircle}>
              <Text style={styles.caloriesNumber}>{restantes.toLocaleString()}</Text>
              <Text style={styles.caloriesLabel}>Restantes</Text>
            </View>
            
            <View style={styles.caloriesDetails}>
              <View style={styles.caloriesDetailItem}>
                <MaterialIcons name="flag" size={16} color={colors.neutral[400]} />
                <Text style={styles.detailText}>Meta base</Text>
                <Text style={styles.detailValue}>{diario.toLocaleString()}</Text>
              </View>
              
              <View style={styles.caloriesDetailItem}>
                <MaterialIcons name="restaurant" size={16} color={colors.neutral[400]} />
                <Text style={styles.detailText}>Alimentos</Text>
                <Text style={styles.detailValue}>{consumido.toLocaleString()}</Text>
              </View>
              
              <View style={styles.caloriesDetailItem}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.neutral[400]} />
                <Text style={styles.detailText}>Exercício</Text>
                <Text style={styles.detailValue}>0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grid de métricas */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            {/* Card de Passos */}
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Passos</Text>
              <View style={styles.metricContent}>
                <FontAwesome5 name="shoe-prints" size={16} color={colors.accent.pink} />
                <Text style={styles.metricValue}>26</Text>
              </View>
              <Text style={styles.metricGoal}>Meta: 10.000 passos</Text>
              <View style={styles.metricProgressBar}>
                <View style={[styles.metricProgressFill, { width: '0.26%' }]} />
              </View>
            </View>
            
            {/* Card de Exercício */}
            <View style={styles.metricCard}>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={colors.neutral[50]} />
              </TouchableOpacity>
              <Text style={styles.metricTitle}>Exercício</Text>
              <View style={styles.metricContent}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.neutral[400]} />
                <Text style={styles.metricValue}>0 cal</Text>
              </View>
              <View style={styles.metricContent}>
                <MaterialIcons name="access-time" size={16} color={colors.neutral[400]} />
                <Text style={styles.metricValue}>00:00 h</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.metricsRow}>
            {/* Card de Peso */}
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Peso</Text>
              <Text style={styles.metricSubtitle}>Últimos 90 dias</Text>
              <Text style={styles.weightValue}>82</Text>
            </View>
            
            {/* Card de Progresso */}
            <View style={styles.metricCard}>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={colors.neutral[50]} />
              </TouchableOpacity>
              <Text style={styles.metricTitle}>Progresso</Text>
            </View>
          </View>
        </View>

        {/* Botão de sair */}
        <TouchableOpacity 
          onPress={lidarComSair} 
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>
            {modoVisitante ? 'Sair do Modo Visitante' : 'Sair da Conta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navegação inferior */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="dashboard" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Painel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="book" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Diário</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.centralButton}>
          <Ionicons name="add" size={28} color={colors.neutral[50]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="trending-up" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Progresso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Mais</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  profileText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  
  brandingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  appName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.blue,
    marginBottom: spacing.xs,
  },
  
  notificationIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  notificationText: {
    fontSize: 20,
  },
  
  todaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  todayTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  editButton: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.base,
  },
  
  editButtonText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  caloriesCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  caloriesTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.sm,
  },
  
  caloriesFormula: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.lg,
  },
  
  caloriesMainDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  caloriesCircle: {
    flex: 1,
    alignItems: 'center',
  },
  
  caloriesNumber: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    lineHeight: typography.lineHeight.tight,
  },
  
  caloriesLabel: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  
  caloriesDetails: {
    flex: 1,
    gap: spacing.md,
  },
  
  caloriesDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  detailIcon: {
    fontSize: 16,
  },
  
  detailText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
  
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  metricsGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  metricCard: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    position: 'relative',
  },
  
  metricTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
  },
  
  metricSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  metricIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  
  metricValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  metricGoal: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  
  metricProgressBar: {
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
  
  weightValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
  },
  
  addButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addButtonText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  
  logoutButton: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
  },
  
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[800],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[700],
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  navIcon: {
    fontSize: 20,
    color: colors.neutral[400],
  },
  
  navLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  centralButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...shadows.lg,
  },
  
  centralButtonText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
});