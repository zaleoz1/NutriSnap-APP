import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Switch, Alert, Dimensions, Animated } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, typography, spacing, borders, shadows } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

export default function TelaConfiguracoes({ navigation }) {
  const { usuario, fazerLogout } = usarAutenticacao();
  
  // Estados para as configurações
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [somAtivo, setSomAtivo] = useState(true);
  const [vibracaoAtiva, setVibracaoAtiva] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [modoEconomia, setModoEconomia] = useState(false);
  const [sincronizacaoAutomatica, setSincronizacaoAutomatica] = useState(true);

  const lidarComEditarPerfil = () => {
    Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento');
  };

  const lidarComAlterarSenha = () => {
    Alert.alert('Alterar Senha', 'Funcionalidade em desenvolvimento');
  };

  const lidarComPrivacidade = () => {
    Alert.alert('Privacidade', 'Funcionalidade em desenvolvimento');
  };

  const lidarComTermos = () => {
    Alert.alert('Termos de Uso', 'Funcionalidade em desenvolvimento');
  };

  const lidarComPolitica = () => {
    Alert.alert('Política de Privacidade', 'Funcionalidade em desenvolvimento');
  };

  const lidarComSobre = () => {
    Alert.alert('Sobre o App', 'NutriSnap v1.0.0\n\nUm aplicativo para controle nutricional e saúde.');
  };

  const lidarComAjuda = () => {
    Alert.alert('Ajuda', 'Funcionalidade em desenvolvimento');
  };

  const lidarComFeedback = () => {
    Alert.alert('Enviar Feedback', 'Funcionalidade em desenvolvimento');
  };

  const lidarComLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await fazerLogout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (erro) {
              console.error('Erro ao fazer logout:', erro);
            }
          }
        }
      ]
    );
  };

  const renderizarSecao = ({ titulo, children, icone, cor = colors.primary[600], gradiente = false }) => (
    <View style={estilos.secao}>
      <View style={estilos.cabecalhoSecao}>
        {gradiente ? (
          <LinearGradient
            colors={[cor, cor + '80']}
            style={estilos.iconeSecaoGradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name={icone} size={20} color={colors.neutral[50]} />
          </LinearGradient>
        ) : (
          <View style={[estilos.iconeSecao, { backgroundColor: cor }]}>
            <MaterialIcons name={icone} size={20} color={colors.neutral[50]} />
          </View>
        )}
        <Text style={estilos.tituloSecao}>{titulo}</Text>
      </View>
      <View style={estilos.conteudoSecao}>
        {children}
      </View>
    </View>
  );

  const renderizarItemConfiguracao = ({ 
    titulo, 
    subtitulo, 
    icone, 
    acao, 
    tipo = 'botao',
    valor = null,
    onValueChange = null,
    perigoso = false,
    destaque = false
  }) => (
    <TouchableOpacity 
      style={[
        estilos.itemConfiguracao,
        perigoso && estilos.itemPerigoso,
        destaque && estilos.itemDestaque
      ]} 
      onPress={acao}
      disabled={tipo === 'switch'}
      activeOpacity={0.7}
    >
      <View style={estilos.informacoesItem}>
        <View style={[
          estilos.iconeItem,
          destaque && estilos.iconeItemDestaque
        ]}>
          <MaterialIcons 
            name={icone} 
            size={24} 
            color={perigoso ? colors.error : destaque ? colors.primary[600] : colors.neutral[400]} 
          />
        </View>
        <View style={estilos.textosItem}>
          <Text style={[
            estilos.tituloItem,
            perigoso && estilos.tituloItemPerigoso,
            destaque && estilos.tituloItemDestaque
          ]}>
            {titulo}
          </Text>
          {subtitulo && (
            <Text style={[
              estilos.subtituloItem,
              destaque && estilos.subtituloItemDestaque
            ]}>
              {subtitulo}
            </Text>
          )}
        </View>
      </View>
      
      {tipo === 'switch' && onValueChange && (
        <Switch
          value={valor}
          onValueChange={onValueChange}
          trackColor={{ false: colors.neutral[600], true: colors.primary[400] }}
          thumbColor={valor ? colors.primary[600] : colors.neutral[400]}
          ios_backgroundColor={colors.neutral[600]}
        />
      )}
      
      {tipo === 'botao' && (
        <View style={estilos.indicadorSeta}>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={perigoso ? colors.error : colors.neutral[400]} 
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Cabeçalho com gradiente */}
      <LinearGradient
        colors={[colors.primary[800], colors.primary[900], colors.neutral[900]]}
        style={estilos.cabecalhoGradiente}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={estilos.cabecalho}>
          <TouchableOpacity 
            style={estilos.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.neutral[50]} />
          </TouchableOpacity>
          
          <Text style={estilos.tituloPagina}>Configurações</Text>
          
          <View style={estilos.espacoDireita} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.conteudoScroll}
      >
        {/* Card de perfil com gradiente */}
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700], colors.primary[800]]}
          style={estilos.cardPerfilGradiente}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={estilos.cardPerfil}>
            <View style={estilos.avatarPerfil}>
              <Text style={estilos.textoAvatar}>
                {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            
            <View style={estilos.informacoesPerfil}>
              <Text style={estilos.nomeUsuario}>
                {usuario?.nome || 'Usuário'}
              </Text>
              <Text style={estilos.emailUsuario}>
                {usuario?.email || 'usuario@email.com'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={estilos.botaoEditarPerfil}
              onPress={lidarComEditarPerfil}
              activeOpacity={0.8}
            >
              <MaterialIcons name="edit" size={20} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Configurações de Conta */}
        {renderizarSecao({
          titulo: 'Conta',
          icone: 'account-circle',
          cor: colors.primary[600],
          gradiente: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Editar Perfil',
          icone: 'person',
          acao: lidarComEditarPerfil,
          destaque: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Alterar Senha',
          icone: 'lock',
          acao: lidarComAlterarSenha,
          destaque: true
        })}

        {/* Configurações do App */}
        {renderizarSecao({
          titulo: 'Preferências',
          icone: 'settings',
          cor: colors.accent.blue,
          gradiente: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Notificações',
          icone: 'notifications',
          tipo: 'switch',
          valor: notificacoesAtivas,
          onValueChange: setNotificacoesAtivas
        })}
        {renderizarItemConfiguracao({
          titulo: 'Som',
          icone: 'volume-up',
          tipo: 'switch',
          valor: somAtivo,
          onValueChange: setSomAtivo
        })}
        {renderizarItemConfiguracao({
          titulo: 'Vibração',
          icone: 'smartphone',
          tipo: 'switch',
          valor: vibracaoAtiva,
          onValueChange: setVibracaoAtiva
        })}
        {renderizarItemConfiguracao({
          titulo: 'Modo Escuro',
          icone: 'brightness-2',
          tipo: 'switch',
          valor: modoEscuro,
          onValueChange: setModoEscuro
        })}
        {renderizarItemConfiguracao({
          titulo: 'Sincronização Automática',
          icone: 'cloud-upload',
          tipo: 'switch',
          valor: sincronizacaoAutomatica,
          onValueChange: setSincronizacaoAutomatica
        })}

        {/* Suporte e Ajuda */}
        {renderizarSecao({
          titulo: 'Suporte',
          icone: 'help',
          cor: colors.accent.green,
          gradiente: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Ajuda',
          icone: 'help-outline',
          acao: lidarComAjuda
        })}
        {renderizarItemConfiguracao({
          titulo: 'Fazer Quiz',
          icone: 'quiz',
          acao: () => navigation.navigate('Quiiz'),
          destaque: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Enviar Feedback',
          icone: 'feedback',
          acao: lidarComFeedback
        })}
        {renderizarItemConfiguracao({
          titulo: 'Sobre o App',
          icone: 'info',
          acao: lidarComSobre
        })}

        {/* Legal */}
        {renderizarSecao({
          titulo: 'Legal',
          icone: 'content-paste',
          cor: colors.accent.purple,
          gradiente: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Termos de Uso',
          icone: 'description',
          acao: lidarComTermos
        })}
        {renderizarItemConfiguracao({
          titulo: 'Política de Privacidade',
          icone: 'security',
          acao: lidarComPolitica
        })}

        {/* Sair da conta */}
        {renderizarSecao({
          titulo: 'Conta',
          icone: 'logout',
          cor: colors.error,
          gradiente: true
        })}
        {renderizarItemConfiguracao({
          titulo: 'Sair da Conta',
          icone: 'logout',
          acao: lidarComLogout,
          perigoso: true
        })}

        {/* Versão do app com estilo melhorado */}
        <View style={estilos.versaoContainer}>
          <View style={estilos.versaoCard}>
            <Text style={estilos.textoVersao}>NutriSnap v1.0.0</Text>
            <Text style={estilos.textoCopyright}>
              © 2024 NutriSnap Team. Todos os direitos reservados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },

  cabecalhoGradiente: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },

  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[800] + '80',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  tituloPagina: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textShadowColor: colors.neutral[900],
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  espacoDireita: {
    width: 44,
  },

  scrollView: {
    flex: 1,
  },

  conteudoScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },

  cardPerfilGradiente: {
    borderRadius: borders.radius['2xl'],
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
    ...shadows.xl,
  },

  cardPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
  },

  avatarPerfil: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.neutral[50] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    borderWidth: 3,
    borderColor: colors.neutral[50] + '40',
    ...shadows.lg,
  },

  textoAvatar: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  informacoesPerfil: {
    flex: 1,
  },

  nomeUsuario: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
    textShadowColor: colors.neutral[900],
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  emailUsuario: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[100],
    textShadowColor: colors.neutral[900],
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  botaoEditarPerfil: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  secao: {
    marginBottom: spacing['xl'],
    marginTop: spacing.xl,
  },

  cabecalhoSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
   
  },

  iconeSecao: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.base,
  },

  iconeSecaoGradiente: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.base,
  },

  tituloSecao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    textShadowColor: colors.neutral[900],
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  conteudoSecao: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700] + '50',
  },

  itemConfiguracao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700] + '30',
    backgroundColor: colors.neutral[800],
  },

  itemPerigoso: {
    borderBottomColor: colors.error + '20',
    backgroundColor: colors.error + '05',
  },

  itemDestaque: {
    backgroundColor: colors.primary[900] + '20',
    borderBottomColor: colors.primary[700] + '30',
  },

  informacoesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconeItem: {
    width: 44,
    alignItems: 'center',
    marginRight: spacing.md,
  },

  iconeItemDestaque: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  textosItem: {
    flex: 1,
  },

  tituloItem: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },

  tituloItemPerigoso: {
    color: colors.error,
  },

  tituloItemDestaque: {
    color: colors.primary[100],
    fontSize: typography.fontSize.lg,
  },

  subtituloItem: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },

  subtituloItemDestaque: {
    color: colors.primary[200],
    fontSize: typography.fontSize.base,
  },

  indicadorSeta: {
    padding: spacing.xs,
  },

  versaoContainer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },

  versaoCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },

  textoVersao: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[300],
    marginBottom: spacing.xs,
  },

  textoCopyright: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
});
