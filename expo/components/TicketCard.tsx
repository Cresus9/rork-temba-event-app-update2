import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Ticket } from '@/types';
import { formatDate } from '@/utils/date';
import { useTranslation } from '@/hooks/useTranslation';

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = () => {
    router.push(`/ticket/${ticket.id}`);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VALID': return 'Valide';
      case 'USED': return 'Utilisé';
      case 'CANCELLED': return 'Annulé';
      case 'EXPIRED': return 'Expiré';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID': return '#10B981';
      case 'USED': return '#6B7280';
      case 'CANCELLED': return '#EF4444';
      case 'EXPIRED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Use the joined data from the database view
  const eventTitle = ticket.event_title || 'Événement';
  const eventDate = ticket.event_date || '';
  const eventTime = ticket.event_time || '';
  const eventLocation = ticket.event_location || '';
  const eventImage = ticket.event_image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3';
  const ticketTypeName = ticket.ticket_type_name || 'Billet';

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.container}>
      {/* Event Header with Image */}
      <View style={styles.header}>
        <Image
          source={{ uri: eventImage }}
          style={styles.headerImage}
          contentFit="cover"
        />
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>{eventTitle}</Text>
          <Text style={styles.eventDate}>
            {eventDate ? formatDate(eventDate) : 'Date à confirmer'}
          </Text>
        </View>
      </View>

      {/* Ticket Details */}
      <View style={styles.ticketDetails}>
        <View style={styles.leftSection}>
          <Text style={styles.ticketTypeLabel}>Ticket Type</Text>
          <Text style={styles.ticketType}>{ticketTypeName}</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {eventDate ? formatDate(eventDate) : 'Date à confirmer'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.detailText}>{eventTime || 'Heure à confirmer'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {eventLocation || 'Lieu à confirmer'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.ticketId}>#{ticket.id.substring(0, 8).toUpperCase()}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(ticket.status) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(ticket.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.common.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    height: 120,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 69, 19, 0.7)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.common.white,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.common.white,
    opacity: 0.9,
  },
  ticketDetails: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  ticketTypeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detailsRow: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.common.white,
  },
});