import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function PoliticaPrivacidade() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.titulo}>Política de Privacidade</Text>
        <Text style={styles.data}>Última atualização: 3 de setembro de 2025</Text>
        <Text style={styles.paragrafo}>
          A sua privacidade é importante para nós. Esta política de privacidade explica como o NutriSnap coleta, usa e protege seus dados pessoais...
        </Text>
        <Text style={styles.subtitulo}>1. Coleta de Informações</Text>
        <Text style={styles.paragrafo}>
          Coletamos informações que você nos fornece diretamente, como nome, e-mail e dados de saúde para personalizar sua experiência.
        </Text>
        <Text style={styles.subtitulo}>2. Uso das Informações</Text>
        <Text style={styles.paragrafo}>
          As informações coletadas são usadas para fornecer e melhorar nossos serviços, personalizar o conteúdo e enviar comunicações relevantes.
        </Text>
        {/* Adicione o restante do conteúdo aqui */}
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
  },
  titulo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[100],
    marginBottom: spacing.md,
  },
  data: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.lg,
  },
  subtitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[200],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragrafo: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    lineHeight: typography.lineHeight.tall,
    marginBottom: spacing.md,
  },
});