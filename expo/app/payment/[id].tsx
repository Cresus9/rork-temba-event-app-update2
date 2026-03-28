import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { CreditCard, Smartphone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { useTicketsStore } from '@/store/tickets-store';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/date';
import { useTranslation } from '@/hooks/useTranslation';
import { Event } from '@/types';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { purchaseTickets, isLoading } = useTicketsStore();
  const { t } = useTranslation();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'mobile'>('card');
  
  // Get URL parameters
  const eventId = id;
  const selections = useLocalSearchParams().selections ? JSON.parse(useLocalSearchParams().selections as string) : [];
  const total = Number(useLocalSearchParams().total) || 0;
  const subtotal = Number(useLocalSearchParams().subtotal) || 0;
  const serviceFee = Number(useLocalSearchParams().serviceFee) || 0;
  
  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez vous connecter pour accéder à cette page",
        [
          {
            text: "Se connecter",
            onPress: () => router.push('/(auth)/login')
          },
          {
            text: "Retour",
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
      return;
    }
    
    fetchEvent();
  }, [eventId, isAuthenticated, user]);

  const fetchEvent = async () => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      setError(null);
      console.log('Fetching event for payment:', eventId);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Event fetch error:', eventError);
        throw new Error(`Impossible de charger l'événement: ${eventError.message}`);
      }

      if (!eventData) {
        throw new Error('Événement non trouvé');
      }

      console.log('Event fetched for payment:', eventData);
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCompletePurchase = async () => {
    if (!user || !eventId || selections.length === 0) {
      Alert.alert(t.common.error, "Informations manquantes pour finaliser l'achat");
      return;
    }

    try {
      console.log('Completing purchase with:', {
        userId: user.id,
        eventId,
        selections,
        paymentMethod: selectedPaymentMethod === 'card' ? 'Credit Card' : 'Mobile Money'
      });

      const result = await purchaseTickets(
        user.id,
        eventId,
        selections,
        selectedPaymentMethod === 'card' ? 'Credit Card' : 'Mobile Money'
      );

      if (result.success && result.ticketIds && result.ticketIds.length > 0) {
        // Navigate to the first ticket created
        router.replace(`/ticket/${result.ticketIds[0]}`);
      } else {
        Alert.alert(t.common.error, "Erreur lors de la finalisation de l'achat");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        t.common.error,
        error instanceof Error ? error.message : "Erreur lors de l'achat"
      );
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Événement non trouvé'}</Text>
        <Button title="Retour" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Paiement",
        }}
      />
      
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{formatDate(event.date)} • {event.time}</Text>
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Méthode de paiement</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'card' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('card')}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.paymentIconContainer}>
                  <CreditCard size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Carte de crédit / débit</Text>
                  <Text style={styles.paymentDescription}>Visa, Mastercard, American Express</Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === 'card' && styles.radioButtonSelected
              ]} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'mobile' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('mobile')}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.paymentIconContainer}>
                  <Smartphone size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Mobile Money</Text>
                  <Text style={styles.paymentDescription}>Orange Money, Wave, Free Money</Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === 'mobile' && styles.radioButtonSelected
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumé final</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>
                {event.currency} {Math.round(subtotal).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Frais de service</Text>
              <Text style={styles.summaryValue}>
                {event.currency} {serviceFee.toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <Text style={styles.totalValue}>
                {event.currency} {Math.round(total).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerTotal}>
              {event.currency} {Math.round(total).toLocaleString()}
            </Text>
          </View>
          <Button
            title={isLoading ? "Traitement en cours..." : "Finaliser l'achat"}
            onPress={handleCompletePurchase}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: Colors.common.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  section: {
    backgroundColor: Colors.common.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  radioButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  footer: {
    backgroundColor: Colors.common.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerSummary: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});