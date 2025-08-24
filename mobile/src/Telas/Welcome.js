import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaBoasVindas({ navigation }) {
  const [slideAtual, setSlideAtual] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const animacaoFade = useRef(new Animated.Value(0)).current;
  const animacaoSlide = useRef(new Animated.Value(30)).current;
  const animacaoBotao = useRef(new Animated.Value(0)).current;
  const escalaBotao = useRef(new Animated.Value(0.8)).current;

  const slides = [
    {
      id: 1,
      icone: 'restaurant',
      subtitulo: 'Use inteligência artificial para analisar automaticamente o valor nutricional dos seus alimentos com apenas uma foto',
      corDestaque: '#00C9FF'
    },
    {
      id: 2,
      icone: 'analytics',
      subtitulo: 'Visualize sua evolução com gráficos detalhados, insights personalizados e acompanhamento completo da sua jornada',
      corDestaque: '#FF6B6B'
    },
    {
      id: 3,
      icone: 'fitness-center',
      subtitulo: 'Receba recomendações exclusivas baseadas em seus objetivos, estilo de vida e preferências pessoais',
      corDestaque: '#FFD93D'
    },
    {
      id: 4,
      icone: 'trending-up',
      subtitulo: 'Combinando tecnologia avançada e ciência da nutrição para resultados duradouros e sustentáveis',
      corDestaque: '#A8EDEA'
    }
  ];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(animacaoFade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(animacaoSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Efeito para animar o botão quando aparecer
  React.useEffect(() => {
    if (slideAtual === slides.length - 1) {
      // Reset das animações do botão
      animacaoBotao.setValue(0);
      escalaBotao.setValue(0.8);
      
      // Animação de entrada do botão
      Animated.parallel([
        Animated.timing(animacaoBotao, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(escalaBotao, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [slideAtual]);

  const renderizarSlide = (slide, index) => {
    const faixaEntrada = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const escala = scrollX.interpolate({
      inputRange: faixaEntrada,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp'
    });

    const opacidade = scrollX.interpolate({
      inputRange: faixaEntrada,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp'
    });

    const translateY = scrollX.interpolate({
      inputRange: faixaEntrada,
      outputRange: [60, 0, 60],
      extrapolate: 'clamp'
    });

    const rotacaoY = scrollX.interpolate({
      inputRange: faixaEntrada,
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        key={slide.id}
        style={[
          estilos.slide,
          {
            transform: [{ scale: escala }, { translateY }, { rotateY: rotacaoY }],
            opacity: opacidade
          }
        ]}
      >
        {/* Background com gradiente */}
        <View style={[estilos.fundoSlide, { backgroundColor: slide.corDestaque + '15' }]}>
          <View style={[estilos.circuloGradiente, { backgroundColor: slide.corDestaque + '20' }]} />
          <View style={[estilos.circuloGradiente2, { backgroundColor: slide.corDestaque + '10' }]} />
        </View>

        {/* Ícone principal com efeito de brilho */}
        <View style={estilos.containerIcone}>
          <View style={[estilos.brilhoIcone, { backgroundColor: slide.corDestaque + '30' }]} />
          <View style={[estilos.circuloIcone, { backgroundColor: slide.corDestaque + '20' }]}>
            <MaterialIcons name={slide.icone} size={70} color={slide.corDestaque} />
          </View>
        </View>
        
        {/* Conteúdo do slide */}
        <View style={estilos.conteudoSlide}>
          <Text style={estilos.tituloSlide}>{slide.titulo}</Text>
          <Text style={estilos.subtituloSlide}>{slide.subtitulo}</Text>
          <Text style={estilos.descricaoSlide}>{slide.descricao}</Text>
        </View>
        
        {/* Elementos decorativos flutuantes */}
        <View style={estilos.elementosFlutuantes}>
          <View style={[estilos.pontoFlutuante, { backgroundColor: slide.corDestaque + '40' }]} />
          <View style={[estilos.linhaFlutuante, { backgroundColor: slide.corDestaque + '30' }]} />
          <View style={[estilos.pontoFlutuante, { backgroundColor: slide.corDestaque + '40' }]} />
        </View>
      </Animated.View>
    );
  };

  const lidarComScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const lidarComFimScroll = (event) => {
    const indiceSlide = Math.round(event.nativeEvent.contentOffset.x / width);
    setSlideAtual(indiceSlide);
  };

  const lidarComProsseguir = () => {
    navigation.navigate('Login');
  };

  const lidarComPular = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header moderno com gradiente */}
      <Animated.View 
        style={[
          estilos.cabecalho,
          {
            opacity: animacaoFade,
            transform: [{ translateY: animacaoSlide }]
          }
        ]}
      >
        <View style={estilos.containerLogo}>
          <Text style={estilos.nomeApp}>NutriSnap</Text>
        </View>
        
        <TouchableOpacity onPress={lidarComPular} style={estilos.botaoPular}>
          <Text style={estilos.textoBotaoPular}>Pular</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Carrossel principal com efeitos visuais */}
      <View style={estilos.containerCarrossel}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={lidarComScroll}
          onMomentumScrollEnd={lidarComFimScroll}
          scrollEventThrottle={16}
          style={estilos.carrossel}
        >
          {slides.map((slide, index) => (
            renderizarSlide(slide, index)
          ))}
        </Animated.ScrollView>
      </View>

      {/* Botão de ação com design moderno */}
      <View style={estilos.containerAcoes}>
        {slideAtual === slides.length - 1 ? (
          <Animated.View
            style={{
              opacity: animacaoBotao,
              transform: [{ scale: escalaBotao }]
            }}
          >
            <TouchableOpacity 
              onPress={lidarComProsseguir} 
              style={estilos.botaoProsseguir}
              activeOpacity={0.9}
            >
              <View style={estilos.gradienteBotaoProsseguir}>
                <Text style={estilos.textoBotaoProsseguir}>Prosseguir</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>

      {/* Footer elegante */}
      <Animated.View 
        style={[
          estilos.rodape,
          {
            opacity: animacaoFade,
            transform: [{ translateY: animacaoSlide }]
          }
        ]}
      >
        <Text style={estilos.textoRodape}>
          Comece sua jornada para uma vida mais saudável hoje mesmo
        </Text>
        <View style={estilos.decoracoesRodape}>
          <View style={[estilos.pontoRodape, { backgroundColor: '#667eea' }]} />
          <View style={[estilos.pontoRodape, { backgroundColor: '#764ba2' }]} />
          <View style={[estilos.pontoRodape, { backgroundColor: '#f093fb' }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  
  containerLogo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  nomeApp: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  botaoPular: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  textoBotaoPular: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  containerCarrossel: {
    height: height * 0.62, // Defina uma altura fixa para o carrossel
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  carrossel: {
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
  
  fundoSlide: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    borderRadius: 200,
    opacity: 0.3,
  },
  
  circuloGradiente: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.4,
  },
  
  circuloGradiente2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
  },
  
  containerIcone: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  
  brilhoIcone: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
    zIndex: -1,
  },
  
  circuloIcone: {
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
  
  conteudoSlide: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    paddingHorizontal: spacing.md,
    flexShrink: 1, // Permite o texto quebrar e não sair da tela
  },
  
  tituloSlide: {
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
  
  subtituloSlide: {
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
  
  descricaoSlide: {
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
  
  elementosFlutuantes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  
  pontoFlutuante: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
  
  linhaFlutuante: {
    width: 60,
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
  
  containerAcoes: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  
  botaoProsseguir: {
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    ...shadows.xl,
    elevation: 15,
  },
  
  gradienteBotaoProsseguir: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#667eea',
  },
  
  textoBotaoProsseguir: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  rodape: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  
  textoRodape: {
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
  
  decoracoesRodape: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  pontoRodape: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
});
