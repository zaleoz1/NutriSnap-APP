import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function PoliticaPrivacidade() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.titulo}>Política de Privacidade do NutriSnap</Text>
        <Text style={styles.data}>Última atualização: 10 de setembro de 2025</Text>
        <Text style={styles.paragrafo}>
          O NutriSnap foi criado como parte de um trabalho de extensão universitária, com o objetivo de ajudar pessoas a monitorar sua alimentação, treinos e metas de saúde de forma inteligente e personalizada. Valorizamos a sua privacidade e o cuidado com seus dados.
        </Text>

        <Text style={styles.subtitulo}>1. Coleta de Dados</Text>
        <Text style={styles.paragrafo}>
          Coletamos apenas os dados necessários para o funcionamento do aplicativo, como informações de perfil, respostas de quizzes, registros de refeições, metas e fotos de alimentos para análise de calorias por IA.
        </Text>

        <Text style={styles.subtitulo}>2. Uso das Informações</Text>
        <Text style={styles.paragrafo}>
          Os dados coletados são utilizados exclusivamente para oferecer as funcionalidades do NutriSnap, como monitoramento de calorias, geração de planos de treino, definição de metas e análise alimentar por IA. Não utilizamos seus dados para fins comerciais.
        </Text>

        <Text style={styles.subtitulo}>3. Compartilhamento de Dados</Text>
        <Text style={styles.paragrafo}>
          Não compartilhamos suas informações pessoais com terceiros sem sua autorização. Seus dados permanecem protegidos e restritos à equipe de desenvolvimento do projeto.
        </Text>

        <Text style={styles.subtitulo}>4. Segurança</Text>
        <Text style={styles.paragrafo}>
          Adotamos medidas de segurança para proteger seus dados contra acesso não autorizado, alteração ou divulgação. Recomendamos que você utilize senhas seguras e mantenha seu dispositivo protegido.
        </Text>

        <Text style={styles.subtitulo}>5. Direitos do Usuário</Text>
        <Text style={styles.paragrafo}>
          Você pode solicitar a atualização, correção ou exclusão de seus dados pessoais a qualquer momento. Para isso, entre em contato com a equipe de desenvolvimento pelo e-mail informado na página Sobre.
        </Text>

        <Text style={styles.subtitulo}>6. Uso de Inteligência Artificial</Text>
        <Text style={styles.paragrafo}>
          As funcionalidades de IA, como o scanner de alimentos e geração de treinos, utilizam seus dados apenas para personalizar as recomendações. Nenhuma informação sensível é compartilhada com provedores externos sem seu consentimento.
        </Text>

        <Text style={styles.subtitulo}>7. Alterações na Política</Text>
        <Text style={styles.paragrafo}>
          Esta política pode ser atualizada periodicamente para garantir maior transparência e segurança. Recomendamos que você revise esta página regularmente.
        </Text>

        <Text style={styles.subtitulo}>8. Contato</Text>
        <Text style={styles.paragrafo}>
          Em caso de dúvidas ou solicitações sobre privacidade, entre em contato com a equipe pelo e-mail disponível na página Sobre.
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