import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView, Animated } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { entrarModoVisitante } = usarAutenticacao();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: 1,
      icon: 'directions-run',
      title: 'Quer ver suas vitórias?',
      subtitle: 'Comece a acompanhar seu dia',
      description: 'Transforme sua saúde com inteligência artificial'
    },
    {
      id: 2,
      icon: 'analytics',
      title: 'Acompanhe seu progresso',
      subtitle: 'Metas personalizadas e resultados reais',
      description: 'Visualize sua evolução com gráficos detalhados'
    },
    {
      id: 3,
      icon: 'fitness-center',
      title: 'Planos personalizados',
      subtitle: 'Treinos e refeições sob medida',
      description: 'Receba recomendações baseadas em seus objetivos'
    }
  ];

  function lidarComModoVisitante() {
    entrarModoVisitante();
    navigation.replace('Onboarding');
  }

  const renderSlide = (slide, index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp'
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        key={slide.id}
        style={[
          styles.slide,
          {
            transform: [{ scale }],
            opacity
          }
        ]}
      >
        <View style={styles.slideImageContainer}>
          <MaterialIcons name={slide.icon} size={60} color={colors.neutral[50]} />
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
      </Animated.View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollEnd = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo ao</Text>
        <Text style={styles.appName}>NutriSnap</Text>
      </View>

      {/* Carrossel */}
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          {slides.map((slide, index) => (
            <View key={slide.id} style={styles.slideContainer}>
              {renderSlide(slide, index)}
            </View>
          ))}
        </Animated.ScrollView>
        
        {/* Indicadores */}
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlide === index && styles.indicatorActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')} 
          style={styles.buttonPrimary}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryText}>ENTRAR NA MINHA CONTA</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={lidarComModoVisitante} 
          style={styles.buttonSecondary}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Experimentar Agora</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')} 
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Primeira vez? Criar conta</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Modo Visitante: Teste todas as funcionalidades sem compromisso
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[600],
  },
  
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  welcomeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  
  appName: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    letterSpacing: -0.5,
  },
  
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  carousel: {
    flex: 1,
  },
  
  slideContainer: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  slide: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  
  slideImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[50] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  
  slideImage: {
    fontSize: 60,
  },
  
  slideTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  slideSubtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[100],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  slideDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.neutral[200],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },
  
  indicatorActive: {
    backgroundColor: colors.neutral[50],
    width: 24,
  },
  
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  
  buttonPrimary: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  buttonPrimaryText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    letterSpacing: 0.5,
  },
  
  buttonSecondary: {
    backgroundColor: colors.neutral[100] + '20',
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[100] + '40',
    ...shadows.base,
  },
  
  buttonSecondaryText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  
  linkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[100],
    textDecorationLine: 'underline',
  },
  
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[200],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
});
