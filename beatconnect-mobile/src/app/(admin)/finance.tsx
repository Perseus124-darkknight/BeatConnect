import React from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';

export default function FinanceScreen() {
  const stackData = [
    {
      stacks: [
        { value: 40, color: '#1DB954', marginBottom: 2 }, // Streaming (Green)
        { value: 20, color: '#a855f7', marginBottom: 2 }, // Merch (Purple)
        { value: 30, color: '#3b82f6', marginBottom: 2 }, // Shows (Blue)
      ],
      label: 'Jan',
    },
    {
      stacks: [
        { value: 50, color: '#1DB954', marginBottom: 2 },
        { value: 30, color: '#a855f7', marginBottom: 2 },
        { value: 40, color: '#3b82f6', marginBottom: 2 },
      ],
      label: 'Feb',
    },
    {
      stacks: [
        { value: 60, color: '#1DB954', marginBottom: 2 },
        { value: 25, color: '#a855f7', marginBottom: 2 },
        { value: 50, color: '#3b82f6', marginBottom: 2 },
      ],
      label: 'Mar',
    },
    {
      stacks: [
        { value: 70, color: '#1DB954', marginBottom: 2 },
        { value: 40, color: '#a855f7', marginBottom: 2 },
        { value: 65, color: '#3b82f6', marginBottom: 2 },
      ],
      label: 'Apr',
    },
  ];

  return (
    <View className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Glows */}
      <View className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[120px]" />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header - The Hero Stat */}
        <View className="px-6 pt-16 pb-10">
          <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[4px] mb-4">Financial Command</Text>
          <Text className="text-zinc-400 text-sm font-medium">Net Income YTD</Text>
          <View className="flex-row items-baseline mt-2">
            <Text className="text-white text-6xl font-black tracking-tighter">$248,320</Text>
            <Text className="text-[#1DB954] text-xl font-black ml-1">.15</Text>
          </View>
          <View className="flex-row items-center mt-4">
             <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="trending-up" size={14} color="#1DB954" />
                <Text className="text-[#1DB954] text-xs font-black ml-2">+24.8%</Text>
             </View>
             <Text className="text-zinc-500 text-xs font-medium ml-3">vs last year</Text>
          </View>
        </View>

        {/* The Split-View Bar Chart */}
        <View className="px-6 mb-8">
          <View className="bg-zinc-900/60 border border-white/5 rounded-[40px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                 <Text className="text-white font-bold text-lg">Revenue Streams</Text>
                 <Text className="text-zinc-500 text-xs mt-1">Multi-platform aggregation</Text>
              </View>
              <TouchableOpacity className="bg-white/5 p-2.5 rounded-2xl border border-white/10">
                <Ionicons name="filter" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <View className="ml-[-10px]">
              <BarChart
                stackData={stackData}
                barWidth={32}
                spacing={32}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: '#71717a', fontSize: 10 }}
                noOfSections={4}
                maxValue={200}
                xAxisLabelTextStyle={{ color: '#71717a', fontSize: 10, fontWeight: 'bold' }}
              />
            </View>

            {/* Legend */}
            <View className="flex-row justify-center mt-8 space-x-6">
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-[#1DB954] mr-2" />
                <Text className="text-zinc-400 text-[10px] font-bold uppercase">Streaming</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-[#a855f7] mr-2" />
                <Text className="text-zinc-400 text-[10px] font-bold uppercase">Merch</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] mr-2" />
                <Text className="text-zinc-400 text-[10px] font-bold uppercase">Shows</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payout & Tax Reserves */}
        <View className="px-6 mb-8">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-zinc-900/60 border border-white/5 rounded-[32px] p-5 mr-4 justify-between h-[180px]">
               <View className="w-12 h-12 rounded-2xl bg-[#1DB954]/10 items-center justify-center">
                  <Ionicons name="shield-checkmark" size={24} color="#1DB954" />
               </View>
               <View>
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Tax Reserve (30%)</Text>
                  <Text className="text-white font-black text-xl mt-1">$74,496</Text>
                  <View className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                     <View className="w-[30%] h-full bg-[#1DB954] rounded-full" />
                  </View>
               </View>
            </View>

            <View className="flex-1 bg-zinc-900/60 border border-white/5 rounded-[32px] p-5 justify-between h-[180px]">
               <View className="w-12 h-12 rounded-2xl bg-blue-500/10 items-center justify-center">
                  <Ionicons name="wallet" size={24} color="#3b82f6" />
               </View>
               <View>
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Pending Payouts</Text>
                  <Text className="text-white font-black text-xl mt-1">$12,450</Text>
                  <TouchableOpacity className="mt-3">
                     <Text className="text-blue-400 text-[10px] font-black uppercase">Withdraw Now</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </View>
        </View>

        {/* Invoice & Expense Scanner */}
        <View className="px-6">
          <TouchableOpacity className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-8 items-center shadow-2xl">
            <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4 border border-white/10">
               <Ionicons name="scan" size={32} color="white" />
            </View>
            <Text className="text-white font-black text-xl">Snap & Log Expense</Text>
            <Text className="text-zinc-500 text-sm text-center mt-2 px-4">
              Categorize receipts instantly for tax deductions and tour accounting.
            </Text>
            <View className="flex-row mt-6 space-x-3">
               <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase">Touring</Text>
               </View>
               <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase">Gear</Text>
               </View>
               <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase">Marketing</Text>
               </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
