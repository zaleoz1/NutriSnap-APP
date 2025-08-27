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
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaMeusDados({ navigation }) {
  const { usuario, token } = usarAutenticacao();
  
  // Estados para os dados do usuário
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    idade: '',
    peso: '',
    altura: '',
    imc: '',
    sexo: 'M',
    nivelAtividade: 'moderado',
    objetivo: 'manter',
    metaCalorias: 0
  });
  
  // Estados para edição
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [campoEditando, setCampoEditando] = useState(null);
  const [valorEditando, setValorEditando] = useState('');

  // Carregar dados do usuário
  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    setCarregando(true);
    try {
      // Buscar dados pessoais
      const dadosPessoais = await buscarApi('/api/usuarios/perfil', { token });
      if (dadosPessoais) {
        setDadosUsuario(prev => ({
          ...prev,
          ...dadosPessoais
        }));
      }

      // Buscar meta de calorias
      const meta = await buscarApi('/api/metas', { token });
      if (meta?.calorias_diarias) {
        setDadosUsuario(prev => ({
          ...prev,
          metaCalorias: meta.calorias_diarias
        }));
      }

      // Calcular IMC se peso e altura estiverem disponíveis
      if (dadosPessoais?.peso && dadosPessoais?.altura) {
        const imcCalculado = calcularIMC(dadosPessoais.peso, dadosPessoais.altura);
        setDadosUsuario(prev => ({
          ...prev,
          imc: imcCalculado
        }));
      }
    } catch (erro) {
      console.log('Erro ao carregar dados:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    const imc = peso / (altura * altura);
    return imc.toFixed(1);
  };

  const obterClassificacaoIMC = (imc) => {
    if (!imc) return 'Não calculado';
    const valor = parseFloat(imc);
    if (valor < 18.5) return 'Abaixo do peso';
    if (valor < 25) return 'Peso normal';
    if (valor < 30) return 'Sobrepeso';
    if (valor < 35) return 'Obesidade I';
    if (valor < 40) return 'Obesidade II';
    return 'Obesidade III';
  };

  const obterCorIMC = (imc) => {
    if (!imc) return colors.neutral[500];
    const valor = parseFloat(imc);
    if (valor < 18.5) return colors.accent.blue;
    if (valor < 25) return colors.success;
    if (valor < 30) return colors.accent.yellow;
    if (valor < 35) return colors.accent.orange;
    if (valor < 40) return colors.accent.red;
    return colors.error;
  };

  const abrirModalEditar = (campo, valor) => {
    setCampoEditando(campo);
    setValorEditando(valor || '');
    setModalEditar(true);
  };

  const fecharModalEditar = () => {
    setModalEditar(false);
    setCampoEditando(null);
    setValorEditando('');
  };

  const salvarEdicao = async () => {
    if (!valorEditando.trim()) {
      Alert.alert('Erro', 'O campo não pode estar vazio');
      return;
    }

    setSalvando(true);
    try {
      const dadosAtualizados = { [campoEditando]: valorEditando };
      
      // Atualizar no backend
      await buscarApi('/api/usuarios/perfil', {
        method: 'PUT',
        token,
        body: dadosAtualizados
      });

      // Atualizar estado local
      setDadosUsuario(prev => ({
        ...prev,
        ...dadosAtualizados
      }));

      // Recalcular IMC se peso ou altura foram alterados
      if (campoEditando === 'peso' || campoEditando === 'altura') {
        const novoPeso = campoEditando === 'peso' ? valorEditando : dadosUsuario.peso;
        const novaAltura = campoEditando === 'altura' ? valorEditando : dadosUsuario.altura;
        const novoIMC = calcularIMC(novoPeso, novaAltura);
        setDadosUsuario(prev => ({
          ...prev,
          imc: novoIMC
        }));
      }

      fecharModalEditar();
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    } finally {
      setSalvando(false);
    }
  };

  const renderizarCardDados = ({ titulo, valor, icone, cor, editavel = true, unidade = '', onPress = null }) => (
    <TouchableOpacity 
      style={[
        estilos.cardDado,
        editavel && estilos.cardEditavel
      ]}
      onPress={editavel ? onPress : undefined}
      activeOpacity={editavel ? 0.7 : 1}
    >
      <View style={estilos.cabecalhoCard}>
        <View style={[estilos.iconeCard, { backgroundColor: cor + '15' }]}>
          <MaterialIcons name={icone} size={24} color={cor} />
        </View>
        <View style={estilos.informacoesCard}>
          <Text style={estilos.tituloCard}>{titulo}</Text>
          <Text style={estilos.valorCard}>
            {valor || 'Não informado'}
            {unidade && valor && ` ${unidade}`}
          </Text>
        </View>
        {editavel && (
          <TouchableOpacity style={estilos.botaoEditar}>
            <MaterialIcons name="edit" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderizarCardIMC = () => {
    const classificacao = obterClassificacaoIMC(dadosUsuario.imc);
    const corIMC = obterCorIMC(dadosUsuario.imc);
    
    return (
      <View style={estilos.cardIMC}>
        <View style={estilos.cabecalhoCard}>
          <View style={[estilos.iconeCard, { backgroundColor: corIMC + '15' }]}>
            <MaterialIcons name="analytics" size={24} color={corIMC} />
          </View>
          <View style={estilos.informacoesCard}>
            <Text style={estilos.tituloCard}>IMC</Text>
            <Text style={[estilos.valorCard, { color: corIMC }]}>
              {dadosUsuario.imc || 'Não calculado'}
              {dadosUsuario.imc && ' kg/m²'}
            </Text>
            {dadosUsuario.imc && (
              <Text style={[estilos.classificacaoIMC, { color: corIMC }]}>
                {classificacao}
              </Text>
            )}
          </View>
        </View>
        
        {dadosUsuario.imc && (
          <View style={estilos.legendaIMC}>
            <Text style={estilos.tituloLegenda}>Classificação IMC:</Text>
            <View style={estilos.itensLegenda}>
              <View style={estilos.itemLegenda}>
                <View style={[estilos.pontoLegenda, { backgroundColor: colors.accent.blue }]} />
                <Text style={estilos.textoLegenda}>Abaixo do peso: {'<'} 18.5</Text>
              </View>
              <View style={estilos.itemLegenda}>
                <View style={[estilos.pontoLegenda, { backgroundColor: colors.success }]} />
                <Text style={estilos.textoLegenda}>Normal: 18.5 - 24.9</Text>
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
        )}
      </View>
    );
  };

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Header com gradiente */}
      <View style={estilos.header}>
        <View style={estilos.cabecalhoHeader}>
          <TouchableOpacity 
            style={estilos.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.neutral[50]} />
          </TouchableOpacity>
          
          <Text style={estilos.tituloHeader}>Meus Dados</Text>
          
          <TouchableOpacity 
            style={estilos.botaoEditarPerfil}
            onPress={() => setEditando(!editando)}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={editando ? "check" : "edit"} 
              size={24} 
              color={colors.neutral[50]} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={estilos.subtituloHeader}>
          Gerencie suas informações pessoais e de saúde
        </Text>
      </View>

      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.conteudoScroll}
      >
        {carregando ? (
          <View style={estilos.containerCarregamento}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={estilos.textoCarregamento}>Carregando seus dados...</Text>
          </View>
        ) : (
          <>
            {/* Informações básicas */}
            <View style={estilos.secao}>
              <Text style={estilos.tituloSecao}>Informações Básicas</Text>
              
              {renderizarCardDados({
                titulo: 'Nome',
                valor: dadosUsuario.nome,
                icone: 'person',
                cor: colors.primary[600],
                editavel: false
              })}
              
              {renderizarCardDados({
                titulo: 'Email',
                valor: dadosUsuario.email,
                icone: 'email',
                cor: colors.accent.blue,
                editavel: false
              })}
              
              {renderizarCardDados({
                titulo: 'Idade',
                valor: dadosUsuario.idade,
                icone: 'cake',
                cor: colors.accent.purple,
                unidade: 'anos',
                onPress: () => abrirModalEditar('idade', dadosUsuario.idade)
              })}
              
              {renderizarCardDados({
                titulo: 'Sexo',
                valor: dadosUsuario.sexo === 'M' ? 'Masculino' : 'Feminino',
                icone: 'wc',
                cor: colors.accent.pink,
                editavel: false
              })}
            </View>

            {/* Medidas físicas */}
            <View style={estilos.secao}>
              <Text style={estilos.tituloSecao}>Medidas Físicas</Text>
              
              {renderizarCardDados({
                titulo: 'Peso',
                valor: dadosUsuario.peso,
                icone: 'monitor-weight',
                cor: colors.accent.green,
                unidade: 'kg',
                onPress: () => abrirModalEditar('peso', dadosUsuario.peso)
              })}
              
              {renderizarCardDados({
                titulo: 'Altura',
                valor: dadosUsuario.altura,
                icone: 'height',
                cor: colors.accent.cyan,
                unidade: 'm',
                onPress: () => abrirModalEditar('altura', dadosUsuario.altura)
              })}
              
              {renderizarCardIMC()}
            </View>

            {/* Preferências e objetivos */}
            <View style={estilos.secao}>
              <Text style={estilos.tituloSecao}>Preferências e Objetivos</Text>
              
              {renderizarCardDados({
                titulo: 'Nível de Atividade',
                valor: dadosUsuario.nivelAtividade?.charAt(0).toUpperCase() + dadosUsuario.nivelAtividade?.slice(1),
                icone: 'directions-run',
                cor: colors.accent.orange,
                editavel: false
              })}
              
              {renderizarCardDados({
                titulo: 'Objetivo',
                valor: dadosUsuario.objetivo?.charAt(0).toUpperCase() + dadosUsuario.objetivo?.slice(1),
                icone: 'flag',
                cor: colors.accent.yellow,
                editavel: false
              })}
              
              {renderizarCardDados({
                titulo: 'Meta de Calorias',
                valor: dadosUsuario.metaCalorias,
                icone: 'local-fire-department',
                cor: colors.error,
                unidade: 'kcal/dia',
                editavel: false
              })}
            </View>

            {/* Botões de ação */}
            <View style={estilos.botoesAcao}>
              <TouchableOpacity 
                style={estilos.botaoCalcularIMC}
                onPress={() => navigation.navigate('IMC')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="calculate" size={20} color={colors.neutral[50]} />
                <Text style={estilos.textoBotaoCalcularIMC}>Calcular IMC</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={estilos.botaoDefinirMetas}
                onPress={() => navigation.navigate('Metas')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="flag" size={20} color={colors.neutral[50]} />
                <Text style={estilos.textoBotaoDefinirMetas}>Definir Metas</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal de edição */}
      <Modal
        visible={modalEditar}
        transparent={true}
        animationType="fade"
        onRequestClose={fecharModalEditar}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContainer}>
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>
                Editar {campoEditando === 'idade' ? 'Idade' : 
                        campoEditando === 'peso' ? 'Peso' : 
                        campoEditando === 'altura' ? 'Altura' : 'Campo'}
              </Text>
              <TouchableOpacity onPress={fecharModalEditar} style={estilos.botaoFechar}>
                <MaterialIcons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={estilos.inputContainer}>
              <Text style={estilos.inputLabel}>
                {campoEditando === 'idade' ? 'Idade (anos)' : 
                 campoEditando === 'peso' ? 'Peso (kg)' : 
                 campoEditando === 'altura' ? 'Altura (metros)' : 'Valor'}
              </Text>
              <TextInput
                style={estilos.input}
                value={valorEditando}
                onChangeText={setValorEditando}
                placeholder={
                  campoEditando === 'idade' ? 'Ex: 25' : 
                  campoEditando === 'peso' ? 'Ex: 70.5' : 
                  campoEditando === 'altura' ? 'Ex: 1.75' : 'Digite o valor'
                }
                placeholderTextColor={colors.neutral[400]}
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>
            
            <View style={estilos.modalBotoes}>
              <TouchableOpacity style={estilos.botaoCancelar} onPress={fecharModalEditar}>
                <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  estilos.botaoSalvar,
                  salvando && estilos.botaoDesabilitado
                ]} 
                onPress={salvarEdicao}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color={colors.neutral[50]} size="small" />
                ) : (
                  <Text style={estilos.textoBotaoSalvar}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
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
  
  // Header com gradiente
  header: {
    backgroundColor: colors.primary[600],
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: spacing.lg,
    borderBottomRightRadius: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  
  cabecalhoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  botaoVoltar: {
    padding: spacing.sm,
  },
  
  tituloHeader: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    textAlign: 'center',
    flex: 1,
  },
  
  botaoEditarPerfil: {
    padding: spacing.sm,
  },
  
  subtituloHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[200],
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  
  // Container de carregamento
  containerCarregamento: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  
  textoCarregamento: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  // Seções
  secao: {
    marginBottom: spacing.xl,
  },
  
  tituloSecao: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.lg,
    textShadowColor: colors.neutral[900],
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Cards de dados
  cardDado: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  cardEditavel: {
    borderColor: colors.primary[600] + '30',
  },
  
  cabecalhoCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconeCard: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  informacoesCard: {
    flex: 1,
  },
  
  tituloCard: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
    marginBottom: spacing.xs,
  },
  
  valorCard: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  botaoEditar: {
    padding: spacing.sm,
  },
  
  // Card IMC especial
  cardIMC: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  classificacaoIMC: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  
  legendaIMC: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[700],
  },
  
  tituloLegenda: {
    fontSize: typography.fontSize.base,
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
  
  // Botões de ação
  botoesAcao: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  
  botaoCalcularIMC: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.lg,
    elevation: 8,
  },
  
  textoBotaoCalcularIMC: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  botaoDefinirMetas: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.green,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.lg,
    elevation: 8,
  },
  
  textoBotaoDefinirMetas: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  // Modal de edição
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  modalTitulo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    flex: 1,
  },
  
  botaoFechar: {
    padding: spacing.xs,
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
  
  input: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  
  modalBotoes: {
    flexDirection: 'row',
    gap: spacing.md,
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
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  botaoDesabilitado: {
    backgroundColor: colors.neutral[600],
  },
  
  textoBotaoSalvar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
});
