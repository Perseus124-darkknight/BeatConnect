import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
          borderTopWidth: 1,
          height: 80, // adjusted for iOS
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3b82f6', // blue-500
        tabBarInactiveTintColor: '#71717a', // zinc-500
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="calendar" 
        options={{ 
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="finance" 
        options={{ 
          title: 'Finance',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="vault" 
        options={{ 
          title: 'The Safe',
          tabBarIcon: ({ color, size }) => <Ionicons name="lock-closed" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="artists" 
        options={{ 
          title: 'Database',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="insights" 
        options={{ 
          href: null,
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{ 
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }} 
      />
      {/* Hide original stack screens from tabs */}
      <Tabs.Screen 
        name="add" 
        options={{ 
          href: null,
          headerShown: true,
          title: 'Add New Artist',
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#fff',
        }} 
      />
      <Tabs.Screen 
        name="edit" 
        options={{ 
          href: null,
          headerShown: true,
          title: 'Edit Artist',
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#fff',
        }} 
      />
    </Tabs>
  );
}
