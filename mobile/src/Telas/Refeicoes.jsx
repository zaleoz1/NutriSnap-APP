import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet, StatusBar, ScrollView, Dimensions, TextInput, Modal, Animated } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

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
  const [progressoAnalise, setProgressoAnalise] = useState(0);

  function recalcularTotal(itens) {
    const calorias = itens.reduce((soma, item) => soma + (parseFloat(item.calorias) || 0), 0);
    const proteinas = itens.reduce((soma, item) => soma + (parseFloat(item.proteinas) || 0), 0);
    const carboidratos = itens.reduce((soma, item) => soma + (parseFloat(item.carboidratos) || 0), 0);
    const gorduras = itens.reduce((soma, item) => soma + (parseFloat(item.gorduras) || 0), 0);
    
    console.log('🧮 Recalculando totais:', { calorias, proteinas, carboidratos, gorduras });
    
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
    setProgressoAnalise(0);
    
    // Simular progresso da análise
    const simularProgresso = () => {
      let progresso = 0;
      const intervalo = setInterval(() => {
        progresso += Math.random() * 15 + 5; // Incremento aleatório entre 5-20%
        if (progresso >= 90) {
          progresso = 90; // Para em 90% até a resposta da API
          clearInterval(intervalo);
        }
        setProgressoAnalise(Math.min(progresso, 90));
      }, 200);
      return intervalo;
    };

    const intervaloProgresso = simularProgresso();

    try {
      const dados = await buscarApi('/api/analise', { method:'POST', token, body:{ dadosImagemBase64: imagemBase64 } });
      
      // Completar o progresso
      clearInterval(intervaloProgresso);
      setProgressoAnalise(100);
      
      // Log para debug
      console.log('📊 Dados recebidos da API:', dados);
      
      // Pequeno delay para mostrar 100% e depois ocultar imagem
      setTimeout(() => {
        const itensProcessados = dados.itens || [];
        console.log('🍎 Itens processados:', itensProcessados);
        
        setItens(itensProcessados);
        
        // Usar totais do backend se disponíveis, senão calcular localmente
        if (dados.caloriasTotais !== undefined && dados.proteinasTotais !== undefined && 
            dados.carboidratosTotais !== undefined && dados.gordurasTotais !== undefined) {
          console.log('📊 Usando totais do backend:', {
            calorias: dados.caloriasTotais,
            proteinas: dados.proteinasTotais,
            carboidratos: dados.carboidratosTotais,
            gorduras: dados.gordurasTotais
          });
          
          setTotal(dados.caloriasTotais);
          setProteinasTotal(dados.proteinasTotais);
          setCarboidratosTotal(dados.carboidratosTotais);
          setGordurasTotal(dados.gordurasTotais);
        } else {
          console.log('🧮 Calculando totais localmente');
          recalcularTotal(itensProcessados);
        }
        
        setAnalisando(false);
        setProgressoAnalise(0);
        // Ocultar imagem e botões após análise bem-sucedida
        setImagem(null);
        setImagemBase64(null);
      }, 500);
      
    } catch (erro) {
      clearInterval(intervaloProgresso);
      setAnalisando(false);
      setProgressoAnalise(0);
      console.error('❌ Erro na análise:', erro);
      Alert.alert('Erro', erro.message);
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
      return false;
    }

    if (!caloriasManual.trim()) {
      Alert.alert('Erro', 'Por favor, insira as calorias');
      return false;
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
      <View style={styles.cardAlimento}>
        <View style={styles.cabecalhoCardAlimento}>
          <View style={styles.infoAlimento}>
            <View style={styles.iconeAlimento}>
              <FontAwesome5 name="apple-alt" size={16} color={colors.accent.green} />
            </View>
            <View style={styles.detalhesAlimento}>
              <Text style={styles.nomeAlimento}>{item.nome}</Text>
              <Text style={styles.caloriasAlimento}>{Math.round(item.calorias)} kcal</Text>
            </View>
          </View>
          <View style={styles.badgeCalorias}>
            <Text style={styles.textoBadgeCalorias}>{Math.round(item.calorias)}</Text>
          </View>
        </View>
        
        <View style={styles.macronutrientes}>
          <View style={styles.macronutriente}>
            <View style={[styles.iconeMacro, { backgroundColor: colors.accent.blue + '20' }]}>
              <MaterialIcons name="fitness-center" size={14} color={colors.accent.blue} />
            </View>
            <Text style={styles.valorMacro}>{Math.round(item.proteinas * 10) / 10}g</Text>
            <Text style={styles.rotuloMacro}>Proteínas</Text>
          </View>
          
          <View style={styles.macronutriente}>
            <View style={[styles.iconeMacro, { backgroundColor: colors.accent.green + '20' }]}>
              <MaterialIcons name="grain" size={14} color={colors.accent.green} />
            </View>
            <Text style={styles.valorMacro}>{Math.round(item.carboidratos * 10) / 10}g</Text>
            <Text style={styles.rotuloMacro}>Carboidratos</Text>
          </View>
          
          <View style={styles.macronutriente}>
            <View style={[styles.iconeMacro, { backgroundColor: colors.accent.orange + '20' }]}>
              <MaterialIcons name="opacity" size={14} color={colors.accent.orange} />
            </View>
            <Text style={styles.valorMacro}>{Math.round(item.gorduras * 10) / 10}g</Text>
            <Text style={styles.rotuloMacro}>Gorduras</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudoScroll}
      >
        {/* Header Elegante */}
        <View style={styles.header}>
          <View style={styles.containerTitulo}>
            <Text style={styles.titulo}>Análise Nutricional</Text>
            <Text style={styles.subtitulo}>Transforme fotos em insights nutricionais</Text>
          </View>
          <View style={styles.containerIconeHeader}>
            <View style={styles.circuloIconeHeader}>
              <MaterialIcons name="camera-alt" size={32} color={colors.primary[400]} />
            </View>
          </View>
        </View>

        {/* Cards de Ação */}
        <View style={styles.containerCardsAcao}>
          <TouchableOpacity 
            onPress={capturarComCamera} 
            style={[styles.cardAcao, styles.cardCamera]}
            activeOpacity={0.9}
          >
            <View style={styles.conteudoCardAcao}>
              <View style={styles.iconeCardAcao}>
                <MaterialIcons name="camera-alt" size={28} color={colors.neutral[50]} />
              </View>
              <Text style={styles.tituloCardAcao}>Câmera</Text>
              <Text style={styles.descricaoCardAcao}>Fotografe sua refeição</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={selecionarDaGaleria} 
            style={[styles.cardAcao, styles.cardGaleria]}
            activeOpacity={0.9}
          >
            <View style={styles.conteudoCardAcao}>
              <View style={styles.iconeCardAcao}>
                <MaterialIcons name="photo-library" size={28} color={colors.neutral[50]} />
              </View>
              <Text style={styles.tituloCardAcao}>Galeria</Text>
              <Text style={styles.descricaoCardAcao}>Selecione uma foto</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={abrirModalAdicao} 
            style={[styles.cardAcao, styles.cardManual]}
            activeOpacity={0.9}
          >
            <View style={styles.conteudoCardAcao}>
              <View style={styles.iconeCardAcao}>
                <MaterialIcons name="edit" size={28} color={colors.neutral[50]} />
              </View>
              <Text style={styles.tituloCardAcao}>Manual</Text>
              <Text style={styles.descricaoCardAcao}>Digite os dados</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Seção de Imagem */}
        {imagem && (
          <View style={styles.secaoImagem}>
            <View style={styles.containerImagem}>
              <Image source={{ uri: imagem }} style={styles.imagemAlimento} />
              <View style={styles.overlayImagem}>
                <View style={styles.badgeImagem}>
                  <MaterialIcons name="check-circle" size={16} color={colors.accent.green} />
                  <Text style={styles.textoBadgeImagem}>Imagem Capturada</Text>
                </View>
              </View>
            </View>
            
            {/* Barra de Progresso da Análise */}
            {analisando && (
              <View style={styles.containerProgresso}>
                <View style={styles.cabecalhoProgresso}>
                  <View style={styles.infoProgresso}>
                    <MaterialIcons name="search" size={20} color={colors.accent.blue} />
                    <Text style={styles.textoProgresso}>Analisando imagem...</Text>
                  </View>
                  <Text style={styles.porcentagemProgresso}>{Math.round(progressoAnalise)}%</Text>
                </View>
                <View style={styles.barraProgresso}>
                  <View style={[styles.preenchimentoProgresso, { width: `${progressoAnalise}%` }]} />
                </View>
                <View style={styles.detalhesProgresso}>
                  <Text style={styles.textoDetalhesProgresso}>
                    {progressoAnalise < 30 ? 'Carregando modelo de IA...' :
                     progressoAnalise < 60 ? 'Processando imagem...' :
                     progressoAnalise < 90 ? 'Identificando alimentos...' :
                     'Finalizando análise...'}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.botoesAcaoImagem}>
              <TouchableOpacity 
                onPress={analisarImagem} 
                style={[styles.botaoAcaoImagem, styles.botaoAnalisar]}
                disabled={analisando}
                activeOpacity={0.9}
              >
                <View style={styles.conteudoBotaoAcao}>
                  {analisando ? (
                    <MaterialIcons name="hourglass-empty" size={18} color={colors.neutral[50]} />
                  ) : (
                    <MaterialIcons name="search" size={18} color={colors.neutral[50]} />
                  )}
                  <Text style={styles.textoBotaoAcao}>
                    {analisando ? 'Analisando...' : 'Analisar Imagem'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={removerImagem} 
                style={[styles.botaoAcaoImagem, styles.botaoRemover]}
                activeOpacity={0.9}
              >
                <View style={styles.conteudoBotaoAcao}>
                  <MaterialIcons name="delete-outline" size={18} color={colors.neutral[50]} />
                  <Text style={styles.textoBotaoAcao}>Remover</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mensagem quando não há imagem */}
        {!imagem && itens.length === 0 && (
          <View style={styles.containerMensagemInicial}>
            <View style={styles.iconeMensagemInicial}>
              <MaterialIcons name="restaurant" size={48} color={colors.neutral[600]} />
            </View>
            <Text style={styles.tituloMensagemInicial}>Comece sua análise nutricional</Text>

          </View>
        )}

        {/* Lista de Alimentos */}
        {itens.length > 0 && (
          <View style={styles.secaoAlimentos}>
            <View style={styles.cabecalhoSecao}>
              <Text style={styles.tituloSecao}>Análise Nutricional Completa</Text>
              <View style={styles.badgeContador}>
                <Text style={styles.textoBadgeContador}>{itens.length}</Text>
              </View>
            </View>
            
            <FlatList
              data={itens}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={renderizarItemAlimento}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
            />
          </View>
        )}

        {/* Resumo Nutricional */}
        {itens.length > 0 && (
          <View style={styles.secaoResumo}>
            <View style={styles.cabecalhoResumo}>
              <Text style={styles.tituloResumo}>Resumo Nutricional</Text>
              <View style={styles.caloriasPrincipais}>
                <Text style={styles.numeroCalorias}>
                  {Math.round(total) || 0}
                </Text>
                <Text style={styles.unidadeCalorias}>kcal</Text>
                {total > 0 && (
                  <Text style={styles.caloriasPorItem}>
                    {itens.length > 1 ? `(${Math.round(total / itens.length)} kcal/item)` : ''}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.macronutrientesResumo}>
              <View style={styles.macronutrienteResumo}>
                <View style={[styles.iconeMacroResumo, { backgroundColor: colors.accent.blue + '20' }]}>
                  <MaterialIcons name="fitness-center" size={20} color={colors.accent.blue} />
                </View>
                <View style={styles.infoMacroResumo}>
                  <Text style={styles.valorMacroResumo}>
                    {Math.round((proteinasTotal || 0) * 10) / 10}g
                  </Text>
                  <Text style={styles.rotuloMacroResumo}>Proteínas</Text>
                  <Text style={styles.porcentagemMacro}>
                    {total > 0 ? Math.round(((proteinasTotal || 0) * 4 / total) * 100) : 0}% das calorias
                  </Text>
                </View>
              </View>
              
              <View style={styles.macronutrienteResumo}>
                <View style={[styles.iconeMacroResumo, { backgroundColor: colors.accent.green + '20' }]}>
                  <MaterialIcons name="grain" size={20} color={colors.accent.green} />
                </View>
                <View style={styles.infoMacroResumo}>
                  <Text style={styles.valorMacroResumo}>
                    {Math.round((carboidratosTotal || 0) * 10) / 10}g
                  </Text>
                  <Text style={styles.rotuloMacroResumo}>Carboidratos</Text>
                  <Text style={styles.porcentagemMacro}>
                    {total > 0 ? Math.round(((carboidratosTotal || 0) * 4 / total) * 100) : 0}% das calorias
                  </Text>
                </View>
              </View>
              
              <View style={styles.macronutrienteResumo}>
                <View style={[styles.iconeMacroResumo, { backgroundColor: colors.accent.orange + '20' }]}>
                  <MaterialIcons name="opacity" size={20} color={colors.accent.orange} />
                </View>
                <View style={styles.infoMacroResumo}>
                  <Text style={styles.valorMacroResumo}>
                    {Math.round((gordurasTotal || 0) * 10) / 10}g
                  </Text>
                  <Text style={styles.rotuloMacroResumo}>Gorduras</Text>
                  <Text style={styles.porcentagemMacro}>
                    {total > 0 ? Math.round(((gordurasTotal || 0) * 9 / total) * 100) : 0}% das calorias
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.botoesAcaoResumo}>
              <TouchableOpacity 
                onPress={salvarRefeicao} 
                style={styles.botaoSalvar}
                activeOpacity={0.9}
              >
                <View style={styles.conteudoBotaoSalvar}>
                  <MaterialIcons name="save" size={20} color={colors.neutral[50]} />
                  <Text style={styles.textoBotaoSalvar}>Salvar Refeição</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  setItens([]);
                  setTotal(0);
                  setProteinasTotal(0);
                  setCarboidratosTotal(0);
                  setGordurasTotal(0);
                }} 
                style={styles.botaoNovaAnalise}
                activeOpacity={0.9}
              >
                <View style={styles.conteudoBotaoNovaAnalise}>
                  <MaterialIcons name="camera-alt" size={20} color={colors.neutral[50]} />
                  <Text style={styles.textoBotaoNovaAnalise}>Nova Análise</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal Elegante */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={fecharModalAdicao}
      >
        <View style={styles.overlayModal}>
          <View style={styles.conteudoModal}>
            <View style={styles.cabecalhoModal}>
              <View style={styles.tituloContainerModal}>
                <MaterialIcons name="restaurant" size={24} color={colors.primary[400]} />
                <Text style={styles.tituloModal}>Adicionar Alimento</Text>
              </View>
              <TouchableOpacity onPress={fecharModalAdicao} style={styles.botaoFecharModal}>
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
                  placeholderTextColor={colors.neutral[500]}
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
                    placeholderTextColor={colors.neutral[500]}
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
                    placeholderTextColor={colors.neutral[500]}
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
                    placeholderTextColor={colors.neutral[500]}
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
                    placeholderTextColor={colors.neutral[500]}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={adicionarAlimentoManualmente}
                style={styles.botaoAdicionarManual}
                activeOpacity={0.9}
              >
                <View style={styles.conteudoBotaoAdicionar}>
                  <MaterialIcons name="add" size={20} color={colors.neutral[50]} />
                  <Text style={styles.textoBotaoAdicionar}>Adicionar Alimento</Text>
                </View>
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
    backgroundColor: colors.neutral[900],
  },
  
  scrollView: {
    flex: 1,
  },
  
  conteudoScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // Header Elegante
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  
  containerTitulo: {
    flex: 1,
  },
  
  titulo: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  
  subtitulo: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },
  
  containerIconeHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  circuloIconeHeader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[400] + '30',
    ...shadows.lg,
  },
  
  // Cards de Ação
  containerCardsAcao: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  cardAcao: {
    flex: 1,
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
    minHeight: 120,
  },
  
  cardCamera: {
    backgroundColor: colors.primary[600],
  },
  
  cardGaleria: {
    backgroundColor: colors.accent.green,
  },
  
  cardManual: {
    backgroundColor: colors.accent.purple,
  },
  
  conteudoCardAcao: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  iconeCardAcao: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  
  tituloCardAcao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
  },
  
  descricaoCardAcao: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  // Seção de Imagem
  secaoImagem: {
    marginBottom: spacing.xl,
  },
  
  containerImagem: {
    borderRadius: borders.radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[700],
    marginBottom: spacing.md,
  },
  
  imagemAlimento: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  
  overlayImagem: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  
  badgeImagem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[900] + 'CC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.full,
    gap: spacing.xs,
  },
  
  textoBadgeImagem: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  botoesAcaoImagem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  botaoAcaoImagem: {
    flex: 1,
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
    elevation: 4,
  },
  
  botaoAnalisar: {
    backgroundColor: colors.accent.blue,
  },
  
  botaoRemover: {
    backgroundColor: colors.neutral[700],
  },
  
  conteudoBotaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  textoBotaoAcao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
  
  // Seção de Alimentos
  secaoAlimentos: {
    marginBottom: spacing.xl,
  },
  
  cabecalhoSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  
  tituloSecao: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  badgeContador: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.full,
  },
  
  textoBadgeContador: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  cardAlimento: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[700],
  },
  
  cabecalhoCardAlimento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  infoAlimento: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconeAlimento: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.green + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  detalhesAlimento: {
    flex: 1,
  },
  
  nomeAlimento: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  caloriasAlimento: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  badgeCalorias: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.md,
  },
  
  textoBadgeCalorias: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  macronutrientes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  macronutriente: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  iconeMacro: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  valorMacro: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[100],
  },
  
  rotuloMacro: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  separador: {
    height: spacing.md,
  },
  
  // Seção de Resumo
  secaoResumo: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[700],
  },
  
  cabecalhoResumo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  tituloResumo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginBottom: spacing.lg,
  },
  
  caloriasPrincipais: {
    alignItems: 'center',
  },
  
  numeroCalorias: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.primary[400],
    lineHeight: typography.lineHeight.tight,
    letterSpacing: -1,
  },
  
  unidadeCalorias: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  
  caloriasPorItem: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  
  macronutrientesResumo: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  macronutrienteResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  
  iconeMacroResumo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  infoMacroResumo: {
    flex: 1,
  },
  
  valorMacroResumo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[100],
    marginBottom: spacing.xs,
  },
  
  rotuloMacroResumo: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginBottom: spacing.xs,
  },
  
  porcentagemMacro: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
  },
  
  botaoSalvar: {
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  conteudoBotaoSalvar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  textoBotaoSalvar: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },

  botoesAcaoResumo: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  botaoNovaAnalise: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },

  conteudoBotaoNovaAnalise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  textoBotaoNovaAnalise: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  // Modal Elegante
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  conteudoModal: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    ...shadows.xl,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[700],
  },
  
  cabecalhoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  tituloContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  
  tituloModal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  botaoFecharModal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[700],
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
    color: colors.neutral[300],
    marginLeft: spacing.sm,
  },
  
  campoTexto: {
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
  
  botaoAdicionarManual: {
    backgroundColor: colors.accent.green,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.lg,
    elevation: 8,
  },
  
  conteudoBotaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  textoBotaoAdicionar: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },

  // Barra de Progresso da Análise
  containerProgresso: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[700],
    ...shadows.base,
  },

  cabecalhoProgresso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  infoProgresso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  textoProgresso: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[300],
  },

  porcentagemProgresso: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.blue,
  },

  barraProgresso: {
    height: 10,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },

  preenchimentoProgresso: {
    height: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.full,
    minWidth: 0,
    transition: 'width 0.3s ease',
  },

  detalhesProgresso: {
    alignItems: 'center',
  },

  textoDetalhesProgresso: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Mensagem quando não há imagem
  containerMensagemInicial: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  iconeMensagemInicial: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  tituloMensagemInicial: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },

  descricaoMensagemInicial: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
});