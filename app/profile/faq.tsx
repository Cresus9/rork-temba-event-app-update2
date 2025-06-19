import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { HelpCircle, ChevronDown, ChevronUp, Search, Mail, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

// Contact information
const SUPPORT_PHONE = "+226 70 00 00 00";
const SUPPORT_EMAIL = "support@temba.com";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Comment acheter des billets ?',
    answer: 'Pour acheter des billets, naviguez vers l\'événement qui vous intéresse, cliquez sur "Acheter des billets", sélectionnez le type et la quantité de billets, puis procédez au paiement.',
    category: 'Billets'
  },
  {
    id: '2',
    question: 'Comment puis-je annuler mes billets ?',
    answer: 'Pour annuler vos billets, allez dans la section "Mes billets", sélectionnez le billet que vous souhaitez annuler et suivez les instructions. Veuillez noter que les politiques d\'annulation varient selon les événements.',
    category: 'Billets'
  },
  {
    id: '3',
    question: 'Comment contacter l\'organisateur d\'un événement ?',
    answer: 'Vous pouvez contacter l\'organisateur en visitant la page de l\'événement et en cliquant sur le profil de l\'organisateur. Vous y trouverez ses coordonnées ou un formulaire de contact.',
    category: 'Événements'
  },
  {
    id: '4',
    question: 'Mes billets sont-ils transférables ?',
    answer: 'La transférabilité des billets dépend de la politique de l\'organisateur. Consultez les détails de l\'événement ou contactez l\'organisateur pour plus d\'informations.',
    category: 'Billets'
  },
  {
    id: '5',
    question: 'Comment puis-je modifier mon profil ?',
    answer: 'Pour modifier votre profil, accédez à la section "Profil" depuis le menu principal, puis cliquez sur "Modifier le profil". Vous pourrez y mettre à jour vos informations personnelles, votre photo de profil et vos préférences.',
    category: 'Compte'
  },
  {
    id: '6',
    question: 'Comment puis-je réinitialiser mon mot de passe ?',
    answer: 'Si vous avez oublié votre mot de passe, cliquez sur "Mot de passe oublié" sur l\'écran de connexion. Vous recevrez un email avec des instructions pour réinitialiser votre mot de passe. Si vous êtes déjà connecté, vous pouvez changer votre mot de passe dans les paramètres de votre compte.',
    category: 'Compte'
  },
  {
    id: '7',
    question: 'Comment puis-je payer mes billets ?',
    answer: 'Nous acceptons plusieurs méthodes de paiement, notamment les cartes de crédit/débit (Visa, Mastercard), PayPal, et certaines solutions de paiement mobile selon votre région. Lors du processus d\'achat, vous verrez toutes les options de paiement disponibles.',
    category: 'Paiement'
  },
  {
    id: '8',
    question: 'Les paiements sont-ils sécurisés ?',
    answer: 'Oui, tous les paiements sont sécurisés. Nous utilisons un cryptage SSL pour protéger vos informations de paiement et nous ne stockons pas les détails de votre carte de crédit sur nos serveurs.',
    category: 'Paiement'
  },
];

export default function FAQScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(faqData.map(item => item.category)));
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === null || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

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
          title: "Foire aux questions",
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HelpCircle size={32} color={Colors.light.primary} />
          <Text style={styles.title}>Comment pouvons-nous vous aider ?</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.subtext} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity 
            style={[
              styles.categoryButton, 
              activeCategory === null && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory(null)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === null && styles.activeCategoryText
            ]}>Tous</Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryButton, 
                activeCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setActiveCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category && styles.activeCategoryText
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.faqContainer}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  {expandedId === item.id ? (
                    <ChevronUp size={20} color={Colors.light.primary} />
                  ) : (
                    <ChevronDown size={20} color={Colors.light.subtext} />
                  )}
                </View>
                
                {expandedId === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                Aucun résultat trouvé pour "{searchQuery}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                Essayez avec d'autres mots-clés ou consultez toutes nos questions fréquentes
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Vous n'avez pas trouvé ce que vous cherchiez ?</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={[styles.contactButton, styles.phoneButton]}
              onPress={handleCallSupport}
              activeOpacity={0.7}
            >
              <Phone size={20} color={Colors.common.white} />
              <Text style={styles.contactButtonText}>Appeler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.contactButton, styles.emailButton]}
              onPress={handleEmailSupport}
              activeOpacity={0.7}
            >
              <Mail size={20} color={Colors.common.white} />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.light.text,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  activeCategoryText: {
    color: Colors.common.white,
    fontWeight: '500',
  },
  faqContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  faqItem: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  answerText: {
    fontSize: 15,
    color: Colors.light.subtext,
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.common.white,
    borderRadius: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  contactSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  phoneButton: {
    backgroundColor: Colors.light.primary,
  },
  emailButton: {
    backgroundColor: Colors.light.secondary,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.common.white,
  },
});