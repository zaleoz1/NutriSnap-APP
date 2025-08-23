import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaIMC() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [calculando, setCalculando] = useState(false);
  const [pesoFocused, setPesoFocused] = useState(false);
  const [alturaFocused, setAlturaFocused] = useState(false);

  function validarFormulario() {
    if (!peso.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu peso');
      return false;
    }
    if (!altura.trim()) {
      Alert.alert('Erro', 'Por favor, insira sua altura');
      return false;
    }
    
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    
    if (isNaN(p) || p <= 0 || p > 500) {
      Alert.alert('Erro', 'Peso deve ser entre 1 e 500 kg');
      return false;
    }
    if (isNaN(a) || a <= 0 || a > 3) {
      Alert.alert('Erro', 'Altura deve ser entre 0.1 e 3 metros');
      return false;
    }
    
    return true;
  }

  function calcularIMC() {
    if (!validarFormulario()) return;
    
    setCalculando(true);
    setTimeout(() => {
      const p = parseFloat(peso);
      const a = parseFloat(altura);
      const valor = p / (a * a);
      
      setImc(valor.toFixed(2));
      
      if (valor < 18.5) setCategoria('Abaixo do peso');
      else if (valor < 25) setCategoria('Peso normal');
      else if (valor < 30) setCategoria('Sobrepeso');
      else if (valor < 35) setCategoria('Obesidade I');
      else if (valor < 40) setCategoria('Obesidade II');
      else setCategoria('Obesidade III');
      
      setCalculando(false);
    }, 500);
  }

  function limparDados() {
    setPeso('');
    setAltura('');
    setImc(null);
    setCategoria('');
  }

  function obterCorCategoria(cat) {
    switch (cat) {
      case 'Abaixo do peso': return colors.accent.blue;
      case 'Peso normal': return colors.success;
      case 'Sobrepeso': return colors.accent.yellow;
      case 'Obesidade I': return colors.accent.orange;
      case 'Obesidade II': return colors.accent.red;
      case 'Obesidade III': return colors.error;
      default: return colors.neutral[500];
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral[50]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Calculadora de IMC</Text>
            <Text style={styles.subtitle}>Índice de Massa Corporal</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="analytics" size={40} color={colors.primary[600]} />
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput
              style={[
                styles.input,
                pesoFocused && styles.inputFocused
              ]}
              placeholder="Ex: 70.5"
              placeholderTextColor={colors.neutral[400]}
              value={peso}
              onChangeText={setPeso}
              onFocus={() => setPesoFocused(true)}
              onBlur={() => setPesoFocused(false)}
              keyboardType="numeric"
              editable={!calculando}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Altura (m)</Text>
            <TextInput
              style={[
                styles.input,
                alturaFocused && styles.inputFocused
              ]}
              placeholder="Ex: 1.75"
              placeholderTextColor={colors.neutral[400]}
              value={altura}
              onChangeText={setAltura}
              onFocus={() => setAlturaFocused(true)}
              onBlur={() => setAlturaFocused(false)}
              keyboardType="numeric"
              editable={!calculando}
            />
          </View>

          <TouchableOpacity
            onPress={calcularIMC}
            style={[
              styles.calculateButton,
              calculando && styles.buttonDisabled
            ]}
            disabled={calculando}
            activeOpacity={0.8}
          >
            {calculando ? (
              <View style={styles.buttonWithLoading}>
                <ActivityIndicator color={colors.neutral[50]} size="small" />
                <Text style={styles.buttonText}>Calculando...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Calcular IMC</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {imc && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Seu IMC</Text>
              <Text style={styles.resultValue}>{imc}</Text>
            </View>
            
            <View style={styles.categoryContainer}>
              <Text style={[
                styles.categoryText,
                { color: obterCorCategoria(categoria) }
              ]}>
                {categoria}
              </Text>
            </View>

            {/* Legenda */}
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Classificação IMC</Text>
              
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent.blue }]} />
                  <Text style={styles.legendText}>Abaixo do peso: {'<'} 18.5</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Peso normal: 18.5 - 24.9</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent.yellow }]} />
                  <Text style={styles.legendText}>Sobrepeso: 25.0 - 29.9</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent.orange }]} />
                  <Text style={styles.legendText}>Obesidade I: 30.0 - 34.9</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent.red }]} />
                  <Text style={styles.legendText}>Obesidade II: 35.0 - 39.9</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                  <Text style={styles.legendText}>Obesidade III: ≥ 40.0</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botão limpar */}
        <TouchableOpacity
          onPress={limparDados}
          style={[styles.clearButton, calculando && styles.buttonDisabled]}
          disabled={calculando}
          activeOpacity={0.8}
        >
          <Text style={styles.clearButtonText}>Limpar Dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  
  icon: {
    fontSize: 40,
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
  
  calculateButton: {
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
  
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  resultContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  resultTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  
  resultValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.tight,
  },
  
  categoryContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borders.radius.lg,
  },
  
  categoryText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  
  legendContainer: {
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.lg,
  },
  
  legendTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  legendItems: {
    gap: spacing.sm,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  legendText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
    flex: 1,
  },
  
  clearButton: {
    backgroundColor: colors.neutral[200],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  
  clearButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
});