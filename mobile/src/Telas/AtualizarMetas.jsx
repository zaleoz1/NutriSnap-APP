import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { atualizarMetas } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

export default function AtualizarMetas({ navigation }) {
  const { token } = usarAutenticacao();
  const [pesoMeta, setPesoMeta] = useState('');
  const [dias, setDias] = useState('');
  const [caloriasDiarias, setCaloriasDiarias] = useState('');
  const [metasNutricionais, setMetasNutricionais] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleAtualizar = async () => {
    setCarregando(true);
    try {
      const dados = {
        peso_meta: pesoMeta,
        dias,
        calorias_diarias: caloriasDiarias,
        metas_nutricionais: metasNutricionais ? { descricao: metasNutricionais } : null,
      };
      const resposta = await atualizarMetas(token, dados);
      Alert.alert('Sucesso', resposta.mensagem || 'Metas atualizadas!');
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Erro', erro.message || 'Não foi possível atualizar as metas.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <Text style={styles.label}>Salvando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.cabecalho}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBotao}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Atualizar Metas</Text>
      </View>
      <View style={styles.formulario}>
        <Text style={styles.label}>Peso Meta (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 70"
          placeholderTextColor={colors.neutral[400]}
          keyboardType="numeric"
          value={pesoMeta}
          onChangeText={setPesoMeta}
        />
        <Text style={styles.label}>Dias para meta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 30"
          placeholderTextColor={colors.neutral[400]}
          keyboardType="numeric"
          value={dias}
          onChangeText={setDias}
        />
        <Text style={styles.label}>Calorias diárias</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2000"
          placeholderTextColor={colors.neutral[400]}
          keyboardType="numeric"
          value={caloriasDiarias}
          onChangeText={setCaloriasDiarias}
        />
        <Text style={styles.label}>Metas nutricionais (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Mais proteínas"
          placeholderTextColor={colors.neutral[400]}
          value={metasNutricionais}
          onChangeText={setMetasNutricionais}
        />
        <TouchableOpacity style={styles.botao} onPress={handleAtualizar}>
          <Text style={styles.textoBotao}>Salvar Metas</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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