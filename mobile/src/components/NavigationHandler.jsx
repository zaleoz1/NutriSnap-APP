import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { usarAutenticacao } from '../services/AuthContext';
import { colors, spacing } from '../styles/globalStyles';

// Componente que gerencia a navegação baseada no estado de autenticação
export default function NavigationHandler({ navigation }) {
  const { token, carregando } = usarAutenticacao();

  useEffect(() => {
    if (!carregando) {
      if (token) {
        navigation.replace('Principal');
      } else {
        navigation.replace('Welcome');
      }
    }
  }, [token, carregando, navigation]);

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
});
