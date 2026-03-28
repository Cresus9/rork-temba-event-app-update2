import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ticket, CreditCard, Calendar, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function WhyChooseUs() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pourquoi choisir Temba</Text>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.iconContainer}>
            <Ticket size={28} color={Colors.light.primary} />
          </View>
          <Text style={styles.featureTitle}>Réservation facile</Text>
          <Text style={styles.featureDescription}>
            Réservez des billets en quelques secondes avec notre processus simple
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.iconContainer}>
            <CreditCard size={28} color={Colors.light.primary} />
          </View>
          <Text style={styles.featureTitle}>Paiements sécurisés</Text>
          <Text style={styles.featureDescription}>
            Options de paiement multiples avec traitement sécurisé
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.iconContainer}>
            <Calendar size={28} color={Colors.light.primary} />
          </View>
          <Text style={styles.featureTitle}>Événements exclusifs</Text>
          <Text style={styles.featureDescription}>
            Accès aux meilleurs événements au Burkina Faso
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.iconContainer}>
            <Shield size={28} color={Colors.light.primary} />
          </View>
          <Text style={styles.featureTitle}>Entrée garantie</Text>
          <Text style={styles.featureDescription}>
            Billets numériques avec codes QR pour une entrée sans problème
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.common.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});