import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registrarUsuario } from '../services/api';
import { colors, spacing, typography } from '../styles/globalStyles';

// Tela de cadastro de novos usuários
export default function TelaRegistro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});

  const validarNome = (nome) => {
    if (nome.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) return 'Nome deve conter apenas letras e espaços';
    return null;
  };

  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email deve ter formato válido';
    return null;
  };

  const validarSenha = (senha) => {
    if (senha.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(senha)) {
      return 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
    }
    return null;
  };

  const validarFormulario = () => {
    const novosErros = {};

    const erroNome = validarNome(nome);
    if (erroNome) novosErros.nome = erroNome;

    const erroEmail = validarEmail(email);
    if (erroEmail) novosErros.email = erroEmail;

    const erroSenha = validarSenha(senha);
    if (erroSenha) novosErros.senha = erroSenha;

    if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'Senhas não coincidem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  async function lidarComRegistro() {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      await registrarUsuario({ nome, email, senha });
      
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso! Faça login para continuar.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (erro) {
      let mensagem = 'Erro ao criar conta. Tente novamente.';
      
      if (erro.status === 409) {
        mensagem = 'Este email já está cadastrado. Use outro email ou faça login.';
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
        <Text style={styles.titulo}>Criar Conta</Text>
        <Text style={styles.subtitulo}>Comece sua jornada de saúde hoje</Text>
      </LinearGradient>

      <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
        <View style={styles.campo}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={[styles.input, erros.nome && styles.inputErro]}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome completo"
            placeholderTextColor={colors.neutral[400]}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {erros.nome && <Text style={styles.erro}>{erros.nome}</Text>}
        </View>

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

        <View style={styles.campo}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={[styles.input, erros.confirmarSenha && styles.inputErro]}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Confirme sua senha"
            placeholderTextColor={colors.neutral[400]}
            secureTextEntry
            autoCapitalize="none"
          />
          {erros.confirmarSenha && <Text style={styles.erro}>{erros.confirmarSenha}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={lidarComRegistro}
          disabled={carregando}
        >
          <Text style={styles.botaoTexto}>
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkTexto}>
            Já tem uma conta? <Text style={styles.linkDestaque}>Faça login</Text>
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
