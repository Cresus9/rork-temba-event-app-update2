import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Calendar, Clock, MapPin, Share2, Star, Mail, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import { getEventById } from '@/mocks/events';
import { useEventsStore } from '@/store/events-store';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/utils/date';
import { useTranslation } from '@/hooks/useTranslation';

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  // Ensure id is properly extracted as a string
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { t } = useTranslation();
  const { allEvents } = useEventsStore();
  const { isAuthenticated, setPendingAction } = useAuthStore();
  
  // Try to get event from store first, then fallback to mock data
  const [event, setEvent] = useState(() => {
    const storeEvent = allEvents.find(e => e.id === id);
    return storeEvent || getEventById(id);
  });
  
  useEffect(() => {
    if (!event) {
      Alert.alert(
        t.common.error,
        t.eventDetails.notFound,
        [{ text: 'OK' }]
      );
      router.back();
    }
  }, [event, router, t]);

  // Update event when store changes
  useEffect(() => {
    const storeEvent = allEvents.find(e => e.id === id);
    if (storeEvent && (!event || event.id !== storeEvent.id)) {
      setEvent(storeEvent);
    }
  }, [allEvents, id, event]);
  
  if (!event) return null;
  
  const ticketsSold = event.tickets_sold || 0;
  const ticketsRemaining = event.capacity - ticketsSold;
  const soldOutPercentage = (ticketsSold / event.capacity) * 100;
  
  // Use price from event, fallback to price_min if price is not available
  const eventPrice = event.price !== undefined ? event.price : event.price_min;
  
  const handleBuyTickets = () => {
    console.log('Navigating to checkout for event:', event.id);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Set pending action to continue after login
      setPendingAction({ type: 'checkout', eventId: event.id });
      
      Alert.alert(
        "Connexion requise",
        "Vous devez vous connecter pour acheter des billets",
        [
          {
            text: "Se connecter",
            onPress: () => router.push('/(auth)/login')
          },
          {
            text: "Annuler",
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    router.push(`/checkout/${event.id}`);
  };
  
  const handleShareEvent = async () => {
    try {
      const shareOptions = {
        message: `${t.eventDetails.checkOut} ${event.title} ${t.eventDetails.on} ${formatDate(event.date)}!`,
        url: `https://temba.app/event/${event.id}`,
        title: event.title,
      };
      
      if (Platform.OS !== 'web') {
        await Share.share(shareOptions);
      } else {
        // Fallback for web
        Alert.alert(
          t.eventDetails.shareEvent,
          `${t.eventDetails.checkOut} ${event.title} ${t.eventDetails.on} ${formatDate(event.date)}!`
        );
      }
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };
  
  const handleContactSupport = (method: 'phone' | 'email') => {
    if (method === 'phone') {
      const phoneNumber = '+221777889900';
      if (Platform.OS !== 'web') {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert(t.eventDetails.supportPhone, phoneNumber);
      }
    } else {
      const email = 'support@temba.app';
      if (Platform.OS !== 'web') {
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(`Support pour l'événement: ${event.title}`)}`);
      } else {
        Alert.alert(t.eventDetails.supportEmail, email);
      }
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t.eventDetails.eventDetails,
          headerRight: () => (
            <TouchableOpacity onPress={handleShareEvent} style={styles.shareButton}>
              <Share2 size={22} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: event.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={20} color={Colors.light.primary} />
              <Text style={styles.infoText}>{event.time}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={20} color={Colors.light.primary} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
            
            {event.avg_rating && (
              <View style={styles.infoItem}>
                <Star size={20} color={Colors.light.primary} />
                <Text style={styles.infoText}>
                  {event.avg_rating.toFixed(1)} ({event.review_count || 0} {t.eventDetails.reviews})
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.eventDetails.about}</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.eventDetails.ticketInfo}</Text>
            <View style={styles.ticketInfoContainer}>
              <View style={styles.ticketInfoItem}>
                <Text style={styles.ticketInfoLabel}>{t.eventDetails.price}</Text>
                <Text style={styles.ticketInfoValue}>
                  {eventPrice === 0 ? t.common.free : `${event.currency} ${eventPrice.toLocaleString()}`}
                </Text>
              </View>
              
              <View style={styles.ticketInfoItem}>
                <Text style={styles.ticketInfoLabel}>{t.eventDetails.capacity}</Text>
                <Text style={styles.ticketInfoValue}>{event.capacity.toLocaleString()}</Text>
              </View>
              
              <View style={styles.ticketInfoItem}>
                <Text style={styles.ticketInfoLabel}>{t.eventDetails.remaining}</Text>
                <Text style={styles.ticketInfoValue}>{ticketsRemaining.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${soldOutPercentage}%` }]} />
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{t.eventDetails.soldOut}: {soldOutPercentage.toFixed(0)}%</Text>
                <Text style={styles.progressLabel}>
                  {ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.eventDetails.contactUs}</Text>
            <View style={styles.contactContainer}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleContactSupport('phone')}
              >
                <View style={styles.contactIconContainer}>
                  <Phone size={24} color={Colors.common.white} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{t.eventDetails.phoneNumber}</Text>
                  <Text style={styles.contactValue}>+221 77 788 9900</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleContactSupport('email')}
              >
                <View style={styles.contactIconContainer}>
                  <Mail size={24} color={Colors.common.white} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{t.eventDetails.emailAddress}</Text>
                  <Text style={styles.contactValue}>support@temba.app</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t.eventDetails.price}</Text>
          <Text style={styles.price}>
            {eventPrice === 0 ? t.common.free : `${event.currency} ${eventPrice.toLocaleString()}`}
          </Text>
        </View>
        
        <Button
          title={t.eventDetails.buyTickets}
          onPress={handleBuyTickets}
          disabled={ticketsRemaining <= 0}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  shareButton: {
    padding: 8,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  ticketInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ticketInfoItem: {
    alignItems: 'center',
  },
  ticketInfoLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  ticketInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  progressContainer: {
    height: 24,
    backgroundColor: Colors.light.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  contactContainer: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.common.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  priceContainer: {
    flex: 1,
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});