import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { fetchArtistById, editArtist, Artist } from '../../services/db';
import { uploadToImgBB } from '../../services/imgbb';
import { Ionicons } from '@expo/vector-icons';

export default function EditArtistScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [name, setName] = useState('');
  const [genres, setGenres] = useState('');
  const [songs, setSongs] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const loadArtist = async () => {
      try {
        const artist = await fetchArtistById(id as string);
        
        if (artist) {
          setName(artist.artist_name);
          setGenres(artist.genres.join(', '));
          setSongs(artist.songs.join(', '));
          setImage(artist.image);
        } else {
          Alert.alert('Error', 'Artist not found');
          router.back();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadArtist();
  }, [id]);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setIsUploadingImage(true);
      try {
        const url = await uploadToImgBB(result.assets[0].base64);
        if (url) {
          setImage(url);
        }
      } catch (e: any) {
        Alert.alert('Upload Failed', e.message);
      }
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !genres || !songs || !image) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await editArtist(id as string, {
        artist_name: name,
        genres: genres.split(',').map(s => s.trim()).filter(Boolean),
        songs: songs.split(',').map(s => s.trim()).filter(Boolean),
        image: image.trim()
      });
      setIsSubmitting(false);
      router.back();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to update artist.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-950 justify-center items-center">
        <ActivityIndicator color="#3b82f6" size="large"/>
        <Text className="text-blue-400 mt-4 font-semibold tracking-wider">Loading Record...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-zinc-950"
    >
      <StatusBar barStyle="light-content" />
      
      {/* Premium Ambient Glows - Blue theme for Edit */}
      <View className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
      
      {/* Header */}
      <View className="px-6 pt-16 pb-4 flex-row items-center z-10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Database Entry</Text>
          <Text className="text-white text-2xl font-black tracking-tight">Edit Artist</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 shadow-black/50 shadow-2xl mt-4">
          
          <View className="mb-6">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Artist Identifier</Text>
            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14 focus:border-blue-500/50">
              <Ionicons name="person-outline" size={20} color="#71717a" />
              <TextInput
                className="flex-1 text-white ml-3 h-full font-medium"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Genres (Comma Separated)</Text>
            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14 focus:border-blue-500/50">
              <Ionicons name="musical-notes-outline" size={20} color="#71717a" />
              <TextInput
                className="flex-1 text-white ml-3 h-full font-medium"
                value={genres}
                onChangeText={setGenres}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Top Songs (Comma Separated)</Text>
            <View className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-blue-500/50">
              <TextInput
                className="text-white font-medium"
                value={songs}
                onChangeText={setSongs}
                multiline
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Cover Artwork</Text>
            
            <View className="bg-black/40 border border-dashed border-white/20 rounded-3xl p-4 items-center justify-center">
              {image ? (
                <View className="relative w-full items-center">
                  <Image source={{ uri: image }} className="w-40 h-40 rounded-2xl bg-zinc-800 shadow-xl shadow-black" />
                  <TouchableOpacity 
                    onPress={() => setImage('')}
                    className="absolute top-2 right-12 w-8 h-8 bg-black/60 rounded-full items-center justify-center border border-white/10"
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="py-6 items-center">
                  <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-3">
                    <Ionicons name="image-outline" size={32} color="#71717a" />
                  </View>
                  <Text className="text-zinc-500 text-sm font-medium mb-4 text-center">Upload artwork or paste a URL below</Text>
                  
                  <TouchableOpacity 
                    onPress={handleImagePick}
                    disabled={isUploadingImage}
                    className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-6 py-3 flex-row items-center"
                  >
                    {isUploadingImage ? <ActivityIndicator color="#3b82f6" size="small" /> : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={20} color="#60a5fa" />
                        <Text className="text-blue-300 font-bold ml-2">Browse Files</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14 mt-4 focus:border-blue-500/50">
              <Ionicons name="link-outline" size={20} color="#71717a" />
              <TextInput
                className="flex-1 text-blue-300 ml-3 h-full font-medium"
                autoCapitalize="none"
                value={image}
                onChangeText={setImage}
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
            className={`w-full ${isSubmitting ? 'bg-blue-800' : 'bg-blue-600'} rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-blue-600/40`}
          >
            {isSubmitting && <ActivityIndicator color="#fff" size="small" className="mr-2" />}
            <Text className="text-white font-black tracking-widest text-lg">
              {isSubmitting ? 'SAVING...' : 'UPDATE ARTIST'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
