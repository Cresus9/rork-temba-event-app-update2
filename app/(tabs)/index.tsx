import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import EventCard from '@/components/EventCard';
import CategoryList from '@/components/CategoryList';
import SearchBar from '@/components/SearchBar';
import WhyChooseUs from '@/components/WhyChooseUs';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    allEvents, 
    featuredEvents,
    searchQuery,
    isLoading, 
    error,
    fetchEvents,
    searchForEvents
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
    
    // If query is not empty, navigate to search results
    if (query.trim()) {
      router.push({
        pathname: '/search',
        params: { query: query.trim() }
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{t.home.hello}</Text>
          <Text style={styles.title}>{t.home.discoverEvents}</Text>
        </View>

        <SearchBar 
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={t.home.searchEvents}
          realTimeSearch={true}
        />

        <Text style={styles.sectionTitle}>{t.home.categories}</Text>
        <CategoryList />

        <Text style={styles.sectionTitle}>{t.home.featuredEvents}</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : featuredEvents.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} variant="featured" />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyFeaturedContainer}>
            <Calendar size={40} color={Colors.light.subtext} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>{t.home.noFeaturedEvents}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t.home.upcomingEvents}</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : allEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            {allEvents.slice(0, 4).map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={40} color={Colors.light.subtext} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>{t.home.noUpcomingEvents}</Text>
          </View>
        )}
        
        <WhyChooseUs />
        
        <NewsletterSubscription />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featuredContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  emptyFeaturedContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});