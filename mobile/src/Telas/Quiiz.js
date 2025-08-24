import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaQuiz({ navigation }) {
  const [passoAtual, setPassoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [entradasTexto, setEntradasTexto] = useState({});



  const passos = [
    {
      id: 'goals',
      title: 'Metas',
      question: 'Selecione até três metas que são mais importantes para você.',
      options: [
        { id: 'perder_peso', text: 'Perder peso' },
        { id: 'manter_peso', text: 'Manter o peso' },
        { id: 'ganhar_peso', text: 'Ganhar peso' },
        { id: 'ganhar_massa', text: 'Ganhar massa muscular' },
        { id: 'modificar_dieta', text: 'Modificar minha dieta' },
        { id: 'planejar_refeicoes', text: 'Planejar refeições' },
        { id: 'controlar_estresse', text: 'Controlar o estresse' },
        { id: 'estilo_ativo', text: 'Ter um estilo de vida ativo' }
      ],
      multiSelect: true
    },
    {
      id: 'meal_plans',
      title: 'Planos de Refeição',
      question: 'Você quer que a gente ajude você a criar planos de refeições semanais?',
      options: [
        { id: 'sim_certeza', text: 'Sim, com certeza' },
        { id: 'posso_experimentar', text: 'Posso experimentar' },
        { id: 'nao_agradeco', text: 'Não, agradeço' }
      ],
      multiSelect: false
    },
    {
      id: 'obstacles',
      title: 'Obstáculos',
      question: 'Anteriormente, quais obstáculos impediram você de perder peso?',
      instruction: 'Selecione todas as opções que descrevem sua situação.',
      options: [
        { id: 'falta_tempo', text: 'Falta de tempo' },
        { id: 'dificil_seguir', text: 'Era muito difícil seguir o plano de emagrecimento' },
        { id: 'nao_gostava_comida', text: 'Não gostava da comida' },
        { id: 'dificil_escolhas', text: 'Foi difícil fazer escolhas alimentares' },
        { id: 'comer_social', text: 'Comer socialmente e eventos' },
        { id: 'desejo_alimentos', text: 'Desejo de comer certos alimentos' },
        { id: 'falta_progresso', text: 'Falta de progresso' },
        { id: 'comida_saudavel', text: 'Comida saudável não tem gosto bom' }
      ],
      multiSelect: true
    },
    {
      id: 'activity_level',
      title: 'Nível de Atividade',
      question: 'Qual é o seu nível básico de atividade?',
      instruction: 'Não incluindo treinos — contamos isso separadamente.',
      options: [
        { id: 'nao_ativo', text: 'Não muito ativo', description: 'Passa a maior parte do dia sentado (ex: caixa de banco, trabalho de escritório)' },
        { id: 'levemente_ativo', text: 'Levemente ativo', description: 'Passa boa parte do dia de pé (ex: professor, vendedor)' },
        { id: 'ativo', text: 'Ativo', description: 'Passa boa parte do dia fazendo alguma atividade física (ex: garçom, carteiro)' },
        { id: 'bastante_ativo', text: 'Bastante ativo', description: 'Passa a maior parte do dia fazendo atividade física pesada (ex: carpinteiro, ciclista entregador)' }
      ],
      multiSelect: false
    },
    {
      id: 'personal_info',
      title: 'Informações Pessoais',
      question: 'Conte um pouco sobre você',
      instruction: 'Selecione o sexo e preencha as informações:',
      options: [
        { id: 'masculino', text: 'Masculino' },
        { id: 'feminino', text: 'Feminino' }
      ],
      multiSelect: false,
      additionalFields: ['idade']
    },
    {
      id: 'measurements',
      title: 'Medidas',
      question: 'Só mais algumas perguntas',
      instruction: 'Preencha suas medidas:',
      additionalFields: ['altura', 'peso_atual', 'peso_meta']
    },
    {
      id: 'weekly_goal',
      title: 'Meta Semanal',
      question: 'Qual é a sua meta semanal?',
      options: [
        { id: '0.2kg', text: 'Perder 0,2 quilogramas por semana' },
        { id: '0.5kg', text: 'Perder 0,5 quilogramas por semana', recommended: true },
        { id: '0.8kg', text: 'Perder 0,8 quilogramas por semana' },
        { id: '1.0kg', text: 'Perder 1 quilogramas por semana' }
      ],
      multiSelect: false
    }
  ];

  const dadosPassoAtual = passos[passoAtual];

  useEffect(() => {
    if (dadosPassoAtual.options?.length > 0) {
      // Se já temos respostas para este passo, não sobrescrever
      if (!respostas[dadosPassoAtual.id]) {
        const opcoesIniciais = dadosPassoAtual.options.map(option => ({
          ...option,
          selected: false
        }));
        setRespostas(prev => ({
          ...prev,
          [dadosPassoAtual.id]: opcoesIniciais
        }));
      }
    }
  }, [passoAtual, dadosPassoAtual.id, dadosPassoAtual.options, respostas]);

  const selecionarOpcao = (optionId) => {
    const opcoesAtualizadas = dadosPassoAtual.options.map(option => ({
      ...option,
      selected: dadosPassoAtual.multiSelect 
        ? option.id === optionId ? !option.selected : option.selected
        : option.id === optionId
    }));
    
    setRespostas(prev => {
      const novasRespostas = {
        ...prev,
        [dadosPassoAtual.id]: opcoesAtualizadas
      };
      return novasRespostas;
    });
  };

  const alterarEntradaTexto = (field, value) => {
    setEntradasTexto(prev => ({ ...prev, [field]: value }));
  };

  const podeProsseguir = () => {
    // Se for o último passo, sempre permitir prosseguir
    if (passoAtual === passos.length - 1) {
      return true;
    }
    
    if (dadosPassoAtual.options?.length > 0) {
      const respostasAtuais = respostas[dadosPassoAtual.id];
      const podeProsseguirResultado = respostasAtuais?.some(option => option.selected);
      return podeProsseguirResultado;
    }
    
    if (dadosPassoAtual.additionalFields) {
      const podeProsseguirResultado = dadosPassoAtual.additionalFields.every(field => 
        entradasTexto[field]?.trim().length > 0
      );
      return podeProsseguirResultado;
    }
    
    return true;
  };

  const proximoPasso = () => {
    if (passoAtual < passos.length - 1) {
      setPassoAtual(passoAtual + 1);
    } else {
      try {
        navigation.replace('Principal');
      } catch (error) {
        // Fallback para navegação simples
        navigation.navigate('Principal');
      }
    }
  };

  const passoAnterior = () => {
    if (passoAtual > 0) {
      setPassoAtual(passoAtual - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderizarBarraProgresso = () => (
    <View style={styles.containerProgresso}>
      <Text style={styles.tituloProgresso}>{dadosPassoAtual.title}</Text>
      <View style={styles.barraProgresso}>
        {passos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.segmentoProgresso,
              index <= passoAtual && styles.segmentoProgressoAtivo
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderizarOpcoes = () => {
    if (!dadosPassoAtual.options?.length) return null;

    const respostasAtuais = respostas[dadosPassoAtual.id] || dadosPassoAtual.options;
    
    return (
      <View style={styles.containerOpcoes}>
        {respostasAtuais.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.botaoOpcao,
              option.selected && styles.botaoOpcaoSelecionado
            ]}
            onPress={() => selecionarOpcao(option.id)}
            activeOpacity={0.8}
          >
            <View style={styles.conteudoOpcao}>
              <Text style={[
                styles.textoOpcao,
                option.selected && styles.textoOpcaoSelecionado
              ]}>
                {option.text}
              </Text>
              {option.description && (
                <Text style={[
                  styles.descricaoOpcao,
                  option.selected && styles.descricaoOpcaoSelecionada
                ]}>
                  {option.description}
                </Text>
              )}
              {option.recommended && (
                <Text style={styles.tagRecomendado}>(Recomendado)</Text>
              )}
            </View>
            <View style={[
              styles.indicadorOpcao,
              option.selected && styles.indicadorOpcaoSelecionado
            ]}>
              {option.selected && <Text style={styles.marcaVerificacao}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderizarEntradasTexto = () => {
    if (!dadosPassoAtual.additionalFields) return null;

    const rotulosCampos = {
      idade: 'Idade',
      altura: 'Altura (cm)',
      peso_atual: 'Peso Atual (kg)',
      peso_meta: 'Peso Meta (kg)'
    };

    const placeholders = {
      idade: 'idade',
      altura: 'altura',
      peso_atual: 'peso atual',
      peso_meta: 'peso meta'
    };

    return (
      <View style={styles.containerEntradasTexto}>
        {dadosPassoAtual.additionalFields.map((field) => (
          <View key={field} style={styles.containerEntrada}>
            <Text style={styles.rotuloEntrada}>{rotulosCampos[field] || field}</Text>
            <TextInput
              style={styles.entradaTexto}
              value={entradasTexto[field] || ''}
              onChangeText={(value) => alterarEntradaTexto(field, value)}
              placeholder={`Digite sua ${placeholders[field] || field}`}
              placeholderTextColor={colors.neutral[500]}
              keyboardType={['idade', 'altura', 'peso_atual', 'peso_meta'].includes(field) ? 'numeric' : 'default'}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.areaSegura} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.containerConteudo}>
            {renderizarBarraProgresso()}
            <View style={styles.containerPergunta}>
              <Text style={styles.textoPergunta}>{dadosPassoAtual.question}</Text>
              {dadosPassoAtual.instruction && (
                <Text style={styles.textoInstrucao}>{dadosPassoAtual.instruction}</Text>
              )}
            </View>
            <View style={styles.conteudoPrincipal}>
              {renderizarOpcoes()}
              {renderizarEntradasTexto()}
            </View>
          </View>

          <View style={styles.containerNavegacao}>
            <TouchableOpacity
              onPress={passoAnterior}
              style={styles.botaoVoltar}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoVoltar}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={proximoPasso}
              style={[
                styles.botaoProximo,
                !podeProsseguir() && styles.botaoProximoDesabilitado
              ]}
              disabled={!podeProsseguir()}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoProximo}>
                {passoAtual === passos.length - 1 ? 'Finalizar' : 'Próximo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  containerConteudo: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  containerProgresso: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  
  tituloProgresso: {
    fontSize: Math.min(typography.fontSize.xl, Math.max(18, width * 0.055)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  barraProgresso: {
    flexDirection: 'row',
    gap: Math.min(spacing.xs, width * 0.02),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  segmentoProgresso: {
    width: Math.min(40, Math.max(30, width * 0.08)),
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: 2,
  },
  
  segmentoProgressoAtivo: {
    backgroundColor: colors.success,
  },
  
  containerPergunta: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  
  textoPergunta: {
    fontSize: Math.min(typography.fontSize['2xl'], Math.max(20, width * 0.06)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.relaxed,
  },
  
  textoInstrucao: {
    fontSize: Math.min(typography.fontSize.base, Math.max(16, width * 0.04)),
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  conteudoPrincipal: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  containerOpcoes: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  
  botaoOpcao: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: Math.min(spacing.lg, width * 0.04),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.base,
    minHeight: Math.max(60, height * 0.07),
  },
  
  botaoOpcaoSelecionado: {
    backgroundColor: colors.primary[600],
  },
  
  conteudoOpcao: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  
  textoOpcao: {
    fontSize: Math.min(typography.fontSize.lg, Math.max(16, width * 0.045)),
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  textoOpcaoSelecionado: {
    color: colors.neutral[50],
  },
  
  descricaoOpcao: {
    fontSize: Math.min(typography.fontSize.sm, Math.max(14, width * 0.035)),
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },
  
  descricaoOpcaoSelecionada: {
    color: colors.neutral[200],
  },
  
  tagRecomendado: {
    fontSize: Math.min(typography.fontSize.sm, Math.max(14, width * 0.035)),
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.blue,
    marginTop: spacing.xs,
  },
  
  indicadorOpcao: {
    width: Math.max(24, width * 0.06),
    height: Math.max(24, width * 0.06),
    borderRadius: Math.max(12, width * 0.03),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  indicadorOpcaoSelecionado: {
    backgroundColor: colors.primary[600],
  },
  
  marcaVerificacao: {
    color: colors.neutral[50],
    fontSize: Math.max(typography.fontSize.sm, width * 0.035),
    fontWeight: typography.fontWeight.bold,
  },
  
  containerEntradasTexto: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  containerEntrada: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.md,
    padding: Math.min(spacing.md, width * 0.035),
    ...shadows.base,
    minHeight: Math.max(70, height * 0.08),
  },

  rotuloEntrada: {
    fontSize: Math.min(typography.fontSize.sm, Math.max(14, width * 0.035)),
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },

  entradaTexto: {
    fontSize: Math.min(typography.fontSize.base, Math.max(16, width * 0.04)),
    color: colors.neutral[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    minHeight: Math.max(40, height * 0.05),
  },
  
  containerNavegacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.min(spacing.lg, width * 0.04),
    paddingVertical: Math.min(spacing.lg, height * 0.02),
    backgroundColor: colors.neutral[900],
  },
  
  botaoVoltar: {
    width: Math.max(40, Math.min(width * 0.12, 50)),
    height: Math.max(40, Math.min(width * 0.12, 50)),
    borderRadius: Math.max(20, Math.min(width * 0.06, 25)),
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
  },
  
  textoBotaoVoltar: {
    fontSize: Math.min(typography.fontSize.xl, Math.max(18, width * 0.06)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  botaoProximo: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: Math.min(spacing.md, height * 0.015),
    paddingHorizontal: Math.min(spacing.lg, width * 0.04),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Math.max(100, Math.min(width * 0.3, 150)),
    ...shadows.lg,
  },
  
  botaoProximoDesabilitado: {
    backgroundColor: colors.neutral[700],
  },
  
  textoBotaoProximo: {
    fontSize: Math.min(typography.fontSize.lg, Math.max(16, width * 0.045)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
});
