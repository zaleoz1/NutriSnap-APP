import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function Quiz({ navigation }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'objetivo',
      title: 'Qual é seu objetivo principal?',
      type: 'single',
      options: [
        { id: 'emagrecer', text: 'Emagrecer' },
        { id: 'ganhar_massa', text: 'Ganhar massa muscular' },
        { id: 'manter_peso', text: 'Manter o peso atual' },
        { id: 'saude', text: 'Melhorar a saúde geral' }
      ]
    },
    {
      id: 'objetivo_fitness',
      title: 'Qual é sua pretensão específica de fitness?',
      type: 'single',
      options: [
        { id: 'ganhar_massa_pura', text: 'Ganhar massa muscular pura' },
        { id: 'definir_corpo', text: 'Definir e tonificar o corpo' },
        { id: 'forca_resistencia', text: 'Aumentar força e resistência' },
        { id: 'perda_gordura', text: 'Perder gordura e definir músculos' },
        { id: 'condicionamento', text: 'Melhorar condicionamento físico' },
        { id: 'reabilitacao', text: 'Reabilitação e recuperação' }
      ]
    },
    {
      id: 'acesso_academia',
      title: 'Qual é seu acesso a equipamentos de treino?',
      type: 'single',
      options: [
        { id: 'academia_completa', text: 'Academia completa com todos os equipamentos' },
        { id: 'academia_basica', text: 'Academia básica com equipamentos limitados' },
        { id: 'casa_equipamentos', text: 'Casa com alguns equipamentos (pesos, esteira)' },
        { id: 'casa_sem_equipamentos', text: 'Casa sem equipamentos específicos' },
        { id: 'ar_livre', text: 'Treino ao ar livre/parques' },
        { id: 'sem_acesso', text: 'Sem acesso a equipamentos' }
      ]
    },
    {
      id: 'tipo_treino',
      title: 'Como você prefere treinar?',
      type: 'multiple',
      options: [
        { id: 'treino_academia', text: 'Treino na academia' },
        { id: 'treino_casa', text: 'Treino em casa' },
        { id: 'treino_ar_livre', text: 'Treino ao ar livre' },
        { id: 'treino_funcional', text: 'Treino funcional' },
        { id: 'treino_corrida', text: 'Corrida/caminhada' },
        { id: 'treino_yoga', text: 'Yoga/pilates' },
        { id: 'treino_natacao', text: 'Natação' },
        { id: 'treino_ciclismo', text: 'Ciclismo' }
      ]
    },
    {
      id: 'frequencia_treino',
      title: 'Com que frequência você pretende treinar?',
      type: 'single',
      options: [
        { id: '2_3_vezes', text: '2-3 vezes por semana' },
        { id: '3_4_vezes', text: '3-4 vezes por semana' },
        { id: '4_5_vezes', text: '4-5 vezes por semana' },
        { id: '5_6_vezes', text: '5-6 vezes por semana' },
        { id: 'diario', text: 'Todos os dias' },
        { id: 'flexivel', text: 'Flexível, conforme disponibilidade' }
      ]
    },
    {
      id: 'suplementos',
      title: 'Você tem acesso a suplementos nutricionais?',
      type: 'multiple',
      options: [
        { id: 'proteina', text: 'Proteína (whey, caseína)' },
        { id: 'creatina', text: 'Creatina' },
        { id: 'bcaa', text: 'BCAA' },
        { id: 'multivitaminico', text: 'Multivitamínico' },
        { id: 'omega3', text: 'Ômega 3' },
        { id: 'pre_workout', text: 'Pré-workout' },
        { id: 'sem_suplementos', text: 'Não uso suplementos' },
        { id: 'nao_sei', text: 'Não sei o que usar' }
      ]
    },
    {
      id: 'nivel_atividade',
      title: 'Como você descreveria seu nível de atividade física?',
      type: 'single',
      options: [
        { id: 'sedentario', text: 'Sedentário - pouco ou nenhum exercício' },
        { id: 'leve', text: 'Levemente ativo - exercício leve 1-3x por semana' },
        { id: 'moderado', text: 'Moderadamente ativo - exercício 3-5x por semana' },
        { id: 'ativo', text: 'Muito ativo - exercício intenso 6-7x por semana' }
      ]
    },
    {
      id: 'dieta_atual',
      title: 'Como você descreveria sua dieta atual?',
      type: 'single',
      options: [
        { id: 'nao_controlo', text: 'Não controlo muito o que como' },
        { id: 'tento_controlar', text: 'Tento controlar, mas é difícil' },
        { id: 'controlo_parcial', text: 'Controlo parcialmente' },
        { id: 'controlo_total', text: 'Tenho controle total sobre minha alimentação' }
      ]
    },
    {
      id: 'obstaculos',
      title: 'Quais são seus principais obstáculos?',
      type: 'multiple',
      options: [
        { id: 'falta_tempo', text: 'Falta de tempo' },
        { id: 'falta_dinheiro', text: 'Orçamento limitado' },
        { id: 'falta_conhecimento', text: 'Falta de conhecimento nutricional' },
        { id: 'falta_motivacao', text: 'Falta de motivação' },
        { id: 'ansiedade', text: 'Ansiedade/estresse' },
        { id: 'social', text: 'Compromissos sociais' }
      ]
    },
    {
      id: 'preferencias',
      title: 'Quais são suas preferências alimentares?',
      type: 'multiple',
      options: [
        { id: 'vegetariano', text: 'Vegetariano' },
        { id: 'vegano', text: 'Vegano' },
        { id: 'sem_gluten', text: 'Sem glúten' },
        { id: 'sem_lactose', text: 'Sem lactose' },
        { id: 'sem_restricoes', text: 'Sem restrições' },
        { id: 'low_carb', text: 'Low carb' }
      ]
    },
    {
      id: 'dados_pessoais',
      title: 'Informações básicas',
      type: 'form',
      fields: [
        { id: 'idade', label: 'Idade', type: 'numeric', placeholder: 'Digite sua idade' },
        { id: 'altura', label: 'Altura (cm)', type: 'numeric', placeholder: 'Digite sua altura' },
        { id: 'peso', label: 'Peso atual (kg)', type: 'numeric', placeholder: 'Digite seu peso' }
      ]
    }
  ];

  const currentQuestion = questions[step];

  const handleAnswer = (questionId, answerId, value) => {
    if (currentQuestion.type === 'multiple') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [answerId]: !prev[questionId]?.[answerId]
        }
      }));
    } else if (currentQuestion.type === 'single') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answerId
      }));
    } else if (currentQuestion.type === 'form') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [answerId]: value
        }
      }));
    }
  };

  const canProceed = () => {
    if (currentQuestion.type === 'single') {
      return answers[currentQuestion.id];
    } else if (currentQuestion.type === 'multiple') {
      const questionAnswers = answers[currentQuestion.id];
      return questionAnswers && Object.values(questionAnswers).some(v => v);
    } else if (currentQuestion.type === 'form') {
      const questionAnswers = answers[currentQuestion.id];
      return questionAnswers && currentQuestion.fields.every(field => 
        questionAnswers[field.id] && questionAnswers[field.id].toString().trim().length > 0
      );
    }
    return false;
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Finalizar quiz
      console.log('Respostas do quiz:', answers);
      navigation.navigate('Dashboard');
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>{currentQuestion.title}</Text>
      <View style={styles.progressBar}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index <= step && styles.progressSegmentActive
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>{step + 1} de {questions.length}</Text>
    </View>
  );

  const renderOptions = () => {
    if (currentQuestion.type === 'form') return null;

    return (
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option) => {
          const isSelected = currentQuestion.type === 'single' 
            ? answers[currentQuestion.id] === option.id
            : answers[currentQuestion.id]?.[option.id];

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected
              ]}
              onPress={() => handleAnswer(currentQuestion.id, option.id)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]}>
                {option.text}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderForm = () => {
    if (currentQuestion.type !== 'form') return null;

    return (
      <View style={styles.formContainer}>
        {currentQuestion.fields.map((field) => (
          <View key={field.id} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            <TextInput
              style={styles.textInput}
              value={answers[currentQuestion.id]?.[field.id] || ''}
              onChangeText={(value) => handleAnswer(currentQuestion.id, field.id, value)}
              placeholder={field.placeholder}
              placeholderTextColor={colors.neutral[500]}
              keyboardType={field.type === 'numeric' ? 'numeric' : 'default'}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProgressBar()}
        
        <View style={styles.contentContainer}>
          {renderOptions()}
          {renderForm()}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={prevStep}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled
          ]}
          onPress={nextStep}
          disabled={!canProceed()}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === questions.length - 1 ? 'Finalizar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  
  progressTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  
  progressSegment: {
    width: 25,
    height: 3,
    backgroundColor: colors.neutral[700],
    borderRadius: 1.5,
  },
  
  progressSegmentActive: {
    backgroundColor: colors.primary[500],
  },
  
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  optionsContainer: {
    gap: spacing.md,
  },
  
  optionButton: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.base,
    minHeight: 70,
  },
  
  optionButtonSelected: {
    backgroundColor: colors.primary[600],
  },
  
  optionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[100],
    flex: 1,
  },
  
  optionTextSelected: {
    color: colors.neutral[50],
    fontWeight: typography.fontWeight.semibold,
  },
  
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkmarkText: {
    color: colors.primary[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  
  formContainer: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  
  inputContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.md,
    padding: spacing.md,
    ...shadows.base,
  },
  
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },
  
  textInput: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    minHeight: 40,
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral[900],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[800],
  },
  
  navButton: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 100,
    alignItems: 'center',
    ...shadows.base,
  },
  
  nextButton: {
    backgroundColor: colors.primary[600],
  },
  
  nextButtonDisabled: {
    backgroundColor: colors.neutral[700],
  },
  
  navButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[100],
  },
  
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
  },
});
