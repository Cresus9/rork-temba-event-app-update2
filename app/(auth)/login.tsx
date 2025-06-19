import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Eye, EyeOff, LogIn, Mail, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login, isLoading, error, clearError, pendingAction, clearPendingAction } = useAuthStore();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  // Helper function to determine if input is email or phone
  const isEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const isPhone = (value: string) => {
    return /^\+?[0-9]{8,15}$/.test(value.replace(/\s+/g, ''));
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert(t.common.error, t.auth.fillAllFields);
      return;
    }

    try {
      await login(identifier.trim(), password);
      handlePostLogin();
    } catch (error) {
      // Error is already handled by the store
      console.error('Login failed:', error);
    }
  };

  const handlePostLogin = () => {
    // Handle pending action after successful login
    if (pendingAction) {
      if (pendingAction.type === 'checkout' && pendingAction.eventId) {
        clearPendingAction();
        router.replace(`/checkout/${pendingAction.eventId}`);
        return;
      }
      clearPendingAction();
    }
    
    // Default navigation after login
    router.replace('/(tabs)');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    if (!identifier.trim()) {
      Alert.alert(t.common.error, t.auth.identifierRequiredForReset);
      return;
    }

    if (!isEmail(identifier) && !isPhone(identifier)) {
      Alert.alert(t.common.error, t.auth.validIdentifier);
      return;
    }

    // Simulate sending password reset email/SMS
    setTimeout(() => {
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
      }, 5000);
    }, 1000);

    Alert.alert(
      t.auth.resetEmailSent,
      isEmail(identifier) ? t.auth.resetEmailInstructions : t.auth.resetPhoneInstructions
    );
  };

  // Determine the appropriate icon for the identifier field
  const getIdentifierIcon = () => {
    if (!identifier) return null;
    if (isEmail(identifier)) return <Mail size={20} color={Colors.light.subtext} />;
    if (isPhone(identifier)) return <Phone size={20} color={Colors.light.subtext} />;
    return null;
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
            <Text style={styles.title}>{t.auth.welcomeBack}</Text>
            <Text style={styles.subtitle}>{t.auth.signInToContinue}</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {emailSent && (
              <View style={styles.successContainer}>
                <Mail size={20} color={Colors.light.success} style={styles.successIcon} />
                <Text style={styles.successText}>{t.auth.resetEmailSent}</Text>
              </View>
            )}
            
            <View style={styles.form}>
              <Input
                label={t.auth.emailOrPhone}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={t.auth.enterEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={getIdentifierIcon()}
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
              
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>{t.auth.forgotPassword}</Text>
              </TouchableOpacity>
              
              <Button
                title={isLoading ? t.auth.signingIn : t.auth.signIn}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                icon={!isLoading && <LogIn size={18} color={Colors.common.white} />}
                style={styles.loginButton}
              />
            </View>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.common.orSignInWith}</Text>
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
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.auth.dontHaveAccount}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.linkText}>{t.auth.signUp}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.emailNotice}>
            {t.auth.loginNotice}
          </Text>
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.successBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successIcon: {
    marginRight: 8,
  },
  successText: {
    color: Colors.light.success,
    fontSize: 14,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
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
  emailNotice: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});