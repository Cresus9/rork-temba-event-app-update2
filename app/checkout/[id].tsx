import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/date';
import { useTranslation } from '@/hooks/useTranslation';
import { Event, TicketType } from '@/types';

// Enhanced error formatting function
const formatError = (error: any): string => {
  console.log('Formatting error:', error);
  
  if (!error) return 'Erreur inconnue';
  
  if (typeof error === 'string') return error;
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle Supabase errors
  if (error.message) {
    if (error.details) return `${error.message}: ${error.details}`;
    if (error.hint) return `${error.message} (${error.hint})`;
    return error.message;
  }
  
  if (error.error_description) return error.error_description;
  if (error.details) return error.details;
  if (error.hint) return error.hint;
  
  if (error.code) {
    const message = error.message || 'Erreur inconnue';
    return `Erreur ${error.code}: ${message}`;
  }
  
  // Try to extract meaningful information from the error object
  if (typeof error === 'object') {
    try {
      const errorString = JSON.stringify(error);
      if (errorString !== '{}') {
        console.log('Error object:', errorString);
        return 'Une erreur est survenue lors de l\'opération';
      }
    } catch (e) {
      console.log('Could not stringify error:', e);
    }
  }
  
  return 'Une erreur inattendue est survenue';
};

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [ticketSelections, setTicketSelections] = useState<{ ticketTypeId: string; quantity: number }[]>([]);
  
  const totalTickets = ticketSelections.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = ticketSelections.reduce((sum, item) => {
    const ticketType = ticketTypes.find(t => t.id === item.ticketTypeId);
    return sum + (ticketType ? Number(ticketType.price) * item.quantity : 0);
  }, 0);
  const serviceFeeAmount = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + serviceFeeAmount;
  
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
    
    fetchEventAndTicketTypes();
  }, [id, isAuthenticated, user]);

  const fetchEventAndTicketTypes = async () => {
    if (!id) {
      setError('ID d\'événement manquant');
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      setError(null);
      console.log('Fetching event and ticket types for:', id);

      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) {
        console.error('Event fetch error:', eventError);
        throw new Error(`Impossible de charger l'événement: ${formatError(eventError)}`);
      }

      if (!eventData) {
        throw new Error('Événement non trouvé');
      }

      console.log('Event fetched:', eventData);

      // Fetch ticket types
      const { data: ticketTypesData, error: ticketTypesError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id)
        .order('price', { ascending: true });

      if (ticketTypesError) {
        console.error('Ticket types fetch error:', ticketTypesError);
        throw new Error(`Impossible de charger les types de billets: ${formatError(ticketTypesError)}`);
      }

      console.log('Ticket types fetched:', ticketTypesData?.length || 0);

      setEvent(eventData);
      setTicketTypes(ticketTypesData || []);
      
      // Initialize ticket selections with correct property name
      setTicketSelections(
        (ticketTypesData || []).map(ticket => ({ ticketTypeId: ticket.id, quantity: 0 }))
      );

      // Auto-select one ticket if none selected and there are ticket types
      if (ticketTypesData && ticketTypesData.length > 0) {
        setTicketSelections(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[0].quantity = 1;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      const errorMessage = formatError(error);
      setError(errorMessage);
    } finally {
      setLoadingData(false);
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

  const handleQuantityChange = (ticketTypeId: string, change: number) => {
    setTicketSelections(prev => 
      prev.map(item => {
        if (item.ticketTypeId === ticketTypeId) {
          const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
          const newQuantity = Math.max(0, Math.min(item.quantity + change, ticketType?.max_per_order || 4));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  const handleContinueToPayment = () => {
    if (totalTickets === 0) {
      Alert.alert(t.common.error, "Veuillez sélectionner au moins un billet");
      return;
    }

    // Navigate to payment screen with ticket selections
    const validSelections = ticketSelections.filter(item => item.quantity > 0);
    const params = new URLSearchParams({
      eventId: String(id),
      selections: JSON.stringify(validSelections),
      total: String(total),
      subtotal: String(subtotal),
      serviceFee: String(serviceFeeAmount)
    });
    
    router.push(`/payment/${id}?${params.toString()}`);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Sélection des billets",
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
            <Text style={styles.sectionTitle}>Sélectionner les billets</Text>
            {ticketTypes.map((ticket) => (
              <View key={ticket.id} style={styles.ticketItem}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketName}>{ticket.name}</Text>
                  <Text style={styles.ticketDescription}>{ticket.description}</Text>
                  <Text style={styles.ticketPrice}>
                    {event.currency} {Number(ticket.price).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      ticketSelections.find(t => t.ticketTypeId === ticket.id)?.quantity === 0 && styles.quantityButtonDisabled
                    ]}
                    onPress={() => handleQuantityChange(ticket.id, -1)}
                    disabled={ticketSelections.find(t => t.ticketTypeId === ticket.id)?.quantity === 0}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>
                    {ticketSelections.find(t => t.ticketTypeId === ticket.id)?.quantity || 0}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      (ticketSelections.find(t => t.ticketTypeId === ticket.id)?.quantity || 0) >= ticket.max_per_order && styles.quantityButtonDisabled
                    ]}
                    onPress={() => handleQuantityChange(ticket.id, 1)}
                    disabled={(ticketSelections.find(t => t.ticketTypeId === ticket.id)?.quantity || 0) >= ticket.max_per_order}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumé de la commande</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>
                {event.currency} {Math.round(subtotal).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Frais de service</Text>
              <Text style={styles.summaryValue}>
                {event.currency} {serviceFeeAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {event.currency} {Math.round(total).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerTickets}>
              {totalTickets} {totalTickets !== 1 ? 'billets' : 'billet'}
            </Text>
            <Text style={styles.footerTotal}>
              {event.currency} {Math.round(total).toLocaleString()}
            </Text>
          </View>
          <Button
            title="Continuer vers le paiement"
            onPress={handleContinueToPayment}
            disabled={totalTickets === 0}
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
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.common.white,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTickets: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});