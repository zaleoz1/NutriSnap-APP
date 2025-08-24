import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaPainel({ navegacao }) {
  const { usuario } = usarAutenticacao();
  const [dataAtual] = useState(new Date());

  // Dados simulados para demonstração
  const dadosUsuario = {
    nome: usuario?.nome || 'Usuário',
    caloriasDiarias: 2290,
    caloriasConsumidas: 0,
    caloriasExercicio: 0,
    passos: 26,
    peso: 82,
    ingestaoAgua: 0
  };

  const caloriasRestantes = dadosUsuario.caloriasDiarias - dadosUsuario.caloriasConsumidas + dadosUsuario.caloriasExercicio;
  const progressoCalorias = Math.min(100, Math.round((dadosUsuario.caloriasConsumidas / dadosUsuario.caloriasDiarias) * 100));
  const progressoPassos = Math.min(100, Math.round((dadosUsuario.passos / 10000) * 100));

  const formatarData = (data) => {
    const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return data.toLocaleDateString('pt-BR', opcoes);
  };

  const obterSaudacao = () => {
    const hora = dataAtual.getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.conteudoScroll}
      >
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <View style={estilos.informacoesUsuario}>
            <View style={estilos.containerAvatar}>
              <Text style={estilos.textoAvatar}>
                {dadosUsuario.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={estilos.detalhesUsuario}>
              <Text style={estilos.saudacao}>{obterSaudacao()}, {dadosUsuario.nome}!</Text>
              <Text style={estilos.data}>{formatarData(dataAtual)}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={estilos.botaoNotificacao}>
            <Ionicons name="notifications" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Card principal de calorias */}
        <View style={estilos.cardPrincipal}>
          <View style={estilos.cabecalhoCard}>
            <Text style={estilos.tituloCard}>Calorias</Text>
            <TouchableOpacity style={estilos.botaoEditar}>
              <Text style={estilos.textoBotaoEditar}>EDITAR</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={estilos.subtituloCalorias}>
            Restantes = Meta - Alimentos + Exercício
          </Text>
          
          <View style={estilos.exibicaoCalorias}>
            <View style={estilos.circuloCalorias}>
              <Text style={estilos.numeroCalorias}>{caloriasRestantes}</Text>
              <Text style={estilos.rotuloCalorias}>Restantes</Text>
            </View>
            
            <View style={estilos.detalhamentoCalorias}>
              <View style={estilos.itemDetalhamento}>
                <MaterialIcons name="flag" size={16} color={colors.neutral[400]} />
                <Text style={estilos.rotuloDetalhamento}>Meta base</Text>
                <Text style={estilos.valorDetalhamento}>{dadosUsuario.caloriasDiarias}</Text>
              </View>
              
              <View style={estilos.itemDetalhamento}>
                <MaterialIcons name="restaurant" size={16} color={colors.neutral[400]} />
                <Text style={estilos.rotuloDetalhamento}>Alimentos</Text>
                <Text style={estilos.valorDetalhamento}>{dadosUsuario.caloriasConsumidas}</Text>
              </View>
              
              <View style={estilos.itemDetalhamento}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.neutral[400]} />
                <Text style={estilos.rotuloDetalhamento}>Exercício</Text>
                <Text style={estilos.valorDetalhamento}>{dadosUsuario.caloriasExercicio}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Banner de anúncio */}
        <View style={estilos.bannerAnuncio}>
          <View style={estilos.conteudoAnuncio}>
            <View style={estilos.anuncioEsquerda}>
              <Text style={estilos.logoAnuncio}>rent day</Text>
              <Text style={estilos.subtextoAnuncio}>rentcars</Text>
            </View>
            <View style={estilos.anuncioCentro}>
              <Text style={estilos.textoAnuncio}>Chance única para alugar carro com desconto!</Text>
            </View>
            <View style={estilos.anuncioDireita}>
              <Text style={estilos.descontoAnuncio}>% ATÉ 40% OFF</Text>
              <View style={estilos.imagemAnuncio}>
                <MaterialIcons name="directions-car" size={24} color={colors.neutral[700]} />
              </View>
              <TouchableOpacity style={estilos.botaoAnuncio}>
                <Text style={estilos.textoBotaoAnuncio}>Baixe agora</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Indicadores do carrossel */}
          <View style={estilos.indicadoresAnuncio}>
            <View style={[estilos.indicadorAnuncio, estilos.indicadorAnuncioAtivo]} />
            <View style={estilos.indicadorAnuncio} />
            <View style={estilos.indicadorAnuncio} />
          </View>
        </View>

        {/* Call to action Premium */}
        <View style={estilos.chamadaPremium}>
          <Text style={estilos.textoPremium}>Diga adeus aos anúncios. Seja Premium</Text>
          <TouchableOpacity style={estilos.botaoPremium}>
            <Text style={estilos.textoBotaoPremium}>Seja Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Cards de métricas */}
        <View style={estilos.gradeMetricas}>
          <View style={estilos.cardMetrica}>
            <Text style={estilos.tituloMetrica}>Passos</Text>
            <View style={estilos.conteudoMetrica}>
              <FontAwesome5 name="shoe-prints" size={20} color={colors.accent.pink} />
              <Text style={estilos.valorMetrica}>{dadosUsuario.passos}</Text>
            </View>
            <Text style={estilos.metaMetrica}>Meta: 10.000 passos</Text>
            <View style={estilos.progressoMetrica}>
              <View style={[estilos.preenchimentoProgressoMetrica, { width: `${progressoPassos}%` }]} />
            </View>
          </View>
          
          <View style={estilos.cardMetrica}>
            <TouchableOpacity style={estilos.botaoAdicionar}>
              <Ionicons name="add" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
            <Text style={estilos.tituloMetrica}>Exercício</Text>
            <View style={estilos.conteudoMetrica}>
              <MaterialIcons name="local-fire-department" size={20} color={colors.neutral[400]} />
              <Text style={estilos.valorMetrica}>{dadosUsuario.caloriasExercicio} cal</Text>
            </View>
            <Text style={estilos.metaMetrica}>00:00 h</Text>
          </View>
          
          <View style={estilos.cardMetrica}>
            <TouchableOpacity style={estilos.botaoAdicionar}>
              <Ionicons name="add" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
            <Text style={estilos.tituloMetrica}>Peso</Text>
            <Text style={estilos.valorMetrica}>{dadosUsuario.peso}</Text>
            <Text style={estilos.metaMetrica}>Últimos 90 dias</Text>
          </View>
          
          <View style={estilos.cardMetrica}>
            <TouchableOpacity style={estilos.botaoAdicionar}>
              <Ionicons name="add" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
            <Text style={estilos.tituloMetrica}>Água</Text>
            <Text style={estilos.valorMetrica}>{dadosUsuario.ingestaoAgua}</Text>
            <Text style={estilos.metaMetrica}>Meta: 2L</Text>
          </View>
        </View>

        {/* Seções de refeições */}
        <View style={estilos.secaoRefeicoes}>
          <Text style={estilos.tituloRefeicoes}>Refeições de Hoje</Text>
          
          {['Café da manhã', 'Almoço', 'Jantar'].map((refeicao, indice) => (
            <View key={indice} style={estilos.itemRefeicao}>
              <Text style={estilos.nomeRefeicao}>{refeicao}</Text>
              <TouchableOpacity style={estilos.botaoAdicionarRefeicao}>
                <Text style={estilos.textoBotaoAdicionarRefeicao}>ADICIONAR ALIMENTO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.menuRefeicao}>
                <Text style={estilos.textoMenuRefeicao}>⋯</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Botões de ação rápida */}
        <View style={estilos.acoesRapidas}>
          <TouchableOpacity style={estilos.botaoAcaoRapida}>
            <View style={estilos.iconeAcaoRapida}>
              <MaterialIcons name="search" size={24} color={colors.primary[600]} />
            </View>
            <Text style={estilos.textoAcaoRapida}>Registrar alimento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={estilos.botaoAcaoRapida}>
            <View style={estilos.iconeAcaoRapida}>
              <MaterialIcons name="qr-code-scanner" size={24} color={colors.primary[600]} />
            </View>
            <Text style={estilos.textoAcaoRapida}>Leitor de código de barras</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de navegação inferior */}
      <View style={estilos.navegacaoInferior}>
        <TouchableOpacity style={[estilos.itemNavegacao, estilos.itemNavegacaoAtivo]}>
          <MaterialIcons name="dashboard" size={20} color={colors.primary[600]} />
          <Text style={estilos.rotuloNavegacao}>Painel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="book" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Diário</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="restaurant" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Refeições</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="trending-up" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Progresso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="settings" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Mais</Text>
        </TouchableOpacity>
      </View>
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
  
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  informacoesUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  containerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  textoAvatar: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  detalhesUsuario: {
    flex: 1,
  },
  
  saudacao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },
  
  data: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  botaoNotificacao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconeNotificacao: {
    fontSize: 20,
  },
  
  cardPrincipal: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  
  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  tituloCard: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  botaoEditar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  textoBotaoEditar: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[400],
  },
  
  subtituloCalorias: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  exibicaoCalorias: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  circuloCalorias: {
    flex: 1,
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  
  numeroCalorias: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[400],
    lineHeight: typography.lineHeight.tight,
  },
  
  rotuloCalorias: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  detalhamentoCalorias: {
    flex: 1,
    gap: spacing.md,
  },
  
  itemDetalhamento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  iconeDetalhamento: {
    fontSize: 16,
  },
  
  rotuloDetalhamento: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    flex: 1,
  },
  
  valorDetalhamento: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  bannerAnuncio: {
    backgroundColor: colors.accent.yellow,
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.base,
  },
  
  conteudoAnuncio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  anuncioEsquerda: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  logoAnuncio: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  
  subtextoAnuncio: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  },
  
  anuncioCentro: {
    flex: 1,
    marginRight: spacing.md,
  },
  
  textoAnuncio: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  
  anuncioDireita: {
    alignItems: 'center',
  },
  
  descontoAnuncio: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  
  imagemAnuncio: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  
  iconeCarroAnuncio: {
    fontSize: 24,
  },
  
  botaoAnuncio: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.md,
  },
  
  textoBotaoAnuncio: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  indicadoresAnuncio: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  
  indicadorAnuncio: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[400],
  },
  
  indicadorAnuncioAtivo: {
    backgroundColor: colors.primary[600],
    width: 18,
  },
  
  chamadaPremium: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  textoPremium: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  
  botaoPremium: {
    backgroundColor: colors.accent.yellow,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.lg,
  },
  
  textoBotaoPremium: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  
  gradeMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  
  cardMetrica: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    ...shadows.base,
  },
  
  tituloMetrica: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  
  botaoAdicionar: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  textoBotaoAdicionar: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  conteudoMetrica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  
  iconeMetrica: {
    fontSize: 20,
  },
  
  valorMetrica: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  metaMetrica: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  
  progressoMetrica: {
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  
  preenchimentoProgressoMetrica: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borders.radius.full,
  },
  
  secaoRefeicoes: {
    marginBottom: spacing.lg,
  },
  
  tituloRefeicoes: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
  },
  
  itemRefeicao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.base,
  },
  
  nomeRefeicao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    flex: 1,
  },
  
  botaoAdicionarRefeicao: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.md,
    marginRight: spacing.sm,
  },
  
  textoBotaoAdicionarRefeicao: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  menuRefeicao: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  textoMenuRefeicao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[400],
  },
  
  acoesRapidas: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  botaoAcaoRapida: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.base,
  },
  
  iconeAcaoRapida: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  
  emojiAcaoRapida: {
    fontSize: 24,
  },
  
  textoAcaoRapida: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  
  navegacaoInferior: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[800],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[700],
  },
  
  itemNavegacao: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  
  itemNavegacaoAtivo: {
    borderTopWidth: 2,
    borderTopColor: colors.primary[600],
  },
  
  iconeNavegacao: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  
  rotuloNavegacao: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
});
