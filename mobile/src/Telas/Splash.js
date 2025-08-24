import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinner começa a girar imediatamente
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Sequência de animações elegantes
    const animationSequence = async () => {
      // Fade in suave
      await new Promise(resolve => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start(resolve);
      });

      // Logo aparece com scale e slide
      await new Promise(resolve => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // Pulse contínuo no texto
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animationSequence();

    // Navegar para a próxima tela após 4 segundos
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Conteúdo principal */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Nome do app */}
        <Animated.View
          style={[
            styles.appNameContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>NutriSnap</Text>
          <View style={styles.appNameUnderline} />
        </Animated.View>

        {/* Spinner de carregamento */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <Text style={styles.loadingText}></Text>
        </View>
      </Animated.View>

      {/* Barra de progresso inferior */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  appNameContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  
  appName: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.neutral[50],
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  appNameUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#4facfe',
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  
  loadingContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4facfe',
    borderTopColor: 'transparent',
    marginBottom: spacing.md,
  },
  
  loadingText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[300],
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
});
