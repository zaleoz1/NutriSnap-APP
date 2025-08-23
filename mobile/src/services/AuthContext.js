import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [modoVisitante, setModoVisitante] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const tokenSalvo = await AsyncStorage.getItem('token');
        const usuarioSalvo = await AsyncStorage.getItem('user');
        if (tokenSalvo) {
          setToken(tokenSalvo);
          setUsuario(JSON.parse(usuarioSalvo));
        }
      } catch (erro) {
        console.log('Erro ao carregar dados salvos:', erro);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const fazerLogin = async (t, u) => {
    setToken(t);
    setUsuario(u);
    setModoVisitante(false);
    await AsyncStorage.setItem('token', t);
    await AsyncStorage.setItem('user', JSON.stringify(u));
  };

  const fazerLogout = async () => {
    setToken(null);
    setUsuario(null);
    setModoVisitante(false);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const entrarModoVisitante = () => {
    setModoVisitante(true);
    setToken(null);
    setUsuario(null);
  };

  const sairModoVisitante = () => {
    setModoVisitante(false);
  };

  // Funções de compatibilidade com nomes em português
  const entrar = fazerLogin;
  const sair = fazerLogout;

  return (
    <ContextoAutenticacao.Provider value={{ 
      token, 
      usuario, 
      modoVisitante,
      carregando,
      fazerLogin, 
      fazerLogout,
      entrarModoVisitante,
      sairModoVisitante,
      // Funções de compatibilidade
      entrar,
      sair
    }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function usarAutenticacao() {
  return useContext(ContextoAutenticacao);
}
