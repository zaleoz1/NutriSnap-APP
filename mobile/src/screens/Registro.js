import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

export default function TelaRegistro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  async function lidarComRegistro() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await buscarApi('/api/autenticacao/registrar', { 
        method: 'POST', 
        body: { nome, email, senha } 
      });
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral[50]} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🍎</Text>
            </View>
            <Text style={styles.logoText}>NutriSnap</Text>
          </View>
          <Text style={styles.welcomeText}>Junte-se a nós!</Text>
          <Text style={styles.subtitleText}>Crie sua conta e comece sua jornada para uma vida mais saudável</Text>
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              style={[
                styles.input,
                nomeFocused && styles.inputFocused
              ]}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.neutral[400]}
              value={nome}
              onChangeText={setNome}
              onFocus={() => setNomeFocused(true)}
              onBlur={() => setNomeFocused(false)}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused
              ]}
              placeholder="seu@email.com"
              placeholderTextColor={colors.neutral[400]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[
                styles.input,
                senhaFocused && styles.inputFocused
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={senha}
              onChangeText={setSenha}
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
              secureTextEntry
              autoCapitalize="none"
            />
            <Text style={styles.passwordHint}>Mínimo de 6 caracteres</Text>
          </View>

          <TouchableOpacity 
            onPress={lidarComRegistro} 
            style={styles.registerButton}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Links de navegação */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.navLink}
          >
            <Text style={styles.navLinkText}>Já tem conta? Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  
  logoIcon: {
    fontSize: 32,
  },
  
  logoText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  
  welcomeText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  subtitleText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
    maxWidth: 300,
  },
  
  formContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  inputGroup: {
    gap: spacing.sm,
  },
  
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginLeft: spacing.sm,
  },
  
  input: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    fontSize: typography.fontSize.base,
    color: colors.neutral[900],
    ...shadows.sm,
  },
  
  inputFocused: {
    borderColor: colors.primary[500],
    borderWidth: borders.width.base,
    ...shadows.base,
  },
  
  passwordHint: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
    marginLeft: spacing.sm,
    fontStyle: 'italic',
  },
  
  registerButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.lg,
    elevation: 8,
  },
  
  registerButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  navigationContainer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  
  navLink: {
    paddingVertical: spacing.sm,
  },
  
  navLinkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
});
