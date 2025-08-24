import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { buscarApi, obterDetalhesErro } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { typography, spacing, borders, shadows } from '../styles/globalStyles';

const { height } = Dimensions.get('window');

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

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

  const validarNome = (nome) => {
    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 2 || nomeLimpo.length > 100) return false;
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return regex.test(nomeLimpo);
  };

  const validarEmail = (email) => {
    const emailLimpo = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailLimpo);
  };

  const validarSenha = (senha) => {
    if (senha.length < 6 || senha.length > 255) return false;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /\d/.test(senha);
    return temMaiuscula && temMinuscula && temNumero;
  };

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

  async function lidarComRegistro() {
    if (!validarFormulario()) return;

    if (!conectado) {
      Alert.alert(
        'Sem conexão', 
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
        [{ text: 'OK' }]
      );
      return;
    }

    setCarregando(true);

    try {
      await buscarApi('/api/autenticacao/registrar', { 
        method: 'POST', 
        body: { 
          nome: nome.trim(),
          email: email.trim().toLowerCase(), 
          senha 
        } 
      });
      
      Alert.alert(
        'Conta criada!', 
        'Sua conta foi criada com sucesso! Faça login para continuar.',
        [
          { 
            text: 'Fazer Login', 
            onPress: () => {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      <View style={styles.backgroundContainer}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
        <View style={styles.gradientCircle3} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoAnim }]
                }
              ]}
            >
              <View style={styles.logoGlow} />
              <View style={styles.logoCircle}>
                <MaterialIcons name="restaurant" size={40} color="#00C9FF" />
              </View>
              <Text style={styles.logoText}>NutriSnap</Text>
            </Animated.View>
            
            <Text style={styles.welcomeText}>Junte-se a nós!</Text>
            <Text style={styles.subtitleText}>Crie sua conta e comece sua jornada para uma vida mais saudável</Text>
            
            <View style={styles.connectionStatus}>
              <View style={[
                styles.connectionDot, 
                { backgroundColor: conectado ? '#00C9FF' : '#FF6B6B' }
              ]} />
              <Text style={[
                styles.connectionText,
                { color: conectado ? '#00C9FF' : '#FF6B6B' }
              ]}>
                {conectado ? 'Conectado ao servidor' : 'Servidor não acessível'}
              </Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: formAnim }]
              }
            ]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome completo</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    nomeFocused && styles.inputFocused,
                    nome.trim() && !validarNome(nome) && styles.inputError
                  ]}
                  placeholder="Seu nome completo"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setNomeFocused(true)}
                  onBlur={() => setNomeFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!carregando}
                />
                <MaterialIcons 
                  name="person" 
                  size={20} 
                  color={nomeFocused ? "#00C9FF" : "rgba(255, 255, 255, 0.6)"} 
                  style={styles.inputIcon}
                />
              </View>
              {nome.trim() && !validarNome(nome) && (
                <Text style={styles.errorText}>Nome deve ter entre 2 e 100 caracteres</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    emailFocused && styles.inputFocused,
                    email.trim() && !validarEmail(email) && styles.inputError
                  ]}
                  placeholder="seu@email.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!carregando}
                />
                <MaterialIcons 
                  name="email" 
                  size={20} 
                  color={emailFocused ? "#00C9FF" : "rgba(255, 255, 255, 0.6)"} 
                  style={styles.inputIcon}
                />
              </View>
              {email.trim() && !validarEmail(email) && (
                <Text style={styles.errorText}>Email deve ter formato válido</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    senhaFocused && styles.inputFocused,
                    senha && !validarSenha(senha) && styles.inputError
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setSenhaFocused(true)}
                  onBlur={() => setSenhaFocused(false)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!carregando}
                />
                <MaterialIcons 
                  name="lock" 
                  size={20} 
                  color={senhaFocused ? "#00C9FF" : "rgba(255, 255, 255, 0.6)"} 
                  style={styles.inputIcon}
                />
              </View>
              {senha && !validarSenha(senha) && (
                <Text style={styles.errorText}>Mínimo 6 caracteres, com maiúscula, minúscula e número</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    confirmarSenhaFocused && styles.inputFocused,
                    confirmarSenha && senha !== confirmarSenha && styles.inputError
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  onFocus={() => setConfirmarSenhaFocused(true)}
                  onBlur={() => setConfirmarSenhaFocused(false)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!carregando}
                />
                <MaterialIcons 
                  name="lock-outline" 
                  size={20} 
                  color={confirmarSenhaFocused ? "#00C9FF" : "rgba(255, 255, 255, 0.6)"} 
                  style={styles.inputIcon}
                />
              </View>
              {confirmarSenha && senha !== confirmarSenha && (
                <Text style={styles.errorText}>As senhas não coincidem</Text>
              )}
            </View>

            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [{ scale: buttonAnim }]
              }}
            >
              <TouchableOpacity 
                onPress={lidarComRegistro} 
                style={[
                  styles.registerButton,
                  carregando && styles.buttonDisabled
                ]}
                disabled={carregando || !conectado}
                activeOpacity={0.9}
              >
                <View style={styles.buttonGradient}>
                  {carregando ? (
                    <View style={styles.buttonWithLoading}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.registerButtonText}>Criando conta...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.registerButtonText}>Criar Conta</Text>
                      <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.navigationContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.navLink}
              disabled={carregando}
            >
              <Text style={styles.navLinkText}>Já tem conta? Fazer login</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  gradientCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 201, 255, 0.1)',
  },

  gradientCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },

  gradientCircle3: {
    position: 'absolute',
    top: height * 0.4,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 209, 61, 0.06)',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: spacing.xl,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },

  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 201, 255, 0.2)',
    zIndex: -1,
  },
  
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 201, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(0, 201, 255, 0.3)',
    ...shadows.lg,
  },
  
  logoText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  
  welcomeText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  subtitleText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borders.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  connectionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    color: '#FFFFFF',
    marginLeft: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  inputWrapper: {
    position: 'relative',
  },
  
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.xl + 20,
    borderWidth: borders.width.thin,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    ...shadows.base,
  },

  inputIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    marginTop: -10,
  },
  
  inputFocused: {
    borderColor: '#00C9FF',
    borderWidth: borders.width.base,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    ...shadows.lg,
  },
  
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: borders.width.base,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  
  errorText: {
    fontSize: typography.fontSize.sm,
    color: '#FF6B6B',
    marginLeft: spacing.sm,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  registerButton: {
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
    ...shadows.xl,
    elevation: 15,
  },

  buttonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#00C9FF',
  },
  
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  navigationContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  navLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  navLinkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#00C9FF',
    textDecorationLine: 'none',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
