import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Camera, MapPin, User, Mail, Phone, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  const { t } = useTranslation();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  const [isLoading, setIsLoading] = useState(false);
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à votre galerie.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  const uploadAvatar = async (uri: string): Promise<string | null> => {
    try {
      if (!uri || !uri.startsWith('file://')) {
        // If it's already a URL (not a local file) or empty, return as is
        return uri;
      }
      
      // Get the file extension
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      // Fetch the image data
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert to base64 for upload
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1]; // Remove data URL prefix
            
            if (!base64Content) {
              throw new Error("Failed to convert image to base64");
            }
            
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
              .from('avatars')
              .upload(fileName, decode(base64Content), {
                contentType: `image/${fileExt}`,
                upsert: true
              });
            
            if (error) throw error;
            
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            
            resolve(publicUrl);
          } catch (error) {
            console.error('Error uploading avatar:', error);
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return null;
    }
  };
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }
      
      // Upload avatar if it's a local file
      let avatarUrl = avatar;
      if (avatar && avatar !== user.avatar) {
        const uploadedUrl = await uploadAvatar(avatar);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name,
          phone: phone,
          location: location,
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update user in auth store
      updateUserProfile({
        name,
        phone,
        location,
        bio,
        avatar: avatarUrl,
      });
      
      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès');
      router.back();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Modifier le profil",
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80' }}
            style={styles.avatar}
            contentFit="cover"
          />
          <TouchableOpacity 
            style={styles.cameraButton} 
            onPress={pickImage}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Camera size={20} color={Colors.common.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Nom complet"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={Colors.light.subtext} />}
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.light.subtext} />}
            editable={false}
          />
          
          <Input
            label="Téléphone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={Colors.light.subtext} />}
          />
          
          <Input
            label="Localisation"
            value={location}
            onChangeText={setLocation}
            leftIcon={<MapPin size={20} color={Colors.light.subtext} />}
          />
          
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            leftIcon={<FileText size={20} color={Colors.light.subtext} />}
            style={styles.bioInput}
            textAlignVertical="top"
          />
          
          <Button
            title="Enregistrer les modifications"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: Platform.OS === 'ios' ? 130 : 120,
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.common.white,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  bioInput: {
    height: 120,
  },
  saveButton: {
    marginTop: 16,
  },
});