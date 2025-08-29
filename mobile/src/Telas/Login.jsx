import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fazerLogin } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, spacing } from '../styles/globalStyles';

// Tela de login para usuários existentes
export default function TelaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});
  const { fazerLogin: loginContext } = usarAutenticacao();

  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email deve ter formato válido';
    return null;
  };

  const validarSenha = (senha) => {
    if (senha.length < 1) return 'Senha é obrigatória';
    return null;
  };

  const validarFormulario = () => {
    const novosErros = {};

    const erroEmail = validarEmail(email);
    if (erroEmail) novosErros.email = erroEmail;

    const erroSenha = validarSenha(senha);
    if (erroSenha) novosErros.senha = erroSenha;

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  async function lidarComLogin() {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const dados = await fazerLogin({ email, senha });
      
      await loginContext(dados.token, dados.usuario);
      
      Alert.alert(
        'Sucesso!',
        'Login realizado com sucesso!',
        [{ text: 'OK' }]
      );
    } catch (erro) {
      let mensagem = 'Erro ao fazer login. Tente novamente.';
      
      if (erro.status === 401) {
        mensagem = 'Email ou senha incorretos';
      } else if (erro.status === 400 && erro.response) {
        try {
          const dados = await erro.response.json();
          if (dados.detalhes && dados.detalhes.length > 0) {
            mensagem = dados.detalhes.join('\n');
          }
        } catch {
          mensagem = erro.message;
        }
      }
      
      Alert.alert('Erro', mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.primary[600], colors.primary[800]]}
        style={styles.header}
      >
        <Text style={styles.titulo}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitulo}>Faça login para continuar sua jornada</Text>
      </LinearGradient>

      <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
        <View style={styles.campo}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, erros.email && styles.inputErro]}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu email"
            placeholderTextColor={colors.neutral[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {erros.email && <Text style={styles.erro}>{erros.email}</Text>}
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erros.senha && styles.inputErro]}
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            placeholderTextColor={colors.neutral[400]}
            secureTextEntry
            autoCapitalize="none"
          />
          {erros.senha && <Text style={styles.erro}>{erros.senha}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={lidarComLogin}
          disabled={carregando}
        >
          <Text style={styles.botaoTexto}>
            {carregando ? 'Fazendo login...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.linkTexto}>
            Não tem uma conta? <Text style={styles.linkDestaque}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitulo: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  formulario: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  campo: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.neutral[800],
  },
  inputErro: {
    borderColor: colors.error[500],
  },
  erro: {
    color: colors.error[500],
    fontSize: 14,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  botao: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  botaoDesabilitado: {
    backgroundColor: colors.neutral[400],
  },
  botaoTexto: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  linkTexto: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  linkDestaque: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});