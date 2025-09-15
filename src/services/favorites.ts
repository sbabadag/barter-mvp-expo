import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

// Key for local storage
const FAVORITES_STORAGE_KEY = 'user_favorites';

// Get user's favorites from database
export const useFavorites = (userId?: string) => useQuery({
  queryKey: ["favorites", userId],
  queryFn: async () => {
    if (!userId) return [];
    
    console.log('Fetching favorites for user:', userId);
    
    if (supabaseConfig.isPlaceholder) {
      // Mock mode - load from AsyncStorage
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        return storedFavorites ? JSON.parse(storedFavorites) : [];
      } catch (error) {
        console.error('Error loading favorites from storage:', error);
        return [];
      }
    } else {
      // Real Supabase mode
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} favorites for user`);
      return data || [];
    }
  },
  enabled: !!userId,
});

// Add item to favorites
export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: string; listingId: string }) => {
      console.log('Adding favorite:', { userId, listingId });
      
      if (supabaseConfig.isPlaceholder) {
        // Mock mode - save to AsyncStorage
        try {
          const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
          const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
          
          // Check if already favorited
          const exists = favorites.find((fav: Favorite) => 
            fav.user_id === userId && fav.listing_id === listingId
          );
          
          if (!exists) {
            const newFavorite: Favorite = {
              id: `fav_${Date.now()}`,
              user_id: userId,
              listing_id: listingId,
              created_at: new Date().toISOString(),
            };
            
            favorites.push(newFavorite);
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            return newFavorite;
          }
          
          return null;
        } catch (error) {
          console.error('Error saving favorite to storage:', error);
          throw error;
        }
      } else {
        // Real Supabase mode
        const { data, error } = await supabase
          .from("favorites")
          .insert({
            user_id: userId,
            listing_id: listingId,
          })
          .select()
          .single();
        
        if (error) {
          // If it's a duplicate error, that's okay
          if (error.code === '23505') {
            console.log('Item already in favorites');
            return null;
          }
          console.error('Error adding favorite:', error);
          throw error;
        }
        
        console.log('✅ Added to favorites:', data);
        return data;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate favorites query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.userId] });
      console.log('✅ Favorite added successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to add favorite:', error);
    },
  });
};

// Remove item from favorites
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: string; listingId: string }) => {
      console.log('Removing favorite:', { userId, listingId });
      
      if (supabaseConfig.isPlaceholder) {
        // Mock mode - remove from AsyncStorage
        try {
          const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
          const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
          
          const filteredFavorites = favorites.filter((fav: Favorite) => 
            !(fav.user_id === userId && fav.listing_id === listingId)
          );
          
          await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filteredFavorites));
          return true;
        } catch (error) {
          console.error('Error removing favorite from storage:', error);
          throw error;
        }
      } else {
        // Real Supabase mode
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);
        
        if (error) {
          console.error('Error removing favorite:', error);
          throw error;
        }
        
        console.log('✅ Removed from favorites');
        return true;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate favorites query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.userId] });
      console.log('✅ Favorite removed successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to remove favorite:', error);
    },
  });
};

// Toggle favorite status
export const useToggleFavorite = () => {
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      listingId, 
      isCurrentlyFavorited 
    }: { 
      userId: string; 
      listingId: string; 
      isCurrentlyFavorited: boolean; 
    }) => {
      if (isCurrentlyFavorited) {
        return removeFavorite.mutateAsync({ userId, listingId });
      } else {
        return addFavorite.mutateAsync({ userId, listingId });
      }
    },
  });
};

// Helper function to check if item is favorited
export const useIsFavorited = (userId?: string, listingId?: string) => {
  const { data: favorites = [] } = useFavorites(userId);
  
  if (!userId || !listingId) return false;
  
  return favorites.some((favorite: Favorite) => favorite.listing_id === listingId);
};

// Get favorite listing IDs as a Set for easy lookup
export const useFavoriteIds = (userId?: string) => {
  const { data: favorites = [] } = useFavorites(userId);
  
  return new Set(favorites.map((favorite: Favorite) => favorite.listing_id));
};