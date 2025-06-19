import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  Settings, 
  LogOut,
  ChevronRight,
  Edit
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = async () => {
    Alert.alert(
      t.profile.logout,
      t.profile.logoutConfirm,
      [
        {
          text: t.common.cancel,
          style: 'cancel',
        },
        {
          text: t.profile.logout,
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              console.log('Logout successful from profile screen');
              router.replace('/');
            } catch (error) {
              console.error('Logout error from profile screen:', error);
              Alert.alert(t.common.error, "Une erreur est survenue lors de la déconnexion");
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <User size={64} color={Colors.light.subtext} />
          <Text style={styles.loginTitle}>{t.profile.signInToAccount}</Text>
          <Text style={styles.loginSubtitle}>{t.profile.signInToAccess}</Text>
          <Button
            title={t.auth.signIn}
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }

  const menuItems = [
    {
      icon: Edit,
      title: 'Modifier le profil',
      onPress: () => router.push('/profile/edit-profile'),
    },
    {
      icon: CreditCard,
      title: t.profile.paymentMethods,
      onPress: () => router.push('/profile/payment-methods'),
    },
    {
      icon: Bell,
      title: t.profile.notifications,
      onPress: () => router.push('/profile/notifications'),
    },
    {
      icon: HelpCircle,
      title: t.profile.helpSupport,
      onPress: () => router.push('/profile/help-support'),
    },
    {
      icon: Settings,
      title: t.profile.settings,
      onPress: () => router.push('/profile/settings'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={32} color={Colors.common.white} />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <item.icon size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, isLoading && styles.disabledButton]} 
        onPress={handleLogout}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LogOut size={20} color={Colors.common.white} />
        <Text style={styles.logoutText}>{t.profile.logout}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>{t.profile.version} 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.common.white,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  menu: {
    backgroundColor: Colors.common.white,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutText: {
    color: Colors.common.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  version: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
});