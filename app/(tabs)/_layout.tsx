import React from "react";
import { Tabs } from "expo-router";
import { Home, Ticket, Search, User } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { StyleSheet, Text, View, Platform } from "react-native";

export default function TabLayout() {
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.subtext,
        tabBarStyle: {
          borderTopColor: Colors.light.border,
          height: Platform.OS === 'android' ? 55 : 60,
          paddingBottom: Platform.OS === 'android' ? 8 : 10,
          paddingTop: Platform.OS === 'android' ? 6 : 8,
          backgroundColor: Colors.common.white,
          borderTopWidth: 1,
          // Remove absolute positioning and bottom property
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 3 : 0,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 2 : 0,
        },
        headerStyle: {
          backgroundColor: Colors.common.white,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.light.text,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Temba",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          tabBarLabel: "Accueil",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Temba</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorer",
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Billets",
          tabBarIcon: ({ color }) => <Ticket size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
          headerTitle: "Profil",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
});