import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInputs, setTextInputs] = useState({});

  const steps = [
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
      additionalFields: ['idade', 'pais', 'cep']
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

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!answers[currentStepData.id] && currentStepData.options?.length > 0) {
      const initialOptions = currentStepData.options.map(option => ({
        ...option,
        selected: false
      }));
      setAnswers(prev => ({
        ...prev,
        [currentStepData.id]: initialOptions
      }));
    }
  }, [currentStep, currentStepData.id, currentStepData.options]);

  const handleOptionSelect = (optionId) => {
    const updatedOptions = currentStepData.options.map(option => ({
      ...option,
      selected: currentStepData.multiSelect 
        ? option.id === optionId ? !option.selected : option.selected
        : option.id === optionId
    }));
    
    setAnswers(prev => ({
      ...prev,
      [currentStepData.id]: updatedOptions
    }));
  };

  const handleTextInputChange = (field, value) => {
    setTextInputs(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (currentStepData.options?.length > 0) {
      const currentAnswers = answers[currentStepData.id];
      return currentAnswers?.some(option => option.selected);
    }
    
    if (currentStepData.additionalFields) {
      return currentStepData.additionalFields.every(field => 
        textInputs[field]?.trim().length > 0
      );
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace('Dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>{currentStepData.title}</Text>
      <View style={styles.progressBar}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index <= currentStep && styles.progressSegmentActive
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderOptions = () => {
    if (!currentStepData.options?.length) return null;

    const currentAnswers = answers[currentStepData.id] || currentStepData.options;
    
    return (
      <View style={styles.optionsContainer}>
        {currentAnswers.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              option.selected && styles.optionButtonSelected
            ]}
            onPress={() => handleOptionSelect(option.id)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionText,
                option.selected && styles.optionTextSelected
              ]}>
                {option.text}
              </Text>
              {option.description && (
                <Text style={[
                  styles.optionDescription,
                  option.selected && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              )}
              {option.recommended && (
                <Text style={styles.recommendedTag}>(Recomendado)</Text>
              )}
            </View>
            <View style={[
              styles.optionIndicator,
              option.selected && styles.optionIndicatorSelected
            ]}>
              {option.selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTextInputs = () => {
    if (!currentStepData.additionalFields) return null;

    const fieldLabels = {
      idade: 'Idade',
      pais: 'País',
      cep: 'CEP',
      altura: 'Altura (cm)',
      peso_atual: 'Peso Atual (kg)',
      peso_meta: 'Peso Meta (kg)'
    };

    const placeholders = {
      idade: 'idade',
      pais: 'país',
      cep: 'CEP',
      altura: 'altura',
      peso_atual: 'peso atual',
      peso_meta: 'peso meta'
    };

    return (
      <View style={styles.textInputsContainer}>
        {currentStepData.additionalFields.map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{fieldLabels[field] || field}</Text>
            <TextInput
              style={styles.textInput}
              value={textInputs[field] || ''}
              onChangeText={(value) => handleTextInputChange(field, value)}
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {renderProgressBar()}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentStepData.question}</Text>
            {currentStepData.instruction && (
              <Text style={styles.instructionText}>{currentStepData.instruction}</Text>
            )}
          </View>
          <View style={styles.mainContent}>
            {renderOptions()}
            {renderTextInputs()}
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled
            ]}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  
  progressTitle: {
    fontSize: Math.min(typography.fontSize.xl, Math.max(18, width * 0.055)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  progressBar: {
    flexDirection: 'row',
    gap: Math.min(spacing.xs, width * 0.02),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  progressSegment: {
    width: Math.min(40, Math.max(30, width * 0.08)),
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: 2,
  },
  
  progressSegmentActive: {
    backgroundColor: colors.success,
  },
  
  questionContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  
  questionText: {
    fontSize: Math.min(typography.fontSize['2xl'], Math.max(20, width * 0.06)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.relaxed,
  },
  
  instructionText: {
    fontSize: Math.min(typography.fontSize.base, Math.max(16, width * 0.04)),
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  optionsContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  
  optionButton: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: Math.min(spacing.lg, width * 0.04),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.base,
    minHeight: Math.max(60, height * 0.07),
  },
  
  optionButtonSelected: {
    backgroundColor: colors.primary[600],
  },
  
  optionContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  
  optionText: {
    fontSize: Math.min(typography.fontSize.lg, Math.max(16, width * 0.045)),
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  optionTextSelected: {
    color: colors.neutral[50],
  },
  
  optionDescription: {
    fontSize: Math.min(typography.fontSize.sm, Math.max(14, width * 0.035)),
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },
  
  optionDescriptionSelected: {
    color: colors.neutral[200],
  },
  
  recommendedTag: {
    fontSize: Math.min(typography.fontSize.sm, Math.max(14, width * 0.035)),
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.blue,
    marginTop: spacing.xs,
  },
  
  optionIndicator: {
    width: Math.max(24, width * 0.06),
    height: Math.max(24, width * 0.06),
    borderRadius: Math.max(12, width * 0.03),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  optionIndicatorSelected: {
    backgroundColor: colors.primary[600],
  },
  
  checkmark: {
    color: colors.neutral[50],
    fontSize: Math.max(typography.fontSize.sm, width * 0.035),
    fontWeight: typography.fontWeight.bold,
  },
  
  textInputsContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  inputContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.md,
    padding: Math.min(spacing.md, width * 0.035),
    ...shadows.base,
    minHeight: Math.max(70, height * 0.08),
  },

  inputLabel: {
    fontSize: Math.min(typography.fontSize.sm, Math.max(14, width * 0.035)),
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },

  textInput: {
    fontSize: Math.min(typography.fontSize.base, Math.max(16, width * 0.04)),
    color: colors.neutral[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    minHeight: Math.max(40, height * 0.05),
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.min(spacing.lg, width * 0.04),
    paddingVertical: Math.min(spacing.lg, height * 0.02),
    backgroundColor: colors.neutral[900],
  },
  
  backButton: {
    width: Math.max(40, Math.min(width * 0.12, 50)),
    height: Math.max(40, Math.min(width * 0.12, 50)),
    borderRadius: Math.max(20, Math.min(width * 0.06, 25)),
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
  },
  
  backButtonText: {
    fontSize: Math.min(typography.fontSize.xl, Math.max(18, width * 0.06)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  nextButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: Math.min(spacing.md, height * 0.015),
    paddingHorizontal: Math.min(spacing.lg, width * 0.04),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Math.max(100, Math.min(width * 0.3, 150)),
    ...shadows.lg,
  },
  
  nextButtonDisabled: {
    backgroundColor: colors.neutral[700],
  },
  
  nextButtonText: {
    fontSize: Math.min(typography.fontSize.lg, Math.max(16, width * 0.045)),
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
});
