import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function SobreApp() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
        <Text style={styles.titulo}>Sobre o NutriSnap</Text>
        <Text style={styles.versao}>Versão 1.0.0</Text>

        <Text style={styles.subtitulo}>O que é o NutriSnap?</Text>
        <Text style={styles.paragrafo}>
          NutriSnap é um aplicativo desenvolvido como parte de um projeto de extensão universitária, voltado para pessoas que desejam melhorar sua alimentação e manter uma rotina frequente de treinos. Com ele, você pode monitorar suas calorias diárias, definir metas como ganho muscular ou limite de calorias, e acompanhar seu progresso de forma prática.
        </Text>

        <Text style={styles.subtitulo}>Funcionalidades</Text>
        <Text style={styles.paragrafo}>
          • Scanner inteligente: tire uma foto do alimento e a IA informa a quantidade exata de calorias.
          {'\n'}• Quiz personalizado: responda perguntas e receba um plano de treino gerado por IA.
          {'\n'}• Metas nutricionais e de treino: defina objetivos e acompanhe seu desempenho.
          {'\n'}• Controle diário: registre refeições, treinos e evolua com dados claros.
        </Text>

        <Text style={styles.subtitulo}>Nossa Missão</Text>
        <Text style={styles.paragrafo}>
          Tornar o cuidado com a saúde mais acessível, inteligente e personalizado, ajudando você a conquistar seus objetivos com tecnologia e praticidade.
        </Text>

        <Text style={styles.subtitulo}>Equipe</Text>
        <Text style={styles.paragrafo}>
          Desenvolvido por Kaio, Isaleo para o trabalho de extensão da faculdade, com apoio de projetos open source e tecnologia de IA.
        </Text>

        <Text style={styles.subtitulo}>Agradecimentos</Text>
        <Text style={styles.paragrafo}>
          Agradecemos aos professores, colegas e à comunidade de código aberto que contribuíram para tornar este projeto possível.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  scrollContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.xl,
  },
  titulo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[100],
    marginBottom: spacing.xs,
  },
  versao: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing['2xl'],
  },
  subtitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[200],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  paragrafo: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    lineHeight: typography.lineHeight.tall,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
});