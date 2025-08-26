import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  ScrollView, 
  Dimensions,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaDiario({ navigation }) {
  const { usuario } = usarAutenticacao();
  
  // Estados para os dados do diário
  const [dataAtual, setDataAtual] = useState(new Date());
  const [caloriasMeta, setCaloriasMeta] = useState(2290);
  const [caloriasAlimentos, setCaloriasAlimentos] = useState(0);
  const [caloriasExercicio, setCaloriasExercicio] = useState(0);
  const [caloriasRestantes, setCaloriasRestantes] = useState(2290);
  const [aguaConsumida, setAguaConsumida] = useState(0);
  const [metaAgua, setMetaAgua] = useState(2000); // 2L por dia - Meta fixa
  const [modalAguaVisivel, setModalAguaVisivel] = useState(false);
  const [quantidadeAgua, setQuantidadeAgua] = useState('');

  // Calcular calorias restantes
  useEffect(() => {
    const restantes = caloriasMeta - caloriasAlimentos + caloriasExercicio;
    setCaloriasRestantes(Math.max(0, restantes));
  }, [caloriasMeta, caloriasAlimentos, caloriasExercicio]);

  // Funções de navegação
  const navegarParaRefeicoes = () => {
    navigation.navigate('Refeicoes');
  };

  const navegarParaExercicios = () => {
    Alert.alert('Exercícios', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaAgua = () => {
    Alert.alert('Controle de Água', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaNutricao = () => {
    Alert.alert('Nutrição', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaObservacoes = () => {
    Alert.alert('Observações', 'Funcionalidade em desenvolvimento');
  };

  const navegarParaJejum = () => {
    Alert.alert('Jejum Intermitente', 'Funcionalidade em desenvolvimento');
  };

  // Funções de adição
  const adicionarAlimento = (refeicao) => {
    Alert.alert(`Adicionar ${refeicao}`, 'Funcionalidade em desenvolvimento');
  };

  const adicionarExercicio = () => {
    Alert.alert('Adicionar Exercício', 'Funcionalidade em desenvolvimento');
  };

  const adicionarAgua = () => {
    setModalAguaVisivel(true);
  };

  const salvarAgua = () => {
    if (quantidadeAgua && !isNaN(quantidadeAgua)) {
      const quantidade = parseInt(quantidadeAgua);
      setAguaConsumida(aguaConsumida + quantidade);
      setQuantidadeAgua('');
    }
    
    setModalAguaVisivel(false);
  };

  const cancelarAgua = () => {
    setModalAguaVisivel(false);
    setQuantidadeAgua('');
  };

  // Formatar data
  const formatarData = (data) => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return data.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  // Navegar entre datas
  const navegarData = (direcao) => {
    const novaData = new Date(dataAtual);
    if (direcao === 'anterior') {
      novaData.setDate(dataAtual.getDate() - 1);
    } else {
      novaData.setDate(dataAtual.getDate() + 1);
    }
    setDataAtual(novaData);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Header com status e navegação de data */}
      <View style={styles.header}>
        <View style={styles.statusBar}>
          <Text style={styles.hora}>14:31</Text>
          <View style={styles.statusIcons}>
            <View style={styles.statusIcon}>
              <Ionicons name="cellular" size={16} color={colors.neutral[50]} />
            </View>
            <View style={styles.statusIcon}>
              <Ionicons name="wifi" size={16} color={colors.neutral[50]} />
            </View>
            <View style={styles.statusIcon}>
              <Ionicons name="battery-half" size={16} color={colors.neutral[50]} />
              <Text style={styles.bateriaTexto}>24</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.navegacaoData}>
          <TouchableOpacity onPress={() => navegarData('anterior')}>
            <MaterialIcons name="chevron-left" size={24} color={colors.neutral[50]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.selectorData}>
            <Text style={styles.textoData}>{formatarData(dataAtual)}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.neutral[50]} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navegarData('proximo')}>
            <MaterialIcons name="chevron-right" size={24} color={colors.neutral[50]} />
          </TouchableOpacity>
        </View>
        
        
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudoScroll}
      >
        {/* Seção de Calorias */}
        <View style={styles.secaoCalorias}>
          <Text style={styles.tituloCalorias}>Calorias restantes</Text>
          
          <View style={styles.calculoCalorias}>
            <View style={styles.itemCaloria}>
              <Text style={styles.valorCaloria}>{caloriasMeta}</Text>
              <Text style={styles.labelCaloria}>Meta</Text>
            </View>
            
            <Text style={styles.operador}>-</Text>
            
            <View style={styles.itemCaloria}>
              <Text style={styles.valorCaloria}>{caloriasAlimentos}</Text>
              <Text style={styles.labelCaloria}>Alimentos</Text>
            </View>
            
            <Text style={styles.operador}>+</Text>
            
            <View style={styles.itemCaloria}>
              <Text style={styles.valorCaloria}>{caloriasExercicio}</Text>
              <Text style={styles.labelCaloria}>Exercício</Text>
            </View>
            
            <Text style={styles.operador}>=</Text>
            
            <View style={styles.itemCaloria}>
              <Text style={[styles.valorCaloria, styles.valorRestante]}>{caloriasRestantes}</Text>
              <Text style={styles.labelCaloria}>Restantes</Text>
            </View>
          </View>
        </View>



        {/* Seção de Café da Manhã */}
        <View style={styles.secaoRefeicao}>
          <View style={styles.cabecalhoRefeicao}>
            <Text style={styles.tituloRefeicao}>Café da Manhã</Text>
            <TouchableOpacity style={styles.botaoOpcoes}>
              <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
                     <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
             <Text style={styles.textoBotaoAdicionar}>ADICIONAR ALIMENTO</Text>
           </TouchableOpacity>
        </View>

        {/* Seção de Almoço */}
        <View style={styles.secaoRefeicao}>
          <View style={styles.cabecalhoRefeicao}>
            <Text style={styles.tituloRefeicao}>Almoço</Text>
            <TouchableOpacity style={styles.botaoOpcoes}>
              <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
                     <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
             <Text style={styles.textoBotaoAdicionar}>ADICIONAR ALIMENTO</Text>
           </TouchableOpacity>
        </View>

        {/* Seção de Jantar */}
        <View style={styles.secaoRefeicao}>
          <View style={styles.cabecalhoRefeicao}>
            <Text style={styles.tituloRefeicao}>Jantar</Text>
            <TouchableOpacity style={styles.botaoOpcoes}>
              <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
                     <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
             <Text style={styles.textoBotaoAdicionar}>ADICIONAR ALIMENTO</Text>
           </TouchableOpacity>
        </View>

        {/* Seção de Lanches */}
        <View style={styles.secaoRefeicao}>
          <View style={styles.cabecalhoRefeicao}>
            <Text style={styles.tituloRefeicao}>Lanches</Text>
            <TouchableOpacity style={styles.botaoOpcoes}>
              <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
                     <TouchableOpacity style={styles.botaoAdicionar} onPress={() => navigation.navigate('Refeicoes')}>
             <Text style={styles.textoBotaoAdicionar}>ADICIONAR ALIMENTO</Text>
           </TouchableOpacity>
        </View>

        {/* Seção de Água */}
        <View style={styles.secaoRefeicao}>
          <View style={styles.cabecalhoRefeicao}>
            <Text style={styles.tituloRefeicao}>Água</Text>
            <TouchableOpacity style={styles.botaoOpcoes}>
              <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarAgua}>
            <Text style={styles.textoBotaoAdicionar}>ADICIONAR ÁGUA</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Exercícios */}
        <View style={styles.secaoRefeicao}>
          <View style={styles.cabecalhoRefeicao}>
            <Text style={styles.tituloRefeicao}>Exercício</Text>
            <TouchableOpacity style={styles.botaoOpcoes}>
              <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarExercicio}>
            <Text style={styles.textoBotaoAdicionar}>ADICIONAR EXERCÍCIO</Text>
          </TouchableOpacity>
        </View>

        

        {/* Botões de Ação */}
        <View style={styles.botoesAcao}>
          <TouchableOpacity style={styles.botaoAcao} onPress={navegarParaNutricao}>
            <Text style={styles.textoBotaoAcao}>NUTRIÇÃO</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.botaoAcao} onPress={navegarParaObservacoes}>
            <Text style={styles.textoBotaoAcao}>OBSERVAÇÕES</Text>
          </TouchableOpacity>
                 </View>
       </ScrollView>

       {/* Modal de Adicionar Água */}
       <Modal
         visible={modalAguaVisivel}
         transparent={true}
         animationType="slide"
         onRequestClose={cancelarAgua}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContainer}>
             <Text style={styles.modalTitulo}>Controle de Água</Text>
             
                           <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantidade (ml):</Text>
                <TextInput
                  style={styles.input}
                  value={quantidadeAgua}
                  onChangeText={setQuantidadeAgua}
                  placeholder="Ex: 250"
                  placeholderTextColor={colors.neutral[400]}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Meta diária: {metaAgua}ml</Text>
                <Text style={styles.metaInfo}>Meta fixa de água por dia</Text>
              </View>
             
             <View style={styles.modalBotoes}>
               <TouchableOpacity style={styles.botaoCancelar} onPress={cancelarAgua}>
                 <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
               </TouchableOpacity>
               
               <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAgua}>
                 <Text style={styles.textoBotaoSalvar}>Salvar</Text>
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

  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[800],
  },

  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  hora: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[50],
    fontWeight: typography.fontWeight.medium,
  },

  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  statusIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  bateriaTexto: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[50],
    marginLeft: 2,
  },

  navegacaoData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  selectorData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  textoData: {
    fontSize: typography.fontSize.lg,
    color: colors.neutral[50],
    fontWeight: typography.fontWeight.semibold,
  },

  indicadoresRapidos: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  indicador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  indicadorTexto: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[50],
    fontWeight: typography.fontWeight.medium,
  },

  scrollView: {
    flex: 1,
  },

  conteudoScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  secaoCalorias: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  tituloCalorias: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  calculoCalorias: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  itemCaloria: {
    alignItems: 'center',
    flex: 1,
    minWidth: 60,
  },

  valorCaloria: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },

  valorRestante: {
    color: colors.primary[400],
  },

  labelCaloria: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[50],
    textAlign: 'center',
  },

  operador: {
    fontSize: typography.fontSize.xl,
    color: colors.neutral[50],
    fontWeight: typography.fontWeight.bold,
    marginHorizontal: spacing.sm,
  },



  secaoRefeicao: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.base,
  },

  cabecalhoRefeicao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  tituloRefeicao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  botaoOpcoes: {
    padding: spacing.xs,
  },

  botaoAdicionar: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minHeight: 50,
  },

  textoBotaoAdicionar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  secaoJejum: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.base,
  },

  cabecalhoJejum: {
    marginBottom: spacing.md,
  },

  tagNovo: {
    backgroundColor: colors.primary[600],
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.full,
    marginBottom: spacing.sm,
  },

  textoTagNovo: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  tituloJejum: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.sm,
  },

  descricaoJejum: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.lg,
  },

  rodapeJejum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botaoJejum: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  textoBotaoJejum: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  ilustracaoJejum: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  ampulheta: {
    width: 30,
    height: 40,
    backgroundColor: colors.primary[400],
    borderRadius: borders.radius.sm,
  },

  maca: {
    width: 25,
    height: 25,
    backgroundColor: colors.error,
    borderRadius: borders.radius.full,
  },

  botoesAcao: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  botaoAcao: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary[600],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

     textoBotaoAcao: {
     fontSize: typography.fontSize.base,
     fontWeight: typography.fontWeight.semibold,
     color: colors.neutral[50],
   },

   // Estilos do Modal de Água
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
   },

   modalContainer: {
     backgroundColor: colors.neutral[800],
     borderRadius: borders.radius.lg,
     padding: spacing.xl,
     width: '85%',
     maxWidth: 400,
     ...shadows.lg,
   },

   modalTitulo: {
     fontSize: typography.fontSize.xl,
     fontWeight: typography.fontWeight.bold,
     color: colors.neutral[50],
     textAlign: 'center',
     marginBottom: spacing.lg,
   },

   inputContainer: {
     marginBottom: spacing.lg,
   },

   inputLabel: {
     fontSize: typography.fontSize.base,
     fontWeight: typography.fontWeight.medium,
     color: colors.neutral[50],
     marginBottom: spacing.sm,
   },

   metaInfo: {
     fontSize: typography.fontSize.sm,
     color: colors.neutral[400],
     fontStyle: 'italic',
   },

   input: {
     backgroundColor: colors.neutral[700],
     borderRadius: borders.radius.md,
     padding: spacing.md,
     fontSize: typography.fontSize.base,
     color: colors.neutral[50],
     borderWidth: 1,
     borderColor: colors.neutral[600],
   },

   modalBotoes: {
     flexDirection: 'row',
     gap: spacing.md,
     marginTop: spacing.lg,
   },

   botaoCancelar: {
     flex: 1,
     backgroundColor: colors.neutral[600],
     borderRadius: borders.radius.md,
     paddingVertical: spacing.md,
     alignItems: 'center',
   },

   textoBotaoCancelar: {
     fontSize: typography.fontSize.base,
     fontWeight: typography.fontWeight.semibold,
     color: colors.neutral[50],
   },

   botaoSalvar: {
     flex: 1,
     backgroundColor: colors.primary[600],
     borderRadius: borders.radius.md,
     paddingVertical: spacing.md,
     alignItems: 'center',
   },

   textoBotaoSalvar: {
     fontSize: typography.fontSize.base,
     fontWeight: typography.fontWeight.semibold,
     color: colors.neutral[50],
   },
 });
