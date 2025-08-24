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
  const [modalVisivel, setModalVisivel] = useState(false);
  const [alimentoManual, setAlimentoManual] = useState('');
  const [caloriasManual, setCaloriasManual] = useState('');
  const [proteinasManual, setProteinasManual] = useState('');
  const [carboidratosManual, setCarboidratosManual] = useState('');
  const [gordurasManual, setGordurasManual] = useState('');

  function recalcular(itens) {
    setTotal(itens.reduce((soma, item) => soma + (item.calorias||0), 0));
  }

  async function escolherImagem() {
    const resultado = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setImagem(asset.uri);
      
      try {
        const dados = await buscarApi('/api/analise', { method:'POST', token, body:{ dadosImagemBase64: asset.base64 } });
        setItens(dados.itens || []);
        recalcular(dados.itens || []);
      } catch (erro) {
        Alert.alert('Erro', erro.message);
      }
    }
  }

  async function escolherDaGaleria() {
    const resultado = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setImagem(asset.uri);
      
      try {
        const dados = await buscarApi('/api/analise', { method:'POST', token, body:{ dadosImagemBase64: asset.base64 } });
        setItens(dados.itens || []);
        recalcular(dados.itens || []);
      } catch (erro) {
        Alert.alert('Erro', erro.message);
      }
    }
  }

  function abrirModal() {
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
    // Limpar campos
    setAlimentoManual('');
    setCaloriasManual('');
    setProteinasManual('');
    setCarboidratosManual('');
    setGordurasManual('');
  }

  function adicionarAlimentoManual() {
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
    recalcular(novosItens);
    fecharModal();
    
    Alert.alert('Sucesso', 'Alimento adicionado manualmente!');
  }

  async function salvarRefeicao() {
    try {
      await buscarApi('/api/refeicoes', { method:'POST', token, body:{ itens, calorias_totais: total, timestamp: new Date() } });
      Alert.alert('Sucesso', 'Refeição salva com sucesso!');
      setImagem(null); setItens([]); setTotal(0);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  function renderizarItem({ item, index }) {
    return (
      <View style={styles.foodItem}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{item.nome}</Text>
          <Text style={styles.foodCalories}>{Math.round(item.calorias)} kcal</Text>
        </View>
        
        <View style={styles.nutritionInfo}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Proteínas</Text>
            <Text style={styles.nutritionValue}>{item.proteinas || 0}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Carboidratos</Text>
            <Text style={styles.nutritionValue}>{item.carboidratos || 0}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Gorduras</Text>
            <Text style={styles.nutritionValue}>{item.gorduras || 0}g</Text>
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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Análise de Refeições</Text>
            <Text style={styles.subtitle}>Fotografe sua refeição ou adicione manualmente</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="camera-alt" size={40} color={colors.primary[600]} />
          </View>
        </View>

        {/* Botões de captura */}
        <View style={styles.captureButtonsContainer}>
          <TouchableOpacity 
            onPress={escolherImagem} 
            style={styles.captureButton}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonContent}>
              <MaterialIcons name="camera-alt" size={28} color={colors.neutral[50]} />
              <Text style={styles.captureText}>Câmera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={escolherDaGaleria} 
            style={[styles.captureButton, styles.galleryButton]}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonContent}>
              <MaterialIcons name="photo-library" size={28} color={colors.neutral[50]} />
              <Text style={styles.captureText}>Galeria</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={abrirModal} 
            style={[styles.captureButton, styles.manualButton]}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonContent}>
              <MaterialIcons name="edit" size={28} color={colors.neutral[50]} />
              <Text style={styles.captureText}>Manual</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Imagem capturada */}
        {imagem && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imagem }} style={styles.foodImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageText}>Refeição Capturada</Text>
            </View>
          </View>
        )}

        {/* Lista de itens */}
        {itens.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>Itens Identificados</Text>
            <FlatList
              data={itens}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={renderizarItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Total de calorias */}
        {itens.length > 0 && (
          <View style={styles.totalContainer}>
            <View style={styles.totalHeader}>
              <Text style={styles.totalTitle}>Total da Refeição</Text>
              <Text style={styles.totalCalories}>{Math.round(total)} kcal</Text>
            </View>
            
            <View style={styles.totalBreakdown}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Proteínas</Text>
                <Text style={styles.totalValue}>
                  {Math.round(itens.reduce((soma, item) => soma + (item.proteinas || 0), 0))}g
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Carboidratos</Text>
                <Text style={styles.totalValue}>
                  {Math.round(itens.reduce((soma, item) => soma + (item.carboidratos || 0), 0))}g
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Gorduras</Text>
                <Text style={styles.totalValue}>
                  {Math.round(itens.reduce((soma, item) => soma + (item.gorduras || 0), 0))}g
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Botões de ação */}
        {itens.length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={salvarRefeicao} 
              style={styles.saveButton}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Salvar Refeição</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal para adicionar alimento manualmente */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Alimento Manualmente</Text>
              <TouchableOpacity onPress={fecharModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome do Alimento *</Text>
                <TextInput
                  style={styles.textInput}
                  value={alimentoManual}
                  onChangeText={setAlimentoManual}
                  placeholder="Ex: Arroz Integral"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Calorias *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={caloriasManual}
                    onChangeText={setCaloriasManual}
                    placeholder="Ex: 130"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Proteínas (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={proteinasManual}
                    onChangeText={setProteinasManual}
                    placeholder="Ex: 2.7"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Carboidratos (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={carboidratosManual}
                    onChangeText={setCarboidratosManual}
                    placeholder="Ex: 27"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Gorduras (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={gordurasManual}
                    onChangeText={setGordurasManual}
                    placeholder="Ex: 0.9"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={adicionarAlimentoManual}
                style={styles.addManualButton}
                activeOpacity={0.8}
              >
                <Text style={styles.addManualButtonText}>Adicionar Alimento</Text>
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
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  subtitle: {
    fontSize: typography.fontSize.base,
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
  
  alertContainer: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    marginBottom: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  alertText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  captureButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  
  captureButton: {
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
  
  galleryButton: {
    backgroundColor: colors.accent.green,
  },
  
  manualButton: {
    backgroundColor: colors.accent.purple,
  },
  
  captureButtonContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  captureIcon: {
    fontSize: 28,
  },
  
  captureText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  imageContainer: {
    marginBottom: spacing.lg,
    borderRadius: borders.radius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  
  foodImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[900] + '80',
    padding: spacing.md,
  },
  
  imageText: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  itemsContainer: {
    marginBottom: spacing.lg,
  },
  
  itemsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  
  foodItem: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  foodName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    flex: 1,
  },
  
  foodCalories: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  nutritionItem: {
    alignItems: 'center',
  },
  
  nutritionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  nutritionValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  totalContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  totalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  totalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  
  totalCalories: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.tight,
  },
  
  totalBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.lg,
  },
  
  totalItem: {
    alignItems: 'center',
  },
  
  totalLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  actionButtons: {
    gap: spacing.md,
  },
  
  saveButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  visitorAlert: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  visitorAlertText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },

  // Estilos do modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  modalContent: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.xl,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    flex: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalForm: {
    gap: spacing.lg,
  },

  inputGroup: {
    gap: spacing.sm,
  },

  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginLeft: spacing.sm,
  },

  textInput: {
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

  addManualButton: {
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

  addManualButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
});