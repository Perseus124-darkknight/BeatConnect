import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleAuth = async () => {
    clearError();
    if (isLoginMode) {
      await login(username, password);
    } else {
      const success = await register(username, password);
      // Immediately log them in if registration is successful
      if (success) {
        await login(username, password);
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    clearError();
  };

  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 px-6">
      <StatusBar style="light" />
      
      {/* Ambient Gradient Background Effect Simulation */}
      <View className="absolute w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl opacity-50 top-[-100px] left-[-100px]" />
      <View className="absolute w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-3xl opacity-50 bottom-[-50px] right-[-100px]" />

      <View className="w-full flex items-center mb-12">
        <Text className="text-4xl font-extrabold text-white tracking-widest uppercase">
          Beat<Text className="text-blue-500">Connect</Text>
        </Text>
        <Text className="text-zinc-400 mt-2 text-sm tracking-wide">
          {isLoginMode ? 'Welcome back to the rhythm' : 'Join the musical revolution'}
        </Text>
      </View>

      {/* Glassmorphic Login Container */}
      <View className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 shadow-black shadow-2xl">
        
        {error && (
          <View className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4">
            <Text className="text-red-300 text-sm text-center">{error}</Text>
          </View>
        )}

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#71717a"
          className="w-full bg-black/40 text-white rounded-xl px-4 py-4 mb-4 border border-white/5"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        
        <TextInput
          placeholder="Password"
          placeholderTextColor="#71717a"
          className="w-full bg-black/40 text-white rounded-xl px-4 py-4 mb-6 border border-white/5"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          onPress={handleAuth}
          disabled={isLoading || !username || !password}
          className={`w-full ${isLoading ? 'bg-blue-800' : 'bg-blue-600'} rounded-xl py-4 flex-row justify-center items-center mb-4`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">
              {isLoginMode ? 'ENTER CONNECT' : 'CREATE ACCOUNT'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMode}>
          <Text className="text-center text-zinc-400 text-sm mt-2">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <Text className="text-blue-400 font-bold">
              {isLoginMode ? 'Sign up' : 'Log in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
