import { useLanguageStore } from '@/store/language-store';

export function useTranslation() {
  const { translations } = useLanguageStore();
  
  return {
    t: translations,
  };
}