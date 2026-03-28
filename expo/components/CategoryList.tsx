import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Music, Film, Trophy, PartyPopper, Palette, Utensils, Briefcase, GraduationCap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { categories } from '@/mocks/categories';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryListProps {
  horizontal?: boolean;
}

export default function CategoryList({ horizontal = true }: CategoryListProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const getIcon = (iconName: string, color: string) => {
    const iconProps = { size: 20, color: color };
    
    switch (iconName) {
      case 'music':
        return <Music {...iconProps} />;
      case 'film':
        return <Film {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      case 'party-popper':
        return <PartyPopper {...iconProps} />;
      case 'palette':
        return <Palette {...iconProps} />;
      case 'utensils':
        return <Utensils {...iconProps} />;
      case 'briefcase':
        return <Briefcase {...iconProps} />;
      case 'graduation-cap':
        return <GraduationCap {...iconProps} />;
      default:
        return <Music {...iconProps} />;
    }
  };

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
      default: return id;
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={horizontal ? styles.scrollContainer : styles.gridContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            { backgroundColor: `${category.color}10` }
          ]}
          onPress={() => handleCategoryPress(category.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
            {getIcon(category.icon, Colors.common.white)}
          </View>
          <Text style={styles.categoryName}>{getCategoryName(category.id)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
});