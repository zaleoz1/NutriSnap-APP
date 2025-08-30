import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, componentStyles, borders } from '../styles/globalStyles';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarMetas, gerarMetasNutricionais } from '../services/api';

const { width } = Dimensions.get('window');

export default function TelaMetas({ navigation }) {
  const { token } = usarAutenticacao();
  const [metas, setMetas] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarMetas();
  }, []);

  const carregarMetas = async () => {
    try {
      setCarregando(true);
      const dadosMetas = await buscarMetas(token);
      console.log('📊 Dados das metas recebidos:', dadosMetas);
      
      if (dadosMetas) {
        // Extrair dados básicos da tabela metas
        const metasBasicas = {
          id: dadosMetas.id,
          peso_atual: dadosMetas.peso_atual,
          peso_meta: dadosMetas.peso_meta,
          dias: dadosMetas.dias,
          calorias_diarias: dadosMetas.calorias_diarias,
          criado_em: dadosMetas.criado_em
        };

        // Extrair dados nutricionais do JSON
        let metasNutricionais = {};
        if (dadosMetas.metas_nutricionais) {
          try {
            metasNutricionais = typeof dadosMetas.metas_nutricionais === 'string' 
              ? JSON.parse(dadosMetas.metas_nutricionais) 
              : dadosMetas.metas_nutricionais;
          } catch (erro) {
            console.error('❌ Erro ao fazer parse das metas nutricionais:', erro);
            metasNutricionais = {};
          }
        }

        // Combinar dados básicos com nutricionais
        const metasCompletas = {
          ...metasBasicas,
          ...metasNutricionais
        };

        console.log('🔍 Estrutura final das metas:', {
          temMacronutrientes: !!metasCompletas.macronutrientes,
          temMicronutrientes: !!metasCompletas.micronutrientes,
          temEstrategias: !!metasCompletas.estrategias,
          temDicas: !!metasCompletas.dicas,
          temProgresso: !!metasCompletas.progresso_esperado
        });

        setMetas(metasCompletas);
      } else {
        setMetas(null);
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar metas:', erro);
      if (erro.status !== 404) {
        Alert.alert('Erro', 'Não foi possível carregar suas metas');
      }
    } finally {
      setCarregando(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarMetas();
    setRefreshing(false);
  };

  const gerarMetasComIA = async () => {
    try {
      setGerandoIA(true);
      const resultado = await gerarMetasNutricionais(token);
      
      if (resultado.metas) {
        // Atualizar o estado com as novas metas
        await carregarMetas();
        Alert.alert(
          'Sucesso!', 
          'Suas metas nutricionais foram geradas com inteligência artificial baseadas no seu perfil!',
          [{ text: 'OK' }]
        );
      }
    } catch (erro) {
      console.error('❌ Erro ao gerar metas com IA:', erro);
      if (erro.status === 400) {
        Alert.alert(
          'Quiz Necessário', 
          'Complete o quiz de perfil primeiro para gerar metas personalizadas.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Fazer Quiz', onPress: () => navigation.navigate('Quiz') }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível gerar metas com IA. Tente novamente.');
      }
    } finally {
      setGerandoIA(false);
    }
  };

  const renderizarCardMacronutriente = ({ titulo, dados, cor, icone }) => {
    if (!dados || !dados.gramas || !dados.percentual) return null;
    
    return (
      <View style={[styles.cardMacronutriente, { borderLeftColor: cor }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: cor + '15' }]}>
            <FontAwesome5 name={icone} size={20} color={cor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{titulo}</Text>
            <Text style={styles.cardValue}>{dados.gramas}g</Text>
            <Text style={styles.cardPercentual}>{dados.percentual}%</Text>
          </View>
        </View>
      </View>
    );
  };

     const renderizarCardVitamina = ({ titulo, dados, cor }) => {
     if (!dados || !dados.quantidade) return null;
     
     return (
       <View style={[styles.cardVitamina, { borderLeftColor: cor }]}>
         <View style={styles.vitaminaHeader}>
           <Text style={styles.vitaminaTitle}>{titulo}</Text>
           <Text style={styles.vitaminaQuantidade}>{dados.quantidade}</Text>
         </View>
       </View>
     );
   };

  const renderizarCardEstrategia = ({ titulo, valor, icone, cor }) => {
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) return null;
    
    return (
      <View style={[styles.cardEstrategia, { borderLeftColor: cor }]}>
        <View style={styles.estrategiaHeader}>
          <MaterialIcons name={icone} size={24} color={cor} />
          <Text style={styles.estrategiaTitle}>{titulo}</Text>
        </View>
        <Text style={styles.estrategiaValor}>{valor}</Text>
      </View>
    );
  };

  

  const renderizarProgresso = () => {
    if (!metas || !metas.peso_atual || !metas.peso_meta) return null;

    const { peso_atual, peso_meta, progresso_esperado } = metas;
    const diferenca = peso_meta - peso_atual;
    const objetivo = metas.objetivo || 'manter_peso';

    return (
      <View style={styles.progressoContainer}>
        <Text style={styles.progressoTitle}>Progresso Esperado</Text>
        
        <View style={styles.progressoCard}>
          <View style={styles.progressoHeader}>
            <Text style={styles.progressoLabel}>Peso Atual</Text>
            <Text style={styles.progressoValor}>{peso_atual}kg</Text>
          </View>
          <View style={styles.progressoHeader}>
            <Text style={styles.progressoLabel}>Meta</Text>
            <Text style={styles.progressoValor}>{peso_meta}kg</Text>
          </View>
          <View style={styles.progressoHeader}>
            <Text style={styles.progressoLabel}>Diferença</Text>
            <Text style={[styles.progressoValor, { color: diferenca > 0 ? colors.success : colors.error }]}>
              {diferenca > 0 ? '+' : ''}{diferenca}kg
            </Text>
          </View>
        </View>

        {progresso_esperado && progresso_esperado.primeiro_mes && (
          <View style={styles.progressoCard}>
            <Text style={styles.progressoSubtitle}>Primeiro Mês</Text>
            {progresso_esperado.primeiro_mes.peso && (
              <View style={styles.progressoItem}>
                <Text style={styles.progressoItemLabel}>Peso:</Text>
                <Text style={styles.progressoItemValor}>
                  {progresso_esperado.primeiro_mes.peso > 0 ? '+' : ''}{progresso_esperado.primeiro_mes.peso}kg
                </Text>
              </View>
            )}
            {progresso_esperado.primeiro_mes.energia && (
              <View style={styles.progressoItem}>
                <Text style={styles.progressoItemLabel}>Energia:</Text>
                <Text style={styles.progressoItemValor}>{progresso_esperado.primeiro_mes.energia}</Text>
              </View>
            )}
          </View>
        )}

        {progresso_esperado && progresso_esperado.tres_meses && (
          <View style={styles.progressoCard}>
            <Text style={styles.progressoSubtitle}>Três Meses</Text>
            {progresso_esperado.tres_meses.peso && (
              <View style={styles.progressoItem}>
                <Text style={styles.progressoItemLabel}>Peso:</Text>
                <Text style={styles.progressoItemValor}>
                  {progresso_esperado.tres_meses.peso > 0 ? '+' : ''}{progresso_esperado.tres_meses.peso}kg
                </Text>
              </View>
            )}
            {progresso_esperado.tres_meses.composicao_corporal && (
              <View style={styles.progressoItem}>
                <Text style={styles.progressoItemLabel}>Composição:</Text>
                <Text style={styles.progressoItemValor}>{progresso_esperado.tres_meses.composicao_corporal}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Carregando suas metas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
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
            <Text style={styles.headerTitle}>Metas Nutricionais</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Opções das Metas',
                'Escolha uma opção:',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Gerar Novas Metas', 
                    onPress: () => gerarMetasComIA(),
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

      {!metas ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="flag" size={64} color={colors.neutral[400]} />
          <Text style={styles.emptyTitle}>Crie suas metas nutricionais com IA Bazeada no seu perfil</Text>
          <TouchableOpacity 
            style={[componentStyles.button.primary, styles.generateButton]}
            onPress={gerarMetasComIA}
            disabled={gerandoIA}
          >
            {gerandoIA ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="psychology" size={20} color="white" />
                <Text style={styles.generateButtonText}>Gerar com IA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Resumo das Metas */}
          <View style={styles.resumoContainer}>
            <Text style={styles.sectionTitle}>Resumo das Metas</Text>
            <View style={styles.resumoCard}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Calorias Diárias</Text>
                <Text style={styles.resumoValor}>{metas.calorias_diarias || 'N/A'} kcal</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Duração</Text>
                <Text style={styles.resumoValor}>{metas.dias || 'N/A'} dias</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Objetivo</Text>
                <Text style={styles.resumoValor}>
                  {metas.objetivo === 'emagrecer' ? 'Emagrecer' : 
                   metas.objetivo === 'ganhar_massa' ? 'Ganhar Massa' : 
                   metas.objetivo === 'manter_peso' ? 'Manter Peso' : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Macronutrientes */}
          {metas.macronutrientes && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Macronutrientes</Text>
              {metas.macronutrientes.proteinas && renderizarCardMacronutriente({
                titulo: 'Proteínas',
                dados: metas.macronutrientes.proteinas,
                cor: colors.accent.blue,
                icone: 'drumstick-bite'
              })}
              {metas.macronutrientes.carboidratos && renderizarCardMacronutriente({
                titulo: 'Carboidratos',
                dados: metas.macronutrientes.carboidratos,
                cor: colors.accent.green,
                icone: 'bread-slice'
              })}
              {metas.macronutrientes.gorduras && renderizarCardMacronutriente({
                titulo: 'Gorduras',
                dados: metas.macronutrientes.gorduras,
                cor: colors.accent.orange,
                icone: 'seedling'
              })}
            </View>
          )}

          {/* Micronutrientes */}
          {metas.micronutrientes && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Micronutrientes</Text>
              
                             {metas.micronutrientes.fibras && (
                 <View style={styles.cardMicronutriente}>
                   <View style={styles.micronutrienteHeader}>
                     <Text style={styles.micronutrienteTitle}>Fibras</Text>
                     <Text style={styles.micronutrienteValor}>{metas.micronutrientes.fibras.gramas}g/dia</Text>
                   </View>
                 </View>
               )}

               {metas.micronutrientes.agua && (
                 <View style={styles.cardMicronutriente}>
                   <View style={styles.micronutrienteHeader}>
                     <Text style={styles.micronutrienteTitle}>Água</Text>
                     <Text style={styles.micronutrienteValor}>{metas.micronutrientes.agua.litros}L/dia</Text>
                   </View>
                 </View>
               )}

              {/* Renderizar outras vitaminas e minerais */}
              {metas.micronutrientes && Object.entries(metas.micronutrientes).map(([key, valor]) => {
                if (key === 'fibras' || key === 'agua' || !valor) return null;
                return (
                  <View key={`micronutriente-${key}`}>
                    {renderizarCardVitamina({
                      titulo: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      dados: valor,
                      cor: colors.accent.purple
                    })}
                  </View>
                );
              })}
            </View>
          )}

          {/* Estratégias */}
          {metas.estrategias && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Estratégias Nutricionais</Text>
              {metas.estrategias.frequencia_refeicoes && renderizarCardEstrategia({
                titulo: 'Frequência de Refeições',
                valor: `${metas.estrategias.frequencia_refeicoes} refeições por dia`,
                icone: 'schedule',
                cor: colors.accent.blue
              })}
              {metas.estrategias.pre_treino && renderizarCardEstrategia({
                titulo: 'Pré-Treino',
                valor: metas.estrategias.pre_treino,
                icone: 'fitness-center',
                cor: colors.accent.green
              })}
              {metas.estrategias.pos_treino && renderizarCardEstrategia({
                titulo: 'Pós-Treino',
                valor: metas.estrategias.pos_treino,
                icone: 'restore',
                cor: colors.accent.orange
              })}
              {metas.estrategias.hidratacao && renderizarCardEstrategia({
                titulo: 'Hidratação',
                valor: metas.estrategias.hidratacao,
                icone: 'local-drink',
                cor: colors.accent.blue
              })}
            </View>
          )}

          

          {/* Progresso Esperado */}
          {renderizarProgresso()}
        </>
      )}
      
      <View style={styles.content}>
        
      </View>
      </ScrollView>
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
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[900],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.neutral[400],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  generateButtonText: {
    color: 'white',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  resumoContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resumoCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resumoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
  },
  resumoValor: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
  sectionContainer: {
    padding: spacing.lg,
  },
  cardMacronutriente: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
  cardValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.blue,
  },
  cardPercentual: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
  fontesContainer: {
    marginTop: spacing.sm,
  },
  fontesTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[300],
    marginBottom: spacing.xs,
  },
  fontesText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.relaxed,
  },
  cardVitamina: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  vitaminaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  vitaminaTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    textTransform: 'capitalize',
  },
  vitaminaQuantidade: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.purple,
  },
  
  cardMicronutriente: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  micronutrienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  micronutrienteTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
  micronutrienteValor: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.purple,
  },
  
  cardEstrategia: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  estrategiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  estrategiaTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginLeft: spacing.sm,
  },
  estrategiaValor: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginLeft: spacing.xl,
  },
  
  progressoContainer: {
    padding: spacing.lg,
  },
  progressoTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  progressoCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  progressoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  progressoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
  },
  progressoValor: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
  progressoSubtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginBottom: spacing.sm,
  },
  progressoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  progressoItemLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
  progressoItemValor: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[300],
  },

});