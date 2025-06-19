import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { frTranslations } from '@/constants/translations';

interface LanguageState {
  language: 'fr';
  translations: typeof frTranslations;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fr',
      translations: frTranslations,
    }),
    {
      name: 'temba-language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);