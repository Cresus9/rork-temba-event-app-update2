import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTicketsStore } from '@/store/tickets-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import TicketCard from '@/components/TicketCard';
import Button from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function TicketsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { tickets, isLoading, error, fetchUserTickets, clearError } = useTicketsStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Fetching tickets for authenticated user:', user.id);
      fetchUserTickets(user.id).catch((error) => {
        console.error('Failed to fetch tickets:', error);
      });
    }
  }, [isAuthenticated, user, fetchUserTickets]);

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRefresh = () => {
    if (user) {
      clearError();
      console.log('Refreshing tickets for user:', user.id);
      fetchUserTickets(user.id).catch((error) => {
        console.error('Failed to refresh tickets:', error);
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>{t.tickets.myTickets}</Text>
        <Text style={styles.authSubtitle}>
          {t.profile.signInToAccess}
        </Text>
        <Button 
          title={t.auth.signIn} 
          onPress={handleLogin} 
          style={styles.authButton}
        />
      </View>
    );
  }

  if (isLoading && tickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Chargement de vos billets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Réessayer" 
          onPress={handleRefresh}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes billets</Text>
      
      {tickets.length > 0 ? (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketCard ticket={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={isLoading}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t.tickets.noTicketsYet}</Text>
          <Text style={styles.emptySubtitle}>
            {t.tickets.ticketsWillAppear}
          </Text>
          <Button 
            title={t.tickets.exploreEvents} 
            onPress={() => router.push('/explore')}
            style={styles.exploreButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark background like in the image
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.common.white,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.common.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#1A1A1A',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.common.white,
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  retryButton: {
    width: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.common.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    width: 200,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1A1A1A',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.common.white,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    width: 200,
  },
});