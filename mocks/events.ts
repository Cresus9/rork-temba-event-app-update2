import { Event } from "@/types";

export const events: Event[] = [
  {
    id: "1",
    title: "Afrobeats Summer Festival",
    description: "Experience the biggest Afrobeats festival in West Africa featuring top artists from across the continent. Enjoy amazing performances, delicious food, and cultural exhibitions in a vibrant atmosphere.",
    date: "2025-07-15",
    time: "16:00",
    location: "National Stadium, Lagos",
    venue: "National Stadium",
    image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 5000,
    currency: "NGN",
    capacity: 15000,
    tickets_sold: 8750,
    status: "upcoming",
    featured: true,
    categories: ["music", "festivals"],
    coordinates: {
      latitude: 6.4951,
      longitude: 3.3708
    },
    organizer: {
      id: "org1",
      name: "AfroVibes Entertainment",
      logo: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    }
  },
  {
    id: "2",
    title: "Tech Innovation Summit",
    description: "Join industry leaders, entrepreneurs, and tech enthusiasts for West Africa's premier technology conference. Discover the latest innovations, network with professionals, and participate in workshops.",
    date: "2025-08-22",
    time: "09:00",
    location: "Kempinski Hotel, Accra",
    venue: "Kempinski Hotel",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 250,
    currency: "USD",
    capacity: 1200,
    tickets_sold: 850,
    status: "upcoming",
    featured: true,
    categories: ["business", "education"],
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    },
    organizer: {
      id: "org2",
      name: "TechWest Africa",
      logo: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  },
  {
    id: "3",
    title: "Dakar International Film Festival",
    description: "Celebrate African cinema at this prestigious film festival showcasing the best films from across the continent and diaspora. Attend screenings, panel discussions, and workshops with renowned filmmakers.",
    date: "2025-09-10",
    time: "18:30",
    location: "Grand Théâtre National, Dakar",
    venue: "Grand Théâtre National",
    image_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 15000,
    currency: "XOF",
    capacity: 2500,
    tickets_sold: 1200,
    status: "upcoming",
    featured: true,
    categories: ["cinema", "arts"],
    coordinates: {
      latitude: 14.6937,
      longitude: -17.4441
    },
    organizer: {
      id: "org3",
      name: "Cinéma Africain",
      logo: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  },
  {
    id: "4",
    title: "Ghana vs. Nigeria Football Match",
    description: "Witness the epic rivalry between Ghana and Nigeria in this thrilling football match. Experience the electric atmosphere as these two football powerhouses compete for regional supremacy.",
    date: "2025-07-28",
    time: "19:00",
    location: "Accra Sports Stadium",
    venue: "Accra Sports Stadium",
    image_url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 100,
    currency: "GHS",
    capacity: 40000,
    tickets_sold: 35000,
    status: "upcoming",
    featured: true,
    categories: ["sports"],
    coordinates: {
      latitude: 5.5504,
      longitude: -0.2167
    },
    organizer: {
      id: "org4",
      name: "West African Football Association",
      logo: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    }
  },
  {
    id: "5",
    title: "Abidjan Food & Wine Festival",
    description: "Indulge in the finest culinary experiences West Africa has to offer. Sample exquisite dishes from top chefs, taste premium wines, and enjoy cooking demonstrations in a luxurious setting.",
    date: "2025-08-05",
    time: "12:00",
    location: "Sofitel Hotel Ivoire, Abidjan",
    venue: "Sofitel Hotel Ivoire",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 25000,
    currency: "XOF",
    capacity: 800,
    tickets_sold: 450,
    status: "upcoming",
    featured: false,
    categories: ["food", "festivals"],
    coordinates: {
      latitude: 5.3364,
      longitude: -4.0147
    },
    organizer: {
      id: "org5",
      name: "Gourmet Africa",
      logo: "https://images.unsplash.com/photo-1581873372796-635b67ca2008?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  },
  {
    id: "6",
    title: "Contemporary African Art Exhibition",
    description: "Explore the vibrant world of contemporary African art at this prestigious exhibition featuring works from emerging and established artists across the continent. Engage with artists and curators through guided tours and discussions.",
    date: "2025-09-18",
    time: "10:00",
    location: "Museum of Black Civilizations, Dakar",
    venue: "Museum of Black Civilizations",
    image_url: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    price: 5000,
    currency: "XOF",
    capacity: 500,
    tickets_sold: 320,
    status: "upcoming",
    featured: false,
    categories: ["arts"],
    coordinates: {
      latitude: 14.6762,
      longitude: -17.4380
    },
    organizer: {
      id: "org6",
      name: "African Arts Foundation",
      logo: "https://images.unsplash.com/photo-1459908676235-d5f02a50184b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  },
  {
    id: "7",
    title: "Entrepreneurship Masterclass",
    description: "Learn from successful entrepreneurs and business leaders in this intensive masterclass designed to help you launch and scale your business in the African market. Gain practical insights, tools, and connections.",
    date: "2025-07-30",
    time: "09:30",
    location: "Radisson Blu, Lagos",
    venue: "Radisson Blu",
    image_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
    price: 75000,
    currency: "NGN",
    capacity: 200,
    tickets_sold: 150,
    status: "upcoming",
    featured: false,
    categories: ["business", "education"],
    coordinates: {
      latitude: 6.4281,
      longitude: 3.4219
    },
    organizer: {
      id: "org7",
      name: "African Business Institute",
      logo: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
    }
  },
  {
    id: "8",
    title: "Accra Jazz Night",
    description: "Immerse yourself in the smooth sounds of jazz at this intimate evening featuring local and international jazz musicians. Enjoy fine dining and premium drinks in an elegant setting.",
    date: "2025-08-15",
    time: "20:00",
    location: "+233 Jazz Bar & Grill, Accra",
    venue: "+233 Jazz Bar & Grill",
    image_url: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 150,
    currency: "GHS",
    capacity: 300,
    tickets_sold: 220,
    status: "upcoming",
    featured: false,
    categories: ["music"],
    coordinates: {
      latitude: 5.5913,
      longitude: -0.1969
    },
    organizer: {
      id: "org8",
      name: "Accra Jazz Society",
      logo: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80"
    }
  }
];

export const getEventById = (id: string): Event | undefined => {
  return events.find(event => event.id === id);
};

export const getFeaturedEvents = (): Event[] => {
  return events.filter(event => event.featured);
};

export const getEventsByCategory = (category: string): Event[] => {
  return events.filter(event => event.categories?.includes(category as any));
};

export const searchEvents = (query: string): Event[] => {
  const lowercaseQuery = query.toLowerCase();
  return events.filter(
    event => 
      event.title.toLowerCase().includes(lowercaseQuery) || 
      event.description.toLowerCase().includes(lowercaseQuery) ||
      event.location.toLowerCase().includes(lowercaseQuery)
  );
};