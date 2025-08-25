import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet, StatusBar, ScrollView, Dimensions, TextInput, Modal } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaRefeicoes() {
  const { token } = usarAutenticacao(); 
  const [imagem, setImagem] = useState(null);
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [proteinasTotal, setProteinasTotal] = useState(0);
  const [carboidratosTotal, setCarboidratosTotal] = useState(0);
  const [gordurasTotal, setGordurasTotal] = useState(0);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [alimentoManual, setAlimentoManual] = useState('');
  const [caloriasManual, setCaloriasManual] = useState('');
  const [proteinasManual, setProteinasManual] = useState('');
  const [carboidratosManual, setCarboidratosManual] = useState('');
  const [gordurasManual, setGordurasManual] = useState('');
  const [imagemBase64, setImagemBase64] = useState(null);
  const [analisando, setAnalisando] = useState(false);

  function recalcularTotal(itens) {
    const calorias = itens.reduce((soma, item) => soma + (item.calorias||0), 0);
    const proteinas = itens.reduce((soma, item) => soma + (item.proteinas||0), 0);
    const carboidratos = itens.reduce((soma, item) => soma + (item.carboidratos||0), 0);
    const gorduras = itens.reduce((soma, item) => soma + (item.gorduras||0), 0);
    
    setTotal(calorias);
    setProteinasTotal(proteinas);
    setCarboidratosTotal(carboidratos);
    setGordurasTotal(gorduras);
  }

  async function capturarComCamera() {
    const resultado = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setImagem(asset.uri);
      setImagemBase64(asset.base64);
      // Limpar dados anteriores
      setItens([]);
      setTotal(0);
      setProteinasTotal(0);
      setCarboidratosTotal(0);
      setGordurasTotal(0);
    }
  }

  async function selecionarDaGaleria() {
    const resultado = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setImagem(asset.uri);
      setImagemBase64(asset.base64);
      // Limpar dados anteriores
      setItens([]);
      setTotal(0);
      setProteinasTotal(0);
      setCarboidratosTotal(0);
      setGordurasTotal(0);
    }
  }

  async function analisarImagem() {
    if (!imagemBase64) {
      Alert.alert('Erro', 'Nenhuma imagem para analisar');
      return;
    }

    setAnalisando(true);
    try {
      const dados = await buscarApi('/api/analise', { method:'POST', token, body:{ dadosImagemBase64: imagemBase64 } });
      setItens(dados.itens || []);
      recalcularTotal(dados.itens || []);
      Alert.alert('Sucesso', 'Imagem analisada com sucesso!');
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    } finally {
      setAnalisando(false);
    }
  }

  function removerImagem() {
    setImagem(null);
    setImagemBase64(null);
    setItens([]);
    setTotal(0);
    setProteinasTotal(0);
    setCarboidratosTotal(0);
    setGordurasTotal(0);
  }

  function abrirModalAdicao() {
    setModalVisivel(true);
  }

  function fecharModalAdicao() {
    setModalVisivel(false);
    // Limpar campos
    setAlimentoManual('');
    setCaloriasManual('');
    setProteinasManual('');
    setCarboidratosManual('');
    setGordurasManual('');
  }

  function adicionarAlimentoManualmente() {
    if (!alimentoManual.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do alimento');
      return;
    }

    if (!caloriasManual.trim()) {
      Alert.alert('Erro', 'Por favor, insira as calorias');
      return;
    }

    const novoAlimento = {
      nome: alimentoManual.trim(),
      calorias: parseFloat(caloriasManual) || 0,
      proteinas: parseFloat(proteinasManual) || 0,
      carboidratos: parseFloat(carboidratosManual) || 0,
      gorduras: parseFloat(gordurasManual) || 0
    };

    const novosItens = [...itens, novoAlimento];
    setItens(novosItens);
    recalcularTotal(novosItens);
    fecharModalAdicao();
    
    Alert.alert('Sucesso', 'Alimento adicionado manualmente!');
  }

  async function salvarRefeicao() {
    try {
      await buscarApi('/api/refeicoes', { method:'POST', token, body:{ itens, calorias_totais: total, timestamp: new Date() } });
      Alert.alert('Sucesso', 'Refeição salva com sucesso!');
      setImagem(null); 
      setItens([]); 
      setTotal(0);
      setProteinasTotal(0);
      setCarboidratosTotal(0);
      setGordurasTotal(0);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  function renderizarItemAlimento({ item, index }) {
    return (
      <View style={styles.itemAlimento}>
        <View style={styles.cabecalhoAlimento}>
          <Text style={styles.nomeAlimento}>{item.nome}</Text>
          <Text style={styles.caloriasAlimento}>{Math.round(item.calorias)} kcal</Text>
        </View>
        
        <View style={styles.informacoesNutricionais}>
          <View style={styles.itemNutricional}>
            <MaterialIcons name="fitness-center" size={16} color={colors.accent.blue} />
            <Text style={styles.rotuloNutricional}>Proteínas</Text>
            <Text style={styles.valorNutricional}>{Math.round(item.proteinas * 10) / 10}g</Text>
          </View>
          <View style={styles.itemNutricional}>
            <MaterialIcons name="grain" size={16} color={colors.accent.green} />
            <Text style={styles.rotuloNutricional}>Carboidratos</Text>
            <Text style={styles.valorNutricional}>{Math.round(item.carboidratos * 10) / 10}g</Text>
          </View>
          <View style={styles.itemNutricional}>
            <MaterialIcons name="opacity" size={16} color={colors.accent.orange} />
            <Text style={styles.rotuloNutricional}>Gorduras</Text>
            <Text style={styles.valorNutricional}>{Math.round(item.gorduras * 10) / 10}g</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral[50]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudoScroll}
      >
        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <View style={styles.containerTitulo}>
            <Text style={styles.titulo}>Análise de Refeições</Text>
            <Text style={styles.subtitulo}>Fotografe sua refeição ou adicione manualmente</Text>
          </View>
          <View style={styles.containerIcone}>
            <MaterialIcons name="camera-alt" size={40} color={colors.primary[600]} />
          </View>
        </View>

        {/* Botões de captura */}
        <View style={styles.containerBotoesCaptura}>
          <TouchableOpacity 
            onPress={capturarComCamera} 
            style={styles.botaoCaptura}
            activeOpacity={0.8}
          >
            <View style={styles.conteudoBotaoCaptura}>
              <MaterialIcons name="camera-alt" size={28} color={colors.neutral[50]} />
              <Text style={styles.textoCaptura}>Câmera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={selecionarDaGaleria} 
            style={[styles.botaoCaptura, styles.botaoGaleria]}
            activeOpacity={0.8}
          >
            <View style={styles.conteudoBotaoCaptura}>
              <MaterialIcons name="photo-library" size={28} color={colors.neutral[50]} />
              <Text style={styles.textoCaptura}>Galeria</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={abrirModalAdicao} 
            style={[styles.botaoCaptura, styles.botaoManual]}
            activeOpacity={0.8}
          >
            <View style={styles.conteudoBotaoCaptura}>
              <MaterialIcons name="edit" size={28} color={colors.neutral[50]} />
              <Text style={styles.textoCaptura}>Manual</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Imagem capturada */}
        {imagem && (
          <View style={styles.containerImagem}>
            <Image source={{ uri: imagem }} style={styles.imagemAlimento} />
            <View style={styles.sobreposicaoImagem}>
              <Text style={styles.textoImagem}>Refeição Capturada</Text>
            </View>
          </View>
        )}

        {/* Botões de ação da imagem */}
        {imagem && (
          <View style={styles.botoesImagem}>
            <TouchableOpacity 
              onPress={analisarImagem} 
              style={[styles.botaoImagem, styles.botaoAnalisar]}
              disabled={analisando}
              activeOpacity={0.8}
            >
                              <View style={styles.conteudoBotaoImagem}>
                  {analisando ? (
                    <MaterialIcons name="hourglass-empty" size={16} color={colors.neutral[50]} />
                  ) : (
                    <MaterialIcons name="search" size={16} color={colors.neutral[50]} />
                  )}
                  <Text style={styles.textoBotaoImagem}>
                    {analisando ? 'Analisando...' : 'Analisar'}
                  </Text>
                </View>
            </TouchableOpacity>

                          <TouchableOpacity 
                onPress={removerImagem} 
                style={[styles.botaoImagem, styles.botaoRemover]}
                activeOpacity={0.8}
              >
                <View style={styles.conteudoBotaoImagem}>
                  <MaterialIcons name="delete" size={16} color={colors.neutral[50]} />
                  <Text style={styles.textoBotaoImagem}>Limpar</Text>
                </View>
              </TouchableOpacity>
          </View>
        )}

        {/* Lista de itens */}
        {itens.length > 0 && (
          <View style={styles.containerItens}>
            <Text style={styles.tituloItens}>Itens Identificados</Text>
            <FlatList
              data={itens}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={renderizarItemAlimento}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Total de calorias */}
        {itens.length > 0 && (
          <View style={styles.containerTotal}>
            <View style={styles.cabecalhoTotal}>
              <Text style={styles.tituloTotal}>Total da Refeição</Text>
              <Text style={styles.caloriasTotais}>{Math.round(total)} kcal</Text>
            </View>
            
            <View style={styles.detalhamentoTotal}>
              <View style={styles.itemTotal}>
                <MaterialIcons name="fitness-center" size={18} color={colors.accent.blue} />
                <Text style={styles.rotuloTotal}>Proteínas</Text>
                <Text style={styles.valorTotal}>
                  {Math.round(proteinasTotal * 10) / 10}g
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <MaterialIcons name="grain" size={18} color={colors.accent.green} />
                <Text style={styles.rotuloTotal}>Carboidratos</Text>
                <Text style={styles.valorTotal}>
                  {Math.round(carboidratosTotal * 10) / 10}g
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <MaterialIcons name="opacity" size={18} color={colors.accent.orange} />
                <Text style={styles.rotuloTotal}>Gorduras</Text>
                <Text style={styles.valorTotal}>
                  {Math.round(gordurasTotal * 10) / 10}g
                </Text>
              </View>
            </View>
            
            {/* Resumo nutricional adicional */}
            <View style={styles.resumoNutricional}>
              <View style={styles.itemResumo}>
                <Text style={styles.rotuloResumo}>Calorias por macronutriente:</Text>
              </View>
              <View style={styles.itemResumo}>
                <Text style={styles.textoResumo}>
                  Proteínas: {Math.round((proteinasTotal * 4 / total) * 100)}% • 
                  Carboidratos: {Math.round((carboidratosTotal * 4 / total) * 100)}% • 
                  Gorduras: {Math.round((gordurasTotal * 9 / total) * 100)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Botões de ação */}
        {itens.length > 0 && (
          <View style={styles.botoesAcao}>
            <TouchableOpacity 
              onPress={salvarRefeicao} 
              style={styles.botaoSalvar}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoSalvar}>Salvar Refeição</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal para adicionar alimento manualmente */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModalAdicao}
      >
        <View style={styles.sobreposicaoModal}>
          <View style={styles.conteudoModal}>
            <View style={styles.cabecalhoModal}>
              <Text style={styles.tituloModal}>Adicionar Alimento Manualmente</Text>
              <TouchableOpacity onPress={fecharModalAdicao} style={styles.botaoFechar}>
                <Ionicons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formularioModal}>
              <View style={styles.grupoInput}>
                <Text style={styles.rotuloInput}>Nome do Alimento *</Text>
                <TextInput
                  style={styles.campoTexto}
                  value={alimentoManual}
                  onChangeText={setAlimentoManual}
                  placeholder="Ex: Arroz Integral"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>

              <View style={styles.linhaInput}>
                <View style={styles.grupoInput}>
                  <Text style={styles.rotuloInput}>Calorias *</Text>
                  <TextInput
                    style={styles.campoTexto}
                    value={caloriasManual}
                    onChangeText={setCaloriasManual}
                    placeholder="Ex: 130"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.grupoInput}>
                  <Text style={styles.rotuloInput}>Proteínas (g)</Text>
                  <TextInput
                    style={styles.campoTexto}
                    value={proteinasManual}
                    onChangeText={setProteinasManual}
                    placeholder="Ex: 2.7"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.linhaInput}>
                <View style={styles.grupoInput}>
                  <Text style={styles.rotuloInput}>Carboidratos (g)</Text>
                  <TextInput
                    style={styles.campoTexto}
                    value={carboidratosManual}
                    onChangeText={setCarboidratosManual}
                    placeholder="Ex: 27"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.grupoInput}>
                  <Text style={styles.rotuloInput}>Gorduras (g)</Text>
                  <TextInput
                    style={styles.campoTexto}
                    value={gordurasManual}
                    onChangeText={setGordurasManual}
                    placeholder="Ex: 0.9"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={adicionarAlimentoManualmente}
                style={styles.botaoAdicionarManual}
                activeOpacity={0.8}
              >
                <Text style={styles.textoBotaoAdicionarManual}>Adicionar Alimento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  
  conteudoScroll: {
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
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  subtitulo: {
    fontSize: typography.fontSize.base,
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
  
  containerAlerta: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    marginBottom: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  textoAlerta: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  containerBotoesCaptura: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  
  botaoCaptura: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  botaoGaleria: {
    backgroundColor: colors.accent.green,
  },
  
  botaoManual: {
    backgroundColor: colors.accent.purple,
  },
  
  conteudoBotaoCaptura: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  iconeCaptura: {
    fontSize: 28,
  },
  
  textoCaptura: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  containerImagem: {
    marginBottom: spacing.lg,
    borderRadius: borders.radius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  
  imagemAlimento: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  
  sobreposicaoImagem: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[900] + '80',
    padding: spacing.md,
  },
  
  textoImagem: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  botoesImagem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },

  botaoImagem: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    elevation: 4,
  },

  botaoAnalisar: {
    backgroundColor: colors.accent.blue,
  },

  botaoRemover: {
    backgroundColor: colors.accent.red,
  },

  conteudoBotaoImagem: {
    alignItems: 'center',
    gap: spacing.xs,
  },

  textoBotaoImagem: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  containerItens: {
    marginBottom: spacing.lg,
  },
  
  tituloItens: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  
  itemAlimento: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  cabecalhoAlimento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  nomeAlimento: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    flex: 1,
  },
  
  caloriasAlimento: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  
  informacoesNutricionais: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  itemNutricional: {
    alignItems: 'center',
  },
  
  rotuloNutricional: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  valorNutricional: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  containerTotal: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  cabecalhoTotal: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  tituloTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  
  caloriasTotais: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.tight,
  },
  
  detalhamentoTotal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.lg,
  },
  
  itemTotal: {
    alignItems: 'center',
  },
  
  rotuloTotal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  valorTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  resumoNutricional: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
  },
  
  itemResumo: {
    marginBottom: spacing.sm,
  },
  
  rotuloResumo: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  
  textoResumo: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  botoesAcao: {
    gap: spacing.md,
  },
  
  botaoSalvar: {
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  textoBotaoSalvar: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  alertaVisitante: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  textoAlertaVisitante: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },

  // Estilos dos botões de imagem
  botoesImagem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  botaoImagem: {
    flex: 1,
    borderRadius: borders.radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    elevation: 2,
    minHeight: 36,
  },

  botaoAnalisar: {
    backgroundColor: colors.accent.blue,
  },

  botaoRemover: {
    backgroundColor: colors.accent.red,
  },

  conteudoBotaoImagem: {
    alignItems: 'center',
    gap: spacing.xs,
  },

  textoBotaoImagem: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.2,
  },

  // Estilos do modal
  sobreposicaoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  conteudoModal: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.xl,
  },

  cabecalhoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  tituloModal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    flex: 1,
  },

  botaoFechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },

  formularioModal: {
    gap: spacing.lg,
  },

  grupoInput: {
    gap: spacing.sm,
  },

  linhaInput: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  rotuloInput: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginLeft: spacing.sm,
  },

  campoTexto: {
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

  botaoAdicionarManual: {
    backgroundColor: colors.accent.green,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.lg,
    elevation: 8,
  },

  textoBotaoAdicionarManual: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
});