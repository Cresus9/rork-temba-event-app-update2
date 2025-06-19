import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Download, Share2, MapPin, Calendar, Clock, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Ticket } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/utils/date';
import { useTranslation } from '@/hooks/useTranslation';
import { generateQRData } from '@/utils/qr-service';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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

export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // Generate QR code when ticket is loaded
  useEffect(() => {
    if (ticket && ticket.id) {
      try {
        const qrData = generateQRData(ticket.id);
        setQrCodeData(qrData);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setError(`Erreur lors de la génération du code QR: ${formatError(error)}`);
      }
    }
  }, [ticket]);

  const fetchTicket = async () => {
    if (!id) {
      setError('ID de billet manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching ticket:', id);

      // First try to fetch from ticket_details view if it exists
      let { data: ticketData, error: ticketError } = await supabase
        .from('ticket_details')
        .select('*')
        .eq('id', id)
        .single();

      // If ticket_details view doesn't exist, fall back to tickets table with joins
      if (ticketError && ticketError.code === '42P01') {
        console.log('ticket_details view not found, using tickets table with joins');
        
        const { data: fallbackTicketData, error: fallbackError } = await supabase
          .from('tickets')
          .select(`
            *,
            ticket_types!inner(name, price),
            events!inner(title, date, time, location, currency, image_url)
          `)
          .eq('id', id)
          .single();

        if (fallbackError) {
          console.error('Ticket fetch error:', fallbackError);
          throw new Error(`Impossible de charger le billet: ${formatError(fallbackError)}`);
        }

        if (!fallbackTicketData) {
          throw new Error('Billet non trouvé');
        }

        // Transform the joined data to match the expected format
        ticketData = {
          ...fallbackTicketData,
          ticket_type_name: fallbackTicketData.ticket_types?.name,
          ticket_type_price: fallbackTicketData.ticket_types?.price,
          event_title: fallbackTicketData.events?.title,
          event_date: fallbackTicketData.events?.date,
          event_time: fallbackTicketData.events?.time,
          event_location: fallbackTicketData.events?.location,
          event_currency: fallbackTicketData.events?.currency,
          event_image: fallbackTicketData.events?.image_url,
        };
      } else if (ticketError) {
        console.error('Ticket fetch error:', ticketError);
        throw new Error(`Impossible de charger le billet: ${formatError(ticketError)}`);
      }

      if (!ticketData) {
        throw new Error('Billet non trouvé');
      }

      console.log('Ticket fetched:', ticketData);
      setTicket(ticketData);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      const errorMessage = formatError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    Alert.alert(
      "Partager le billet",
      "Fonctionnalité de partage à venir",
      [{ text: "OK" }]
    );
  };

  const generatePdfHtml = (ticket: Ticket, qrCodeDataUrl: string) => {
    // Format the status text in French
    const getStatusText = (status: string) => {
      switch (status) {
        case 'VALID': return 'Valide';
        case 'USED': return 'Utilisé';
        case 'CANCELLED': return 'Annulé';
        case 'EXPIRED': return 'Expiré';
        default: return status;
      }
    };

    // Get status color
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'VALID': return '#2E7D32';
        case 'USED': return '#F57C00';
        case 'CANCELLED': return '#C62828';
        case 'EXPIRED': return '#757575';
        default: return '#757575';
      }
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .ticket-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #e0e0e0;
              border-radius: 12px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e0e0e0;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: ${Colors.light.primary};
              margin-bottom: 5px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              margin: 15px 0;
            }
            .event-details {
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-bottom: 20px;
            }
            .detail-row {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .detail-icon {
              width: 20px;
              height: 20px;
              color: #666;
            }
            .detail-text {
              font-size: 16px;
              color: #666;
            }
            .ticket-details {
              margin: 20px 0;
              padding: 20px 0;
              border-top: 1px solid #e0e0e0;
              border-bottom: 1px solid #e0e0e0;
            }
            .ticket-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
            }
            .ticket-label {
              font-size: 16px;
              color: #666;
            }
            .ticket-value {
              font-size: 16px;
              font-weight: 600;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 12px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 600;
              background-color: ${getStatusColor(ticket.status)}20;
              color: ${getStatusColor(ticket.status)};
            }
            .qr-container {
              text-align: center;
              margin: 20px auto;
              max-width: 300px;
              padding: 20px;
              border: 2px dashed #e0e0e0;
              border-radius: 16px;
              background-color: #f9f9f9;
            }
            .qr-title {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .qr-subtitle {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
            .qr-code-wrapper {
              width: 200px;
              height: 200px;
              margin: 0 auto;
              padding: 10px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .qr-code {
              width: 100%;
              height: 100%;
            }
            .qr-valid-text {
              font-size: 14px;
              color: #2E7D32;
              margin-top: 10px;
              font-weight: 500;
            }
            .qr-status {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin-top: 20px;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
            .qr-status-icon {
              width: 20px;
              height: 20px;
              background-color: #757575;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .qr-status-text {
              font-size: 16px;
              color: #757575;
              font-weight: 500;
            }
            .notes {
              margin-top: 20px;
            }
            .notes-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .notes-text {
              font-size: 14px;
              color: #666;
              line-height: 1.5;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            .event-image {
              width: 100%;
              max-height: 200px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="header">
              <div class="logo">EventTicket</div>
              <div>Votre billet électronique</div>
            </div>
            
            ${ticket.event_image ? `<img src="${ticket.event_image}" class="event-image" alt="Event Image" />` : ''}
            
            <h1 class="title">${ticket.event_title || 'Événement'}</h1>
            
            <div class="event-details">
              <div class="detail-row">
                <span class="detail-icon">📅</span>
                <span class="detail-text">${formatDate(ticket.event_date || '')} à ${ticket.event_time || ''}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-icon">📍</span>
                <span class="detail-text">${ticket.event_location || 'Lieu non spécifié'}</span>
              </div>
            </div>
            
            <div class="ticket-details">
              <div class="ticket-row">
                <span class="ticket-label">Type de billet</span>
                <span class="ticket-value">${ticket.ticket_type_name || 'Standard'}</span>
              </div>
              
              <div class="ticket-row">
                <span class="ticket-label">Prix</span>
                <span class="ticket-value">${ticket.event_currency || '€'} ${Number(ticket.ticket_type_price || 0).toLocaleString()}</span>
              </div>
              
              <div class="ticket-row">
                <span class="ticket-label">Statut</span>
                <span class="status-badge">${getStatusText(ticket.status)}</span>
              </div>
              
              <div class="ticket-row">
                <span class="ticket-label">ID du billet</span>
                <span class="ticket-value" style="font-family: monospace; font-size: 14px;">${ticket.id}</span>
              </div>
            </div>
            
            <div class="qr-container">
              <div class="qr-title">Scanner pour vérifier</div>
              <div class="qr-subtitle">Présentez ce code QR à l'entrée</div>
              
              <div class="qr-code-wrapper">
                <img src="${qrCodeDataUrl}" class="qr-code" alt="QR Code" />
              </div>
              
              <div class="qr-valid-text">Valide pour une entrée unique</div>
              
              <div class="qr-status">
                <div class="qr-status-icon">✓</div>
                <div class="qr-status-text">Billet ${getStatusText(ticket.status)}</div>
              </div>
            </div>
            
            <div class="notes">
              <div class="notes-title">Informations importantes</div>
              <div class="notes-text">
                • Ce billet est personnel et non transférable<br>
                • Arrivez 30 minutes avant le début de l'événement<br>
                • Une pièce d'identité peut être demandée<br>
                • Le code QR doit être scanné pour valider l'entrée
              </div>
            </div>
            
            <div class="footer">
              <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
              <p>© 2025 EventTicket - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    if (!ticket) return;
    
    try {
      setDownloadLoading(true);
      
      // Generate QR code data
      const ticketId = ticket.id || '';  // Fix: Provide default empty string to avoid undefined
      if (!ticketId) {
        throw new Error("ID de billet invalide");
      }
      
      // Use the already generated QR code data
      if (!qrCodeData) {
        throw new Error("Code QR non généré");
      }
      
      // Create QR code URL using the generated data
      const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCodeData)}`;
      
      // Generate PDF HTML content
      const htmlContent = generatePdfHtml(ticket, qrCodeDataUrl);
      
      // Create PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      // Generate a more user-friendly filename
      const eventName = (ticket.event_title || 'event').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
      const newFileUri = `${FileSystem.documentDirectory}billet_${eventName}_${timestamp}.pdf`;
      
      // Copy the file to a more accessible location with a better name
      await FileSystem.copyAsync({
        from: uri,
        to: newFileUri
      });
      
      // Share the PDF file
      if (Platform.OS === 'web') {
        // For web, we can't use Sharing API, so we'll open the PDF in a new tab
        window.open(uri, '_blank');
      } else {
        // For mobile, use the Sharing API
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert(
            "Partage non disponible",
            "Le partage n'est pas disponible sur cet appareil",
            [{ text: "OK" }]
          );
          return;
        }
        
        await Sharing.shareAsync(newFileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger votre billet',
          UTI: 'com.adobe.pdf'
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        "Erreur",
        `Impossible de générer le PDF: ${formatError(error)}`,
        [{ text: "OK" }]
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement du billet...</Text>
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Billet non trouvé'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Create QR code URL using the generated data
  const qrCodeDataUrl = qrCodeData 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCodeData)}`
    : null;

  // Helper function to get status text in French
  const getStatusText = (status: string) => {
    switch (status) {
      case 'VALID': return 'Valide';
      case 'USED': return 'Utilisé';
      case 'CANCELLED': return 'Annulé';
      case 'EXPIRED': return 'Expiré';
      default: return status;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Mon Billet",
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Share2 size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDownload} 
                style={styles.headerButton}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                ) : (
                  <Download size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.ticketContainer}>
          {/* Event Image */}
          {ticket.event_image && (
            <Image 
              source={{ uri: ticket.event_image }} 
              style={styles.eventImage}
              resizeMode="cover"
            />
          )}
          
          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{ticket.event_title || 'Événement'}</Text>
            
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Calendar size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText}>
                  {formatDate(ticket.event_date || '')} à {ticket.event_time || ''}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <MapPin size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText}>{ticket.event_location || 'Lieu non spécifié'}</Text>
              </View>
            </View>
          </View>
          
          {/* Ticket Details */}
          <View style={styles.ticketDetails}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Type de billet</Text>
              <Text style={styles.ticketValue}>{ticket.ticket_type_name || 'Standard'}</Text>
            </View>
            
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Prix</Text>
              <Text style={styles.ticketValue}>
                {ticket.event_currency || '€'} {Number(ticket.ticket_type_price || 0).toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Statut</Text>
              <View style={[
                styles.statusBadge,
                ticket.status === 'VALID' && styles.statusValid,
                ticket.status === 'USED' && styles.statusUsed,
                ticket.status === 'CANCELLED' && styles.statusCancelled,
              ]}>
                <Text style={[
                  styles.statusText,
                  ticket.status === 'VALID' && styles.statusTextValid,
                  ticket.status === 'USED' && styles.statusTextUsed,
                  ticket.status === 'CANCELLED' && styles.statusTextCancelled,
                ]}>
                  {getStatusText(ticket.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>ID du billet</Text>
              <Text style={styles.ticketId}>{ticket.id}</Text>
            </View>
          </View>
          
          {/* QR Code - Updated with new design */}
          <View style={styles.qrOuterContainer}>
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>SCANNER POUR VÉRIFIER</Text>
              <Text style={styles.qrSubtitle}>Présentez ce code QR à l'entrée</Text>
              
              {qrCodeDataUrl ? (
                <View style={styles.qrCodeWrapper}>
                  <Image 
                    source={{ uri: qrCodeDataUrl }}
                    style={styles.qrCode}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.qrErrorContainer}>
                  <Text style={styles.qrErrorText}>
                    Impossible de générer le code QR
                  </Text>
                </View>
              )}
              
              <Text style={styles.qrValidText}>
                Valide pour une entrée unique
              </Text>
            </View>
            
            <View style={styles.ticketStatusContainer}>
              <View style={styles.ticketStatusIcon}>
                <Check size={16} color="#fff" />
              </View>
              <Text style={styles.ticketStatusText}>
                Billet {getStatusText(ticket.status)}
              </Text>
            </View>
          </View>
          
          {/* Important Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Informations importantes</Text>
            <Text style={styles.notesText}>
              • Ce billet est personnel et non transférable{"\n"}
              • Arrivez 30 minutes avant le début de l'événement{"\n"}
              • Une pièce d'identité peut être demandée{"\n"}
              • Le code QR doit être scanné pour valider l'entrée
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.subtext,
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
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.common.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  ticketContainer: {
    margin: 16,
    backgroundColor: Colors.common.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  ticketDetails: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketLabel: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  ticketValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  ticketId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.light.subtext,
    maxWidth: 150,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusValid: {
    backgroundColor: '#E8F5E8',
  },
  statusUsed: {
    backgroundColor: '#FFF3E0',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextValid: {
    color: '#2E7D32',
  },
  statusTextUsed: {
    color: '#F57C00',
  },
  statusTextCancelled: {
    color: '#C62828',
  },
  // Updated QR code container styles to match the design
  qrOuterContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  qrContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    width: 200,
    height: 200,
    padding: 10,
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  qrErrorContainer: {
    padding: 16,
    backgroundColor: Colors.light.border,
    borderRadius: 12,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrErrorText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  qrValidText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '500',
  },
  ticketStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '80%',
    gap: 8,
  },
  ticketStatusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketStatusText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  notesContainer: {
    padding: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.subtext,
    lineHeight: 20,
  },
});