import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function TermosDeUso() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.titulo}>Termos de Uso do NutriSnap</Text>
        <Text style={styles.data}>Última atualização: 3 de setembro de 2025</Text>
        <Text style={styles.paragrafo}>
          Bem-vindo ao NutriSnap! Ao utilizar nosso aplicativo, você concorda em cumprir os seguintes termos e condições...
        </Text>
        <Text style={styles.subtitulo}>1. Aceitação dos Termos</Text>
        <Text style={styles.paragrafo}>
          Ao acessar e usar o NutriSnap, você reconhece que leu, entendeu e concorda em ficar vinculado a estes Termos de Uso.
        </Text>
        <Text style={styles.subtitulo}>2. Uso do Serviço</Text>
        <Text style={styles.paragrafo}>
          O NutriSnap é fornecido para seu uso pessoal e não comercial. Você não pode usar o aplicativo para fins ilegais ou não autorizados.
        </Text>
        {/* Adicione o restante do conteúdo dos termos aqui */}
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