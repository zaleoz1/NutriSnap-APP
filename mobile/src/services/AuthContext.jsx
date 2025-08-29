import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verificarToken, testarConexao } from './api';

const ContextoAutenticacao = createContext(null);

// Provedor de contexto para gerenciar autenticação global
export function ProvedorAutenticacao({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    verificarConectividade();
  }, []);

  useEffect(() => {
    carregarDadosSalvos();
  }, []);

  // Verifica conectividade com o servidor
  const verificarConectividade = async () => {
    try {
      const resultado = await testarConexao();
      setConectado(resultado.conectado);
      
      if (!resultado.conectado) {
        console.warn('⚠️ Servidor não está acessível:', resultado.erro);
      }
    } catch (erro) {
      console.error('❌ Erro ao verificar conectividade:', erro);
      setConectado(false);
    }
  };

  // Carrega dados salvos do AsyncStorage na inicialização
  const carregarDadosSalvos = async () => {
    try {
      const [tokenSalvo, usuarioSalvo] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);

      if (tokenSalvo && usuarioSalvo) {
        const tokenValido = await verificarToken(tokenSalvo);
        
        if (tokenValido) {
          setToken(tokenSalvo);
          setUsuario(JSON.parse(usuarioSalvo));
          console.log('✅ Token válido carregado');
        } else {
          console.log('⚠️ Token expirado, removendo dados salvos');
          await limparDados();
        }
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar dados salvos:', erro);
      await limparDados();
    } finally {
      setCarregando(false);
    }
  };

  // Autentica usuário e salva dados localmente
  const fazerLogin = async (novoToken, novoUsuario) => {
    try {
      if (!novoToken || !novoUsuario) {
        throw new Error('Token e usuário são obrigatórios');
      }

      console.log('🔍 Fazendo login:', { 
        tokenLength: novoToken.length,
        usuario: novoUsuario.email 
      });

      setToken(novoToken);
      setUsuario(novoUsuario);

      await Promise.all([
        AsyncStorage.setItem('token', novoToken),
        AsyncStorage.setItem('user', JSON.stringify(novoUsuario))
      ]);

      console.log('✅ Login realizado com sucesso:', novoUsuario.email);
      console.log('🔍 Token salvo no estado:', { 
        tokenLength: novoToken.length,
        tokenInicio: novoToken.substring(0, 20) + '...'
      });
    } catch (erro) {
      console.error('❌ Erro ao fazer login:', erro);
      throw erro;
    }
  };

  // Remove dados de autenticação
  const fazerLogout = async () => {
    try {
      await limparDados();
      console.log('✅ Logout realizado com sucesso');
    } catch (erro) {
      console.error('❌ Erro ao fazer logout:', erro);
    }
  };

  // Limpa todos os dados de autenticação
  const limparDados = async () => {
    setToken(null);
    setUsuario(null);
    
    try {
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user')
      ]);
    } catch (erro) {
      console.error('❌ Erro ao limpar dados:', erro);
    }
  };

  // Verifica se o usuário está autenticado
  const estaAutenticado = () => {
    return !!(token && usuario);
  };

  const entrar = fazerLogin;
  const sair = fazerLogout;

  const contexto = {
    token,
    usuario,
    carregando,
    conectado,
    
    fazerLogin,
    fazerLogout,
    
    entrar,
    sair,
    
    estaAutenticado,
    
    limparDados,
    verificarConectividade
  };

  return (
    <ContextoAutenticacao.Provider value={contexto}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function usarAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  
  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  }
  
  return contexto;
}
