import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Switch
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Eye, EyeOff, UserPlus, Mail, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
  
  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Simple validation for phone numbers
    return /^\+?[0-9]{8,15}$/.test(phone.replace(/\s+/g, ''));
  };

  const handleRegister = async () => {
    // Clear any previous errors
    clearError();
    
    // Validate inputs
    if (!name.trim()) {
      Alert.alert(t.common.error, t.auth.nameRequired);
      return;
    }
    
    if (!email.trim()) {
      Alert.alert(t.common.error, t.auth.emailRequired);
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert(t.common.error, t.auth.validEmail);
      return;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert(t.common.error, t.auth.phoneRequired);
      return;
    }
    
    if (!validatePhone(phoneNumber)) {
      Alert.alert(t.common.error, t.auth.phoneInvalid);
      return;
    }
    
    if (!password.trim()) {
      Alert.alert(t.common.error, t.auth.passwordRequired);
      return;
    }
    
    if (password.length < 6) {
      Alert.alert(t.common.error, t.auth.passwordLength);
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert(t.common.error, t.auth.passwordsMatch);
      return;
    }
    
    try {
      // Format phone number
      const formattedPhone = phoneNumber.trim() 
        ? (phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`.replace(/\s+/g, ''))
        : undefined;
      
      await register(name.trim(), email.trim(), password, formattedPhone);
      
      // Show success message
      Alert.alert(
        t.auth.registrationSuccess,
        t.auth.accountCreated,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to home screen
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      // Error is already handled by the store
      console.error('Registration failed:', error);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: '',
          headerBackVisible: true,
          headerTransparent: true,
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <Text style={styles.appName}>Temba</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.title}>{t.auth.createAccount}</Text>
            <Text style={styles.subtitle}>{t.auth.signUpToStart}</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.form}>
              <Input
                label={t.auth.fullName}
                value={name}
                onChangeText={setName}
                placeholder={t.auth.fullName}
                autoCapitalize="words"
              />
              
              <Input
                label={t.auth.email}
                value={email}
                onChangeText={setEmail}
                placeholder={t.auth.enterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<Mail size={20} color={Colors.light.subtext} />}
              />
              
              <Input
                label={t.auth.phoneNumber}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+33612345678"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<Phone size={20} color={Colors.light.subtext} />}
              />
              
              <Input
                label={t.auth.password}
                value={password}
                onChangeText={setPassword}
                placeholder={t.auth.enterPassword}
                secureTextEntry={!showPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.light.subtext} />
                    ) : (
                      <Eye size={20} color={Colors.light.subtext} />
                    )}
                  </TouchableOpacity>
                }
              />
              
              <Input
                label={t.auth.confirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t.auth.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={Colors.light.subtext} />
                    ) : (
                      <Eye size={20} color={Colors.light.subtext} />
                    )}
                  </TouchableOpacity>
                }
              />
              
              <View style={styles.newsletterContainer}>
                <Switch
                  value={subscribeToNewsletter}
                  onValueChange={setSubscribeToNewsletter}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
                  thumbColor={subscribeToNewsletter ? Colors.light.primary : Colors.light.card}
                />
                <View style={styles.newsletterTextContainer}>
                  <Text style={styles.newsletterTitle}>{t.auth.subscribeToNewsletter}</Text>
                  <Text style={styles.newsletterDescription}>{t.auth.receiveUpdates}</Text>
                </View>
              </View>
              
              <Button
                title={isLoading ? t.auth.processing : t.auth.signUp}
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                icon={!isLoading && <UserPlus size={18} color={Colors.common.white} />}
                style={styles.registerButton}
              />
            </View>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.common.orSignUpWith}</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <View style={styles.socialIconBox}>
                  <Text style={styles.socialIcon}>G</Text>
                </View>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <View style={[styles.socialIconBox, styles.facebookIcon]}>
                  <Text style={styles.socialIcon}>f</Text>
                </View>
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.termsText}>
              {t.auth.bySigningUp} <Text style={styles.linkText}>{t.auth.termsOfService}</Text> {t.auth.andOur} <Text style={styles.linkText}>{t.auth.privacyPolicy}</Text>
            </Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.auth.alreadyHaveAccount}</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.linkText}>{t.auth.signIn}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    color: Colors.common.white,
    fontSize: 24,
    fontWeight: '700',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  card: {
    backgroundColor: Colors.common.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  newsletterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  newsletterTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  newsletterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  newsletterDescription: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 2,
  },
  registerButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    color: Colors.light.subtext,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: Colors.common.white,
  },
  socialIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  socialIcon: {
    color: Colors.common.white,
    fontSize: 14,
    fontWeight: '700',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  linkText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});