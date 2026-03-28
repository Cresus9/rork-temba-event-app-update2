export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  role?: string;
  status?: string;
  avatar?: string;
  created_at?: string;
}

export type EventCategory = 
  | 'music'
  | 'cinema'
  | 'sports'
  | 'festivals'
  | 'arts'
  | 'food'
  | 'business'
  | 'education'
  | 'all';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  category_id: string;
  organizer_id: string;
  price_min: number;
  price_max: number;
  currency: string;
  capacity: number;
  status: 'draft' | 'published' | 'cancelled';
  created_at: string;
  updated_at: string;
  featured?: boolean;
  // Optional properties for enhanced event data
  tickets_sold?: number;
  avg_rating?: number;
  review_count?: number;
  price?: number; // Derived from price_min for display purposes
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  max_per_order: number;
  sale_start_date?: string;
  sale_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  event_id: string;
  user_id: string;
  ticket_type_id: string;
  status: 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';
  qr_code: string; // Now contains encrypted data
  created_at: string;
  updated_at: string;
  scanned_at?: string;
  scanned_by?: string;
  scan_location?: string;
  transfer_id?: string;
  // Joined fields from the view or enriched data
  ticket_types?: {
    name: string;
    price: number;
  };
  events?: {
    title: string;
    date: string;
    time: string;
    location: string;
    currency: string;
    image_url: string;
  };
  ticket_type_name?: string;
  ticket_type_price?: number;
  event_title?: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  event_currency?: string;
  event_image?: string;
  user_name?: string;
  user_email?: string;
  scanned_by_name?: string;
}

export interface Order {
  id: string;
  user_id: string;
  event_id: string;
  total: number; // Changed to number to match database numeric type
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_method: string;
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
  // Store as proper JSONB object for database compatibility
  ticket_quantities: { [ticketTypeId: string]: number };
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface QRPayload {
  id: string;
  timestamp: number;
}

// Helper type for ticket selections during purchase
export interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
}

// Helper type for validated ticket selections with additional info
export interface ValidatedTicketSelection extends TicketSelection {
  price: number;
  name: string;
}