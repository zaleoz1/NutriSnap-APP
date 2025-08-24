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
  const [pesoFocado, setPesoFocado] = useState(false);
  const [alturaFocada, setAlturaFocada] = useState(false);
  const [erroPeso, setErroPeso] = useState('');
  const [erroAltura, setErroAltura] = useState('');

  // Função para converter vírgula em ponto (corrige bug do teclado iPhone)
  const converterVirgulaParaPonto = (valor) => {
    return valor.replace(',', '.');
  };

  // Função para validar peso em tempo real
  const validarPeso = (valor) => {
    if (!valor || !valor.trim()) {
      setErroPeso('');
      return;
    }
    const p = parseFloat(valor);
    if (isNaN(p) || p <= 0 || p > 500) {
      setErroPeso('Peso deve ser entre 1 e 500 kg');
    } else {
      setErroPeso('');
    }
  };

  // Função para validar altura em tempo real
  const validarAltura = (valor) => {
    if (!valor || !valor.trim()) {
      setErroAltura('');
      return;
    }
    const a = parseFloat(valor);
    if (isNaN(a) || a <= 0.5 || a > 2.5) {
      setErroAltura('Altura deve ser entre 0.5 e 2.5 metros');
    } else {
      setErroAltura('');
    }
  };

  function validarFormulario() {
    // Limpar erros anteriores
    setErroPeso('');
    setErroAltura('');
    
    let valido = true;
    
    if (!peso || !peso.trim()) {
      setErroPeso('Por favor, insira seu peso');
      valido = false;
    } else {
      const p = parseFloat(peso);
      if (isNaN(p) || p <= 0 || p > 500) {
        setErroPeso('Peso deve ser entre 1 e 500 kg');
        valido = false;
      }
    }
    
    if (!altura || !altura.trim()) {
      setErroAltura('Por favor, insira sua altura');
      valido = false;
    } else {
      const a = parseFloat(altura);
      if (isNaN(a) || a <= 0.5 || a > 2.5) {
        setErroAltura('Altura deve ser entre 0.5 e 2.5 metros');
        valido = false;
      }
    }
    
    return valido;
  }

  function calcularIMC() {
    if (!validarFormulario()) return;
    
    setCalculando(true);
    
    // Cálculo imediato sem timeout desnecessário
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    const valor = p / (a * a);
    
    // Validação adicional do resultado
    if (isNaN(valor) || valor < 10 || valor > 100) {
      Alert.alert('Erro', 'Valores inseridos resultam em IMC inválido. Verifique peso e altura.');
      setCalculando(false);
      return;
    }
    
    setImc(valor.toFixed(1));
    
    // Classificação do IMC
    if (valor < 18.5) setCategoria('Abaixo do peso');
    else if (valor < 25) setCategoria('Peso normal');
    else if (valor < 30) setCategoria('Sobrepeso');
    else if (valor < 35) setCategoria('Obesidade I');
    else if (valor < 40) setCategoria('Obesidade II');
    else setCategoria('Obesidade III');
    
    setCalculando(false);
    
    // Mostrar mensagem de sucesso
    Alert.alert(
      'IMC Calculado!', 
      `Seu IMC é ${valor.toFixed(1)} - ${valor < 18.5 ? 'Abaixo do peso' : 
        valor < 25 ? 'Peso normal' : 
        valor < 30 ? 'Sobrepeso' : 
        valor < 35 ? 'Obesidade I' : 
        valor < 40 ? 'Obesidade II' : 'Obesidade III'}`
    );
  }

  function limparDados() {
    setPeso('');
    setAltura('');
    setImc(null);
    setCategoria('');
    setPesoFocado(false);
    setAlturaFocada(false);
    setErroPeso('');
    setErroAltura('');
    setCalculando(false);
  }

  function obterCorCategoria(categoria) {
    if (!categoria || typeof categoria !== 'string') {
      return colors.neutral[500];
    }
    
    switch (categoria) {
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
    <View style={estilos.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral[50]} />
      
      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
      >
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <View style={estilos.containerTitulo}>
            <Text style={estilos.titulo}>Calculadora de IMC</Text>
            <Text style={estilos.subtitulo}>Índice de Massa Corporal</Text>
          </View>
          <View style={estilos.containerIcone}>
            <MaterialIcons name="analytics" size={40} color={colors.primary[600]} />
          </View>
        </View>

        {/* Formulário */}
        <View style={estilos.containerFormulario}>
          <View style={estilos.grupoEntrada}>
            <Text style={estilos.rotuloEntrada}>Peso (kg)</Text>
            <Text style={estilos.dicaEntrada}>Use ponto ou vírgula como separador decimal (ex: 70.5)</Text>
            <TextInput
              style={[
                estilos.entrada,
                pesoFocado ? estilos.entradaFocada : null
              ]}
              placeholder="Ex: 70.5"
              placeholderTextColor={colors.neutral[400]}
              value={peso}
              onChangeText={(valor) => {
                const valorConvertido = converterVirgulaParaPonto(valor);
                setPeso(valorConvertido);
                validarPeso(valorConvertido);
              }}
              onFocus={() => setPesoFocado(true)}
              onBlur={() => setPesoFocado(false)}
              keyboardType="numeric"
              editable={!calculando}
            />
            {erroPeso && erroPeso.length > 0 ? <Text style={estilos.textoErro}>{erroPeso}</Text> : null}
          </View>

          <View style={estilos.grupoEntrada}>
            <Text style={estilos.rotuloEntrada}>Altura (m)</Text>
            <Text style={estilos.dicaEntrada}>Use ponto ou vírgula como separador decimal (ex: 1.75)</Text>
            <TextInput
              style={[
                estilos.entrada,
                alturaFocada ? estilos.entradaFocada : null
              ]}
              placeholder="Ex: 1.75"
              placeholderTextColor={colors.neutral[400]}
              value={altura}
              onChangeText={(valor) => {
                const valorConvertido = converterVirgulaParaPonto(valor);
                setAltura(valorConvertido);
                validarAltura(valorConvertido);
              }}
              onFocus={() => setAlturaFocada(true)}
              onBlur={() => setAlturaFocada(false)}
              keyboardType="numeric"
              editable={!calculando}
            />
            {erroAltura && erroAltura.length > 0 ? <Text style={estilos.textoErro}>{erroAltura}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={calcularIMC}
            style={[
              estilos.botaoCalcular,
              (calculando || !!erroPeso || !!erroAltura) ? estilos.botaoDesabilitado : null
            ]}
            disabled={calculando || !!erroPeso || !!erroAltura}
            activeOpacity={0.8}
          >
            {calculando ? (
              <View style={estilos.botaoComCarregamento}>
                <ActivityIndicator color={colors.neutral[50]} size="small" />
                <Text style={estilos.textoBotao}>Calculando...</Text>
              </View>
            ) : (
              <Text style={estilos.textoBotao}>Calcular IMC</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {imc && imc !== null && imc !== '' && imc !== undefined ? (
          <View style={estilos.containerResultado}>
            <View style={estilos.cabecalhoResultado}>
              <Text style={estilos.tituloResultado}>Seu IMC</Text>
              <Text style={estilos.valorResultado}>{imc}</Text>
            </View>
            
            <View style={estilos.containerCategoria}>
              <Text style={[
                estilos.textoCategoria,
                { color: obterCorCategoria(categoria) }
              ]}>
                {categoria || 'Não definido'}
              </Text>
              <Text style={estilos.subtextoCategoria}>
                IMC: {imc} kg/m²
              </Text>
            </View>

            {/* Interpretação do resultado */}
            <View style={estilos.containerInterpretacao}>
              <Text style={estilos.tituloInterpretacao}>O que isso significa?</Text>
              <Text style={estilos.textoInterpretacao}>
                {categoria === 'Abaixo do peso' ? 
                  'Seu IMC indica que você está abaixo do peso considerado saudável para sua altura. Considere consultar um nutricionista para orientações sobre ganho de peso saudável.' :
                categoria === 'Peso normal' ? 
                  'Parabéns! Seu IMC está na faixa considerada saudável. Continue mantendo hábitos alimentares equilibrados e atividade física regular.' :
                categoria === 'Sobrepeso' ? 
                  'Seu IMC indica sobrepeso. Considere ajustar sua alimentação e aumentar a atividade física para alcançar um peso mais saudável.' :
                categoria === 'Obesidade I' ? 
                  'Seu IMC indica obesidade grau I. É recomendável buscar orientação profissional para um plano de emagrecimento saudável.' :
                categoria === 'Obesidade II' ? 
                  'Seu IMC indica obesidade grau II. É importante buscar acompanhamento médico e nutricional para um tratamento adequado.' :
                categoria === 'Obesidade III' ? 
                  'Seu IMC indica obesidade grau III (mórbida). É essencial buscar acompanhamento médico especializado para um tratamento personalizado.' :
                  'IMC calculado com sucesso. Consulte um profissional de saúde para interpretação personalizada.'
                }
              </Text>
            </View>

            {/* Legenda */}
            <View style={estilos.containerLegenda}>
              <Text style={estilos.tituloLegenda}>Classificação IMC</Text>
              
              <View style={estilos.itensLegenda}>
                <View style={estilos.itemLegenda}>
                  <View style={[estilos.pontoLegenda, { backgroundColor: colors.accent.blue }]} />
                  <Text style={estilos.textoLegenda}>Abaixo do peso: {'<'} 18.5</Text>
                </View>
                
                <View style={estilos.itemLegenda}>
                  <View style={[estilos.pontoLegenda, { backgroundColor: colors.success }]} />
                  <Text style={estilos.textoLegenda}>Peso normal: 18.5 - 24.9</Text>
                </View>
                
                <View style={estilos.itemLegenda}>
                  <View style={[estilos.pontoLegenda, { backgroundColor: colors.accent.yellow }]} />
                  <Text style={estilos.textoLegenda}>Sobrepeso: 25.0 - 29.9</Text>
                </View>
                
                <View style={estilos.itemLegenda}>
                  <View style={[estilos.pontoLegenda, { backgroundColor: colors.accent.orange }]} />
                  <Text style={estilos.textoLegenda}>Obesidade I: 30.0 - 34.9</Text>
                </View>
                
                <View style={estilos.itemLegenda}>
                  <View style={[estilos.pontoLegenda, { backgroundColor: colors.accent.red }]} />
                  <Text style={estilos.textoLegenda}>Obesidade II: 35.0 - 39.9</Text>
                </View>
                
                <View style={estilos.itemLegenda}>
                  <View style={[estilos.pontoLegenda, { backgroundColor: colors.error }]} />
                  <Text style={estilos.textoLegenda}>Obesidade III: ≥ 40.0</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Botão limpar */}
        <TouchableOpacity
          onPress={limparDados}
          style={[estilos.botaoLimpar, calculando ? estilos.botaoDesabilitado : null]}
          disabled={calculando}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotaoLimpar}>Limpar Dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
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
  
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  
  containerTitulo: {
    flex: 1,
  },
  
  titulo: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  
  subtitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
  },
  
  containerIcone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  
  icone: {
    fontSize: 40,
  },
  
  containerFormulario: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  grupoEntrada: {
    gap: spacing.sm,
  },
  
  rotuloEntrada: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginLeft: spacing.sm,
  },
  
  dicaEntrada: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  
  textoErro: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  
  entrada: {
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
  
  entradaFocada: {
    borderColor: colors.primary[500],
    borderWidth: borders.width.base,
    ...shadows.base,
  },
  
  botaoCalcular: {
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
  
  botaoDesabilitado: {
    backgroundColor: colors.neutral[400],
    ...shadows.sm,
  },
  
  botaoComCarregamento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  textoBotao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  containerResultado: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  cabecalhoResultado: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  tituloResultado: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  
  valorResultado: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.tight,
  },
  
  containerCategoria: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borders.radius.lg,
  },
  
  textoCategoria: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  
  subtextoCategoria: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  
  containerInterpretacao: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
  },
  
  tituloInterpretacao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  textoInterpretacao: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
    lineHeight: typography.lineHeight.normal,
    textAlign: 'justify',
  },
  
  containerLegenda: {
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.lg,
  },
  
  tituloLegenda: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  itensLegenda: {
    gap: spacing.sm,
  },
  
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  pontoLegenda: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  textoLegenda: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
    flex: 1,
  },
  
  botaoLimpar: {
    backgroundColor: colors.neutral[200],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  
  textoBotaoLimpar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },


});