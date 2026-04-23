import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StatusBar, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ActivityRing = ({ progress, color, size = 60, strokeWidth = 8, label }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="items-center mr-6">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`${color}33`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>
      <Text className="text-zinc-500 text-[10px] font-bold uppercase mt-2">{label}</Text>
    </View>
  );
};

const TIMELINE_DATA = [
  { id: '1', time: '14:30', event: 'Flight to Berlin', icon: 'airplane', color: '#3b82f6' },
  { id: '2', time: '18:00', event: 'Radio Interview', icon: 'mic', color: '#a855f7' },
  { id: '3', time: 'MAY 24', event: 'New Single Release', icon: 'disc', color: '#1DB954' },
];

export default function DashboardScreen() {
  const { logout, userName, userImage, userMood } = useAuthStore();
  const router = useRouter();
  const [listeners, setListeners] = useState(12432);
  const [hasUrgentContract, setHasUrgentContract] = useState(true);

  const getMoodColor = () => {
    switch (userMood) {
      case 'Creative': return 'rgba(29, 185, 84, 0.2)'; // Green
      case 'Focused': return 'rgba(59, 130, 246, 0.2)'; // Blue
      case 'Burnout': return 'rgba(239, 68, 68, 0.2)'; // Red
      case 'Resting': return 'rgba(168, 85, 247, 0.2)'; // Purple
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setListeners(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Glows */}
      <View 
        style={{ backgroundColor: getMoodColor() }}
        className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full blur-[80px]" 
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Section */}
        <View className="px-6 pt-16 pb-8 flex-row justify-between items-center">
          <View>
            <View className="flex-row items-center mb-1">
               <Text className="text-zinc-500 text-sm font-medium">Good morning,</Text>
               <View className="ml-2 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                  <Text className="text-blue-400 text-[10px] font-black uppercase">PRO</Text>
               </View>
            </View>
            <Text className="text-white text-3xl font-black tracking-tight">{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(admin)/profile')}>
            <Image 
              source={{ uri: userImage }} 
              className="w-14 h-14 rounded-2xl border border-white/10"
            />
          </TouchableOpacity>
        </View>

        {/* Smart Prioritization Engine: Urgent Alert */}
        {hasUrgentContract && (
          <TouchableOpacity 
            onPress={() => router.push('/(admin)/vault')}
            className="mx-6 mb-6 bg-red-500/10 border border-red-500/20 rounded-[32px] p-6 flex-row items-center shadow-2xl"
          >
             <View className="w-12 h-12 rounded-2xl bg-red-500/20 items-center justify-center mr-4">
                <Ionicons name="alert-circle" size={28} color="#ef4444" className="animate-pulse" />
             </View>
             <View className="flex-1">
                <Text className="text-red-500 text-[10px] font-black uppercase tracking-[2px] mb-1">Priority 1: Action Required</Text>
                <Text className="text-white text-base font-bold">Berlin Arena Contract expires in 24h</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}

        {/* Listeners Right Now Ticker */}
        <View className="mx-6 mb-8 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
           <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-3 shadow-lg shadow-red-500/50" />
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Listeners Right Now</Text>
           </View>
           <Text className="text-white text-xl font-black tabular-nums">{listeners.toLocaleString()}</Text>
        </View>

        {/* Activity Rings (KPIs) */}
        <View className="px-6 mb-10">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mb-6">Live Performance Rings</Text>
          <View className="flex-row">
            <ActivityRing progress={75} color="#3b82f6" label="Growth" />
            <ActivityRing progress={45} color="#1DB954" label="Tour" />
            <ActivityRing progress={92} color="#f59e0b" label="Revenue" />
          </View>
        </View>

        {/* Next Up Timeline */}
        <View className="mb-10">
          <Text className="px-6 text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mb-4">Next Up</Text>
          <FlatList
            horizontal
            data={TIMELINE_DATA}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={({ item }) => (
              <View className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-5 mr-4 w-[240px] shadow-2xl">
                <View className="flex-row items-center mb-4">
                   <View style={{ backgroundColor: `${item.color}22` }} className="p-2 rounded-xl">
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                   </View>
                   <Text className="text-zinc-500 text-xs font-bold ml-3">{item.time}</Text>
                </View>
                <Text className="text-white text-lg font-bold leading-tight">{item.event}</Text>
                <TouchableOpacity className="mt-4 flex-row items-center">
                   <Text style={{ color: item.color }} className="text-xs font-bold">View Details</Text>
                   <Ionicons name="chevron-forward" size={12} color={item.color} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* Quick Action Bento Grid */}
        <View className="px-6">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mb-6">Quick Action Command</Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Tile 1 */}
            <TouchableOpacity 
              onPress={() => router.push('/(admin)/artists')}
              className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 w-[47%] mb-5 h-[160px] justify-between"
            >
               <View className="w-12 h-12 rounded-2xl bg-blue-500/10 items-center justify-center">
                  <Ionicons name="people" size={24} color="#3b82f6" />
               </View>
               <Text className="text-white font-bold text-base leading-tight">Manage Artists</Text>
            </TouchableOpacity>

            {/* Tile 2 */}
            <TouchableOpacity className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 w-[47%] mb-5 h-[160px] justify-between">
               <View className="w-12 h-12 rounded-2xl bg-teal-500/10 items-center justify-center">
                  <Ionicons name="scan" size={24} color="#2dd4bf" />
               </View>
               <Text className="text-white font-bold text-base leading-tight">Scan Receipt</Text>
            </TouchableOpacity>

            {/* Tile 3 */}
            <TouchableOpacity className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 w-[47%] h-[160px] justify-between">
               <View className="w-12 h-12 rounded-2xl bg-purple-500/10 items-center justify-center">
                  <Ionicons name="people" size={24} color="#a855f7" />
               </View>
               <Text className="text-white font-bold text-base leading-tight">New Guest List</Text>
            </TouchableOpacity>

            {/* Tile 4 */}
            <TouchableOpacity className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 w-[47%] h-[160px] justify-between">
               <View className="w-12 h-12 rounded-2xl bg-orange-500/10 items-center justify-center">
                  <Ionicons name="pencil" size={24} color="#f97316" />
               </View>
               <Text className="text-white font-bold text-base leading-tight">e-Sign Contract</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
