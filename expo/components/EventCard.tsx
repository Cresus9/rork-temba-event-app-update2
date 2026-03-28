import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Ticket } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Event } from '@/types';
import Card from './ui/Card';
import { formatDate } from '@/utils/date';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth-store';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
}

const { width } = Dimensions.get('window');

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, setPendingAction } = useAuthStore();
  
  // Use price from event, fallback to price_min if price is not available
  const eventPrice = event.price !== undefined ? event.price : event.price_min;
  
  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  const handleBuyTickets = () => {
    console.log('Buy tickets clicked for event:', event.id);
    
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
    
    // Navigate to checkout with the event ID
    router.push(`/checkout/${event.id}`);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.featuredContainer}
      >
        <Image
          source={{ uri: event.image_url }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.featuredInfo}>
              <View style={styles.infoRow}>
                <Calendar size={16} color={Colors.common.white} />
                <Text style={styles.featuredInfoText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={16} color={Colors.common.white} />
                <Text style={styles.featuredInfoText} numberOfLines={1}>{event.location}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.featuredButton}
              onPress={(e) => {
                e.stopPropagation();
                handleBuyTickets();
              }}
              activeOpacity={0.8}
            >
              <Ticket size={16} color={Colors.common.white} />
              <Text style={styles.featuredButtonText}>Acheter des billets</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <Card style={styles.compactCard}>
          <Image
            source={{ uri: event.image_url }}
            style={styles.compactImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
            <View style={styles.infoRow}>
              <Calendar size={14} color={Colors.light.subtext} />
              <Text style={styles.compactInfoText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color={Colors.light.subtext} />
              <Text style={styles.compactInfoText} numberOfLines={1}>{event.location}</Text>
            </View>
            <TouchableOpacity 
              style={styles.compactButton}
              onPress={(e) => {
                e.stopPropagation();
                handleBuyTickets();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.compactButtonText}>Acheter</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Card style={styles.card}>
        <Image
          source={{ uri: event.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.light.subtext} />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.light.subtext} />
            <Text style={styles.infoText} numberOfLines={1}>{event.location}</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.price}>
              {eventPrice === 0 ? t.common.free : `${event.currency} ${eventPrice.toLocaleString()}`}
            </Text>
            <TouchableOpacity
              style={styles.buyButtonTouchable}
              onPress={(e) => {
                e.stopPropagation();
                handleBuyTickets();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buyButtonText}>Acheter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    height: 180,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  buyButtonTouchable: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Featured styles
  featuredContainer: {
    height: 220,
    width: width - 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredImage: {
    height: '100%',
    width: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.common.white,
    marginBottom: 12,
  },
  featuredInfo: {
    gap: 8,
    marginBottom: 16,
  },
  featuredInfoText: {
    fontSize: 14,
    color: Colors.common.white,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  featuredButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    padding: 0,
    height: 120,
    marginBottom: 12,
    overflow: 'hidden',
  },
  compactImage: {
    width: 120,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text,
  },
  compactInfoText: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  compactButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  compactButtonText: {
    color: Colors.common.white,
    fontWeight: '500',
    fontSize: 12,
  },
});