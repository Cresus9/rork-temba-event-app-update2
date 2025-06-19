import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Globe, Moon, Bell, Lock, ChevronRight, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth-store';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout, deleteAccount } = useAuthStore();
  
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const toggleDarkMode = () => {
    Alert.alert(
      t.common.comingSoon,
      "Le mode sombre sera bientôt disponible."
    );
    // setDarkMode(previousState => !previousState);
  };
  
  const togglePushNotifications = () => {
    setPushNotifications(previousState => !previousState);
    router.push('/profile/notifications');
  };
  
  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: t.common.cancel,
          style: "cancel"
        },
        {
          text: "Déconnexion",
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              await logout();
              console.log('Logout successful from settings');
              router.replace('/');
            } catch (error: any) {
              console.error('Logout error from settings:', error);
              Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la déconnexion");
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };
  
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        {
          text: t.common.cancel,
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: async () => {
            if (!user?.id) {
              Alert.alert("Erreur", "Vous devez être connecté pour supprimer votre compte");
              return;
            }
            
            setIsDeleting(true);
            
            try {
              await deleteAccount();
              Alert.alert("Compte supprimé", "Votre compte a été supprimé avec succès.");
              router.replace('/');
            } catch (error: any) {
              console.error('Error deleting account:', error);
              Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la suppression de votre compte");
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const navigateTo = (path: string) => {
    if (!path) return;
    console.log(`Navigating to: ${path}`);
    router.push(path);
  };

  const handlePrivacySettings = () => {
    // Navigate to privacy settings page
    router.push('/profile/privacy');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t.profile.settings,
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigateTo('/profile/edit-profile')}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.settingLabel}>Modifier le profil</Text>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigateTo('/profile/change-password')}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.settingLabel}>Changer le mot de passe</Text>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handlePrivacySettings}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.settingLabel}>Confidentialité</Text>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingWithIcon}>
              <Globe size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Langue</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert(t.common.comingSoon, "Le changement de langue sera bientôt disponible.")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.settingValue}>Français</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingWithIcon}>
              <Moon size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Mode sombre</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={darkMode ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={toggleDarkMode}
              value={darkMode}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigateTo('/profile/notifications')}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <View style={styles.settingWithIcon}>
              <Bell size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Alert.alert(t.common.comingSoon, "Les paramètres de sécurité seront bientôt disponibles.")}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <View style={styles.settingWithIcon}>
              <Lock size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Paramètres de sécurité</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutSection}
          onPress={handleLogout}
          activeOpacity={0.7}
          disabled={isLoggingOut}
        >
          <View style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={Colors.common.white} />
            ) : (
              <>
                <LogOut size={20} color={Colors.common.white} />
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={[styles.dangerButton, isDeleting && styles.disabledButton]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.light.error} />
            ) : (
              <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Version de l'application: 1.0.0</Text>
          {user && <Text style={styles.infoText}>ID utilisateur: {user.id.substring(0, 8)}</Text>}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingValue: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  logoutSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 16,
  },
  dangerSection: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: `${Colors.light.error}15`,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  dangerButtonText: {
    color: Colors.light.error,
    fontWeight: '600',
    fontSize: 16,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
});