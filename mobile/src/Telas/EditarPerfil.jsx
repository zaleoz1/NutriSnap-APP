import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

export default function EditarPerfil({ navigation }) {
  const { usuario, token, atualizarUsuario } = usarAutenticacao();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [pesoMeta, setPesoMeta] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [sexo, setSexo] = useState('');

  // Efeito para carregar os dados atuais do usuário
  useEffect(() => {
    async function carregarDadosPerfil() {
      try {
        const dadosPerfil = await buscarApi(`/api/usuarios/perfil`, { token });
        if (dadosPerfil) {
          setNome(dadosPerfil.nome || '');
          setEmail(dadosPerfil.email || '');
          setIdade(dadosPerfil.idade?.toString() || '');
          setPeso(dadosPerfil.peso_atual?.toString() || '');
          setPesoMeta(dadosPerfil.peso_meta?.toString() || '');
          setAltura(dadosPerfil.altura?.toString() || '');
          setObjetivo(dadosPerfil.objetivo || '');
          setNivelAtividade(dadosPerfil.nivel_atividade || '');
          setSexo(dadosPerfil.sexo || '');
        }
      } catch (erro) {
        console.error('Erro ao carregar dados do perfil:', erro);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      } finally {
        setCarregando(false);
      }
    }
    carregarDadosPerfil();
  }, [token]);

  // Função para enviar os dados atualizados
  const lidarComEnvio = async () => {
    setSalvando(true);
    try {
      const dadosAtualizados = {
        nome,
        email,
        idade: idade ? parseInt(idade) : null,
        peso_atual: peso ? parseFloat(peso) : null,
        peso_meta: pesoMeta ? parseFloat(pesoMeta) : null,
        altura: altura ? parseFloat(altura) : null,
        objetivo,
        nivel_atividade: nivelAtividade,
        sexo
      };
      
      const resposta = await buscarApi('/api/usuarios/perfil', {
        method: 'PUT',
        token,
        body: dadosAtualizados,
      });

      if (resposta.sucesso) {
        Alert.alert('Sucesso', resposta.mensagem);
        // Atualiza os dados no AuthContext para refletir a mudança imediatamente
        if (atualizarUsuario) {
          atualizarUsuario(resposta.usuario);
        }
        navigation.navigate('Principal');
      } else {
        Alert.alert('Menssagem', resposta.mensagem || 'Não foi possível atualizar o perfil.');
      }
    } catch (erro) {
      console.error('Erro ao atualizar perfil:', erro);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
          <MaterialIcons name="arrow-back" size={24} color={colors.neutral[50]} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar Perfil</Text>
      </View>
      
      <View style={styles.formulario}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome completo" placeholderTextColor={colors.neutral[500]} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Seu email" placeholderTextColor={colors.neutral[500]} />

        <Text style={styles.label}>Idade</Text>
        <TextInput style={styles.input} value={idade} onChangeText={setIdade} keyboardType="numeric" placeholder="Sua idade" placeholderTextColor={colors.neutral[500]} />
        
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput style={styles.input} value={peso} onChangeText={setPeso} keyboardType="numeric" placeholder="Seu peso atual" placeholderTextColor={colors.neutral[500]} />

        <Text style={styles.label}>Peso Meta (kg)</Text>
        <TextInput style={styles.input} value={pesoMeta} onChangeText={setPesoMeta} keyboardType="numeric" placeholder="Seu peso meta" placeholderTextColor={colors.neutral[500]} />

        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput style={styles.input} value={altura} onChangeText={setAltura} keyboardType="numeric" placeholder="Sua altura" placeholderTextColor={colors.neutral[500]} />

        <Text style={styles.label}>Objetivo</Text>
        <TextInput style={styles.input} value={objetivo} onChangeText={setObjetivo} placeholder="Ex: Ganho muscular, emagrecimento..." placeholderTextColor={colors.neutral[500]} />

        <Text style={styles.label}>Nível de Atividade</Text>
        <TextInput style={styles.input} value={nivelAtividade} onChangeText={setNivelAtividade} placeholder="Ex: Sedentário, moderado, intenso..." placeholderTextColor={colors.neutral[500]} />

        <TouchableOpacity style={styles.botao} onPress={lidarComEnvio} disabled={salvando}>
          {salvando ? (
            <ActivityIndicator size="small" color={colors.neutral[50]} />
          ) : (
            <Text style={styles.textoBotao}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: 50,
  },
  botaoVoltar: {
    marginRight: spacing.md,
  },
  titulo: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[100],
  },
  formulario: {
    padding: spacing.xl,
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
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[900],
  },
});