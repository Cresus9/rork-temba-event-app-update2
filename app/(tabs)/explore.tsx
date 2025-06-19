import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useEventsStore } from '@/store/events-store';
import Colors from '@/constants/colors';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import CategoryList from '@/components/CategoryList';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar } from 'lucide-react-native';

export default function ExploreScreen() {
  const { 
    allEvents, 
    filteredEvents,
    searchQuery,
    isLoading, 
    error,
    fetchEvents,
    searchForEvents,
    clearFilters
  } = useEventsStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        t.common.error,
        error,
        [{ text: 'OK' }]
      );
    }
  }, [error, t.common.error]);

  const handleSearch = (query: string) => {
    searchForEvents(query);
  };

  return (
    <View style={styles.container}>
      <SearchBar 
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder={t.home.searchPlaceholder}
        realTimeSearch={true}
      />

      <Text style={styles.sectionTitle}>{t.explore.browseByCategory}</Text>
      <CategoryList horizontal={false} />

      <View style={styles.eventsHeader}>
        <Text style={styles.sectionTitle}>{t.explore.allEvents}</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearFilters}>{t.explore.clearFilters}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventsContainer}
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Calendar size={64} color={Colors.light.subtext} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>{t.explore.noEventsFound}</Text>
              <Text style={styles.emptySubtext}>{t.explore.adjustSearch}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginTop: 8,
    marginBottom: -8,
  },
  clearFilters: {
    color: Colors.light.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  eventsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});