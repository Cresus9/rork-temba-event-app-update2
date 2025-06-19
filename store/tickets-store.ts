import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket, Order, TicketType } from '@/types';
import { supabase } from '@/lib/supabase';
import { generateQRData } from '@/utils/qr-service';

interface TicketsState {
  tickets: Ticket[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  fetchUserTickets: (userId: string) => Promise<void>;
  fetchUserOrders: (userId: string) => Promise<void>;
  fetchTicketTypes: (eventId: string) => Promise<TicketType[]>;
  purchaseTickets: (
    userId: string, 
    eventId: string, 
    ticketSelections: { ticketTypeId: string; quantity: number }[],
    paymentMethod: string
  ) => Promise<{ success: boolean; orderId?: string; ticketIds?: string[] }>;
  clearError: () => void;
}

// Generate a simple UUID-like string
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Enhanced error formatting function
const formatError = (error: any): string => {
  console.log('Formatting error in tickets store:', error);
  
  if (!error) return 'Erreur inconnue';
  
  if (typeof error === 'string') return error;
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle Supabase errors
  if (error.message) {
    if (error.details) return `${error.message}: ${error.details}`;
    if (error.hint) return `${error.message} (${error.hint})`;
    return error.message;
  }
  
  if (error.error_description) return error.error_description;
  if (error.details) return error.details;
  if (error.hint) return error.hint;
  
  if (error.code) {
    const message = error.message || 'Erreur inconnue';
    return `Erreur ${error.code}: ${message}`;
  }
  
  // Try to extract meaningful information from the error object
  if (typeof error === 'object') {
    try {
      const errorString = JSON.stringify(error);
      if (errorString !== '{}') {
        console.log('Error object in tickets store:', errorString);
        return 'Une erreur est survenue lors de l\'opération';
      }
    } catch (e) {
      console.log('Could not stringify error in tickets store:', e);
    }
  }
  
  return 'Une erreur inattendue est survenue';
};

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: [],
      orders: [],
      isLoading: false,
      error: null,
      
      clearError: () => set({ error: null }),
      
      fetchUserTickets: async (userId) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Fetching tickets for user:', userId);
          
          if (!userId) {
            throw new Error('ID utilisateur manquant');
          }
          
          // First try to fetch from ticket_details view if it exists
          let { data: ticketsData, error: ticketsError } = await supabase
            .from('ticket_details')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          // If ticket_details view doesn't exist, fall back to tickets table with joins
          if (ticketsError && ticketsError.code === '42P01') {
            console.log('ticket_details view not found, using tickets table with joins');
            
            const { data: fallbackTicketsData, error: fallbackError } = await supabase
              .from('tickets')
              .select(`
                *,
                ticket_types!inner(name, price),
                events!inner(title, date, time, location, currency, image_url)
              `)
              .eq('user_id', userId)
              .order('created_at', { ascending: false });

            if (fallbackError) {
              console.error('Tickets fetch error:', fallbackError);
              throw fallbackError;
            }

            // Transform the joined data to match the expected format
            ticketsData = fallbackTicketsData?.map(ticket => ({
              ...ticket,
              ticket_type_name: ticket.ticket_types?.name,
              ticket_type_price: ticket.ticket_types?.price,
              event_title: ticket.events?.title,
              event_date: ticket.events?.date,
              event_time: ticket.events?.time,
              event_location: ticket.events?.location,
              event_currency: ticket.events?.currency,
              event_image: ticket.events?.image_url,
            })) || [];
          } else if (ticketsError) {
            console.error('Tickets fetch error:', ticketsError);
            throw ticketsError;
          }

          console.log('Fetched tickets:', ticketsData?.length || 0);
          
          set({ 
            tickets: ticketsData || [],
            isLoading: false
          });
        } catch (error) {
          const errorMessage = formatError(error);
          console.error('Error fetching tickets:', error);
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      fetchUserOrders: async (userId) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Fetching orders for user:', userId);
          
          if (!userId) {
            throw new Error('ID utilisateur manquant');
          }
          
          const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          console.log('Fetched orders:', orders?.length || 0);
          
          set({ 
            orders: orders || [],
            isLoading: false
          });
        } catch (error) {
          const errorMessage = formatError(error);
          console.error('Error fetching orders:', error);
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      fetchTicketTypes: async (eventId) => {
        try {
          console.log('Fetching ticket types for event:', eventId);
          
          if (!eventId) {
            throw new Error('ID événement manquant');
          }
          
          const { data: ticketTypes, error } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('event_id', eventId)
            .order('price', { ascending: true });

          if (error) {
            throw error;
          }

          console.log('Fetched ticket types:', ticketTypes?.length || 0);
          return ticketTypes || [];
        } catch (error) {
          const errorMessage = formatError(error);
          console.error('Error fetching ticket types:', error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      purchaseTickets: async (userId, eventId, ticketSelections, paymentMethod) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Starting ticket purchase:', { userId, eventId, ticketSelections, paymentMethod });
          
          // Validate inputs
          if (!userId || typeof userId !== 'string') {
            throw new Error('ID utilisateur manquant ou invalide');
          }
          
          if (!eventId || typeof eventId !== 'string') {
            throw new Error('ID événement manquant ou invalide');
          }
          
          if (!ticketSelections || !Array.isArray(ticketSelections) || ticketSelections.length === 0) {
            throw new Error('Aucun billet sélectionné');
          }
          
          if (!paymentMethod || typeof paymentMethod !== 'string') {
            throw new Error('Méthode de paiement manquante');
          }
          
          // Validate ticket selections format
          for (const selection of ticketSelections) {
            if (!selection.ticketTypeId || typeof selection.ticketTypeId !== 'string') {
              throw new Error('ID de type de billet invalide');
            }
            if (!selection.quantity || typeof selection.quantity !== 'number' || selection.quantity <= 0) {
              throw new Error('Quantité de billets invalide');
            }
          }
          
          // Get ticket types to calculate total
          const { data: ticketTypes, error: ticketTypesError } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('event_id', eventId);

          if (ticketTypesError) {
            console.error('Ticket types error:', ticketTypesError);
            throw new Error(`Erreur lors de la récupération des types de billets: ${formatError(ticketTypesError)}`);
          }

          if (!ticketTypes || ticketTypes.length === 0) {
            throw new Error('Aucun type de billet trouvé pour cet événement');
          }

          console.log('Ticket types found:', ticketTypes.length);

          // Calculate total price
          let total = 0;
          const validatedSelections = [];
          
          for (const selection of ticketSelections) {
            if (!selection.ticketTypeId || selection.quantity <= 0) {
              continue;
            }
            
            const ticketType = ticketTypes.find(tt => tt.id === selection.ticketTypeId);
            if (!ticketType) {
              throw new Error(`Type de billet non trouvé: ${selection.ticketTypeId}`);
            }
            
            const price = Number(ticketType.price);
            if (isNaN(price) || price < 0) {
              throw new Error(`Prix invalide pour le type de billet: ${ticketType.name}`);
            }
            
            total += price * selection.quantity;
            validatedSelections.push({
              ticketTypeId: selection.ticketTypeId,
              quantity: selection.quantity,
              price: price,
              name: ticketType.name
            });
            
            console.log(`Added ${selection.quantity} x ${ticketType.name} at ${price} each`);
          }

          if (total <= 0) {
            throw new Error('Le montant total doit être supérieur à zéro');
          }

          if (validatedSelections.length === 0) {
            throw new Error('Aucune sélection de billet valide');
          }

          // Add service fee (5%)
          const serviceFee = Math.round(total * 0.05);
          total += serviceFee;

          console.log('Calculated total:', total, 'with service fee:', serviceFee);

          // Create ticket_quantities as a proper object for JSONB
          const ticketQuantitiesObject: { [key: string]: number } = {};
          validatedSelections.forEach(sel => {
            ticketQuantitiesObject[sel.ticketTypeId] = sel.quantity;
          });

          const orderData = {
            user_id: userId,
            event_id: eventId,
            total: total,  // Keep as number
            status: 'completed' as const,
            payment_method: paymentMethod,
            // Store as object for JSONB compatibility
            ticket_quantities: ticketQuantitiesObject
          };

          console.log('Creating order with data:', orderData);

          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

          if (orderError) {
            console.error('Order creation error:', orderError);
            console.error('Order error details:', {
              message: orderError.message,
              details: orderError.details,
              hint: orderError.hint,
              code: orderError.code
            });
            throw new Error(`Erreur lors de la création de la commande: ${formatError(orderError)}`);
          }

          if (!order) {
            throw new Error('La commande n\'a pas pu être créée');
          }

          console.log('Order created successfully:', order);

          // Create individual tickets with the new QR code format
          const ticketsToCreate = [];
          for (const selection of validatedSelections) {
            for (let i = 0; i < selection.quantity; i++) {
              const ticketId = generateUUID();
              let qrCode;
              
              try {
                // Use the new QR code generation method
                qrCode = generateQRData(ticketId);
              } catch (qrError) {
                console.error('QR generation error:', qrError);
                throw new Error(`Erreur lors de la génération du QR code: ${formatError(qrError)}`);
              }
              
              ticketsToCreate.push({
                id: ticketId,
                order_id: order.id,
                event_id: eventId,
                user_id: userId,
                ticket_type_id: selection.ticketTypeId,
                status: 'VALID' as const,
                qr_code: qrCode
              });
            }
          }

          if (ticketsToCreate.length === 0) {
            throw new Error('Aucun billet à créer');
          }

          console.log('Creating tickets:', ticketsToCreate.length);

          const { data: newTickets, error: ticketsError } = await supabase
            .from('tickets')
            .insert(ticketsToCreate)
            .select();

          if (ticketsError) {
            console.error('Tickets creation error:', ticketsError);
            console.error('Tickets error details:', {
              message: ticketsError.message,
              details: ticketsError.details,
              hint: ticketsError.hint,
              code: ticketsError.code
            });
            throw new Error(`Erreur lors de la création des billets: ${formatError(ticketsError)}`);
          }

          if (!newTickets || newTickets.length === 0) {
            throw new Error('Les billets n\'ont pas pu être créés');
          }

          console.log('Tickets created successfully:', newTickets.length);

          // Update local state
          set(state => ({
            orders: [order, ...state.orders],
            isLoading: false,
            error: null
          }));

          // Refresh tickets
          try {
            await get().fetchUserTickets(userId);
          } catch (refreshError) {
            console.warn('Could not refresh tickets after purchase:', refreshError);
            // Don't throw here as the purchase was successful
          }
          
          console.log('Purchase completed successfully');
          
          // Return ticket IDs for navigation
          const ticketIds = newTickets.map(ticket => ticket.id);
          return { success: true, orderId: order.id, ticketIds };
        } catch (error) {
          const errorMessage = formatError(error);
          console.error('Error purchasing tickets:', error);
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      }
    }),
    {
      name: 'temba-tickets-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        tickets: [],
        orders: []
      }),
    }
  )
);