import { EventCategory } from "@/types";

export type CategoryInfo = {
  id: EventCategory;
  name: string;
  icon: string;
  color: string;
};

export const categories: CategoryInfo[] = [
  {
    id: "music",
    name: "Music",
    icon: "music",
    color: "#4f46e5"
  },
  {
    id: "cinema",
    name: "Cinema",
    icon: "film",
    color: "#ef4444"
  },
  {
    id: "sports",
    name: "Sports",
    icon: "trophy",
    color: "#10b981"
  },
  {
    id: "festivals",
    name: "Festivals",
    icon: "party-popper",
    color: "#f97316"
  },
  {
    id: "arts",
    name: "Arts",
    icon: "palette",
    color: "#8b5cf6"
  },
  {
    id: "food",
    name: "Food",
    icon: "utensils",
    color: "#f59e0b"
  },
  {
    id: "business",
    name: "Business",
    icon: "briefcase",
    color: "#0ea5e9"
  },
  {
    id: "education",
    name: "Education",
    icon: "graduation-cap",
    color: "#14b8a6"
  }
];

export const getCategoryById = (id: EventCategory): CategoryInfo | undefined => {
  return categories.find(category => category.id === id);
};