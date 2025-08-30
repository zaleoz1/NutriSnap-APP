import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  StatusBar, 
  ScrollView, 
  Dimensions,
  RefreshControl,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaIMC({ navigation }) {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [calculando, setCalculando] = useState(false);
  const [pesoFocado, setPesoFocado] = useState(false);
  const [alturaFocada, setAlturaFocada] = useState(false);
  const [erroPeso, setErroPeso] = useState('');
  const [erroAltura, setErroAltura] = useState('');
  const [mostrarClassificacao, setMostrarClassificacao] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Inicializar animação
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simular refresh - pode ser usado para recarregar dados se necessário
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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
    setMostrarClassificacao(false);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Header moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Calculadora de IMC</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Opções do IMC',
                'Escolha uma opção:',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Limpar Dados', 
                    onPress: () => limparDados(),
                    style: 'default'
                  }
                ]
              );
            }}
          >
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent.blue]}
            tintColor={colors.accent.blue}
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Formulário */}
        <View style={styles.treinosSection}>
          <Text style={styles.sectionTitle}>Calculadora de IMC</Text>
          <View style={styles.secaoFormulario}>
          <View style={styles.grupoEntrada}>
            <Text style={styles.rotuloEntrada}>Peso (kg)</Text>
            <Text style={styles.dicaEntrada}>Use ponto ou vírgula como separador decimal (ex: 70.5)</Text>
            <TextInput
              style={[
                styles.entrada,
                pesoFocado ? styles.entradaFocada : null
              ]}
              placeholder="Ex: 70.5"
              placeholderTextColor={colors.neutral[500]}
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
            {erroPeso && erroPeso.length > 0 ? <Text style={styles.textoErro}>{erroPeso}</Text> : null}
          </View>

          <View style={styles.grupoEntrada}>
            <Text style={styles.rotuloEntrada}>Altura (m)</Text>
            <Text style={styles.dicaEntrada}>Use ponto ou vírgula como separador decimal (ex: 1.75)</Text>
            <TextInput
              style={[
                styles.entrada,
                alturaFocada ? styles.entradaFocada : null
              ]}
              placeholder="Ex: 1.75"
              placeholderTextColor={colors.neutral[500]}
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
            {erroAltura && erroAltura.length > 0 ? <Text style={styles.textoErro}>{erroAltura}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={calcularIMC}
            style={[
              styles.botaoCalcular,
              (calculando || !!erroPeso || !!erroAltura) ? styles.botaoDesabilitado : null
            ]}
            disabled={calculando || !!erroPeso || !!erroAltura}
            activeOpacity={0.8}
          >
            {calculando ? (
              <View style={styles.botaoComCarregamento}>
                <ActivityIndicator color={colors.neutral[50]} size="small" />
                <Text style={styles.textoBotao}>Calculando...</Text>
              </View>
            ) : (
              <Text style={styles.textoBotao}>Calcular IMC</Text>
            )}
          </TouchableOpacity>
          </View>
        </View>

        {/* Resultado */}
        {imc && imc !== null && imc !== '' && imc !== undefined ? (
          <View style={styles.treinosSection}>
            <Text style={styles.sectionTitle}>Resultado do IMC</Text>
            <View style={styles.secaoResultado}>
            <View style={styles.cabecalhoResultado}>
              <Text style={styles.tituloResultado}>Seu IMC</Text>
              <Text style={styles.valorResultado}>{imc}</Text>
            </View>
            
            <View style={styles.containerCategoria}>
              <Text style={[
                styles.textoCategoria,
                { color: obterCorCategoria(categoria) }
              ]}>
                {categoria || 'Não definido'}
              </Text>
              <Text style={styles.subtextoCategoria}>
                IMC: {imc} kg/m²
              </Text>
            </View>

            {/* Legenda */}
            <View style={styles.containerLegenda}>
              <TouchableOpacity
                onPress={() => setMostrarClassificacao(!mostrarClassificacao)}
                style={styles.botaoToggleClassificacao}
                activeOpacity={0.8}
              >
                <Text style={styles.textoBotaoToggle}>
                  {mostrarClassificacao ? 'Ocultar' : 'Ver'} Classificação IMC
                </Text>
                <MaterialIcons 
                  name={mostrarClassificacao ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color={colors.primary[400]} 
                />
              </TouchableOpacity>
              
              {mostrarClassificacao && (
                <>
                  <Text style={styles.tituloLegenda}>Classificação IMC</Text>
                  
                  <View style={styles.itensLegenda}>
                    <View style={styles.itemLegenda}>
                      <View style={[styles.pontoLegenda, { backgroundColor: colors.accent.blue }]} />
                      <Text style={styles.textoLegenda}>Abaixo do peso: {'<'} 18.5</Text>
                    </View>
                    
                    <View style={styles.itemLegenda}>
                      <View style={[styles.pontoLegenda, { backgroundColor: colors.success }]} />
                      <Text style={styles.textoLegenda}>Peso normal: 18.5 - 24.9</Text>
                    </View>
                    
                    <View style={styles.itemLegenda}>
                      <View style={[styles.pontoLegenda, { backgroundColor: colors.accent.yellow }]} />
                      <Text style={styles.textoLegenda}>Sobrepeso: 25.0 - 29.9</Text>
                    </View>
                    
                    <View style={styles.itemLegenda}>
                      <View style={[styles.pontoLegenda, { backgroundColor: colors.accent.orange }]} />
                      <Text style={styles.textoLegenda}>Obesidade I: 30.0 - 34.9</Text>
                    </View>
                    
                    <View style={styles.itemLegenda}>
                      <View style={[styles.pontoLegenda, { backgroundColor: colors.accent.red }]} />
                      <Text style={styles.textoLegenda}>Obesidade II: 35.0 - 39.9</Text>
                    </View>
                    
                    <View style={styles.itemLegenda}>
                      <View style={[styles.pontoLegenda, { backgroundColor: colors.error }]} />
                      <Text style={styles.textoLegenda}>Obesidade III: ≥ 40.0</Text>
                    </View>
                  </View>
                </>
              )}
            </View>



            {/* Botão limpar */}
            <TouchableOpacity
              onPress={limparDados}
              style={[styles.botaoLimpar, calculando ? styles.botaoDesabilitado : null]}
              disabled={calculando}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoLimpar}>Limpar Dados</Text>
            </TouchableOpacity>
            </View>
          </View>
        ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  header: {
    backgroundColor: colors.neutral[800],
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borders.radius['2xl'],
    borderBottomRightRadius: borders.radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.xl,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  
  // Seção do Formulário
  treinosSection: {
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  secaoFormulario: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  grupoEntrada: {
    marginBottom: spacing.lg,
  },
  
  rotuloEntrada: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  
  dicaEntrada: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  
  entrada: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[600],
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    ...shadows.sm,
  },
  
  entradaFocada: {
    borderColor: colors.primary[400],
    borderWidth: borders.width.base,
    ...shadows.base,
  },
  
  textoErro: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    marginTop: spacing.xs,
    fontStyle: 'italic',
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
    backgroundColor: colors.neutral[600],
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
  
  // Seção de Resultado
  treinoCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },
  
  secaoResultado: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  cabecalhoResultado: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  tituloResultado: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginBottom: spacing.sm,
  },
  
  valorResultado: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.primary[400],
    lineHeight: typography.lineHeight.tight,
    letterSpacing: -1,
  },
  
  containerCategoria: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[700],
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
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  
  containerLegenda: {
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[700],
    paddingTop: spacing.lg,
  },
  
  tituloLegenda: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[100],
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
    color: colors.neutral[300],
    flex: 1,
  },
  
  botaoToggleClassificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.md,
    ...shadows.sm,
  },
  
  textoBotaoToggle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[100],
  },
  

  
  botaoLimpar: {
    backgroundColor: colors.neutral[700],
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
    color: colors.neutral[100],
  },
});