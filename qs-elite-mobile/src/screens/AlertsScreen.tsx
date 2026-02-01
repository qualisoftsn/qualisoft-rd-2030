import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api-client';

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
    // Setup push notifications
    registerPushNotifications();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerPushNotifications = async () => {
    // Configuration Firebase Cloud Messaging
    // TODO: Implémenter selon votre configuration
    console.log('Push notifications registered for user:', user?.U_Id);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderAlert = ({ item }: any) => {
    const isOverdue = item.AL_Type === 'OVERDUE';
    const daysUntilDue = Math.ceil((new Date(item.AL_DueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
      <TouchableOpacity 
        className="bg-slate-800 rounded-xl p-4 mb-3 border border-white/10"
        onPress={() => {/* TODO: Navigate to alert details */}}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-start gap-3 flex-1">
            <View className={`p-2 rounded-lg bg-${getPriorityColor(item.AL_Priority)}/20`}>
              {item.AL_Type === 'OVERDUE' ? (
                <AlertTriangle color={getPriorityColor(item.AL_Priority)} size={20} />
              ) : item.AL_Type === 'DEADLINE' ? (
                <Clock color={getPriorityColor(item.AL_Priority)} size={20} />
              ) : (
                <Bell color={getPriorityColor(item.AL_Priority)} size={20} />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-bold text-white text-base">{item.AL_Title}</Text>
              <Text className="text-slate-400 text-sm mt-1">{item.AL_Message}</Text>
              
              {isOverdue ? (
                <View className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <Text className="text-red-400 text-xs font-bold">
                    ⚠️ EN RETARD DE {Math.abs(daysUntilDue)} JOUR{Math.abs(daysUntilDue) > 1 ? 'S' : ''}
                  </Text>
                </View>
              ) : daysUntilDue >= 0 && (
                <View className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  <Text className="text-amber-400 text-xs">
                    {daysUntilDue === 0 ? 'ÉCHÉANCE AUJOURD\'HUI' : 
                     daysUntilDue === 1 ? 'ÉCHÉANCE DEMAIN' : 
                     `ÉCHÉANCE DANS ${daysUntilDue} JOUR${daysUntilDue > 1 ? 'S' : ''}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {item.AL_Status === 'UNREAD' && (
            <View className="bg-amber-500 rounded-full w-3 h-3" />
          )}
        </View>
        
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-white/5">
          <View className="flex-row items-center gap-2">
            <Clock size={14} color="#94a3b8" />
            <Text className="text-slate-500 text-xs">
              {new Date(item.AL_DueDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              item.AL_Priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
              item.AL_Priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300' : 
              item.AL_Priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
            }`}>
              {item.AL_Priority}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-[#0B0F1A] items-center justify-center">
        <Bell size={40} color="#94a3b8" />
        <Text className="text-slate-500 mt-4">Chargement des alertes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0B0F1A]">
      <View className="p-4 border-b border-white/5 bg-[#111A2E]">
        <Text className="text-2xl font-bold text-white">Alertes Réglementaires</Text>
        <Text className="text-slate-500 text-sm mt-1">
          {alerts.filter((a: any) => a.AL_Status === 'UNREAD').length} non lues
        </Text>
      </View>
      
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.AL_Id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <Bell size={60} color="#334155" />
            <Text className="text-slate-600 mt-4 text-lg font-bold">Aucune alerte</Text>
            <Text className="text-slate-500 mt-2 text-sm">Toutes les échéances sont à jour</Text>
          </View>
        }
      />
    </View>
  );
}