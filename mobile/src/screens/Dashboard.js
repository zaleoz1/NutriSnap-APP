import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { usuario } = usarAutenticacao();
  const [currentDate] = useState(new Date());

  // Dados simulados para demonstração
  const userData = {
    name: usuario?.nome || 'Usuário',
    dailyCalories: 2290,
    consumedCalories: 0,
    exerciseCalories: 0,
    steps: 26,
    weight: 82,
    waterIntake: 0
  };

  const remainingCalories = userData.dailyCalories - userData.consumedCalories + userData.exerciseCalories;
  const caloriesProgress = Math.min(100, Math.round((userData.consumedCalories / userData.dailyCalories) * 100));
  const stepsProgress = Math.min(100, Math.round((userData.steps / 10000) * 100));

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userData.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>{getGreeting()}, {userData.name}!</Text>
              <Text style={styles.date}>{formatDate(currentDate)}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Card principal de calorias */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Calorias</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>EDITAR</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.caloriesSubtitle}>
            Restantes = Meta - Alimentos + Exercício
          </Text>
          
          <View style={styles.caloriesDisplay}>
            <View style={styles.caloriesCircle}>
              <Text style={styles.caloriesNumber}>{remainingCalories}</Text>
              <Text style={styles.caloriesLabel}>Restantes</Text>
            </View>
            
            <View style={styles.caloriesBreakdown}>
              <View style={styles.breakdownItem}>
                <MaterialIcons name="flag" size={16} color={colors.neutral[400]} />
                <Text style={styles.breakdownLabel}>Meta base</Text>
                <Text style={styles.breakdownValue}>{userData.dailyCalories}</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <MaterialIcons name="restaurant" size={16} color={colors.neutral[400]} />
                <Text style={styles.breakdownLabel}>Alimentos</Text>
                <Text style={styles.breakdownValue}>{userData.consumedCalories}</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.neutral[400]} />
                <Text style={styles.breakdownLabel}>Exercício</Text>
                <Text style={styles.breakdownValue}>{userData.exerciseCalories}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Banner de anúncio */}
        <View style={styles.adBanner}>
          <View style={styles.adContent}>
            <View style={styles.adLeft}>
              <Text style={styles.adLogo}>rent day</Text>
              <Text style={styles.adSubtext}>rentcars</Text>
            </View>
            <View style={styles.adCenter}>
              <Text style={styles.adText}>Chance única para alugar carro com desconto!</Text>
            </View>
            <View style={styles.adRight}>
              <Text style={styles.adDiscount}>% ATÉ 40% OFF</Text>
              <View style={styles.adImage}>
                <MaterialIcons name="directions-car" size={24} color={colors.neutral[700]} />
              </View>
              <TouchableOpacity style={styles.adButton}>
                <Text style={styles.adButtonText}>Baixe agora</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Indicadores do carrossel */}
          <View style={styles.adIndicators}>
            <View style={[styles.adIndicator, styles.adIndicatorActive]} />
            <View style={styles.adIndicator} />
            <View style={styles.adIndicator} />
          </View>
        </View>

        {/* Call to action Premium */}
        <View style={styles.premiumCTA}>
          <Text style={styles.premiumText}>Diga adeus aos anúncios. Seja Premium</Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Seja Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Cards de métricas */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Passos</Text>
            <View style={styles.metricContent}>
              <FontAwesome5 name="shoe-prints" size={20} color={colors.accent.pink} />
              <Text style={styles.metricValue}>{userData.steps}</Text>
            </View>
            <Text style={styles.metricGoal}>Meta: 10.000 passos</Text>
            <View style={styles.metricProgress}>
              <View style={[styles.metricProgressFill, { width: `${stepsProgress}%` }]} />
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
            <Text style={styles.metricTitle}>Exercício</Text>
            <View style={styles.metricContent}>
              <MaterialIcons name="local-fire-department" size={20} color={colors.neutral[400]} />
              <Text style={styles.metricValue}>{userData.exerciseCalories} cal</Text>
            </View>
            <Text style={styles.metricGoal}>00:00 h</Text>
          </View>
          
          <View style={styles.metricCard}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
            <Text style={styles.metricTitle}>Peso</Text>
            <Text style={styles.metricValue}>{userData.weight}</Text>
            <Text style={styles.metricGoal}>Últimos 90 dias</Text>
          </View>
          
          <View style={styles.metricCard}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
            <Text style={styles.metricTitle}>Água</Text>
            <Text style={styles.metricValue}>{userData.waterIntake}</Text>
            <Text style={styles.metricGoal}>Meta: 2L</Text>
          </View>
        </View>

        {/* Seções de refeições */}
        <View style={styles.mealsSection}>
          <Text style={styles.mealsTitle}>Refeições de Hoje</Text>
          
          {['Café da manhã', 'Almoço', 'Jantar'].map((meal, index) => (
            <View key={index} style={styles.mealItem}>
              <Text style={styles.mealName}>{meal}</Text>
              <TouchableOpacity style={styles.addMealButton}>
                <Text style={styles.addMealButtonText}>ADICIONAR ALIMENTO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mealMenu}>
                <Text style={styles.mealMenuText}>⋯</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Botões de ação rápida */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="search" size={24} color={colors.primary[600]} />
            </View>
            <Text style={styles.quickActionText}>Registrar alimento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="qr-code-scanner" size={24} color={colors.primary[600]} />
            </View>
            <Text style={styles.quickActionText}>Leitor de código de barras</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de navegação inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <MaterialIcons name="dashboard" size={20} color={colors.primary[600]} />
          <Text style={styles.navLabel}>Painel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="book" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Diário</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="restaurant" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Refeições</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="trending-up" size={20} color={colors.neutral[400]} />
          <Text style={styles.navLabel}>Progresso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="settings" size={20} color={colors.neutral[400]} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  userDetails: {
    flex: 1,
  },
  
  greeting: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  date: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  notificationIcon: {
    fontSize: 20,
  },
  
  mainCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[400],
  },
  
  caloriesSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  caloriesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  caloriesCircle: {
    flex: 1,
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  
  caloriesNumber: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[400],
    lineHeight: typography.lineHeight.tight,
  },
  
  caloriesLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  caloriesBreakdown: {
    flex: 1,
    gap: spacing.md,
  },
  
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  breakdownIcon: {
    fontSize: 16,
  },
  
  breakdownLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    flex: 1,
  },
  
  breakdownValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  adBanner: {
    backgroundColor: colors.accent.yellow,
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.base,
  },
  
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  adLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  adLogo: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  
  adSubtext: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  },
  
  adCenter: {
    flex: 1,
    marginRight: spacing.md,
  },
  
  adText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  
  adRight: {
    alignItems: 'center',
  },
  
  adDiscount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  
  adImage: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  
  adCarIcon: {
    fontSize: 24,
  },
  
  adButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.md,
  },
  
  adButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  adIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  
  adIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[400],
  },
  
  adIndicatorActive: {
    backgroundColor: colors.primary[600],
    width: 18,
  },
  
  premiumCTA: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  premiumText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  
  premiumButton: {
    backgroundColor: colors.accent.yellow,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.lg,
  },
  
  premiumButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  
  metricCard: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    ...shadows.base,
  },
  
  metricTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  
  addButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  
  metricIcon: {
    fontSize: 20,
  },
  
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  metricGoal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  metricProgress: {
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  
  metricProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borders.radius.full,
  },
  
  mealsSection: {
    marginBottom: spacing.lg,
  },
  
  mealsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
  },
  
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.base,
  },
  
  mealName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    flex: 1,
  },
  
  addMealButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.md,
    marginRight: spacing.sm,
  },
  
  addMealButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  mealMenu: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  mealMenuText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[400],
  },
  
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.base,
  },
  
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  
  quickActionEmoji: {
    fontSize: 24,
  },
  
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  
  bottomNav: {
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
    paddingVertical: spacing.sm,
  },
  
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primary[600],
  },
  
  navIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  
  navLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
});
