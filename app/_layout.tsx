import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import { SplashLogo } from "@/components/Logo";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { isInitialized } = useSupabaseAuth();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return (
      <View style={styles.splashContainer}>
        <SplashLogo size={200} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { t } = useTranslation();
  
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: t.common.back,
          headerStyle: {
            backgroundColor: Colors.common.white,
          },
          headerTintColor: Colors.light.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(auth)/login" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="(auth)/register" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: "Détails de l'événement",
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="ticket/[id]" 
          options={{ 
            title: "Billet",
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="category/[id]" 
          options={{ 
            title: "Catégorie",
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="search" 
          options={{ 
            title: "Résultats de recherche",
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="checkout/[id]" 
          options={{ 
            title: "Sélection des billets",
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="payment/[id]" 
          options={{ 
            title: "Paiement",
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});