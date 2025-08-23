import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { buscarApi, URL_BASE } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

export default function TelaLogin({ navigation }) {
  const { entrar } = usarAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  async function lidarComLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      const dados = await buscarApi('/api/autenticacao/entrar', { method: 'POST', body: { email, senha } });
      await entrar(dados.token, dados.usuario);
      navigation.replace('Principal');
    } catch (erro) {
      Alert.alert('Erro', erro.message);
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
          <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitleText}>Entre na sua conta para continuar sua jornada</Text>
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
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
          </View>

          <TouchableOpacity 
            onPress={lidarComLogin} 
            style={styles.loginButton}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>

        {/* Links de navegação */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={styles.navLink}
          >
            <Text style={styles.navLinkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.navLink}
          >
            <Text style={styles.navLinkText}>Voltar</Text>
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
    paddingTop: spacing['3xl'],
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
  
  loginButton: {
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
  
  loginButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  navigationContainer: {
    alignItems: 'center',
    gap: spacing.md,
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