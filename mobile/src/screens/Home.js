import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Dimensions } from 'react-native';
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
      setMeta({ calorias_diarias: 2000 });
      setConsumido(1200);
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

  const diario = meta?.calorias_diarias || 2000;
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral[50]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header com saudação */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {modoVisitante ? 'Olá, Visitante!' : `Olá, ${usuario?.nome || 'usuário'}!`}
            </Text>
            <Text style={styles.greetingSubtitle}>
              {modoVisitante ? 'Experimente todas as funcionalidades' : 'Como está sua jornada hoje?'}
            </Text>
          </View>
          
          {modoVisitante && (
            <View style={styles.visitorBadge}>
              <Text style={styles.visitorBadgeText}>Visitante</Text>
            </View>
          )}
        </View>

        {/* Aviso do modo visitante */}
        {modoVisitante && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>
              💡 Modo Visitante - Dados simulados para demonstração
            </Text>
          </View>
        )}

        {/* Card principal de calorias */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Meta Diária de Calorias</Text>
            <Text style={styles.cardSubtitle}>Acompanhe seu progresso</Text>
          </View>
          
          <View style={styles.caloriesDisplay}>
            <Text style={styles.caloriesNumber}>{diario}</Text>
            <Text style={styles.caloriesUnit}>kcal</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${percentual}%` }
                ]} 
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {consumido} / {diario} kcal
              </Text>
              <Text style={styles.progressPercentage}>
                {percentual}%
              </Text>
            </View>
          </View>
        </View>

        {/* Grid de funcionalidades */}
        <View style={styles.featuresGrid}>
          <View style={styles.gridRow}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Refeicoes')} 
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📱</Text>
              </View>
              <Text style={styles.featureTitle}>Refeições</Text>
              <Text style={styles.featureDescription}>Analise suas refeições</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('IMC')} 
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📊</Text>
              </View>
              <Text style={styles.featureTitle}>IMC</Text>
              <Text style={styles.featureDescription}>Calcule seu IMC</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.gridRow}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Meta')} 
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🎯</Text>
              </View>
              <Text style={styles.featureTitle}>Metas</Text>
              <Text style={styles.featureDescription}>Defina seus objetivos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('PlanoTreino')} 
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>💪</Text>
              </View>
              <Text style={styles.featureTitle}>Treinos</Text>
              <Text style={styles.featureDescription}>Planos personalizados</Text>
            </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  
  greetingContainer: {
    flex: 1,
  },
  
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  greetingSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
  },
  
  visitorBadge: {
    backgroundColor: colors.accent.yellow + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.full,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '40',
  },
  
  visitorBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.yellow + 'CC',
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
  
  mainCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  cardSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  },
  
  caloriesDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  caloriesNumber: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.tight,
  },
  
  caloriesUnit: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  
  progressContainer: {
    gap: spacing.md,
  },
  
  progressBar: {
    height: 16,
    backgroundColor: colors.neutral[200],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borders.radius.full,
  },
  
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  progressText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
  
  progressPercentage: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  
  featuresGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  featureCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  
  featureEmoji: {
    fontSize: 24,
  },
  
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  
  featureDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  logoutButton: {
    backgroundColor: colors.neutral[100],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    ...shadows.sm,
  },
  
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
});