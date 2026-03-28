import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { Shield, Eye, Lock, AlertCircle } from 'lucide-react-native';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Confidentialité",
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={32} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>Paramètres de confidentialité</Text>
          <Text style={styles.headerSubtitle}>
            Gérez vos préférences de confidentialité et contrôlez vos données personnelles
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibilité du profil</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingWithIcon}>
              <Eye size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Profil public</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={profileVisibility ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={setProfileVisibility}
              value={profileVisibility}
            />
          </View>
          
          <Text style={styles.settingDescription}>
            Lorsque cette option est activée, votre profil peut être vu par d'autres utilisateurs.
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingWithIcon}>
              <Lock size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Partage de localisation</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={locationSharing ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={setLocationSharing}
              value={locationSharing}
            />
          </View>
          
          <Text style={styles.settingDescription}>
            Permet à l'application d'utiliser votre localisation pour vous proposer des événements à proximité.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données et personnalisation</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingWithIcon}>
              <AlertCircle size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Collecte de données</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={dataCollection ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={setDataCollection}
              value={dataCollection}
            />
          </View>
          
          <Text style={styles.settingDescription}>
            Nous permet de collecter des données anonymes pour améliorer l'application.
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingWithIcon}>
              <AlertCircle size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Emails marketing</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
              thumbColor={marketingEmails ? Colors.light.primary : '#f4f3f4'}
              ios_backgroundColor={Colors.light.border}
              onValueChange={setMarketingEmails}
              value={marketingEmails}
            />
          </View>
          
          <Text style={styles.settingDescription}>
            Recevoir des emails sur les nouveaux événements et offres spéciales.
          </Text>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Télécharger mes données</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Politique de confidentialité</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pour toute question concernant vos données personnelles, veuillez contacter notre équipe de support.
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
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.common.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});