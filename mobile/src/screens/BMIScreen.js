import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

export default function TelaIMC() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [calculando, setCalculando] = useState(false);

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
    }, 500); // Simular processamento
  }

  function limparDados() {
    setPeso('');
    setAltura('');
    setImc(null);
    setCategoria('');
  }

  function obterCorCategoria(cat) {
    switch (cat) {
      case 'Abaixo do peso': return '#3b82f6';
      case 'Peso normal': return '#10b981';
      case 'Sobrepeso': return '#f59e0b';
      case 'Obesidade I': return '#f97316';
      case 'Obesidade II': return '#ef4444';
      case 'Obesidade III': return '#dc2626';
      default: return '#6b7280';
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Calculadora de IMC</Text>
      <Text style={estilos.subtitulo}>Índice de Massa Corporal</Text>
      
      <TextInput 
        placeholder="Peso (kg)" 
        keyboardType="numeric" 
        value={peso} 
        onChangeText={setPeso} 
        style={estilos.entrada}
        editable={!calculando}
      />
      
      <TextInput 
        placeholder="Altura (m) ex: 1.75" 
        keyboardType="numeric" 
        value={altura} 
        onChangeText={setAltura} 
        style={estilos.entrada}
        editable={!calculando}
      />
      
      <TouchableOpacity 
        onPress={calcularIMC} 
        style={[estilos.botao, estilos.botaoCalcular, calculando && estilos.botaoDesabilitado]}
        disabled={calculando}
      >
        {calculando ? (
          <View style={estilos.botaoComLoading}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={estilos.textoBotao}>Calculando...</Text>
          </View>
        ) : (
          <Text style={estilos.textoBotao}>Calcular IMC</Text>
        )}
      </TouchableOpacity>

      {imc && (
        <View style={estilos.resultado}>
          <Text style={estilos.textoResultado}>IMC: {imc}</Text>
          <Text style={[estilos.textoCategoria, { color: obterCorCategoria(categoria) }]}>
            Classificação: {categoria}
          </Text>
          
          <View style={estilos.legenda}>
            <Text style={estilos.textoLegenda}>Legenda:</Text>
            <Text style={[estilos.itemLegenda, { color: '#3b82f6' }]}>• Abaixo do peso: {'<'} 18.5</Text>
            <Text style={[estilos.itemLegenda, { color: '#10b981' }]}>• Peso normal: 18.5 - 24.9</Text>
            <Text style={[estilos.itemLegenda, { color: '#f59e0b' }]}>• Sobrepeso: 25.0 - 29.9</Text>
            <Text style={[estilos.itemLegenda, { color: '#f97316' }]}>• Obesidade I: 30.0 - 34.9</Text>
            <Text style={[estilos.itemLegenda, { color: '#ef4444' }]}>• Obesidade II: 35.0 - 39.9</Text>
            <Text style={[estilos.itemLegenda, { color: '#dc2626' }]}>• Obesidade III: ≥ 40.0</Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        onPress={limparDados} 
        style={[estilos.botao, estilos.botaoLimpar]}
        disabled={calculando}
      >
        <Text style={estilos.textoBotao}>Limpar</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { 
    flex:1, 
    padding:20, 
    backgroundColor:'#f9fafb' 
  },
  titulo: { 
    fontSize:24, 
    fontWeight:'800', 
    color:'#10b981', 
    textAlign:'center', 
    marginBottom:8 
  },
  subtitulo: {
    fontSize:16,
    color:'#6b7280',
    textAlign:'center',
    marginBottom:24
  },
  entrada: { 
    backgroundColor:'#fff', 
    padding:14, 
    borderRadius:12, 
    borderColor:'#e5e7eb', 
    borderWidth:1, 
    marginBottom:12 
  },
  botao: { 
    padding:14, 
    borderRadius:12,
    marginBottom: 12
  },
  botaoCalcular: {
    backgroundColor:'#10b981'
  },
  botaoLimpar: {
    backgroundColor:'#6b7280'
  },
  botaoDesabilitado: {
    backgroundColor:'#9ca3af'
  },
  botaoComLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  textoBotao: { 
    color:'#fff', 
    textAlign:'center', 
    fontWeight:'700' 
  },
  resultado: { 
    marginTop:16, 
    backgroundColor:'#fff', 
    padding:16, 
    borderRadius:12, 
    borderWidth:1, 
    borderColor:'#e5e7eb',
    marginBottom: 16
  },
  textoResultado: { 
    textAlign:'center', 
    fontSize:20, 
    fontWeight:'800',
    color: '#111827',
    marginBottom: 8
  },
  textoCategoria: { 
    textAlign:'center', 
    fontSize:18, 
    fontWeight:'700',
    marginBottom: 16
  },
  legenda: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16
  },
  textoLegenda: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center'
  },
  itemLegenda: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center'
  }
});