import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import EventCard from '@/components/EventCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Search } from 'lucide-react-native';
import SearchBar from '@/components/SearchBar';

export default function SearchScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const { 
    filteredEvents, 
    searchQuery, 
    isLoading, 
    error, 
    searchForEvents 
  } = useEventsStore();
  const { t } = useTranslation();
  const router = useRouter();
  
  useEffect(() => {
    if (query) {
      searchForEvents(query);
    }
  }, [query, searchForEvents]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        t.common.error,
        error,
        [{ text: 'OK' }]
      );
    }
  }, [error, t.common.error]);

  const handleSearch = (text: string) => {
    searchForEvents(text);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: `${t.search.searchResults}: ${query || ''}`,
          headerBackTitle: t.common.back,
        }}
      />
      
      <View style={styles.container}>
        <SearchBar 
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={t.home.searchPlaceholder}
          realTimeSearch={true}
        />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <>
            {filteredEvents.length > 0 ? (
              <>
                <Text style={styles.resultsText}>
                  {filteredEvents.length} {filteredEvents.length !== 1 ? t.search.resultsFound : t.search.resultFound}
                </Text>
                <FlatList
                  data={filteredEvents}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <EventCard event={item} />}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Search size={64} color={Colors.light.subtext} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>{t.search.noResultsFound}</Text>
                <Text style={styles.emptySubtitle}>
                  {t.search.couldntFind} "{searchQuery}"
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
  resultsText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
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