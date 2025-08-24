import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  const slides = [
    {
      id: 1,
      icon: 'restaurant',
      subtitle: 'Use inteligência artificial para analisar automaticamente o valor nutricional dos seus alimentos com apenas uma foto',
      accentColor: '#00C9FF'
    },
    {
      id: 2,
      icon: 'analytics',
      subtitle: 'Visualize sua evolução com gráficos detalhados, insights personalizados e acompanhamento completo da sua jornada',
      accentColor: '#FF6B6B'
    },
    {
      id: 3,
      icon: 'fitness-center',
      subtitle: 'Receba recomendações exclusivas baseadas em seus objetivos, estilo de vida e preferências pessoais',
      accentColor: '#FFD93D'
    },
    {
      id: 4,
      icon: 'trending-up',
      subtitle: 'Combinando tecnologia avançada e ciência da nutrição para resultados duradouros e sustentáveis',
      accentColor: '#A8EDEA'
    }
  ];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Efeito para animar o botão quando aparecer
  React.useEffect(() => {
    if (currentSlide === slides.length - 1) {
      // Reset das animações do botão
      buttonAnim.setValue(0);
      buttonScale.setValue(0.8);
      
      // Animação de entrada do botão
      Animated.parallel([
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentSlide]);

  const renderSlide = (slide, index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp'
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp'
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [60, 0, 60],
      extrapolate: 'clamp'
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        key={slide.id}
        style={[
          styles.slide,
          {
            transform: [{ scale }, { translateY }, { rotateY }],
            opacity
          }
        ]}
      >
        {/* Background com gradiente */}
        <View style={[styles.slideBackground, { backgroundColor: slide.accentColor + '15' }]}>
          <View style={[styles.gradientCircle, { backgroundColor: slide.accentColor + '20' }]} />
          <View style={[styles.gradientCircle2, { backgroundColor: slide.accentColor + '10' }]} />
        </View>

        {/* Ícone principal com efeito de brilho */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconGlow, { backgroundColor: slide.accentColor + '30' }]} />
          <View style={[styles.iconCircle, { backgroundColor: slide.accentColor + '20' }]}>
            <MaterialIcons name={slide.icon} size={70} color={slide.accentColor} />
          </View>
        </View>
        
        {/* Conteúdo do slide */}
        <View style={styles.slideContent}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>
        
        {/* Elementos decorativos flutuantes */}
        <View style={styles.floatingElements}>
          <View style={[styles.floatingDot, { backgroundColor: slide.accentColor + '40' }]} />
          <View style={[styles.floatingLine, { backgroundColor: slide.accentColor + '30' }]} />
          <View style={[styles.floatingDot, { backgroundColor: slide.accentColor + '40' }]} />
        </View>
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

  const handleProceed = () => {
    navigation.navigate('Login');
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header moderno com gradiente */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>NutriSnap</Text>
        </View>
        
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Pular</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Carrossel principal com efeitos visuais */}
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
  renderSlide(slide, index)
))}
        </Animated.ScrollView>
      </View>

      {/* Botão de ação com design moderno */}
      <View style={styles.actionsContainer}>
        {currentSlide === slides.length - 1 ? (
          <Animated.View
            style={{
              opacity: buttonAnim,
              transform: [{ scale: buttonScale }]
            }}
          >
            <TouchableOpacity 
              onPress={handleProceed} 
              style={styles.proceedButton}
              activeOpacity={0.9}
            >
              <View style={styles.proceedButtonGradient}>
                <Text style={styles.proceedButtonText}>Prosseguir</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>

      {/* Footer elegante */}
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.footerText}>
          Comece sua jornada para uma vida mais saudável hoje mesmo
        </Text>
        <View style={styles.footerDecorations}>
          <View style={[styles.footerDot, { backgroundColor: '#667eea' }]} />
          <View style={[styles.footerDot, { backgroundColor: '#764ba2' }]} />
          <View style={[styles.footerDot, { backgroundColor: '#f093fb' }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  skipButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  carouselContainer: {
    height: height * 0.62, // Defina uma altura fixa para o carrossel
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  carousel: {
    flexGrow: 0, // Não deixa crescer além do necessário
    height: '100%',
  },
  
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: '100%', // Ocupa toda a altura do carrossel
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  
  slideBackground: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    borderRadius: 200,
    opacity: 0.3,
  },
  
  gradientCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.4,
  },
  
  gradientCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  
  iconGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
    zIndex: -1,
  },
  
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.xl,
    elevation: 15,
  },
  
  slideContent: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    paddingHorizontal: spacing.md,
    flexShrink: 1, // Permite o texto quebrar e não sair da tela
  },
  
  slideTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.black,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.tight,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  
  slideSubtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  slideDescription: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    maxWidth: width * 0.95, // Aumenta o limite para não cortar texto
  },
  
  floatingElements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  
  floatingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
  
  floatingLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
  
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  
  proceedButton: {
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    ...shadows.xl,
    elevation: 15,
  },
  
  proceedButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#667eea',
  },
  
  proceedButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  footerDecorations: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
});
