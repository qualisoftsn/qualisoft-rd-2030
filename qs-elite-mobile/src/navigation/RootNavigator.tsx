import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';

// AUTHENTIFICATION
import LandingPage from '../screens/auth/LandingPage';
import LoginScreen from '../screens/auth/LoginScreen';

// NAVIGATION PRINCIPALE (ONGLETS TACTILES)
import MainTabNavigator from './MainTabNavigator';

// DÉTAILS ET PROCÉDURES
import AuditExecution from '../screens/quality/AuditExecution';
import ProcessReviewForm from '../screens/quality/ProcessReviewForm';
import ActionDetail from '../screens/quality/ActionDetail';

const Stack = createStackNavigator();

const screenOptions: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
};

export default function RootNavigator() {
  // L'application réagit en temps réel aux données de LoginScreen via Zustand
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isLoggedIn ? (
          <Stack.Group>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            {/* L'interface tactile à onglets est le point d'entrée après connexion */}
            <Stack.Screen name="Main" component={MainTabNavigator} />
            
            {/* Écrans de détails ouverts en plein écran (Stack verticale) */}
            <Stack.Screen name="AuditExecution" component={AuditExecution} />
            <Stack.Screen name="ProcessReview" component={ProcessReviewForm} />
            <Stack.Screen name="ActionDetail" component={ActionDetail} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}