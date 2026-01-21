import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import de notre architecture de navigation
import RootNavigator from './src/navigation/RootNavigator';

/**
 * POINT D'ENTRÉE UNIQUE - QUALISOFT ELITE MOBILE
 * * Ce composant enveloppe l'application dans les providers nécessaires :
 * 1. SafeAreaProvider : Gère les zones sûres (encoches, barres système).
 * 2. RootNavigator : Gère la logique de bascule entre Auth et App.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* StatusBar en mode light pour ressortir sur notre thème Navy/Dark */}
        <StatusBar style="light" />
        
        {/* Le cerveau de la navigation */}
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Navy Slate Elite
  },
});