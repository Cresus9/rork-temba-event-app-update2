import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CreditCard, Plus, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'mobile_money';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      name: 'Visa',
      lastFour: '4242',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mobile_money',
      name: 'Orange Money',
      lastFour: '7890',
      isDefault: false,
    }
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert(
      t.common.comingSoon,
      "La fonctionnalité d'ajout de méthode de paiement sera bientôt disponible."
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Supprimer la méthode de paiement",
      "Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?",
      [
        {
          text: t.common.cancel,
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => {
            setPaymentMethods(methods => methods.filter(method => method.id !== id));
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t.profile.paymentMethods,
        }}
      />
      
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {paymentMethods.length > 0 ? (
            <View style={styles.methodsContainer}>
              {paymentMethods.map((method) => (
                <View key={method.id} style={styles.methodCard}>
                  <View style={styles.methodInfo}>
                    <CreditCard size={24} color={Colors.light.text} />
                    <View style={styles.methodDetails}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <Text style={styles.methodNumber}>
                        {method.type === 'credit_card' ? '•••• •••• •••• ' : ''}{method.lastFour}
                      </Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Par défaut</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method.id)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.actionText}>Définir par défaut</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(method.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Aucune méthode de paiement</Text>
              <Text style={styles.emptySubtitle}>
                Vous n'avez pas encore ajouté de méthode de paiement
              </Text>
            </View>
          )}
          
          <Button
            title="Ajouter une méthode de paiement"
            onPress={handleAddPaymentMethod}
            icon={<Plus size={18} color={Colors.common.white} />}
            style={styles.addButton}
          />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  methodsContainer: {
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodDetails: {
    marginLeft: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: Colors.light.subtext,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: `${Colors.light.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: `${Colors.light.error}10`,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 24,
  },
});