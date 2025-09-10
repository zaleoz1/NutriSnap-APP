import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function SobreApp() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Se você tiver um logo, pode adicioná-lo aqui */}
        {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
        
        <Text style={styles.titulo}>Sobre o NutriSnap</Text>
        <Text style={styles.versao}>Versão 1.0.0</Text>
        
        <Text style={styles.subtitulo}>Nossa Missão</Text>
        <Text style={styles.paragrafo}>
          O NutriSnap nasceu com a missão de simplificar o controle nutricional e tornar a vida mais saudável. Acreditamos que o acesso à informação e o monitoramento fácil dos hábitos alimentares são essenciais para alcançar seus objetivos de bem-estar.
        </Text>
        
        <Text style={styles.subtitulo}>Equipe</Text>
        <Text style={styles.paragrafo}>
          Desenvolvido com ❤️ por Kaio Araújo.
        </Text>
        
        <Text style={styles.subtitulo}>Agradecimentos</Text>
        <Text style={styles.paragrafo}>
          Agradecemos a todos que nos apoiaram e aos projetos de código aberto que tornaram este aplicativo possível.
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