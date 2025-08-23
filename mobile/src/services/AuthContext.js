import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    (async () => {
      const tokenSalvo = await AsyncStorage.getItem('token');
      const usuarioSalvo = await AsyncStorage.getItem('user');
      if (tokenSalvo) setToken(tokenSalvo);
      if (usuarioSalvo) setUsuario(JSON.parse(usuarioSalvo));
    })();
  }, []);

  const fazerLogin = async (t, u) => {
    setToken(t);
    setUsuario(u);
    await AsyncStorage.setItem('token', t);
    await AsyncStorage.setItem('user', JSON.stringify(u));
  };

  const fazerLogout = async () => {
    setToken(null);
    setUsuario(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <ContextoAutenticacao.Provider value={{ token, usuario, fazerLogin, fazerLogout }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function usarAutenticacao() {
  return useContext(ContextoAutenticacao);
}
