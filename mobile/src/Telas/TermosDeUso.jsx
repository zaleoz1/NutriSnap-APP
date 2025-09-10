import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function TermosDeUso() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.titulo}>Termos de Uso do NutriSnap</Text>
        <Text style={styles.data}>Última atualização: 10 de setembro de 2025</Text>
        <Text style={styles.paragrafo}>
          Bem-vindo ao NutriSnap! Este aplicativo foi desenvolvido como parte de um trabalho de extensão universitária, com o objetivo de ajudar pessoas a monitorar sua alimentação, definir metas de saúde e treinos, e utilizar inteligência artificial para facilitar o cuidado com o bem-estar.
        </Text>

        <Text style={styles.subtitulo}>1. Aceitação dos Termos</Text>
        <Text style={styles.paragrafo}>
          Ao acessar e usar o NutriSnap, você reconhece que leu, entendeu e concorda em ficar vinculado a estes Termos de Uso. Caso não concorde, por favor, não utilize o aplicativo.
        </Text>

        <Text style={styles.subtitulo}>2. Funcionalidades do Aplicativo</Text>
        <Text style={styles.paragrafo}>
          O NutriSnap permite que você monitore calorias diárias, defina metas como ganho muscular ou limite de calorias, gere planos de treino personalizados a partir de quizzes feitos por IA, e utilize o scanner inteligente para identificar calorias de alimentos por meio de fotos.
        </Text>

        <Text style={styles.subtitulo}>3. Uso do Serviço</Text>
        <Text style={styles.paragrafo}>
          O aplicativo é destinado ao uso pessoal e não comercial. Você concorda em utilizar o NutriSnap apenas para fins lícitos e de acordo com estes termos.
        </Text>

        <Text style={styles.subtitulo}>4. Privacidade e Dados</Text>
        <Text style={styles.paragrafo}>
          Suas informações pessoais e dados de saúde são tratados com responsabilidade. Não compartilhamos seus dados com terceiros sem sua autorização. Para mais detalhes, consulte nossa Política de Privacidade.
        </Text>

        <Text style={styles.subtitulo}>5. Responsabilidade</Text>
        <Text style={styles.paragrafo}>
          O NutriSnap oferece recomendações baseadas em inteligência artificial, mas não substitui acompanhamento profissional de saúde ou nutrição. Sempre consulte especialistas para decisões importantes sobre sua saúde.
        </Text>

        <Text style={styles.subtitulo}>6. Alterações nos Termos</Text>
        <Text style={styles.paragrafo}>
          Podemos atualizar estes Termos de Uso periodicamente. Recomendamos que você revise esta página regularmente para estar ciente de quaisquer mudanças.
        </Text>

        <Text style={styles.subtitulo}>7. Contato</Text>
        <Text style={styles.paragrafo}>
          Em caso de dúvidas, sugestões ou solicitações relacionadas ao NutriSnap, entre em contato com a equipe de desenvolvimento pelo e-mail informado na página Sobre.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  scrollContainer: {
    padding: spacing.xl,
  },
  titulo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[100],
    marginBottom: spacing.md,
  },
  data: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.lg,
  },
  subtitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[200],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragrafo: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    lineHeight: typography.lineHeight.tall,
    marginBottom: spacing.md,
  },
});