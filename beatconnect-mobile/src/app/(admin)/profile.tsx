import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Image, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { userName, userBio, userImage, updateProfile } = useAuthStore();
  const router = useRouter();
  
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState(userBio);
  const [profileImage, setProfileImage] = useState(userImage);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    updateProfile({ name, bio, image: profileImage });
    
    // Simulate a brief delay for UX
    setTimeout(() => {
      setIsSaving(false);
      // Optional: navigate back to dashboard or show success
    }, 800);
  };

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Glow */}
      <View className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px]" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6 flex-row justify-between items-center">
          <Text className="text-white text-3xl font-black tracking-tight">Artist Profile</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-full ${isSaving ? 'bg-zinc-800' : 'bg-blue-600'}`}
          >
            <Text className="text-white font-bold text-sm">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="px-6 mb-8">
          <View className="bg-zinc-900/60 border border-white/5 rounded-[40px] p-8 items-center shadow-2xl">
            <TouchableOpacity onPress={pickImage} className="relative mb-4">
              <Image source={{ uri: profileImage }} className="w-32 h-32 rounded-full border-4 border-zinc-800" />
              <View className="absolute bottom-1 right-1 bg-blue-500 w-8 h-8 rounded-full items-center justify-center border-4 border-[#121212]">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            
            <View className="items-center">
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-black">{name}</Text>
                <View className="ml-2 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-[2px] mt-1">Verified Artist</Text>
            </View>
          </View>
        </View>

        {/* Edit Fields */}
        <View className="px-6 mb-8">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mb-4 ml-2">Public Identity</Text>
          <View className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
            <View>
              <Text className="text-zinc-400 text-xs font-bold mb-2 ml-1">Artist Name</Text>
              <TextInput 
                value={name}
                onChangeText={setName}
                className="bg-black/40 text-white rounded-2xl px-4 py-4 border border-white/5"
                placeholderTextColor="#52525b"
              />
            </View>
            <View className="mt-4">
              <Text className="text-zinc-400 text-xs font-bold mb-2 ml-1">Artist Bio</Text>
              <TextInput 
                value={bio}
                onChangeText={setBio}
                multiline
                className="bg-black/40 text-white rounded-2xl px-4 py-4 border border-white/5 h-24"
                placeholderTextColor="#52525b"
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View className="px-6 mb-8">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mb-4 ml-2">Preferences</Text>
          <View className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-2">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-white/5 items-center justify-center mr-4">
                  <Ionicons name="notifications" size={18} color="#71717a" />
                </View>
                <Text className="text-white text-sm font-bold">Push Notifications</Text>
              </View>
              <Switch 
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: '#27272a', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row items-center justify-between p-4 border-t border-white/5">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-white/5 items-center justify-center mr-4">
                  <Ionicons name="globe" size={18} color="#71717a" />
                </View>
                <Text className="text-white text-sm font-bold">Public Discoverability</Text>
              </View>
              <Switch 
                value={isPublicProfile}
                onValueChange={setIsPublicProfile}
                trackColor={{ false: '#27272a', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-6">
          <TouchableOpacity 
            onPress={() => useAuthStore.getState().logout()}
            className="bg-red-500/10 border border-red-500/20 rounded-[28px] p-6 flex-row items-center justify-center"
          >
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-3">Log Out of All Devices</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
