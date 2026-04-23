import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StatusBar, TextInput, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchArtists, removeArtist, subscribeToArtists, Artist } from '../../services/db';

export default function ArtistsListScreen() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Use subscription for real-time updates
    const unsubscribe = subscribeToArtists((data) => {
      setArtists(data);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchArtists();
      setArtists(data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Artist',
      `Are you sure you want to remove ${name} from the database?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeArtist(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete artist');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const filteredArtists = artists.filter(artist => 
    (artist.artist_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity 
      onPress={() => router.push({ pathname: '/(admin)/edit', params: { id: item.artist_id } })}
      className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-4 mb-4 flex-row items-center shadow-2xl"
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        className="w-16 h-16 rounded-2xl border border-white/10 bg-zinc-800" 
      />
      <View className="flex-1 ml-4">
        <Text className="text-white text-lg font-bold" numberOfLines={1}>{item.artist_name}</Text>
        <Text className="text-zinc-500 text-xs mt-1" numberOfLines={1}>
          {item.genres?.length > 0 ? item.genres.join(', ') : 'No genres listed'}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleDelete(item.artist_id!, item.artist_name)}
        className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center border border-red-500/20"
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Glow */}
      <View className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[100px]" />

      <View className="px-6 pt-16 flex-1">
        <View className="flex-row justify-between items-center mb-6">
           <View>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[4px] mb-2">Artist Catalog</Text>
              <Text className="text-white text-3xl font-black tracking-tight">Management</Text>
           </View>
           <TouchableOpacity 
             onPress={() => router.push('/(admin)/add')}
             className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-600/50"
           >
              <Ionicons name="add" size={28} color="white" />
           </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex-row items-center mb-6">
           <Ionicons name="search" size={20} color="#71717a" />
           <TextInput 
             placeholder="Search artist database..." 
             placeholderTextColor="#71717a"
             className="flex-1 ml-3 text-white font-medium"
             value={search}
             onChangeText={setSearch}
           />
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-zinc-500 mt-4 font-medium">Syncing database...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredArtists}
            keyExtractor={(item) => item.artist_id!}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#3b82f6"
              />
            }
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Ionicons name="people-outline" size={48} color="#27272a" />
                <Text className="text-zinc-500 mt-4 font-medium">
                  {search ? 'No artists match your search' : 'No artists in database'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

