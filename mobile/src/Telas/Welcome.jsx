import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

// Tela de boas-vindas com introdução ao app
export default function TelaBoasVindas({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      title: 'Bem-vindo ao NutriSnap',
      description: 'Seu companheiro inteligente para uma vida mais saudável',
      icon: '🍎',
      color: colors.primary[600]
    },
    {
      title: 'Análise Nutricional por IA',
      description: 'Fotografe suas refeições e receba informações nutricionais detalhadas',
      icon: '📸',
      color: colors.secondary[600]
    },
    {
      title: 'Metas Personalizadas',
      description: 'Receba recomendações nutricionais baseadas no seu perfil e objetivos',
      icon: '🎯',
      color: colors.success[600]
    },
    {
      title: 'Acompanhamento Completo',
      description: 'Monitore seu progresso, treinos e hábitos alimentares',
      icon: '📊',
      color: colors.warning[600]
    }
  ];

  const renderizarSlide = (slide, index) => {
    const isActive = index === currentIndex;
    
    return (
      <View key={index} style={styles.slide}>
        <Animated.View 
          style={[
            styles.slideContent,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.slideIcon}>{slide.icon}</Text>
          <Text style={[styles.slideTitle, { color: slide.color }]}>
            {slide.title}
          </Text>
          <Text style={styles.slideDescription}>
            {slide.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const lidarComFimScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const lidarComProsseguir = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true
      });
    } else {
      navigation.navigate('Cadastro');
    }
  };

  const lidarComPular = () => {
    navigation.navigate('Cadastro');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[800]} />
      
      <LinearGradient
        colors={[colors.primary[800], colors.primary[600]]}
        style={styles.header}
      >
        <Text style={styles.logo}>NutriSnap</Text>
        <Text style={styles.subtitle}>Transforme sua saúde com tecnologia</Text>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={lidarComFimScroll}
        style={styles.scrollView}
      >
        {slides.map(renderizarSlide)}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={lidarComPular}
          >
            <Text style={styles.skipButtonText}>Pular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: slides[currentIndex]?.color }]}
            onPress={lidarComProsseguir}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.neutral[600],
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing.xs,
  },
  indicatorActive: {
    backgroundColor: colors.primary[600],
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.neutral[500],
  },
  nextButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
