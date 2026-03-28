import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Sliders } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Input from './ui/Input';
import { useTranslation } from '@/hooks/useTranslation';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  realTimeSearch?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  placeholder,
  realTimeSearch = true
}: SearchBarProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (onSubmit) {
      onSubmit();
    } else if (value.trim()) {
      router.push({
        pathname: '/search',
        params: { query: value.trim() }
      });
    }
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    // If realTimeSearch is enabled, trigger search on each text change
    if (realTimeSearch && onSubmit) {
      // Use a small timeout to avoid too many requests while typing
      const timeoutId = setTimeout(() => {
        onSubmit();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder || t.home.searchEvents}
        style={styles.inputContainer}
        leftIcon={<Search size={20} color={Colors.light.subtext} />}
        rightIcon={
          onFilterPress ? (
            <TouchableOpacity onPress={onFilterPress} activeOpacity={0.7}>
              <Sliders size={20} color={Colors.light.subtext} />
            </TouchableOpacity>
          ) : undefined
        }
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
});