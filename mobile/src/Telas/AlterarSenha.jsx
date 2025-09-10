import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert,
  ActivityIndicator // Importe o ActivityIndicator
} from 'react-native';

// Importe o contexto de autenticação e a nova função de API
import { usarAutenticacao } from '../services/AuthContext';
import { alterarSenhaAPI } from '../services/api';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

export default function AlterarSenha({ navigation }) {
  const { token } = usarAutenticacao(); // Obtenha o token do contexto
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const lidarComEnvio = async () => {
    // 1. Validações básicas
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senhaAtual === novaSenha) {
      Alert.alert('Erro', 'A nova senha não pode ser igual à senha atual.');
      return;
    }

    setCarregando(true);

    try {
      // 2. Chame a função da API para alterar a senha
      const resposta = await alterarSenhaAPI(token, senhaAtual, novaSenha); 

      if (resposta.sucesso) {
        Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
        navigation.goBack(); // Volta para a tela anterior
      } else {
        Alert.alert('Erro', resposta.mensagem || 'Não foi possível alterar a senha. Verifique a senha atual.');
      }
    } catch (erro) {
      console.error('Erro ao alterar senha:', erro);
      Alert.alert('Erro', 'Ocorreu um erro de rede. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.titulo}>Alterar Senha</Text>
        <Text style={styles.subtitulo}>Mantenha sua conta segura.</Text>

        <View style={styles.formulario}>
          <Text style={styles.label}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="Digite sua senha atual"
            placeholderTextColor={colors.neutral[500]}
          />

          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.neutral[500]}
          />

          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Confirme sua nova senha"
            placeholderTextColor={colors.neutral[500]}
          />

          <TouchableOpacity 
            style={styles.botao} 
            onPress={lidarComEnvio}
            disabled={carregando} // Desabilita o botão durante o carregamento
          >
            {carregando ? (
              <ActivityIndicator size="small" color={colors.neutral[50]} />
            ) : (
              <Text style={styles.textoBotao}>Alterar Senha</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  titulo: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[100],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  formulario: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[300],
    marginBottom: spacing.sm,
  },
  input: {
    height: 50,
    backgroundColor: colors.neutral[800],
    color: colors.neutral[50],
    borderRadius: borders.radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  botao: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.lg,
    borderRadius: borders.radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  textoBotao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
});