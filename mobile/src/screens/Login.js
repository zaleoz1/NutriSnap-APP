import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { buscarApi, obterDetalhesErro } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

export default function TelaLogin({ navigation }) {
  const { entrar, conectado } = usarAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Validação de email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validação de senha
  const validarSenha = (senha) => {
    return senha.length >= 6;
  };

  // Validar formulário
  const validarFormulario = () => {
    if (!email.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira seu email');
      return false;
    }

    if (!validarEmail(email.trim())) {
      Alert.alert('Email inválido', 'Por favor, insira um email válido');
      return false;
    }

    if (!senha.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira sua senha');
      return false;
    }

    if (!validarSenha(senha)) {
      Alert.alert('Senha inválida', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  // Lidar com login
  async function lidarComLogin() {
    if (!validarFormulario()) return;

    // Verificar conectividade
    if (!conectado) {
      Alert.alert(
        'Sem conexão', 
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
        [
          { text: 'OK' },
          { text: 'Tentar novamente', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setCarregando(true);

    try {
      const dados = await buscarApi('/api/autenticacao/entrar', { 
        method: 'POST', 
        body: { 
          email: email.trim().toLowerCase(), 
          senha 
        } 
      });

      await entrar(dados.token, dados.usuario);
      
      // Limpar campos
      setEmail('');
      setSenha('');
      
      // Navegar para tela principal
      navigation.replace('Principal');
      
    } catch (erro) {
      console.error('❌ Erro no login:', erro);
      
      let mensagem = 'Erro ao fazer login. Tente novamente.';
      
      if (erro.status === 401) {
        mensagem = 'Email ou senha incorretos. Verifique suas credenciais.';
      } else if (erro.status === 404) {
        mensagem = 'Serviço de autenticação não disponível.';
      } else if (erro.status === 500) {
        mensagem = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (erro.message) {
        mensagem = erro.message;
      }

      // Mostrar detalhes do erro se disponível
      const detalhes = obterDetalhesErro(erro);
      if (detalhes && detalhes !== mensagem) {
        mensagem += `\n\nDetalhes: ${detalhes}`;
      }

      Alert.alert('Erro no Login', mensagem);
      
    } finally {
      setCarregando(false);
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
              <MaterialIcons name="restaurant" size={32} color={colors.primary[600]} />
            </View>
            <Text style={styles.logoText}>NutriSnap</Text>
          </View>
          <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitleText}>Entre na sua conta para continuar sua jornada</Text>
          
          {/* Indicador de conectividade */}
          <View style={styles.connectionStatus}>
            <View style={[
              styles.connectionDot, 
              { backgroundColor: conectado ? colors.success : colors.error }
            ]} />
            <Text style={[
              styles.connectionText,
              { color: conectado ? colors.success : colors.error }
            ]}>
              {conectado ? 'Conectado ao servidor' : 'Servidor não acessível'}
            </Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused,
                email.trim() && !validarEmail(email.trim()) && styles.inputError
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
              editable={!carregando}
            />
            {email.trim() && !validarEmail(email.trim()) && (
              <Text style={styles.errorText}>Email deve ter formato válido</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[
                styles.input,
                senhaFocused && styles.inputFocused,
                senha.trim() && !validarSenha(senha) && styles.inputError
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={senha}
              onChangeText={setSenha}
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
              secureTextEntry
              autoCapitalize="none"
              editable={!carregando}
            />
            {senha.trim() && !validarSenha(senha) && (
              <Text style={styles.errorText}>Mínimo de 6 caracteres</Text>
            )}
          </View>

          <TouchableOpacity 
            onPress={lidarComLogin} 
            style={[
              styles.loginButton,
              carregando && styles.buttonDisabled
            ]}
            disabled={carregando || !conectado}
            activeOpacity={0.8}
          >
            {carregando ? (
              <View style={styles.buttonWithLoading}>
                <ActivityIndicator color={colors.neutral[50]} size="small" />
                <Text style={styles.loginButtonText}>Entrando...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Links de navegação */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={styles.navLink}
            disabled={carregando}
          >
            <Text style={styles.navLinkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.navLink}
            disabled={carregando}
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
    marginBottom: spacing.md,
  },
  
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  connectionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
  
  inputError: {
    borderColor: colors.error,
    borderWidth: borders.width.base,
  },
  
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginLeft: spacing.sm,
    fontStyle: 'italic',
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
  
  buttonDisabled: {
    backgroundColor: colors.neutral[400],
    ...shadows.sm,
  },
  
  buttonWithLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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