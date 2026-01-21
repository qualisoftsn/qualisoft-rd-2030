import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import de nos écrans métiers
import StrategicDashboard from '../screens/dashboard/StrategicDashboard';
import AuditList from '../screens/quality/AuditList';
import ReportEvent from '../screens/safety/ReportEvent';
import MeetingList from '../screens/governance/MeetingList';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB', // Bleu Qualisoft Elite
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Pilotage') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Qualité') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'Sécurité') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Gouvernance') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pilotage" component={StrategicDashboard} />
      <Tab.Screen name="Qualité" component={AuditList} />
      <Tab.Screen name="Sécurité" component={ReportEvent} />
      <Tab.Screen name="Gouvernance" component={MeetingList} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;