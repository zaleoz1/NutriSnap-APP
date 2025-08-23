import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaRefeicoes() {
  const { token, modoVisitante } = usarAutenticacao();
  const [imagem, setImagem] = useState(null);
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);

  function recalcular(itens) {
    setTotal(itens.reduce((soma, item) => soma + (item.calorias||0), 0));
  }

  async function escolherImagem() {
    const resultado = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setImagem(asset.uri);
      
      if (modoVisitante) {
        // Dados simulados para modo visitante
        const itensSimulados = [
          { nome: 'Arroz Integral', calorias: 130, proteinas: 2.7, carboidratos: 27, gorduras: 0.9 },
          { nome: 'Feijão Preto', calorias: 77, proteinas: 4.5, carboidratos: 14, gorduras: 0.5 },
          { nome: 'Frango Grelhado', calorias: 165, proteinas: 31, carboidratos: 0, gorduras: 3.6 },
          { nome: 'Salada de Alface', calorias: 15, proteinas: 1.4, carboidratos: 2.9, gorduras: 0.2 }
        ];
        setItens(itensSimulados);
        recalcular(itensSimulados);
        Alert.alert('Modo Visitante', 'Análise simulada - dados não são reais');
      } else {
        try {
          const dados = await buscarApi('/api/analise', { method:'POST', token, body:{ dadosImagemBase64: asset.base64 } });
          setItens(dados.itens || []);
          recalcular(dados.itens || []);
        } catch (erro) {
          Alert.alert('Erro', erro.message);
        }
      }
    }
  }

  async function salvarRefeicao() {
    if (modoVisitante) {
      Alert.alert('Modo Visitante', 'Refeições não podem ser salvas no modo visitante. Faça login para salvar.');
      return;
    }

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
            <Text style={styles.subtitle}>Fotografe sua refeição para análise nutricional</Text>
          </View>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📱</Text>
          </View>
        </View>

        {/* Aviso do modo visitante */}
        {modoVisitante && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>
              💡 Modo Visitante - Análise simulada para demonstração
            </Text>
          </View>
        )}

        {/* Botão de captura */}
        <TouchableOpacity 
          onPress={escolherImagem} 
          style={styles.captureButton}
          activeOpacity={0.8}
        >
          <View style={styles.captureButtonContent}>
            <Text style={styles.captureIcon}>📸</Text>
            <Text style={styles.captureText}>Fotografar Refeição</Text>
          </View>
        </TouchableOpacity>

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
            {!modoVisitante && (
              <TouchableOpacity 
                onPress={salvarRefeicao} 
                style={styles.saveButton}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Salvar Refeição</Text>
              </TouchableOpacity>
            )}
            
            {modoVisitante && (
              <View style={styles.visitorAlert}>
                <Text style={styles.visitorAlertText}>
                  Faça login para salvar suas refeições
                </Text>
              </View>
            )}
          </View>
        )}
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
  
  captureButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
    elevation: 8,
  },
  
  captureButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  
  captureIcon: {
    fontSize: 32,
  },
  
  captureText: {
    fontSize: typography.fontSize.xl,
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
});