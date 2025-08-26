import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Switch, Alert, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
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

  const renderizarSecao = ({ titulo, children, icone, cor = colors.primary[600] }) => (
    <View style={estilos.secao}>
      <View style={estilos.cabecalhoSecao}>
        <View style={[estilos.iconeSecao, { backgroundColor: cor }]}>
          <MaterialIcons name={icone} size={20} color={colors.neutral[50]} />
        </View>
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
    perigoso = false 
  }) => (
    <TouchableOpacity 
      style={[
        estilos.itemConfiguracao,
        perigoso && estilos.itemPerigoso
      ]} 
      onPress={acao}
      disabled={tipo === 'switch'}
    >
      <View style={estilos.informacoesItem}>
        <View style={estilos.iconeItem}>
          <MaterialIcons 
            name={icone} 
            size={24} 
            color={perigoso ? colors.error : colors.neutral[400]} 
          />
        </View>
        <View style={estilos.textosItem}>
          <Text style={[
            estilos.tituloItem,
            perigoso && estilos.tituloItemPerigoso
          ]}>
            {titulo}
          </Text>
          {subtitulo && (
            <Text style={estilos.subtituloItem}>{subtitulo}</Text>
          )}
        </View>
      </View>
      
      {tipo === 'switch' && onValueChange && (
        <Switch
          value={valor}
          onValueChange={onValueChange}
          trackColor={{ false: colors.neutral[600], true: colors.primary[400] }}
          thumbColor={valor ? colors.primary[600] : colors.neutral[400]}
        />
      )}
      
      {tipo === 'botao' && (
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={colors.neutral[400]} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral[900]} />
      
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <TouchableOpacity 
          style={estilos.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.neutral[50]} />
        </TouchableOpacity>
        
        <Text style={estilos.tituloPagina}>Configurações</Text>
        
        <View style={estilos.espacoDireita} />
      </View>

      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.conteudoScroll}
      >
        {/* Perfil do usuário */}
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
          >
            <MaterialIcons name="edit" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* Configurações de Conta */}
        {renderizarSecao({
          titulo: 'Conta',
          icone: 'account-circle',
          cor: colors.primary[600]
        })}
        {renderizarItemConfiguracao({
          titulo: 'Editar Perfil',
          icone: 'person',
          acao: lidarComEditarPerfil
        })}
        {renderizarItemConfiguracao({
          titulo: 'Alterar Senha',
          icone: 'lock',
          acao: lidarComAlterarSenha
        })}

        {/* Configurações do App */}
        {renderizarSecao({
          titulo: 'Preferências',
          icone: 'settings',
          cor: colors.accent.blue
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
          cor: colors.accent.green
        })}
        {renderizarItemConfiguracao({
          titulo: 'Ajuda',
          icone: 'help-outline',
          acao: lidarComAjuda
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
          cor: colors.accent.purple
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
          cor: colors.error
        })}
        {renderizarItemConfiguracao({
          titulo: 'Sair da Conta',
          icone: 'logout',
          acao: lidarComLogout,
          perigoso: true
        })}

        {/* Versão do app */}
        <View style={estilos.versaoContainer}>
          <Text style={estilos.textoVersao}>NutriSnap v1.0.0</Text>
          <Text style={estilos.textoCopyright}>
            © 2024 NutriSnap Team. Todos os direitos reservados.
          </Text>
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

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[800],
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloPagina: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  espacoDireita: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  conteudoScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  cardPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },

  avatarPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },

  textoAvatar: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  informacoesPerfil: {
    flex: 1,
  },

  nomeUsuario: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    marginBottom: spacing.xs,
  },

  emailUsuario: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },

  botaoEditarPerfil: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  secao: {
    marginBottom: spacing.xl,
  },

  cabecalhoSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  iconeSecao: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  tituloSecao: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
  },

  conteudoSecao: {
    backgroundColor: colors.neutral[800],
    borderRadius: borders.radius.lg,
    overflow: 'hidden',
    ...shadows.base,
  },

  itemConfiguracao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },

  itemPerigoso: {
    borderBottomColor: colors.error + '20',
  },

  informacoesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconeItem: {
    width: 40,
    alignItems: 'center',
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

  subtituloItem: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.normal,
  },

  versaoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[800],
  },

  textoVersao: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },

  textoCopyright: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
});
