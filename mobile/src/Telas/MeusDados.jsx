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
  ActivityIndicator,
  RefreshControl,
  Animated
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
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Carregar dados do usuário
  useEffect(() => {
    carregarDadosUsuario();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
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

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosUsuario();
    setRefreshing(false);
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
    
    // ✅ FUNÇÃO AUXILIAR: Formatar texto removendo underscores e capitalizando
    const formatarTexto = (texto) => {
      if (!texto || typeof texto !== 'string') return texto;
      
      // Substituir underscores por espaços e capitalizar cada palavra
      return texto
        .replace(/_/g, ' ')
        .split(' ')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
        .join(' ');
    };
    
    switch (campo) {
      case 'sexo':
        if (valor === 'M' || valor === 'masculino') return 'Masculino';
        if (valor === 'F' || valor === 'feminino') return 'Feminino';
        return formatarTexto(valor);
        
      case 'objetivo':
        const objetivos = {
          'emagrecer': 'Emagrecer',
          'ganhar_peso': 'Ganhar Peso',
          'manter_peso': 'Manter Peso',
          'ganhar_massa': 'Ganhar Massa',
          'definir_musculos': 'Definir Músculos',
          'melhorar_resistencia': 'Melhorar Resistência',
          'saude_geral': 'Saúde Geral'
        };
        return objetivos[valor] || formatarTexto(valor);
        
      case 'nivel_atividade':
        const niveis = {
          'sedentario': 'Sedentário',
          'leve': 'Leve',
          'moderado': 'Moderado',
          'ativo': 'Ativo',
          'atleta': 'Atleta'
        };
        return niveis[valor] || formatarTexto(valor);
        
      case 'frequencia_treino':
        const frequencias = {
          '1_2_vezes': '1-2 vezes por semana',
          '3_4_vezes': '3-4 vezes por semana',
          '5_6_vezes': '5-6 vezes por semana',
          'diario': 'Diário'
        };
        return frequencias[valor] || formatarTexto(valor);
        
      case 'acesso_academia':
        const acessos = {
          'academia_completa': 'Academia Completa',
          'academia_basica': 'Academia Básica',
          'casa': 'Casa',
          'parque': 'Parque',
          'sem_acesso': 'Sem Acesso'
        };
        return acessos[valor] || formatarTexto(valor);
        
      case 'dieta_atual':
        const dietas = {
          'nao_controlo': 'Não Controlo',
          'vegetariana': 'Vegetariana',
          'vegana': 'Vegana',
          'low_carb': 'Low Carb',
          'keto': 'Cetogênica',
          'mediterranea': 'Mediterrânea',
          'sem_restricoes': 'Sem Restrições'
        };
        return dietas[valor] || formatarTexto(valor);
        
      case 'historico_exercicios':
        const historicos = {
          'iniciante': 'Iniciante',
          'intermediario': 'Intermediário',
          'avancado': 'Avançado',
          'profissional': 'Profissional'
        };
        return historicos[valor] || formatarTexto(valor);
        
      case 'horario_preferido':
        const horarios = {
          'manha': 'Manhã',
          'tarde': 'Tarde',
          'noite': 'Noite',
          'flexivel': 'Flexível'
        };
        return horarios[valor] || formatarTexto(valor);
        
      case 'duracao_treino':
        const duracoes = {
          '30_min': '30 minutos',
          '45_min': '45 minutos',
          '60_min': '1 hora',
          '90_min': '1 hora e 30 min',
          '120_min': '2 horas'
        };
        return duracoes[valor] || formatarTexto(valor);
        
      case 'motivacao':
        const motivacoes = {
          'saude': 'Saúde',
          'estetica': 'Estética',
          'performance': 'Performance',
          'competicao': 'Competição',
          'bem_estar': 'Bem-estar'
        };
        return motivacoes[valor] || formatarTexto(valor);
        
      case 'preferencias':
      case 'habitos_alimentares':
      case 'restricoes_medicas':
      case 'tipo_treino_preferido':
      case 'metas_especificas':
      case 'obstaculos':
        if (typeof valor === 'object' && valor !== null) {
          const chaves = Object.keys(valor);
          if (chaves.length === 0) return 'Não informado';
          
          // Formatar cada chave individualmente
          const chavesFormatadas = chaves.map(chave => {
            // Mapear valores específicos para cada tipo
            if (campo === 'preferencias') {
              const preferencias = {
                'sem_restricoes': 'Sem Restrições',
                'vegetariano': 'Vegetariano',
                'vegano': 'Vegano',
                'sem_gluten': 'Sem Glúten',
                'sem_lactose': 'Sem Lactose'
              };
              return preferencias[chave] || formatarTexto(chave);
            }
            
            if (campo === 'habitos_alimentares') {
              const habitos = {
                'lanches': 'Faz Lanches',
                'refeicoes_regulares': 'Refeições Regulares',
                'jejum_intermitente': 'Jejum Intermitente',
                'dieta_restritiva': 'Dieta Restritiva'
              };
              return habitos[chave] || formatarTexto(chave);
            }
            
            if (campo === 'restricoes_medicas') {
              const restricoes = {
                'nenhuma': 'Nenhuma',
                'diabetes': 'Diabetes',
                'hipertensao': 'Hipertensão',
                'colesterol_alto': 'Colesterol Alto',
                'intolerancia_lactose': 'Intolerância à Lactose'
              };
              return restricoes[chave] || formatarTexto(chave);
            }
            
            if (campo === 'tipo_treino_preferido') {
              const tipos = {
                'cardio': 'Cardiovascular',
                'forca': 'Força',
                'flexibilidade': 'Flexibilidade',
                'equilibrio': 'Equilíbrio',
                'funcional': 'Funcional'
              };
              return tipos[chave] || formatarTexto(chave);
            }
            
            if (campo === 'metas_especificas') {
              const metas = {
                'resistencia': 'Resistência',
                'forca_maxima': 'Força Máxima',
                'hipertrofia': 'Hipertrofia',
                'emagrecimento': 'Emagrecimento',
                'flexibilidade': 'Flexibilidade'
              };
              return metas[chave] || formatarTexto(chave);
            }
            
            if (campo === 'obstaculos') {
              const obstaculos = {
                'falta_tempo': 'Falta de Tempo',
                'falta_motivacao': 'Falta de Motivação',
                'falta_dinheiro': 'Falta de Dinheiro',
                'falta_conhecimento': 'Falta de Conhecimento',
                'problemas_saude': 'Problemas de Saúde'
              };
              return obstaculos[chave] || formatarTexto(chave);
            }
            
            return formatarTexto(chave);
          });
          
          return chavesFormatadas.join(', ');
        }
        return valor;
        
      default:
        return formatarTexto(valor);
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
    
    // Detectar automaticamente o tipo de campo baseado no nome
    let tipoCampoDetectado = tipo;
    
    if (['objetivo', 'nivel_atividade', 'frequencia_treino', 'acesso_academia', 
         'dieta_atual', 'historico_exercicios', 'horario_preferido', 'duracao_treino', 
         'motivacao', 'sexo'].includes(campo)) {
      tipoCampoDetectado = 'selecao';
    } else if (['idade', 'altura', 'peso_atual', 'peso_meta', 'duracao_treino'].includes(campo)) {
      tipoCampoDetectado = 'numero';
    } else {
      tipoCampoDetectado = 'texto';
    }
    
    setCampoEditando(campo);
    setValorEditando(valor || '');
    setTipoCampo(tipoCampoDetectado);
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

    // ✅ VERIFICAÇÃO ADICIONAL: Garantir que dadosQuiz não esteja vazio
    if (!dadosQuiz || Object.keys(dadosQuiz).length === 0) {
      Alert.alert('Erro', 'Dados do quiz não foram carregados. Tente novamente.');
      return;
    }

    setSalvando(true);
    try {
      // ✅ CORREÇÃO: Enviar todos os dados existentes + a edição
      const dadosAtualizados = {
        ...dadosQuiz,  // Todos os dados existentes
        [campoEditando]: valorEditando  // Campo editado
      };
      
      console.log('🔍 Dados sendo enviados para atualização:', {
        campoEditando,
        valorEditando,
        dadosExistentes: dadosQuiz,
        dadosCompletos: dadosAtualizados
      });
      
      // Atualizar no backend - quiz
      await buscarApi('/api/quiz', {
        method: 'POST',
        token,
        body: dadosAtualizados
      });

      console.log('✅ Dados atualizados com sucesso no backend');

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
      console.error('❌ Erro ao atualizar dados:', erro);
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
          styles.treinoCard,
          editavel && styles.treinoCardEditavel
        ]}
        onPress={editavel ? onPress : undefined}
        activeOpacity={editavel ? 0.7 : 1}
      >
        <View style={styles.treinoHeader}>
          <View style={[styles.treinoIconContainer, { backgroundColor: cor + '20' }]}>
            <MaterialIcons name={icone} size={24} color={cor} />
          </View>
          
          <View style={styles.treinoInfo}>
            <Text style={styles.treinoNome}>{titulo}</Text>
            <View style={[styles.diaBadge, { backgroundColor: cor + '20' }]}>
              <Text style={[styles.diaTexto, { color: cor }]}>
                {valor || 'Não informado'}
                {unidade && valor && valor !== 'Não informado' && ` ${unidade}`}
              </Text>
            </View>
          </View>
          
          {editavel && (
            <TouchableOpacity 
              style={styles.botaoOpcoes}
              onPress={onPress}
              activeOpacity={0.7}
            >
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
      <View style={styles.treinoCard}>
        <View style={styles.treinoHeader}>
          <View style={[styles.treinoIconContainer, { backgroundColor: corIMC + '20' }]}>
            <MaterialIcons name="analytics" size={24} color={corIMC} />
          </View>
          
          <View style={styles.treinoInfo}>
            <Text style={styles.treinoNome}>IMC</Text>
            <View style={[styles.diaBadge, { backgroundColor: corIMC + '20' }]}>
              <Text style={[styles.diaTexto, { color: corIMC }]}>
                {dadosUsuario.imc || 'Não calculado'}
                {dadosUsuario.imc && ' kg/m²'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderizarSecaoQuiz = (titulo, campos) => (
    <View style={styles.treinosSection}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      
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
            <Text style={styles.headerTitle}>Meus Dados</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Opções dos Dados',
                'Escolha uma opção:',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Recarregar', 
                    onPress: () => onRefresh(),
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
          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.blue} />
              <Text style={styles.loadingText}>Carregando seus dados...</Text>
            </View>
          ) : (
          <>
            {/* Informações básicas */}
            <View style={styles.treinosSection}>
              <Text style={styles.sectionTitle}>Informações Básicas</Text>
              
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
            <View style={styles.treinosSection}>
              <Text style={styles.sectionTitle}>Medidas Físicas</Text>
              
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
            <View style={styles.treinosSection}>
              <Text style={styles.sectionTitle}>Preferências e Objetivos</Text>
              
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
            <View style={styles.treinosSection}>
              <Text style={styles.sectionTitle}>Ferramentas</Text>
              <View style={styles.botoesAcao}>
                <TouchableOpacity 
                  style={styles.botaoAcao}
                  onPress={() => navigation.navigate('IMC')}
                >
                  <View style={styles.iconeBotaoAcao}>
                    <MaterialIcons name="calculate" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.textoBotaoAcao}>Calcular IMC</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.botaoAcao}
                  onPress={() => navigation.navigate('Metas')}
                >
                  <View style={styles.iconeBotaoAcao}>
                    <MaterialIcons name="flag" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.textoBotaoAcao}>Definir Metas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal de edição */}
      <Modal
        visible={modalEditar}
        transparent={true}
        animationType="fade"
        onRequestClose={fecharModalEditar}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                Editar {campoEditando?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <TouchableOpacity onPress={fecharModalEditar} style={styles.botaoFechar}>
                <MaterialIcons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {campoEditando?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {obterUnidade(campoEditando) && ` (${obterUnidade(campoEditando)})`}
              </Text>
              
              {tipoCampo === 'selecao' && campoEditando === 'sexo' ? (
                <View style={styles.selecaoContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.opcaoSelecao,
                      valorEditando === 'M' && styles.opcaoSelecionada
                    ]}
                    onPress={() => setValorEditando('M')}
                  >
                    <Text style={[
                      styles.textoOpcao,
                      valorEditando === 'M' && styles.textoOpcaoSelecionada
                    ]}>Masculino</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.opcaoSelecao,
                      valorEditando === 'F' && styles.opcaoSelecionada
                    ]}
                    onPress={() => setValorEditando('F')}
                  >
                    <Text style={[
                      styles.textoOpcao,
                      valorEditando === 'F' && styles.textoOpcaoSelecionada
                    ]}>Feminino</Text>
                  </TouchableOpacity>
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'objetivo' ? (
                <View style={styles.selecaoContainer}>
                  {['emagrecer', 'manter', 'ganhar_massa'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'emagrecer' ? 'Emagrecer' : 
                         opcao === 'manter' ? 'Manter Peso' : 'Ganhar Massa'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'nivel_atividade' ? (
                <View style={styles.selecaoContainer}>
                  {['sedentario', 'leve', 'moderado', 'ativo', 'muito_ativo'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'sedentario' ? 'Sedentário' : 
                         opcao === 'leve' ? 'Leve' : 
                         opcao === 'moderado' ? 'Moderado' : 
                         opcao === 'ativo' ? 'Ativo' : 'Muito Ativo'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'frequencia_treino' ? (
                <View style={styles.selecaoContainer}>
                  {['1_2_vezes', '3_4_vezes', '5_6_vezes', 'diario'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === '1_2_vezes' ? '1-2 vezes/semana' : 
                         opcao === '3_4_vezes' ? '3-4 vezes/semana' : 
                         opcao === '5_6_vezes' ? '5-6 vezes/semana' : 'Diário'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'acesso_academia' ? (
                <View style={styles.selecaoContainer}>
                  {['academia_completa', 'academia_basica', 'casa', 'ar_livre'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'academia_completa' ? 'Academia Completa' : 
                         opcao === 'academia_basica' ? 'Academia Básica' : 
                         opcao === 'casa' ? 'Casa' : 'Ar Livre'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'dieta_atual' ? (
                <View style={styles.selecaoContainer}>
                  {['nao_controlo', 'controlo_parcial', 'controlo_total', 'dieta_especifica'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'nao_controlo' ? 'Não Controlo' : 
                         opcao === 'controlo_parcial' ? 'Controlo Parcial' : 
                         opcao === 'controlo_total' ? 'Controlo Total' : 'Dieta Específica'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'historico_exercicios' ? (
                <View style={styles.selecaoContainer}>
                  {['iniciante', 'intermediario', 'avancado', 'atleta'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'iniciante' ? 'Iniciante' : 
                         opcao === 'intermediario' ? 'Intermediário' : 
                         opcao === 'avancado' ? 'Avançado' : 'Atleta'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'horario_preferido' ? (
                <View style={styles.selecaoContainer}>
                  {['manha', 'tarde', 'noite', 'flexivel'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'manha' ? 'Manhã' : 
                         opcao === 'tarde' ? 'Tarde' : 
                         opcao === 'noite' ? 'Noite' : 'Flexível'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'duracao_treino' ? (
                <View style={styles.selecaoContainer}>
                  {['30_min', '45_min', '60_min', '90_min', '120_min'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === '30_min' ? '30 minutos' : 
                         opcao === '45_min' ? '45 minutos' : 
                         opcao === '60_min' ? '60 minutos' : 
                         opcao === '90_min' ? '90 minutos' : '120 minutos'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : tipoCampo === 'selecao' && campoEditando === 'motivacao' ? (
                <View style={styles.selecaoContainer}>
                  {['saude', 'estetica', 'desempenho', 'competicao', 'bem_estar'].map((opcao) => (
                    <TouchableOpacity 
                      key={opcao}
                      style={[
                        styles.opcaoSelecao,
                        valorEditando === opcao && styles.opcaoSelecionada
                      ]}
                      onPress={() => setValorEditando(opcao)}
                    >
                      <Text style={[
                        styles.textoOpcao,
                        valorEditando === opcao && styles.textoOpcaoSelecionada
                      ]}>
                        {opcao === 'saude' ? 'Saúde' : 
                         opcao === 'estetica' ? 'Estética' : 
                         opcao === 'desempenho' ? 'Desempenho' : 
                         opcao === 'competicao' ? 'Competição' : 'Bem-estar'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={valorEditando}
                  onChangeText={(texto) => {
                    // Substituir vírgulas por pontos para campos numéricos
                    if (tipoCampo === 'numero') {
                      const textoFormatado = texto.replace(',', '.');
                      setValorEditando(textoFormatado);
                    } else {
                      setValorEditando(texto);
                    }
                  }}
                  placeholder={`Digite ${campoEditando?.replace(/_/g, ' ').toLowerCase()}`}
                  placeholderTextColor={colors.neutral[400]}
                  keyboardType={tipoCampo === 'numero' ? 'numeric' : 'default'}
                  autoFocus={true}
                />
              )}
            </View>
            
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={fecharModalEditar}>
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.botaoSalvar,
                  salvando && styles.botaoDesabilitado
                ]} 
                onPress={salvarEdicao}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color={colors.neutral[50]} size="small" />
                ) : (
                  <Text style={styles.textoBotaoSalvar}>Salvar</Text>
                )}
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral[500],
    fontWeight: typography.fontWeight.medium,
  },
  
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
  
  treinoCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },
  
  treinoCardEditavel: {
    borderColor: colors.primary[600] + '30',
  },
  
  treinoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  
  treinoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  treinoInfo: {
    flex: 1,
  },
  
  treinoNome: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  diaBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borders.radius.lg,
  },
  
  diaTexto: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  
  botaoOpcoes: {
    padding: spacing.xs,
  },
  
  botoesAcao: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  botaoAcao: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
  },

  iconeBotaoAcao: {
    marginBottom: spacing.sm,
  },

  textoBotaoAcao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  // Modal
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
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.lg,
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
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },

  textoBotaoCancelar: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },

  botaoSalvar: {
    flex: 1,
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },

  botaoDesabilitado: {
    backgroundColor: colors.neutral[400],
    shadowOpacity: 0.1,
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