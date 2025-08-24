import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verificarToken, testarConexao } from './api';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [conectado, setConectado] = useState(false);

  // Verificar conectividade com o servidor
  useEffect(() => {
    verificarConectividade();
  }, []);

  // Carregar dados salvos na inicialização
  useEffect(() => {
    carregarDadosSalvos();
  }, []);

  // Verificar conectividade com o servidor
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

  // Carregar dados salvos do AsyncStorage
  const carregarDadosSalvos = async () => {
    try {
      const [tokenSalvo, usuarioSalvo] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);

      if (tokenSalvo && usuarioSalvo) {
        // Verificar se o token ainda é válido
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

  // Fazer login
  const fazerLogin = async (novoToken, novoUsuario) => {
    try {
      // Validar dados
      if (!novoToken || !novoUsuario) {
        throw new Error('Token e usuário são obrigatórios');
      }

      // Salvar no estado
      setToken(novoToken);
      setUsuario(novoUsuario);

      // Salvar no AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('token', novoToken),
        AsyncStorage.setItem('user', JSON.stringify(novoUsuario))
      ]);

      console.log('✅ Login realizado com sucesso:', novoUsuario.email);
    } catch (erro) {
      console.error('❌ Erro ao fazer login:', erro);
      throw erro;
    }
  };

  // Fazer logout
  const fazerLogout = async () => {
    try {
      await limparDados();
      console.log('✅ Logout realizado com sucesso');
    } catch (erro) {
      console.error('❌ Erro ao fazer logout:', erro);
    }
  };

  // Limpar todos os dados
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

  // Verificar se o usuário está autenticado
  const estaAutenticado = () => {
    return !!(token && usuario);
  };

  // Funções de compatibilidade com nomes em português
  const entrar = fazerLogin;
  const sair = fazerLogout;

  // Contexto fornecido
  const contexto = {
    // Estados
    token,
    usuario,
    carregando,
    conectado,
    
    // Funções principais
    fazerLogin,
    fazerLogout,
    
    // Funções de compatibilidade
    entrar,
    sair,
    
    // Funções utilitárias
    estaAutenticado,
    
    // Funções de gerenciamento
    limparDados,
    verificarConectividade
  };

  return (
    <ContextoAutenticacao.Provider value={contexto}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function usarAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  
  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  }
  
  return contexto;
}
