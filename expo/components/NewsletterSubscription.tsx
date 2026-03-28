import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';

export default function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { t } = useTranslation();
  
  const handleSubscribe = async () => {
    if (!email.trim()) {
      Alert.alert(t.common.error, t.newsletter.emailRequired);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t.common.error, t.newsletter.validEmail);
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Vérifier si l'email existe déjà
      const { data: existingSubscribers, error: checkError } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingSubscribers) {
        setSuccessMessage(t.newsletter.alreadySubscribed);
        setEmail('');
        setIsLoading(false);
        return;
      }
      
      // Ajouter le nouvel abonné
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ 
          email, 
          status: 'active',
          subscribed_at: new Date().toISOString() 
        }]);
      
      if (error) throw error;
      
      setSuccessMessage(t.newsletter.subscribeSuccess);
      setEmail('');
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription à la newsletter:', error);
      Alert.alert(t.common.error, t.newsletter.subscribeError);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Mail size={32} color={Colors.light.primary} />
      </View>
      
      <Text style={styles.title}>{t.newsletter.stayInformed}</Text>
      
      <Text style={styles.description}>
        {t.newsletter.subscribeDescription}
      </Text>
      
      {successMessage ? (
        <View style={styles.successContainer}>
          <CheckCircle size={24} color={Colors.light.success} style={styles.successIcon} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t.newsletter.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubscribe}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.common.white} />
            ) : (
              <ArrowRight size={24} color={Colors.common.white} />
            )}
          </TouchableOpacity>
        </View>
      )}
      
      <Text style={styles.privacyText}>
        {t.newsletter.privacyNotice}
      </Text>
      
      <Text style={styles.copyright}>
        © 2025 Temba. {t.common.allRightsReserved}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: Colors.common.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 24,
    alignItems: 'center',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  button: {
    width: 56,
    height: 56,
    backgroundColor: Colors.light.primary,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.successBg,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  successIcon: {
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.success,
    lineHeight: 22,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  copyright: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});