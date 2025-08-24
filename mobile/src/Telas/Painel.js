import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function TelaPrincipal({ navigation }) {
  const { usuario, token, sair } = usarAutenticacao();
  const [meta, setMeta] = useState(null);
  const [consumido, setConsumido] = useState(0);
  const [modalVisivel, setModalVisivel] = useState(false);

  async function carregarDados() {
    try {
      const m = await buscarApi('/api/metas', { token });
      setMeta(m);
      const refeicoes = await buscarApi('/api/refeicoes', { token });
      const hoje = new Date().toDateString();
      const total = refeicoes
        .filter(r => new Date(r.timestamp).toDateString() === hoje)
        .reduce((soma, r) => soma + (r.calorias_totais || 0), 0);
      setConsumido(total);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  const diario = meta?.calorias_diarias || 2290;
  const restantes = diario - consumido;
  const percentual = Math.min(100, Math.round((consumido / diario) * 100));

  function lidarComSair() {
    sair();
    navigation.replace('Login');
  }

  function abrirModal() {
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
  }

  function navegarPara(opcao) {
    fecharModal();
    switch (opcao) {
      case 'alimento':
        navigation.navigate('Refeicoes');
        break;
      case 'imc':
        navigation.navigate('IMC');
        break;
      case 'codigo_barras':
        // Por enquanto, navegar para refeições (pode ser implementado depois)
        navigation.navigate('Refeicoes');
        break;
      case 'treinos':
        navigation.navigate('PlanoTreino');
        break;
    }
  }

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
      >
        {/* Header com branding */}
        <View style={estilos.header}>
          <View style={estilos.iconePerfil}>
            <Text style={estilos.textoPerfil}>
              {usuario?.nome?.charAt(0) || 'U'}
            </Text>
          </View>
          
          <View style={estilos.containerMarca}>
            <Text style={estilos.nomeApp}>nutrisnap</Text>
          </View>
          
          <TouchableOpacity style={estilos.iconeNotificacao}>
            <Ionicons name="notifications" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Seção "Hoje" */}
        <View style={estilos.secaoHoje}>
          <Text style={estilos.tituloHoje}>Hoje</Text>
          <TouchableOpacity style={estilos.botaoEditar}>
            <Text style={estilos.textoBotaoEditar}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal de calorias */}
        <View style={estilos.cardCalorias}>
          <Text style={estilos.tituloCalorias}>Calorias</Text>
          <Text style={estilos.formulaCalorias}>
            Restantes = Meta - Alimentos + Exercício
          </Text>
          
          <View style={estilos.displayPrincipalCalorias}>
            <View style={estilos.circuloCalorias}>
              <Text style={estilos.numeroCalorias}>{restantes.toLocaleString()}</Text>
              <Text style={estilos.rotuloCalorias}>Restantes</Text>
            </View>
            
            <View style={estilos.detalhesCalorias}>
              <View style={estilos.itemDetalheCalorias}>
                <MaterialIcons name="flag" size={16} color={colors.neutral[400]} />
                <Text style={estilos.textoDetalhe}>Meta base</Text>
                <Text style={estilos.valorDetalhe}>{diario.toLocaleString()}</Text>
              </View>
              
              <View style={estilos.itemDetalheCalorias}>
                <MaterialIcons name="restaurant" size={16} color={colors.neutral[400]} />
                <Text style={estilos.textoDetalhe}>Alimentos</Text>
                <Text style={estilos.valorDetalhe}>{consumido.toLocaleString()}</Text>
              </View>
              
              <View style={estilos.itemDetalheCalorias}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.neutral[400]} />
                <Text style={estilos.textoDetalhe}>Exercício</Text>
                <Text style={estilos.valorDetalhe}>0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grid de métricas */}
        <View style={estilos.gridMetricas}>
          <View style={estilos.linhaMetricas}>
            {/* Card de Passos */}
            <View style={estilos.cardMetrica}>
              <Text style={estilos.tituloMetrica}>Passos</Text>
              <View style={estilos.conteudoMetrica}>
                <FontAwesome5 name="shoe-prints" size={16} color={colors.accent.pink} />
                <Text style={estilos.valorMetrica}>26</Text>
              </View>
              <Text style={estilos.metaMetrica}>Meta: 10.000 passos</Text>
              <View style={estilos.barraProgressoMetrica}>
                <View style={[estilos.preenchimentoProgressoMetrica, { width: '0.26%' }]} />
              </View>
            </View>
            
            {/* Card de Exercício */}
            <View style={estilos.cardMetrica}>
              <TouchableOpacity style={estilos.botaoAdicionar}>
                <Ionicons name="add" size={20} color={colors.neutral[50]} />
              </TouchableOpacity>
              <Text style={estilos.tituloMetrica}>Exercício</Text>
              <View style={estilos.conteudoMetrica}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.neutral[400]} />
                <Text style={estilos.valorMetrica}>0 cal</Text>
              </View>
              <View style={estilos.conteudoMetrica}>
                <MaterialIcons name="access-time" size={16} color={colors.neutral[400]} />
                <Text style={estilos.valorMetrica}>00:00 h</Text>
              </View>
            </View>
          </View>
          
          <View style={estilos.linhaMetricas}>
            {/* Card de Peso */}
            <View style={estilos.cardMetrica}>
              <Text style={estilos.tituloMetrica}>Peso</Text>
              <Text style={estilos.subtituloMetrica}>Últimos 90 dias</Text>
              <Text style={estilos.valorPeso}>82</Text>
            </View>
            
            {/* Card de Progresso */}
            <View style={estilos.cardMetrica}>
              <TouchableOpacity style={estilos.botaoAdicionar}>
                <Ionicons name="add" size={20} color={colors.neutral[50]} />
              </TouchableOpacity>
              <Text style={estilos.tituloMetrica}>Progresso</Text>
            </View>
          </View>
        </View>

        {/* Botão de sair */}
        <TouchableOpacity 
          onPress={lidarComSair} 
          style={estilos.botaoSair}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotaoSair}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navegação inferior */}
      <View style={estilos.navegacaoInferior}>
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="dashboard" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Painel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="book" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Diário</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.botaoCentral} onPress={abrirModal}>
          <Ionicons name="add" size={28} color={colors.neutral[50]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="trending-up" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Progresso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={estilos.itemNavegacao}>
          <MaterialIcons name="more-horiz" size={20} color={colors.neutral[400]} />
          <Text style={estilos.rotuloNavegacao}>Mais</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de opções */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <TouchableOpacity 
          style={estilos.overlayModal} 
          activeOpacity={1} 
          onPress={fecharModal}
        >
          <View style={estilos.conteudoModal}>
            <View style={estilos.cabecalhoModal}>
              <Text style={estilos.tituloModal}>O que você quer fazer?</Text>
              <TouchableOpacity onPress={fecharModal} style={estilos.botaoFechar}>
                <Ionicons name="close" size={24} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={estilos.gridOpcoes}>
              {/* Registrar Alimento */}
              <TouchableOpacity 
                style={estilos.cardOpcao} 
                onPress={() => navegarPara('alimento')}
                activeOpacity={0.8}
              >
                <View style={[estilos.iconeOpcao, { backgroundColor: colors.accent.green + '20' }]}>
                  <MaterialIcons name="restaurant" size={28} color={colors.accent.green} />
                </View>
                <Text style={estilos.tituloOpcao}>Registrar Alimento</Text>
                <Text style={estilos.descricaoOpcao}>Fotografe sua refeição</Text>
              </TouchableOpacity>

              {/* Calcular IMC */}
              <TouchableOpacity 
                style={estilos.cardOpcao} 
                onPress={() => navegarPara('imc')}
                activeOpacity={0.8}
              >
                <View style={[estilos.iconeOpcao, { backgroundColor: colors.accent.blue + '20' }]}>
                  <MaterialIcons name="analytics" size={28} color={colors.accent.blue} />
                </View>
                <Text style={estilos.tituloOpcao}>Calcular IMC</Text>
                <Text style={estilos.descricaoOpcao}>Índice de massa corporal</Text>
              </TouchableOpacity>

              {/* Código de Barras */}
              <TouchableOpacity 
                style={estilos.cardOpcao} 
                onPress={() => navegarPara('codigo_barras')}
                activeOpacity={0.8}
              >
                <View style={[estilos.iconeOpcao, { backgroundColor: colors.accent.purple + '20' }]}>
                  <MaterialIcons name="qr-code-scanner" size={28} color={colors.accent.purple} />
                </View>
                <Text style={estilos.tituloOpcao}>Código de Barras</Text>
                <Text style={estilos.descricaoOpcao}>Escaneie produtos</Text>
              </TouchableOpacity>

              {/* Treinos */}
              <TouchableOpacity 
                style={estilos.cardOpcao} 
                onPress={() => navegarPara('treinos')}
                activeOpacity={0.8}
              >
                <View style={[estilos.iconeOpcao, { backgroundColor: colors.accent.orange + '20' }]}>
                  <MaterialIcons name="fitness-center" size={28} color={colors.accent.orange} />
                </View>
                <Text style={estilos.tituloOpcao}>Treinos</Text>
                <Text style={estilos.descricaoOpcao}>Plano de exercícios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  iconePerfil: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  textoPerfil: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  
  containerMarca: {
    flex: 1,
    alignItems: 'center',
  },
  
  nomeApp: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.blue,
    marginBottom: spacing.xs,
  },
  
  iconeNotificacao: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  textoNotificacao: {
    fontSize: 20,
  },
  
  secaoHoje: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  tituloHoje: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  botaoEditar: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.base,
  },
  
  textoBotaoEditar: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  cardCalorias: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  tituloCalorias: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.sm,
  },
  
  formulaCalorias: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.lg,
  },
  
  displayPrincipalCalorias: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  circuloCalorias: {
    flex: 1,
    alignItems: 'center',
  },
  
  numeroCalorias: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
    lineHeight: typography.lineHeight.tight,
  },
  
  rotuloCalorias: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  
  detalhesCalorias: {
    flex: 1,
    gap: spacing.md,
  },
  
  itemDetalheCalorias: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  iconeDetalhe: {
    fontSize: 16,
  },
  
  textoDetalhe: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
  
  valorDetalhe: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  gridMetricas: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  linhaMetricas: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  cardMetrica: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    position: 'relative',
  },
  
  tituloMetrica: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.md,
  },
  
  subtituloMetrica: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  
  conteudoMetrica: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  iconeMetrica: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  
  valorMetrica: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },
  
  metaMetrica: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  
  barraProgressoMetrica: {
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.full,
    overflow: 'hidden',
  },
  
  preenchimentoProgressoMetrica: {
    height: '100%',
    backgroundColor: colors.accent.pink,
    borderRadius: borders.radius.full,
  },
  
  valorPeso: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[50],
  },
  
  botaoAdicionar: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  textoBotaoAdicionar: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  
  botaoSair: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  
  textoBotaoSair: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
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
    gap: spacing.xs,
  },
  
  iconeNavegacao: {
    fontSize: 20,
    color: colors.neutral[400],
  },
  
  rotuloNavegacao: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontWeight: typography.fontWeight.medium,
  },
  
  botaoCentral: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...shadows.lg,
  },
  
  textoBotaoCentral: {
    color: colors.neutral[50],
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },

  // Estilos do modal
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  conteudoModal: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },

  cabecalhoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  tituloModal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    flex: 1,
  },

  botaoFechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridOpcoes: {
    gap: spacing.md,
  },

  cardOpcao: {
    backgroundColor: colors.neutral[700],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.base,
  },

  iconeOpcao: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloOpcao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },

  descricaoOpcao: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },
});