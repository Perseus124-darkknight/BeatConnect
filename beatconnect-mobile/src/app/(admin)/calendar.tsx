import React from 'react';
import { View, Text, StatusBar, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TOUR_DATES = [
  {
    id: '1',
    date: 'MAY 12',
    venue: 'O2 Academy Brixton',
    city: 'London, UK',
    soundcheck: '16:00',
    sales: 0.92,
    status: 'High Demand',
    color: '#a855f7', // purple
  },
  {
    id: '2',
    date: 'MAY 14',
    venue: 'Zenith',
    city: 'Paris, France',
    soundcheck: '15:30',
    sales: 0.78,
    status: 'Selling Fast',
    color: '#3b82f6', // blue
  },
  {
    id: '3',
    date: 'MAY 15',
    venue: 'Huxleys Neue Welt',
    city: 'Berlin, Germany',
    soundcheck: '16:30',
    sales: 0.85,
    status: 'High Demand',
    color: '#a855f7',
  },
  {
    id: '4',
    date: 'MAY 18',
    venue: 'Fabrique',
    city: 'Milan, Italy',
    soundcheck: '17:00',
    sales: 0.64,
    status: 'Limited',
    color: '#3b82f6',
  },
  {
    id: '5',
    date: 'MAY 20',
    venue: 'Razzmatazz',
    city: 'Barcelona, Spain',
    soundcheck: '16:00',
    sales: 0.98,
    status: 'Sold Out Soon',
    color: '#a855f7',
  },
];

export default function CalendarScreen() {
  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Glows */}
      <View className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[80px]" />
      <View className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px]" />

      <View className="px-6 pt-16 pb-6 flex-row justify-between items-end">
        <View>
          <Text className="text-zinc-500 text-xs font-bold uppercase tracking-[3px] mb-1">World Tour 2026</Text>
          <Text className="text-white text-3xl font-black tracking-tight">Tour Center</Text>
        </View>
        <TouchableOpacity className="bg-white/5 border border-white/10 p-3 rounded-2xl flex-row items-center">
          <Ionicons name="map-outline" size={18} color="white" />
          <Text className="text-white text-xs font-bold ml-2">Map View</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={TOUR_DATES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="flex-row mb-6">
            {/* Date Column */}
            <View className="w-16 pt-2 items-center">
              <Text className="text-zinc-500 text-[10px] font-black tracking-wider">{item.date.split(' ')[0]}</Text>
              <Text className="text-white text-xl font-black">{item.date.split(' ')[1]}</Text>
              <View className="w-[1px] flex-1 bg-zinc-800 my-4" />
            </View>

            {/* Content Card */}
            <View className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[28px] p-5 shadow-2xl overflow-hidden">
               {/* Glassmorphism Shine Overlay */}
               <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/10" />
               
               <View className="flex-row justify-between items-start mb-4">
                 <View className="flex-1 mr-2">
                   <Text className="text-white font-bold text-lg leading-6" numberOfLines={1}>{item.venue}</Text>
                   <Text className="text-zinc-400 text-xs mt-1">{item.city}</Text>
                 </View>
                 <View className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex-row items-center">
                   <Ionicons name="time-outline" size={12} color="#71717a" />
                   <Text className="text-zinc-300 text-[10px] font-bold ml-1.5">{item.soundcheck}</Text>
                 </View>
               </View>

               {/* Sales Progress */}
               <View>
                 <View className="flex-row justify-between items-center mb-2">
                   <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Ticket Sales</Text>
                   <Text className="text-white text-[10px] font-bold">{Math.round(item.sales * 100)}%</Text>
                 </View>
                 <View className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                   <View 
                    style={{ width: `${item.sales * 100}%`, backgroundColor: item.color }} 
                    className="h-full rounded-full" 
                   />
                 </View>
                 <View className="flex-row items-center mt-3">
                   <View style={{ backgroundColor: item.color }} className="w-1.5 h-1.5 rounded-full mr-2" />
                   <Text style={{ color: item.color }} className="text-[10px] font-bold uppercase tracking-widest">{item.status}</Text>
                 </View>
               </View>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-10 right-8 bg-purple-600 w-16 h-16 rounded-[22px] items-center justify-center shadow-2xl shadow-purple-500/50 z-50"
        style={{ transform: [{ rotate: '0deg' }] }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
