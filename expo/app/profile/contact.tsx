import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Mail, Phone, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

// Contact information
const SUPPORT_PHONE = "+226 70 00 00 00";
const SUPPORT_EMAIL = "support@temba.com";
const SUPPORT_ADDRESS = "123 Avenue de l'Indépendance, Ouagadougou, Burkina Faso";
const SUPPORT_HOURS = "Lundi au vendredi, de 9h à 18h";

export default function ContactScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Support%20Request`);
  };

  const handleOpenMap = () => {
    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(SUPPORT_ADDRESS)}`;
    Linking.openURL(mapUrl);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Nous contacter",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Contactez-nous</Text>
        <Text style={styles.description}>
          Notre équipe de support est disponible pour vous aider. N'hésitez pas à nous contacter par téléphone ou par email.
        </Text>
        
        <View style={styles.contactCardsContainer}>
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleCallSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.primary}15` }]}>
              <Phone size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.contactLabel}>Téléphone</Text>
            <Text style={styles.contactValue}>{SUPPORT_PHONE}</Text>
            <Text style={styles.contactHours}>{SUPPORT_HOURS}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.secondary}15` }]}>
              <Mail size={24} color={Colors.light.secondary} />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={[styles.contactValue, { color: Colors.light.secondary }]}>{SUPPORT_EMAIL}</Text>
            <Text style={styles.contactHours}>Réponse sous 24 heures</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.addressCard}
          onPress={handleOpenMap}
          activeOpacity={0.7}
        >
          <View style={styles.addressHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.info}15` }]}>
              <MapPin size={24} color={Colors.light.info} />
            </View>
            <View style={styles.addressTextContainer}>
              <Text style={styles.contactLabel}>Adresse</Text>
              <Text style={styles.addressText}>{SUPPORT_ADDRESS}</Text>
            </View>
          </View>
          <Text style={styles.mapLinkText}>Voir sur la carte</Text>
        </TouchableOpacity>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Informations supplémentaires</Text>
          <Text style={styles.infoText}>
            Pour les questions concernant les billets, veuillez avoir votre numéro de commande à portée de main lorsque vous nous contactez.
          </Text>
          <Text style={styles.infoText}>
            Pour les organisateurs d'événements, veuillez utiliser l'adresse email dédiée: organisateurs@temba.com
          </Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 24,
    lineHeight: 22,
  },
  contactCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 4,
    textAlign: 'center',
  },
  contactHours: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 4,
  },
  mapLinkText: {
    fontSize: 14,
    color: Colors.light.info,
    fontWeight: '500',
    textAlign: 'right',
  },
  infoSection: {
    backgroundColor: `${Colors.light.primary}08`,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 8,
    lineHeight: 20,
  },
});