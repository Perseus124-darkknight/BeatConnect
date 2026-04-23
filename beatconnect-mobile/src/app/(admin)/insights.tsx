import React from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';

export default function InsightsScreen() {
  const ageData = [
    { value: 15, label: '13-17', frontColor: '#1DB954' },
    { value: 45, label: '18-24', frontColor: '#1DB954' },
    { value: 25, label: '25-34', frontColor: '#1DB954' },
    { value: 10, label: '35-44', frontColor: '#1DB954' },
    { value: 5, label: '45+', frontColor: '#1DB954' },
  ];

  const topCities = [
    { city: 'London', country: 'UK', listeners: '124.5k' },
    { city: 'New York', country: 'USA', listeners: '98.2k' },
    { city: 'Berlin', country: 'Germany', listeners: '85.7k' },
    { city: 'Paris', country: 'France', listeners: '72.1k' },
    { city: 'Tokyo', country: 'Japan', listeners: '64.9k' },
  ];

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Glows */}
      <View className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-[#1DB954]/10 rounded-full blur-[80px]" />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <Text className="text-white text-3xl font-black tracking-tight">Audience Insights</Text>
          <Text className="text-zinc-400 text-sm mt-1">Real-time data from the last 28 days</Text>
        </View>

        {/* Global Reach Map Card */}
        <View className="px-6 mb-6">
          <View className="bg-[#1e1e1e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <View className="p-5">
              <Text className="text-white font-bold text-lg">Global Reach</Text>
              <Text className="text-zinc-400 text-xs mt-1">Listeners by geographic location</Text>
            </View>
            
            {/* Mock World Map visualization placeholder */}
            <View className="h-[180px] w-full bg-zinc-900/50 items-center justify-center">
               {/* Simplified SVG or Icon representation for "Heatmap" */}
               <View className="items-center">
                  <Ionicons name="map-outline" size={60} color="#1DB954" style={{ opacity: 0.3 }} />
                  <Text className="text-[#1DB954] text-[10px] font-bold uppercase tracking-widest mt-2">Heat-map Visualization</Text>
               </View>
               
               {/* Decorative Heatmap "dots" */}
               <View className="absolute top-10 left-20 w-3 h-3 bg-[#1DB954] rounded-full blur-[4px] opacity-60" />
               <View className="absolute top-24 left-40 w-4 h-4 bg-[#1DB954] rounded-full blur-[6px] opacity-40" />
               <View className="absolute top-16 right-24 w-2 h-2 bg-[#1DB954] rounded-full blur-[3px] opacity-80" />
            </View>
            
            <View className="p-5 border-t border-white/5 bg-white/5">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Top Region</Text>
                  <Text className="text-white font-bold text-base mt-1">Western Europe</Text>
                </View>
                <View className="items-end">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Growth</Text>
                  <Text className="text-[#1DB954] font-bold text-base mt-1">+12.4%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Age Demographics Card */}
        <View className="px-6 mb-6">
          <View className="bg-[#1e1e1e] border border-white/5 rounded-3xl p-5 shadow-2xl">
            <Text className="text-white font-bold text-lg mb-6">Age Demographics</Text>
            
            <View className="h-[220px] w-full ml-[-20px]">
              <BarChart
                data={ageData}
                barWidth={35}
                noOfSections={4}
                barBorderRadius={8}
                frontColor="#1DB954"
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                yAxisTextStyle={{ color: '#71717a', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#71717a', fontSize: 10 }}
                maxValue={50}
                isAnimated
                animationDuration={1000}
              />
            </View>
          </View>
        </View>

        {/* Top Cities List */}
        <View className="px-6">
          <View className="bg-[#1e1e1e] border border-white/5 rounded-3xl p-5 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-lg">Top Cities</Text>
              <TouchableOpacity>
                <Text className="text-[#1DB954] text-xs font-bold">View All</Text>
              </TouchableOpacity>
            </View>
            
            {topCities.map((item, index) => (
              <View key={index} className={`flex-row items-center justify-between py-4 ${index !== topCities.length - 1 ? 'border-b border-white/5' : ''}`}>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-zinc-800/50 items-center justify-center mr-4">
                    <Text className="text-zinc-500 text-xs font-bold">{index + 1}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-semibold">{item.city}</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">{item.country}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white text-sm font-bold">{item.listeners}</Text>
                  <Text className="text-zinc-500 text-[10px] uppercase tracking-tighter mt-0.5">listeners</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
