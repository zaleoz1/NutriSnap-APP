import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { buscarApi, obterDetalhesErro } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

export default function TelaRegistro({ navigation }) {
  const { conectado } = usarAutenticacao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmarSenhaFocused, setConfirmarSenhaFocused] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Validação de nome
  const validarNome = (nome) => {
    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 2) return false;
    if (nomeLimpo.length > 100) return false;
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return regex.test(nomeLimpo);
  };

  // Validação de email
  const validarEmail = (email) => {
    const emailLimpo = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailLimpo);
  };

  // Validação de senha
  const validarSenha = (senha) => {
    if (senha.length < 6) return false;
    if (senha.length > 255) return false;
    
    // Verificar se contém pelo menos uma letra maiúscula, uma minúscula e um número
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /\d/.test(senha);
    
    return temMaiuscula && temMinuscula && temNumero;
  };

  // Validar formulário completo
  const validarFormulario = () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira seu nome completo');
      return false;
    }

    if (!validarNome(nome)) {
      Alert.alert('Nome inválido', 'Nome deve ter entre 2 e 100 caracteres e conter apenas letras e espaços');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira seu email');
      return false;
    }

    if (!validarEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, insira um email válido');
      return false;
    }

    if (!senha) {
      Alert.alert('Campo obrigatório', 'Por favor, insira uma senha');
      return false;
    }

    if (!validarSenha(senha)) {
      Alert.alert('Senha inválida', 'Senha deve ter entre 6 e 255 caracteres, com pelo menos uma letra maiúscula, uma minúscula e um número');
      return false;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Senhas não coincidem', 'A confirmação de senha deve ser igual à senha');
      return false;
    }

    return true;
  };

  // Lidar com registro
  async function lidarComRegistro() {
    if (!validarFormulario()) return;

    // Verificar conectividade
    if (!conectado) {
      Alert.alert(
        'Sem conexão', 
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
        [
          { text: 'OK' },
          { text: 'Tentar novamente', onPress: () => navigation.navigate('Register') }
        ]
      );
      return;
    }

    setCarregando(true);

    try {
      const dados = await buscarApi('/api/autenticacao/registrar', { 
        method: 'POST', 
        body: { 
          nome: nome.trim(),
          email: email.trim().toLowerCase(), 
          senha 
        } 
      });

      console.log('✅ Registro realizado com sucesso:', dados);
      
      Alert.alert(
        'Conta criada!', 
        'Sua conta foi criada com sucesso! Faça login para continuar.',
        [
          { 
            text: 'Fazer Login', 
            onPress: () => {
              // Limpar campos
              setNome('');
              setEmail('');
              setSenha('');
              setConfirmarSenha('');
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (erro) {
      console.error('❌ Erro no registro:', erro);
      
      let mensagem = 'Erro ao criar conta. Tente novamente.';
      
      if (erro.status === 409) {
        mensagem = 'Este email já está cadastrado. Use outro email ou faça login.';
      } else if (erro.status === 400) {
        mensagem = 'Dados inválidos. Verifique as informações inseridas.';
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

      Alert.alert('Erro no Registro', mensagem);
      
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
          <Text style={styles.welcomeText}>Junte-se a nós!</Text>
          <Text style={styles.subtitleText}>Crie sua conta e comece sua jornada para uma vida mais saudável</Text>
          
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
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              style={[
                styles.input,
                nomeFocused && styles.inputFocused,
                nome.trim() && !validarNome(nome) && styles.inputError
              ]}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.neutral[400]}
              value={nome}
              onChangeText={setNome}
              onFocus={() => setNomeFocused(true)}
              onBlur={() => setNomeFocused(false)}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!carregando}
            />
            {nome.trim() && !validarNome(nome) && (
              <Text style={styles.errorText}>Nome deve ter entre 2 e 100 caracteres</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused,
                email.trim() && !validarEmail(email) && styles.inputError
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
            {email.trim() && !validarEmail(email) && (
              <Text style={styles.errorText}>Email deve ter formato válido</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[
                styles.input,
                senhaFocused && styles.inputFocused,
                senha && !validarSenha(senha) && styles.inputError
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
            {senha && !validarSenha(senha) && (
              <Text style={styles.errorText}>Mínimo 6 caracteres, com maiúscula, minúscula e número</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar senha</Text>
            <TextInput
              style={[
                styles.input,
                confirmarSenhaFocused && styles.inputFocused,
                confirmarSenha && senha !== confirmarSenha && styles.inputError
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              onFocus={() => setConfirmarSenhaFocused(true)}
              onBlur={() => setConfirmarSenhaFocused(false)}
              secureTextEntry
              autoCapitalize="none"
              editable={!carregando}
            />
            {confirmarSenha && senha !== confirmarSenha && (
              <Text style={styles.errorText}>As senhas não coincidem</Text>
            )}
          </View>

          <TouchableOpacity 
            onPress={lidarComRegistro} 
            style={[
              styles.registerButton,
              carregando && styles.buttonDisabled
            ]}
            disabled={carregando || !conectado}
            activeOpacity={0.8}
          >
            {carregando ? (
              <View style={styles.buttonWithLoading}>
                <ActivityIndicator color={colors.neutral[50]} size="small" />
                <Text style={styles.registerButtonText}>Criando conta...</Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Links de navegação */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.navLink}
            disabled={carregando}
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
  
  buttonDisabled: {
    backgroundColor: colors.neutral[400],
    ...shadows.sm,
  },
  
  buttonWithLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
