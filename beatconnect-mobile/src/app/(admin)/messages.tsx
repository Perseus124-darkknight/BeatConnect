import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/useAuthStore';

export default function MessagesScreen() {
  const { userMood, setMood } = useAuthStore();

  const moods = [
    { label: 'Creative', icon: 'color-palette', color: '#1DB954' },
    { label: 'Focused', icon: 'headset', color: '#3b82f6' },
    { label: 'Burnout', icon: 'flame', color: '#ef4444' },
    { label: 'Resting', icon: 'bed', color: '#a855f7' },
  ];

  const channels = [
    { id: '1', name: 'Project: New Album', unread: true, urgent: false, lastMsg: 'Management: Remix stems uploaded.' },
    { id: '2', name: 'Tour Logistics', unread: false, urgent: true, lastMsg: 'Berlin venue update needed.' },
    { id: '3', name: 'PR & Media', unread: false, urgent: false, lastMsg: 'Vogue interview confirmed.' },
  ];

  const dms = [
    { id: '4', name: 'Marcus (Manager)', unread: true, lastMsg: 'Check the new contract draft.', active: true },
    { id: '5', name: 'Sarah (Legal)', unread: false, lastMsg: 'Copyright papers filed.', active: false },
  ];

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      
      {/* Search Header */}
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-black tracking-tight">The Huddle</Text>
          <TouchableOpacity className="bg-white/5 p-2.5 rounded-full border border-white/10">
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center bg-zinc-900/80 border border-white/5 rounded-2xl px-4 h-12">
          <Ionicons name="search" size={18} color="#71717a" />
          <TextInput 
            placeholder="Search messages, files, links..."
            placeholderTextColor="#52525b"
            className="flex-1 ml-3 text-white text-sm"
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Creator Check-In */}
        <View className="px-6 mb-8">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mb-4">Creator Check-In</Text>
          <View className="flex-row justify-between">
            {moods.map((mood) => (
              <TouchableOpacity 
                key={mood.label}
                onPress={() => setMood(mood.label)}
                className={`items-center justify-center p-4 rounded-3xl border ${userMood === mood.label ? 'bg-white/5 border-white/20 shadow-2xl' : 'bg-transparent border-transparent'}`}
                style={{ width: '23%' }}
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: userMood === mood.label ? mood.color : 'rgba(255,255,255,0.05)' }}>
                  <Ionicons name={mood.icon as any} size={20} color={userMood === mood.label ? 'white' : '#71717a'} />
                </View>
                <Text className={`text-[10px] font-bold ${userMood === mood.label ? 'text-white' : 'text-zinc-500'}`}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Channels Section */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px]">Channels</Text>
            <Ionicons name="add" size={18} color="#71717a" />
          </View>
          
          <View>
            {channels.map((channel) => (
              <TouchableOpacity key={channel.id} className="flex-row items-center bg-white/5 border border-white/5 rounded-2xl p-4 mb-2">
                <View className="w-10 h-10 rounded-2xl bg-zinc-800 items-center justify-center mr-4">
                  <Text className="text-zinc-400 font-bold">#</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${channel.unread || channel.urgent ? 'text-white' : 'text-zinc-400'}`}>{channel.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-1" numberOfLines={1}>{channel.lastMsg}</Text>
                </View>
                {channel.unread && (
                  <View className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                )}
                {channel.urgent && (
                   <View className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Direct Messages Section */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px]">Direct Messages</Text>
            <Ionicons name="chevron-down" size={14} color="#71717a" />
          </View>
          
          <View>
            {dms.map((dm) => (
              <TouchableOpacity key={dm.id} className="flex-row items-center py-3">
                <View className="relative">
                  <Image source={{ uri: `https://i.pravatar.cc/100?u=${dm.id}` }} className="w-12 h-12 rounded-2xl" />
                  <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#121212] ${dm.active ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className={`text-sm font-bold ${dm.unread ? 'text-white' : 'text-zinc-400'}`}>{dm.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-1" numberOfLines={1}>{dm.lastMsg}</Text>
                </View>
                {dm.unread && (
                  <View className="bg-blue-600 px-2 py-1 rounded-lg">
                    <Text className="text-white text-[10px] font-black">NEW</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
