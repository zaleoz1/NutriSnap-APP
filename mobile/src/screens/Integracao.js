import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const steps = [
    {
      id: 'goals',
      title: 'Metas',
      question: 'Selecione até três metas que são mais importantes para você.',
      options: [
        { id: 'perder_peso', text: 'Perder peso', selected: false },
        { id: 'manter_peso', text: 'Manter o peso', selected: false },
        { id: 'ganhar_peso', text: 'Ganhar peso', selected: false },
        { id: 'ganhar_massa', text: 'Ganhar massa muscular', selected: false },
        { id: 'modificar_dieta', text: 'Modificar minha dieta', selected: false },
        { id: 'planejar_refeicoes', text: 'Planejar refeições', selected: false },
        { id: 'controlar_estresse', text: 'Controlar o estresse', selected: false },
        { id: 'estilo_ativo', text: 'Ter um estilo de vida ativo', selected: false }
      ],
      multiSelect: true,
      maxSelections: 3
    },
    {
      id: 'meal_plans',
      title: 'Metas',
      question: 'Você quer que a gente ajude você a criar planos de refeições semanais?',
      options: [
        { id: 'sim_certeza', text: 'Sim, com certeza', selected: false },
        { id: 'posso_experimentar', text: 'Posso experimentar', selected: false },
        { id: 'nao_agradeco', text: 'Não, agradeço', selected: false }
      ],
      multiSelect: false
    },
    {
      id: 'obstacles',
      title: 'Metas',
      question: 'Anteriormente, quais obstáculos impediram você de perder peso?',
      instruction: 'Selecione todas as opções que descrevem sua situação.',
      options: [
        { id: 'falta_tempo', text: 'Falta de tempo', selected: false },
        { id: 'dificil_seguir', text: 'Era muito difícil seguir o plano de emagrecimento', selected: false },
        { id: 'nao_gostava_comida', text: 'Não gostava da comida', selected: false },
        { id: 'dificil_escolhas', text: 'Foi difícil fazer escolhas alimentares', selected: false },
        { id: 'comer_social', text: 'Comer socialmente e eventos', selected: false },
        { id: 'desejo_alimentos', text: 'Desejo de comer certos alimentos', selected: false },
        { id: 'falta_progresso', text: 'Falta de progresso', selected: false },
        { id: 'comida_saudavel', text: 'Comida saudável não tem gosto bom', selected: false }
      ],
      multiSelect: true
    },
    {
      id: 'activity_level',
      title: 'Metas',
      question: 'Qual é o seu nível básico de atividade?',
      instruction: 'Não incluindo treinos — contamos isso separadamente.',
      options: [
        { id: 'nao_ativo', text: 'Não muito ativo', description: 'Passa a maior parte do dia sentado (ex: caixa de banco, trabalho de escritório)', selected: false },
        { id: 'levemente_ativo', text: 'Levemente ativo', description: 'Passa boa parte do dia de pé (ex: professor, vendedor)', selected: false },
        { id: 'ativo', text: 'Ativo', description: 'Passa boa parte do dia fazendo alguma atividade física (ex: garçom, carteiro)', selected: false },
        { id: 'bastante_ativo', text: 'Bastante ativo', description: 'Passa a maior parte do dia fazendo atividade física pesada (ex: carpinteiro, ciclista entregador)', selected: false }
      ],
      multiSelect: false
    },
    {
      id: 'personal_info',
      title: 'Você',
      question: 'Conte um pouco sobre você',
      instruction: 'Selecione o sexo que devemos usar para calcular suas necessidades calóricas:',
      options: [
        { id: 'masculino', text: 'Masculino', selected: false },
        { id: 'feminino', text: 'Feminino', selected: false }
      ],
      multiSelect: false,
      additionalFields: ['idade', 'pais', 'cep']
    },
    {
      id: 'measurements',
      title: 'Você',
      question: 'Só mais algumas perguntas',
      options: [],
      additionalFields: ['altura', 'peso_atual', 'peso_meta']
    },
    {
      id: 'weekly_goal',
      title: 'Meta',
      question: 'Qual é a sua meta semanal?',
      options: [
        { id: '0.2kg', text: 'Perder 0,2 quilogramas por semana', selected: false },
        { id: '0.5kg', text: 'Perder 0,5 quilogramas por semana', selected: false, recommended: true },
        { id: '0.8kg', text: 'Perder 0,8 quilogramas por semana', selected: false },
        { id: '1.0kg', text: 'Perder 1 quilogramas por semana', selected: false }
      ],
      multiSelect: false
    }
  ];

  const currentStepData = steps[currentStep];

  const handleOptionSelect = (optionId) => {
    if (currentStepData.multiSelect) {
      const updatedOptions = currentStepData.options.map(option => {
        if (option.id === optionId) {
          return { ...option, selected: !option.selected };
        }
        return option;
      });
      
      // Verificar limite máximo de seleções
      const selectedCount = updatedOptions.filter(opt => opt.selected).length;
      if (selectedCount <= currentStepData.maxSelections || !updatedOptions.find(opt => opt.id === optionId).selected) {
        setAnswers(prev => ({
          ...prev,
          [currentStepData.id]: updatedOptions
        }));
      }
    } else {
      const updatedOptions = currentStepData.options.map(option => ({
        ...option,
        selected: option.id === optionId
      }));
      setAnswers(prev => ({
        ...prev,
        [currentStepData.id]: updatedOptions
      }));
    }
  };

  const canProceed = () => {
    const currentAnswers = answers[currentStepData.id];
    if (!currentAnswers) return false;
    
    if (currentStepData.multiSelect) {
      return currentAnswers.some(option => option.selected);
    } else {
      return currentAnswers.some(option => option.selected);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar onboarding e navegar para o dashboard
      navigation.replace('Principal');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => {
    return (
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
  };

  const renderOptions = () => {
    return (
      <View style={styles.optionsContainer}>
        {currentStepData.options.map((option) => (
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
              {option.selected && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProgressBar()}

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentStepData.question}</Text>
          {currentStepData.instruction && (
            <Text style={styles.instructionText}>{currentStepData.instruction}</Text>
          )}
        </View>

        {renderOptions()}
      </ScrollView>

      {/* Botões de navegação */}
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
          <Text style={styles.nextButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
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
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  progressTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
  },
  
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  
  progressSegment: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: 2,
  },
  
  progressSegmentActive: {
    backgroundColor: colors.success,
  },
  
  questionContainer: {
    marginBottom: spacing.xl,
  },
  
  questionText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.relaxed,
  },
  
  instructionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
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
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[700],
    ...shadows.base,
  },
  
  optionButtonSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  optionContent: {
    flex: 1,
  },
  
  optionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  optionTextSelected: {
    color: colors.neutral[50],
  },
  
  optionDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },
  
  optionDescriptionSelected: {
    color: colors.neutral[200],
  },
  
  recommendedTag: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.blue,
    marginTop: spacing.xs,
  },
  
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  optionIndicatorSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  checkmark: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[800],
  },
  
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
  },
  
  backButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  nextButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...shadows.lg,
  },
  
  nextButtonDisabled: {
    backgroundColor: colors.neutral[700],
  },
  
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
});
