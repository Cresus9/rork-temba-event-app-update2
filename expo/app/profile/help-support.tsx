import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { HelpCircle, Mail, Phone, FileText, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'Comment acheter des billets ?',
    answer: 'Pour acheter des billets, naviguez vers l\'événement qui vous intéresse, cliquez sur "Acheter des billets", sélectionnez le type et la quantité de billets, puis procédez au paiement.'
  },
  {
    id: '2',
    question: 'Comment puis-je annuler mes billets ?',
    answer: 'Pour annuler vos billets, allez dans la section "Mes billets", sélectionnez le billet que vous souhaitez annuler et suivez les instructions. Veuillez noter que les politiques d\'annulation varient selon les événements.'
  },
  {
    id: '3',
    question: 'Comment contacter l\'organisateur d\'un événement ?',
    answer: 'Vous pouvez contacter l\'organisateur en visitant la page de l\'événement et en cliquant sur le profil de l\'organisateur. Vous y trouverez ses coordonnées ou un formulaire de contact.'
  },
  {
    id: '4',
    question: 'Mes billets sont-ils transférables ?',
    answer: 'La transférabilité des billets dépend de la politique de l\'organisateur. Consultez les détails de l\'événement ou contactez l\'organisateur pour plus d\'informations.'
  },
];

// Contact information
const SUPPORT_PHONE = "+226 70 00 00 00";
const SUPPORT_EMAIL = "support@temba.com";
const SUPPORT_HOURS = "Lundi au vendredi, de 9h à 18h";

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const navigateTo = (path: string) => {
    if (!path) return;
    console.log(`Navigating to: ${path}`);
    router.push(path);
  };

  const handleFaqItemPress = (id: string) => {
    const faq = faqs.find(item => item.id === id);
    if (faq) {
      Alert.alert(faq.question, faq.answer);
    }
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Support%20Request`);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t.profile.helpSupport,
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment pouvons-nous vous aider ?</Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={styles.contactOption} 
              onPress={handleEmailSupport}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.primary}15` }]}>
                <Mail size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.optionTitle}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactOption} 
              onPress={() => navigateTo('/profile/faq')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.secondary}15` }]}>
                <HelpCircle size={24} color={Colors.light.secondary} />
              </View>
              <Text style={styles.optionTitle}>FAQ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactOption} 
              onPress={() => Alert.alert(t.common.comingSoon, "Les conditions d'utilisation seront bientôt disponibles.")}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.info}15` }]}>
                <FileText size={24} color={Colors.light.info} />
              </View>
              <Text style={styles.optionTitle}>Conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          
          {faqs.map((faq) => (
            <TouchableOpacity 
              key={faq.id} 
              style={styles.faqItem}
              onPress={() => handleFaqItemPress(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer} numberOfLines={2}>{faq.answer}</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.subtext} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigateTo('/profile/faq')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>Voir toutes les questions</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Besoin d'aide urgente ?</Text>
          
          <TouchableOpacity 
            style={styles.supportCard}
            onPress={handleCallSupport}
            activeOpacity={0.7}
          >
            <View style={styles.supportCardContent}>
              <Phone size={24} color={Colors.light.primary} />
              <View style={styles.supportCardText}>
                <Text style={styles.supportCardTitle}>Service client</Text>
                <Text style={styles.supportCardDescription}>
                  Notre équipe est disponible {SUPPORT_HOURS}
                </Text>
              </View>
            </View>
            <Text style={styles.phoneNumber}>{SUPPORT_PHONE}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.supportCard, styles.emailCard]}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <View style={styles.supportCardContent}>
              <Mail size={24} color={Colors.light.secondary} />
              <View style={styles.supportCardText}>
                <Text style={styles.supportCardTitle}>Email Support</Text>
                <Text style={styles.supportCardDescription}>
                  Envoyez-nous un email et nous vous répondrons dans les 24 heures
                </Text>
              </View>
            </View>
            <Text style={[styles.phoneNumber, styles.emailText]}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactOption: {
    alignItems: 'center',
    width: '30%',
    padding: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  faqContent: {
    flex: 1,
    marginRight: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  supportCard: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  emailCard: {
    marginTop: 12,
  },
  supportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportCardText: {
    marginLeft: 16,
    flex: 1,
  },
  supportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  supportCardDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  emailText: {
    color: Colors.light.secondary,
  },
});