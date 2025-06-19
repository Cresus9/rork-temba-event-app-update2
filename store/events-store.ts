import { create } from 'zustand';
import { Event, EventCategory } from '@/types';
import { supabase } from '@/lib/supabase';

interface EventsState {
  allEvents: Event[];
  featuredEvents: Event[];
  filteredEvents: Event[];
  searchQuery: string;
  selectedCategory: EventCategory | null;
  isLoading: boolean;
  error: string | null;
  
  fetchEvents: () => Promise<void>;
  fetchEventsByCategory: (category: EventCategory) => Promise<void>;
  searchForEvents: (query: string) => Promise<void>;
  clearFilters: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  allEvents: [],
  featuredEvents: [],
  filteredEvents: [],
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(id, name, avatar_url)
        `)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error.message || JSON.stringify(error));
        throw new Error(error.message || 'Error fetching events from database');
      }
      
      if (!eventsData || eventsData.length === 0) {
        set({ 
          allEvents: [],
          featuredEvents: [],
          filteredEvents: [],
          isLoading: false,
          error: 'No events found. Please check back later.'
        });
        return;
      }
      
      // Process events data
      const processedEvents = eventsData.map(event => ({
        ...event,
        categories: event.categories || [],
        organizer: event.organizer ? {
          id: event.organizer.id,
          name: event.organizer.name,
          logo: event.organizer.avatar_url
        } : { id: '', name: '', logo: null }
      })) as Event[];
      
      // Filter featured events
      const featured = processedEvents.filter(event => event.featured);
      
      set({ 
        allEvents: processedEvents,
        featuredEvents: featured,
        filteredEvents: processedEvents,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred');
      
      set({ 
        isLoading: false,
        error: `Error fetching events: ${errorMessage}`
      });
    }
  },
  
  fetchEventsByCategory: async (category) => {
    set({ isLoading: true, selectedCategory: category, error: null });
    
    try {
      const { data: eventCategories, error: categoryError } = await supabase
        .from('event_categories')
        .select('event_id')
        .eq('name', category);
      
      if (categoryError) {
        console.error('Error fetching event categories:', categoryError.message || JSON.stringify(categoryError));
        throw new Error(categoryError.message || 'Error fetching event categories');
      }
      
      if (!eventCategories || eventCategories.length === 0) {
        set({ 
          filteredEvents: [],
          isLoading: false,
          error: `No events found in the "${category}" category.`
        });
        return;
      }
      
      const eventIds = eventCategories.map(ec => ec.event_id);
      
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(id, name, avatar_url)
        `)
        .in('id', eventIds)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events by category:', error.message || JSON.stringify(error));
        throw new Error(error.message || 'Error fetching events by category');
      }
      
      if (!eventsData || eventsData.length === 0) {
        set({ 
          filteredEvents: [],
          isLoading: false,
          error: `No events found in the "${category}" category.`
        });
        return;
      }
      
      // Process events data
      const processedEvents = eventsData.map(event => ({
        ...event,
        categories: event.categories || [],
        organizer: event.organizer ? {
          id: event.organizer.id,
          name: event.organizer.name,
          logo: event.organizer.avatar_url
        } : { id: '', name: '', logo: null }
      })) as Event[];
      
      set({ 
        filteredEvents: processedEvents,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error fetching events by category:', error);
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred');
      
      set({ 
        filteredEvents: [],
        isLoading: false,
        error: `Error fetching events by category: ${errorMessage}`
      });
    }
  },
  
  searchForEvents: async (query) => {
    set({ searchQuery: query });
    
    // If query is empty, return all events without making a server request
    if (!query || query.trim() === '') {
      set({
        filteredEvents: get().allEvents,
        error: null
      });
      return;
    }
    
    // For real-time filtering, first do a client-side filter
    const normalizedQuery = query.trim().toLowerCase();
    const { allEvents } = get();
    
    // Filter events locally first for immediate feedback
    const localFilteredEvents = allEvents.filter(event => 
      event.title.toLowerCase().includes(normalizedQuery) ||
      event.description.toLowerCase().includes(normalizedQuery) ||
      event.location.toLowerCase().includes(normalizedQuery)
    );
    
    set({ 
      filteredEvents: localFilteredEvents,
      isLoading: true,
      error: null
    });
    
    // Then perform the server-side search for more accurate results
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(id, name, avatar_url)
        `)
        .or(`title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,location.ilike.%${normalizedQuery}%`)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error searching events:', error.message || JSON.stringify(error));
        throw new Error(error.message || 'Error searching events');
      }
      
      if (!eventsData || eventsData.length === 0) {
        set({ 
          filteredEvents: [],
          isLoading: false,
          error: `No events found matching "${query}".`
        });
        return;
      }
      
      // Process events data
      const processedEvents = eventsData.map(event => ({
        ...event,
        categories: event.categories || [],
        organizer: event.organizer ? {
          id: event.organizer.id,
          name: event.organizer.name,
          logo: event.organizer.avatar_url
        } : { id: '', name: '', logo: null }
      })) as Event[];
      
      set({ 
        filteredEvents: processedEvents,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error searching events:', error);
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred');
      
      set({ 
        isLoading: false,
        error: `Error searching events: ${errorMessage}`
      });
    }
  },
  
  clearFilters: () => {
    set({ 
      filteredEvents: get().allEvents,
      searchQuery: '',
      selectedCategory: null,
      error: null
    });
  }
}));