import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bell, Mail } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    id: '',
    user_id: user?.id || '',
    email: true,
    push: true,
    created_at: '',
    updated_at: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchNotificationPreferences();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        throw error;
      }

      if (data) {
        setNotifications({
          id: data.id,
          user_id: data.user_id,
          email: data.email ?? true,
          push: data.push ?? true,
          created_at: data.created_at || '',
          updated_at: data.updated_at || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erreur', 'Impossible de charger vos préférences de notification');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmailNotifications = () => {
    setNotifications(prev => ({
      ...prev,
      email: !prev.email
    }));
  };

  const togglePushNotifications = () => {
    setNotifications(prev => ({
      ...prev,
      push: !prev.push
    }));
  };

  const saveSettings = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour modifier vos préférences');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        user_id: user.id,
        email: notifications.email,
        push: notifications.push,
        updated_at: new Date().toISOString()
      };

      // Check if the user already has notification preferences
      const { data, error: checkError } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking preferences:', checkError);
        throw checkError;
      }

      if (data) {
        // Update existing preferences
        const { error } = await supabase
          .from('notification_preferences')
          .update(payload)
          .eq('id', data.id);

        if (error) {
          console.error('Error updating preferences:', error);
          throw error;
        }
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('notification_preferences')
          .insert([{
            ...payload,
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error inserting preferences:', error);
          throw error;
        }
      }

      Alert.alert(
        "Paramètres enregistrés",
        "Vos préférences de notification ont été mises à jour avec succès."
      );
      router.back();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde de vos préférences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Chargement des préférences...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Notifications",
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canaux de notification</Text>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.primary}15` }]}>
                <Mail size={20} color={Colors.light.primary} />
              </View>
              <View>
                <Text style={styles.notificationTitle}>Notifications par email</Text>
                <Text style={styles.notificationDescription}>
                  Recevez des notifications par email
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={notifications.email ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={toggleEmailNotifications}
              value={notifications.email}
            />
          </View>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.secondary}15` }]}>
                <Bell size={20} color={Colors.light.secondary} />
              </View>
              <View>
                <Text style={styles.notificationTitle}>Notifications push</Text>
                <Text style={styles.notificationDescription}>
                  Recevez des notifications push sur votre appareil
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={notifications.push ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={togglePushNotifications}
              value={notifications.push}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveSettings}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          Vous pouvez modifier vos préférences de notification à tout moment.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    flexWrap: 'wrap',
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.common.white,
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
  },
});