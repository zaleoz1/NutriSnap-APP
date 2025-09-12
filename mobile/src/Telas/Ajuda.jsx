import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../styles/globalStyles';

export default function Ajuda({ navigation }) {
  const abrirEmail = () => {
    Linking.openURL('mailto:kaioalexandre2681@gmail.com?subject=Ajuda NutriSnap');
  };

  const abrirWhatsApp = () => {
    Linking.openURL('https://wa.me/5599996458528?text=Olá, preciso de ajuda com o NutriSnap!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Bloco do botão de voltar + título */}
        <View style={styles.headerBloco}>
          <View style={styles.headerBackground}>
            
            <Text style={styles.titulo}>Ajuda & Suporte</Text>
          </View>
        </View>

        <Text style={styles.paragrafo}>
          Precisa de ajuda para usar o NutriSnap? Veja abaixo as perguntas frequentes, dicas de uso e formas de contato com nossa equipe.
        </Text>

        <Text style={styles.subtitulo}>Perguntas Frequentes</Text>
        <View style={styles.faqItem}>
          <Text style={styles.faqPergunta}>• Como faço para registrar minhas refeições?</Text>
          <Text style={styles.faqResposta}>Acesse a tela "Refeições" no menu principal e clique em "Adicionar Refeição". Preencha os campos e salve.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqPergunta}>• Como funciona o scanner de alimentos?</Text>
          <Text style={styles.faqResposta}>Na tela de scanner, tire uma foto do alimento. A IA irá analisar e mostrar a quantidade de calorias estimada.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqPergunta}>• Posso definir metas de treino e alimentação?</Text>
          <Text style={styles.faqResposta}>Sim! Na tela "Metas", escolha seu objetivo, como ganho muscular ou limite de calorias diárias.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqPergunta}>• Como altero meus dados pessoais?</Text>
          <Text style={styles.faqResposta}>Vá em "Configurações" &gt; "Editar Perfil" para atualizar nome, peso, altura e outros dados.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqPergunta}>• O NutriSnap substitui acompanhamento profissional?</Text>
          <Text style={styles.faqResposta}>Não. O app oferece recomendações, mas sempre consulte profissionais de saúde para decisões importantes.</Text>
        </View>

        <Text style={styles.subtitulo}>Dicas de Uso</Text>
        <Text style={styles.paragrafo}>
          • Mantenha seus dados atualizados para recomendações mais precisas.
          {'\n'}• Use o quiz para receber planos de treino personalizados.
          {'\n'}• Ative notificações para não esquecer de registrar refeições e treinos.
        </Text>

        <Text style={styles.subtitulo}>Contato</Text>
        <Text style={styles.paragrafo}>
          Se não encontrou sua resposta, fale com a equipe:
        </Text>
        <View style={styles.contatoContainer}>
          <TouchableOpacity style={styles.contatoBotao} onPress={abrirEmail}>
            <MaterialIcons name="email" size={24} color={colors.primary[600]} />
            <Text style={styles.contatoTexto}>E-mail: kaioalexandre2681@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contatoBotao} onPress={abrirWhatsApp}>
            <MaterialIcons name="chat" size={24} color={colors.primary[600]} />
            <Text style={styles.contatoTexto}>WhatsApp: (99)99645-8528</Text>
          </TouchableOpacity>
        </View>
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
  headerBloco: {
    marginBottom: spacing['2xl'],
  },
  headerBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    paddingTop: 40, // padding top maior para o header
    marginHorizontal: -spacing.xl,
    marginTop: -spacing.xl,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titulo: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[100],
    textAlign: 'center',
    flex: 1,
  },
  textoVoltar: {
    display: 'none', // Esconde o texto do botão de voltar
  },
  subtitulo: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[200],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragrafo: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    lineHeight: typography.lineHeight.tall,
    marginBottom: spacing.md,
  },
  faqItem: {
    marginBottom: spacing.md,
  },
  faqPergunta: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[300],
  },
  faqResposta: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  contatoContainer: {
    marginTop: spacing.md,
  },
  contatoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contatoTexto: {
    marginLeft: spacing.sm,
    color: colors.primary[100],
    fontSize: typography.fontSize.base,
  },
});