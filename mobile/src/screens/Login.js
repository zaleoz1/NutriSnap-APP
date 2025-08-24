import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { buscarApi, obterDetalhesErro } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaLogin({ navigation }) {
  const { entrar, conectado } = usarAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
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

    // Animação do botão após um delay
    setTimeout(() => {
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Background com gradiente e elementos decorativos */}
      <View style={styles.backgroundContainer}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
        <View style={styles.gradientCircle3} />
        <View style={styles.floatingElements}>
          <View style={styles.floatingDot} />
          <View style={styles.floatingLine} />
          <View style={styles.floatingDot} />
        </View>
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
          {/* Header com logo animado */}
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
            
            <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitleText}>Entre na sua conta para continuar sua jornada</Text>
            
            {/* Indicador de conectividade elegante */}
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

          {/* Formulário com animação */}
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
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    emailFocused && styles.inputFocused,
                    email.trim() && !validarEmail(email.trim()) && styles.inputError
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
              {email.trim() && !validarEmail(email.trim()) && (
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
                    senha.trim() && !validarSenha(senha) && styles.inputError
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
              {senha.trim() && !validarSenha(senha) && (
                <Text style={styles.errorText}>Mínimo de 6 caracteres</Text>
              )}
            </View>

            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [{ scale: buttonAnim }]
              }}
            >
              <TouchableOpacity 
                onPress={lidarComLogin} 
                style={[
                  styles.loginButton,
                  carregando && styles.buttonDisabled
                ]}
                disabled={carregando || !conectado}
                activeOpacity={0.9}
              >
                <View style={styles.buttonGradient}>
                  {carregando ? (
                    <View style={styles.buttonWithLoading}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.loginButtonText}>Entrando...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Entrar</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Links de navegação */}
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

  floatingElements: {
    position: 'absolute',
    top: height * 0.6,
    left: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    paddingRight: spacing.xl + 20, // Espaço para o ícone
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
  
  loginButton: {
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
  
  loginButtonText: {
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