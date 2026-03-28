import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import EventCard from '@/components/EventCard';
import { getCategoryById } from '@/mocks/categories';
import { EventCategory } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { filteredEvents, isLoading, fetchEventsByCategory } = useEventsStore();
  const { t } = useTranslation();
  
  const category = getCategoryById(id as EventCategory);
  
  useEffect(() => {
    if (id) {
      fetchEventsByCategory(id as EventCategory);
    }
  }, [id, fetchEventsByCategory]);

  const getCategoryName = (id: string) => {
    switch (id) {
      case 'music': return t.categories.music;
      case 'cinema': return t.categories.cinema;
      case 'sports': return t.categories.sports;
      case 'festivals': return t.categories.festivals;
      case 'arts': return t.categories.arts;
      case 'food': return t.categories.food;
      case 'business': return t.categories.business;
      case 'education': return t.categories.education;
      default: return "Catégorie";
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: category ? getCategoryName(category.id) : "Catégorie",
        }}
      />
      
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <>
            {filteredEvents.length > 0 ? (
              <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <EventCard event={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>{t.explore.noEventsFound}</Text>
                <Text style={styles.emptySubtitle}>
                  {t.categories.noEventsInCategory}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});