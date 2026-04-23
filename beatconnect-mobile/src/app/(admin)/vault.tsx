import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DOCUMENTS = [
  { id: '1', name: 'Global Publishing Agreement', date: 'Oct 24, 2025', status: 'Signed', type: 'Legal', color: '#1DB954' },
  { id: '2', name: 'Berlin Arena Performance Contract', date: 'May 12, 2026', status: 'Action Required', type: 'Tour', color: '#ef4444' },
  { id: '3', name: 'Summer Festival Rider', date: 'June 05, 2026', status: 'Pending', type: 'Logistics', color: '#f59e0b' },
  { id: '4', name: 'Brand Partnership: Alpha Audio', date: 'Jan 15, 2026', status: 'Signed', type: 'Brand', color: '#1DB954' },
];

export default function VaultScreen() {
  const [filter, setFilter] = useState('All');

  const filteredDocs = filter === 'All' 
    ? DOCUMENTS 
    : DOCUMENTS.filter(doc => (filter === 'Pending' && doc.status === 'Pending') || (filter === 'Executed' && doc.status === 'Signed') || (filter === 'Action Required' && doc.status === 'Action Required'));

  return (
    <View className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" />
      
      {/* Security Glow */}
      <View className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px]" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row justify-between items-center mb-6">
             <View>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[4px] mb-2">Secure Repository</Text>
                <Text className="text-white text-3xl font-black tracking-tight">The Safe</Text>
             </View>
             <View className="flex-row items-center bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20">
                <Ionicons name="shield-checkmark" size={18} color="#3b82f6" />
                <Text className="text-blue-400 text-xs font-black ml-2 uppercase">Encrypted</Text>
             </View>
          </View>

          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
            {['All', 'Action Required', 'Pending', 'Executed'].map((item) => (
              <TouchableOpacity 
                key={item}
                onPress={() => setFilter(item)}
                className={`mr-3 px-6 py-3 rounded-2xl border ${filter === item ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}
              >
                <Text className={`text-xs font-bold ${filter === item ? 'text-black' : 'text-zinc-400'}`}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex-row items-center mb-8">
             <Ionicons name="search" size={20} color="#71717a" />
             <TextInput 
               placeholder="Search legal documents..." 
               placeholderTextColor="#71717a"
               className="flex-1 ml-3 text-white font-medium"
             />
          </View>

          {/* Document Cards */}
          <View className="space-y-6">
            {filteredDocs.map((doc) => (
              <TouchableOpacity 
                key={doc.id}
                className="bg-zinc-900/60 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl"
              >
                <View className="flex-row">
                   {/* Thumbnail Mock */}
                   <View className="w-24 bg-zinc-800 items-center justify-center border-r border-white/5">
                      <Ionicons name="document-text" size={32} color="#3f3f46" />
                      <View className="absolute bottom-4 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                         <Text className="text-zinc-500 text-[8px] font-black uppercase">Preview</Text>
                      </View>
                   </View>
                   
                   <View className="flex-1 p-6">
                      <View className="flex-row justify-between items-start mb-2">
                         <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{doc.type}</Text>
                         <View className={`px-2 py-1 rounded-lg ${doc.status === 'Action Required' ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10'}`}>
                            <Text 
                              style={{ color: doc.status === 'Action Required' ? '#ef4444' : doc.color }} 
                              className={`text-[8px] font-black uppercase ${doc.status === 'Action Required' ? 'animate-pulse' : ''}`}
                            >
                               {doc.status}
                            </Text>
                         </View>
                      </View>
                      <Text className="text-white text-lg font-bold leading-tight mb-4">{doc.name}</Text>
                      <View className="flex-row justify-between items-center">
                         <Text className="text-zinc-500 text-xs font-medium">{doc.date}</Text>
                         <TouchableOpacity className="flex-row items-center">
                            <Text className="text-blue-500 text-xs font-black uppercase">Sign Now</Text>
                            <Ionicons name="chevron-forward" size={12} color="#3b82f6" style={{ marginLeft: 4 }} />
                         </TouchableOpacity>
                      </View>
                   </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security Feature Info */}
        <View className="px-6 mt-4">
           <View className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-blue-500/10 items-center justify-center mr-4">
                 <Ionicons name="finger-print" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                 <Text className="text-white text-sm font-bold">Biometric Vault</Text>
                 <Text className="text-zinc-500 text-xs mt-1">This vault is locked with FaceID and utilizes 256-bit AES encryption for all legal files.</Text>
              </View>
           </View>
        </View>

      </ScrollView>
    </View>
  );
}
