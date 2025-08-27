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

  // Estados para os dados do quiz
  const [dadosQuiz, setDadosQuiz] = useState({
    idade: '',
    sexo: '',
    altura: '',
    peso_atual: '',
    peso_meta: '',
    objetivo: '',
    nivel_atividade: '',
    frequencia_treino: '',
    acesso_academia: '',
    dieta_atual: '',
    preferencias: {},
    habitos_alimentares: {},
    restricoes_medicas: {},
    historico_exercicios: '',
    tipo_treino_preferido: {},
    horario_preferido: '',
    duracao_treino: '',
    metas_especificas: {},
    motivacao: '',
    obstaculos: {}
  });
  
  // Estados para edição
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [campoEditando, setCampoEditando] = useState(null);
  const [valorEditando, setValorEditando] = useState('');
  const [tipoCampo, setTipoCampo] = useState('texto'); // texto, numero, selecao

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

      // Buscar dados do quiz
      const quizData = await buscarApi('/api/quiz', { token });
      if (quizData) {
        setDadosQuiz(quizData);
        
        // Atualizar dados do usuário com informações do quiz
        setDadosUsuario(prev => ({
          ...prev,
          idade: quizData.idade || prev.idade,
          peso: quizData.peso_atual || prev.peso,
          altura: quizData.altura || prev.altura,
          sexo: quizData.sexo || prev.sexo,
          nivelAtividade: quizData.nivel_atividade || prev.nivelAtividade,
          objetivo: quizData.objetivo || prev.objetivo
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
      if (quizData?.peso_atual && quizData?.altura) {
        const imcCalculado = calcularIMC(quizData.peso_atual, quizData.altura);
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

  const formatarValor = (valor, campo) => {
    if (!valor || !campo) return 'Não informado';
    
    switch (campo) {
      case 'sexo':
        return valor === 'M' ? 'Masculino' : valor === 'F' ? 'Feminino' : valor;
      case 'objetivo':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'nivel_atividade':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'frequencia_treino':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'acesso_academia':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'dieta_atual':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'historico_exercicios':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'motivacao':
        return valor.charAt(0).toUpperCase() + valor.slice(1);
      case 'preferencias':
      case 'habitos_alimentares':
      case 'restricoes_medicas':
      case 'tipo_treino_preferido':
      case 'metas_especificas':
      case 'obstaculos':
        if (typeof valor === 'object' && valor !== null) {
          const chaves = Object.keys(valor);
          if (chaves.length === 0) return 'Não informado';
          return chaves.join(', ');
        }
        return valor;
      default:
        return valor;
    }
  };

  const obterUnidade = (campo) => {
    if (!campo) return '';
    
    switch (campo) {
      case 'idade': return 'anos';
      case 'altura': return 'm';
      case 'peso_atual':
      case 'peso_meta': return 'kg';
      case 'duracao_treino': return 'min';
      default: return '';
    }
  };

  const obterIcone = (campo) => {
    if (!campo) return 'info';
    
    switch (campo) {
      case 'idade': return 'cake';
      case 'sexo': return 'wc';
      case 'altura': return 'height';
      case 'peso_atual':
      case 'peso_meta': return 'monitor-weight';
      case 'objetivo': return 'flag';
      case 'nivel_atividade': return 'directions-run';
      case 'frequencia_treino': return 'schedule';
      case 'acesso_academia': return 'fitness-center';
      case 'dieta_atual': return 'restaurant';
      case 'preferencias': return 'favorite';
      case 'habitos_alimentares': return 'local-dining';
      case 'restricoes_medicas': return 'medical-services';
      case 'historico_exercicios': return 'history';
      case 'tipo_treino_preferido': return 'sports';
      case 'horario_preferido': return 'access-time';
      case 'duracao_treino': return 'timer';
      case 'metas_especificas': return 'target';
      case 'motivacao': return 'psychology';
      case 'obstaculos': return 'warning';
      default: return 'info';
    }
  };

  const obterCor = (campo) => {
    if (!campo) return colors.neutral[500];
    
    const cores = [
      colors.primary[600],
      colors.accent.blue,
      colors.accent.purple,
      colors.accent.pink,
      colors.accent.green,
      colors.accent.cyan,
      colors.accent.orange,
      colors.accent.yellow,
      colors.success,
      colors.warning,
      colors.error
    ];
    
    const index = campo.length % cores.length;
    return cores[index];
  };

  const abrirModalEditar = (campo, valor, tipo = 'texto') => {
    if (!campo) return;
    
    setCampoEditando(campo);
    setValorEditando(valor || '');
    setTipoCampo(tipo);
    setModalEditar(true);
  };

  const fecharModalEditar = () => {
    setModalEditar(false);
    setCampoEditando(null);
    setValorEditando('');
    setTipoCampo('texto');
  };

  const salvarEdicao = async () => {
    if (!campoEditando || !valorEditando.trim()) {
      Alert.alert('Erro', 'O campo não pode estar vazio');
      return;
    }

    setSalvando(true);
    try {
      const dadosAtualizados = { [campoEditando]: valorEditando };
      
      // Atualizar no backend - quiz
      await buscarApi('/api/quiz', {
        method: 'POST',
        token,
        body: dadosAtualizados
      });

      // Atualizar estado local
      setDadosQuiz(prev => ({
        ...prev,
        ...dadosAtualizados
      }));

      // Atualizar dados do usuário se for um campo relevante
      if (campoEditando && ['idade', 'peso_atual', 'altura', 'sexo', 'nivel_atividade', 'objetivo'].includes(campoEditando)) {
        setDadosUsuario(prev => ({
          ...prev,
          idade: campoEditando === 'idade' ? valorEditando : prev.idade,
          peso: campoEditando === 'peso_atual' ? valorEditando : prev.peso,
          altura: campoEditando === 'altura' ? valorEditando : prev.altura,
          sexo: campoEditando === 'sexo' ? valorEditando : prev.sexo,
          nivelAtividade: campoEditando === 'nivel_atividade' ? valorEditando : prev.nivelAtividade,
          objetivo: campoEditando === 'objetivo' ? valorEditando : prev.objetivo
        }));
      }

      // Recalcular IMC se peso ou altura foram alterados
      if (campoEditando && (campoEditando === 'peso_atual' || campoEditando === 'altura')) {
        const novoPeso = campoEditando === 'peso_atual' ? valorEditando : dadosQuiz.peso_atual;
        const novaAltura = campoEditando === 'altura' ? valorEditando : dadosQuiz.altura;
        const novoIMC = calcularIMC(novoPeso, novaAltura);
        setDadosUsuario(prev => ({
          ...prev,
          imc: novoIMC
        }));
        
        // Atualizar também o peso no estado do usuário
        if (campoEditando === 'peso_atual') {
          setDadosUsuario(prev => ({
            ...prev,
            peso: valorEditando
          }));
        }
      }

      fecharModalEditar();
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    } finally {
      setSalvando(false);
    }
  };

  const renderizarCardDados = ({ titulo, valor, icone, cor, editavel = true, unidade = '', onPress = null }) => {
    if (!titulo) return null;
    
    return (
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
              {unidade && valor && valor !== 'Não informado' && ` ${unidade}`}
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
  };

  const renderizarCardIMC = () => {
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
          </View>
        </View>
      </View>
    );
  };

  const renderizarSecaoQuiz = (titulo, campos) => (
    <View style={estilos.secao}>
      <Text style={estilos.tituloSecao}>{titulo}</Text>
      
      {campos.map((campo) => {
        if (!campo) return null;
        
        const tipoCampo = ['idade', 'altura', 'peso_atual', 'peso_meta', 'duracao_treino'].includes(campo) ? 'numero' : 'texto';
        
        return (
          <View key={campo}>
            {renderizarCardDados({
              titulo: campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              valor: formatarValor(dadosQuiz[campo], campo),
              icone: obterIcone(campo),
              cor: obterCor(campo),
              editavel: true,
              unidade: obterUnidade(campo),
              onPress: () => abrirModalEditar(campo, dadosQuiz[campo], tipoCampo)
            })}
          </View>
        );
      })}
    </View>
  );

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
                valor: dadosQuiz.idade,
                icone: 'cake',
                cor: colors.accent.purple,
                unidade: 'anos',
                onPress: () => abrirModalEditar('idade', dadosQuiz.idade, 'numero')
              })}
              
              {renderizarCardDados({
                titulo: 'Sexo',
                valor: formatarValor(dadosQuiz.sexo, 'sexo'),
                icone: 'wc',
                cor: colors.accent.pink,
                onPress: () => abrirModalEditar('sexo', dadosQuiz.sexo, 'selecao')
              })}
            </View>

            {/* Medidas físicas */}
            <View style={estilos.secao}>
              <Text style={estilos.tituloSecao}>Medidas Físicas</Text>
              
              {renderizarCardDados({
                titulo: 'Peso Atual',
                valor: dadosQuiz.peso_atual,
                icone: 'monitor-weight',
                cor: colors.accent.green,
                unidade: 'kg',
                onPress: () => abrirModalEditar('peso_atual', dadosQuiz.peso_atual, 'numero')
              })}
              
              {renderizarCardDados({
                titulo: 'Peso Meta',
                valor: dadosQuiz.peso_meta,
                icone: 'flag',
                cor: colors.accent.yellow,
                unidade: 'kg',
                onPress: () => abrirModalEditar('peso_meta', dadosQuiz.peso_meta, 'numero')
              })}
              
              {renderizarCardDados({
                titulo: 'Altura',
                valor: dadosQuiz.altura,
                icone: 'height',
                cor: colors.accent.cyan,
                unidade: 'm',
                onPress: () => abrirModalEditar('altura', dadosQuiz.altura, 'numero')
              })}
              
              {renderizarCardIMC()}
            </View>

            {/* Objetivos e preferências */}
            {renderizarSecaoQuiz('Objetivos e Preferências', [
              'objetivo',
              'nivel_atividade',
              'frequencia_treino',
              'acesso_academia',
              'dieta_atual'
            ])}

            {/* Treinos */}
            {renderizarSecaoQuiz('Preferências de Treino', [
              'historico_exercicios',
              'tipo_treino_preferido',
              'horario_preferido',
              'duracao_treino'
            ])}

            {/* Hábitos e restrições */}
            {renderizarSecaoQuiz('Hábitos e Restrições', [
              'preferencias',
              'habitos_alimentares',
              'restricoes_medicas'
            ])}

            {/* Metas e motivação */}
            {renderizarSecaoQuiz('Metas e Motivação', [
              'metas_especificas',
              'motivacao',
              'obstaculos'
            ])}

            {/* Preferências e objetivos */}
            <View style={estilos.secao}>
              <Text style={estilos.tituloSecao}>Preferências e Objetivos</Text>
              
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
                Editar {campoEditando?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <TouchableOpacity onPress={fecharModalEditar} style={estilos.botaoFechar}>
                <MaterialIcons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={estilos.inputContainer}>
              <Text style={estilos.inputLabel}>
                {campoEditando?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {obterUnidade(campoEditando) && ` (${obterUnidade(campoEditando)})`}
              </Text>
              
              {tipoCampo === 'selecao' && campoEditando === 'sexo' ? (
                <View style={estilos.selecaoContainer}>
                  <TouchableOpacity 
                    style={[
                      estilos.opcaoSelecao,
                      valorEditando === 'M' && estilos.opcaoSelecionada
                    ]}
                    onPress={() => setValorEditando('M')}
                  >
                    <Text style={[
                      estilos.textoOpcao,
                      valorEditando === 'M' && estilos.textoOpcaoSelecionada
                    ]}>Masculino</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      estilos.opcaoSelecao,
                      valorEditando === 'F' && estilos.opcaoSelecionada
                    ]}
                    onPress={() => setValorEditando('F')}
                  >
                    <Text style={[
                      estilos.textoOpcao,
                      valorEditando === 'F' && estilos.textoOpcaoSelecionada
                    ]}>Feminino</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TextInput
                  style={estilos.input}
                  value={valorEditando}
                  onChangeText={setValorEditando}
                  placeholder={`Digite ${campoEditando?.replace(/_/g, ' ').toLowerCase()}`}
                  placeholderTextColor={colors.neutral[400]}
                  keyboardType={tipoCampo === 'numero' ? 'numeric' : 'default'}
                  autoFocus={true}
                />
              )}
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

  // Seleção de opções
  selecaoContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },

  opcaoSelecao: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  opcaoSelecionada: {
    backgroundColor: colors.primary[600],
    borderWidth: 1,
    borderColor: colors.primary[600],
  },

  textoOpcao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[50],
  },

  textoOpcaoSelecionada: {
    color: colors.neutral[50],
  },
}); 