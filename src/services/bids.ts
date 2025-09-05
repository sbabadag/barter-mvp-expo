import { useState, useEffect } from 'react';
import { supabase, supabaseConfig } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../state/AuthProvider';
import { HapticService } from './haptics';
import { notificationService } from './notifications';
import { Platform } from 'react-native';

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  bidder_name?: string;
  bidder_avatar?: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  created_at: string;
  expires_at?: string;
  counter_offer_amount?: number;
  counter_offer_message?: string;
}

export interface BidWithListing extends Bid {
  listing_title: string;
  listing_image: string;
  listing_price: number;
  seller_id: string;
  seller_name?: string;
}

// Mock bids for development
let mockBids: Bid[] = [
  {
    id: 'bid_1',
    listing_id: '1',
    bidder_id: 'user_1692547123456',
    bidder_name: 'Ahmet Yılmaz',
    bidder_avatar: 'https://i.pravatar.cc/100?u=ahmet',
    amount: 450,
    message: 'Merhaba, bu fiyata alabilir miyim? Nakit ödeme yapabilirim.',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // expires in 22 hours
  },
  {
    id: 'bid_2',
    listing_id: '2',
    bidder_id: 'user_1692547123457',
    bidder_name: 'Fatma Kaya',
    bidder_avatar: 'https://i.pravatar.cc/100?u=fatma',
    amount: 180,
    message: 'Bu kitabı çok istiyorum, lütfen kabul edin.',
    status: 'accepted',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'bid_3',
    listing_id: '1',
    bidder_id: 'user_1692547123458',
    bidder_name: 'Mehmet Özkan',
    bidder_avatar: 'https://i.pravatar.cc/100?u=mehmet',
    amount: 400,
    message: 'Bu fiyata takas yapalım mı?',
    status: 'countered',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    counter_offer_amount: 480,
    counter_offer_message: '480 TL olursa anlaşalım, hemen teslim edebilirim.',
  },
];

// Use bids hook for listings
export const useBidsForListing = (listingId: string) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchBids = async () => {
    if (!listingId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching bids for listing:', listingId);
      console.log('User authenticated:', isAuthenticated);
      console.log('Current user:', user);
      console.log('Supabase config:', supabaseConfig);
      
      if (supabaseConfig.isPlaceholder) {
        // Mock mode
        console.log('Using mock mode for bids');
        const listingBids = mockBids.filter(bid => bid.listing_id === listingId);
        console.log('Found mock bids:', listingBids);
        setBids(listingBids);
      } else {
        console.log('Using real Supabase for bids');
        // Real Supabase - but check if tables exist
        try {
          // Simplified approach: fetch bids without complex joins to avoid type issues
          console.log('Fetching bids from database...');
          
          const bidsQuery = supabase
            .from('bids')
            .select('*')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });
          
          const { data: bidsData, error: bidsError } = await bidsQuery;

          if (bidsError) {
            console.error('Error fetching bids:', bidsError);
            throw bidsError;
          }

          console.log('Bids fetched successfully:', bidsData?.length || 0);

          // For now, use simple formatting without profile joins to avoid type errors
          const formattedBids = (bidsData || []).map((bid: any) => ({
            ...bid,
            bidder_name: 'Kullanıcı', // Will be improved once relationship is fixed
            bidder_avatar: `https://i.pravatar.cc/100?u=${bid.bidder_id}`,
          }));

          console.log('Final formatted bids:', formattedBids);
          setBids(formattedBids);
        } catch (supabaseError: any) {
          // If table doesn't exist or other Supabase errors, fall back to mock
          console.log('Supabase error, falling back to mock mode:', supabaseError);
          if (supabaseError.code === 'PGRST205' || supabaseError.code === 'PGRST200' || supabaseError.message?.includes('table') || supabaseError.message?.includes('relationship')) {
            console.log('Database table not found or relationship error, using mock data');
            const listingBids = mockBids.filter(bid => bid.listing_id === listingId);
            setBids(listingBids);
          } else {
            throw supabaseError;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Teklifler yüklenirken hata oluştu');
      // Fallback to mock data on error
      console.log('Falling back to mock data');
      const listingBids = mockBids.filter(bid => bid.listing_id === listingId);
      setBids(listingBids);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [listingId]);

  return { bids, isLoading, error, refetch: fetchBids };
};

// Use user's bids (both made and received)
export const useUserBids = () => {
  const [madeBids, setMadeBids] = useState<BidWithListing[]>([]);
  const [receivedBids, setReceivedBids] = useState<BidWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchUserBids = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching user bids...');
      console.log('User authenticated:', isAuthenticated);
      console.log('Current user:', user);

      if (!user || !isAuthenticated) {
        console.log('No authenticated user found, setting empty arrays');
        setMadeBids([]);
        setReceivedBids([]);
        setIsLoading(false);
        return;
      }

      if (supabaseConfig.isPlaceholder) {
        console.log('Using mock mode for user bids');
        // Mock mode
        const userMadeBids = mockBids
          .filter(bid => bid.bidder_id === user.id)
          .map(bid => ({
            ...bid,
            listing_title: 'Örnek Ürün',
            listing_image: `https://picsum.photos/300/400?random=${bid.listing_id}`,
            listing_price: 500,
            seller_id: 'seller_123',
            seller_name: 'Satıcı',
          }));

        const userReceivedBids = mockBids
          .filter(bid => bid.listing_id === '1') // Assume user owns listing 1
          .map(bid => ({
            ...bid,
            listing_title: 'Benim Ürünüm',
            listing_image: `https://picsum.photos/300/400?random=${bid.listing_id}`,
            listing_price: 500,
            seller_id: user.id,
            seller_name: 'Ben',
          }));

        console.log('User made bids:', userMadeBids);
        console.log('User received bids:', userReceivedBids);
        
        setMadeBids(userMadeBids);
        setReceivedBids(userReceivedBids);
      } else {
        console.log('Using real Supabase for user bids');
        // Real Supabase implementation would go here
        // For now, fallback to mock
        setMadeBids([]);
        setReceivedBids([]);
      }
    } catch (err) {
      console.error('Error fetching user bids:', err);
      setError('Teklifleriniz yüklenirken hata oluştu');
      // Fallback to empty arrays
      setMadeBids([]);
      setReceivedBids([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBids();
  }, []);

  return { madeBids, receivedBids, isLoading, error, refetch: fetchUserBids };
};

// Create a new bid
export const createBid = async (
  listingId: string,
  amount: number,
  message?: string,
  expiresIn24h: boolean = true,
  currentUser?: any // Accept user from auth context
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Creating bid:', { listingId, amount, message, expiresIn24h });
    
    let user = currentUser;

    // If no user passed, try to get from AsyncStorage (fallback)
    if (!user) {
      try {
        const savedUser = await AsyncStorage.getItem('mock_user');
        user = savedUser ? JSON.parse(savedUser) : null;
        console.log('User from AsyncStorage:', user);
      } catch (storageError) {
        console.log('No mock user in AsyncStorage');
      }
    }

    console.log('Final user for bid:', user);

    if (!user) {
      console.log('No user found, bid creation failed');
      return { success: false, error: 'Teklif vermek için giriş yapmalısınız' };
    }

    const newBid: Bid = {
      id: `bid_${Date.now()}`,
      listing_id: listingId,
      bidder_id: user.id,
      bidder_name: user.display_name || 'Anonim Kullanıcı',
      bidder_avatar: user.avatar_url,
      amount,
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: expiresIn24h 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
        : undefined,
    };

    console.log('New bid object:', newBid);

    if (supabaseConfig.isPlaceholder) {
      // Mock mode
      console.log('Adding bid to mock data');
      mockBids.unshift(newBid);
      console.log('Mock bids now:', mockBids.length);
      
      // Haptic feedback ve notification için mock mode
      HapticService.success();
      if (Platform.OS !== 'web' && __DEV__) {
        await notificationService.scheduleBidNotification(
          `Mock İlan ${listingId}`, 
          amount, 
          listingId
        );
      }
      
      return { success: true };
    } else {
      console.log('Creating bid in Supabase');
      try {
        // Real Supabase
        const { error } = await supabase
          .from('bids')
          .insert([{
            listing_id: listingId,
            bidder_id: user.id,
            amount,
            message,
            expires_at: newBid.expires_at,
          }]);

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        console.log('Bid created successfully in Supabase');
        
        // Başarılı teklif için haptic feedback
        HapticService.success();
        console.log('✅ Teklif başarıyla oluşturuldu - Haptic feedback verildi');
        
        return { success: true };
      } catch (supabaseError: any) {
        console.log('Supabase error during bid creation, falling back to mock:', supabaseError);
        if (supabaseError.code === 'PGRST205' || supabaseError.code === 'PGRST200' || supabaseError.message?.includes('table') || supabaseError.message?.includes('relationship')) {
          console.log('Database table not found or relationship error, using mock mode for bid creation');
          mockBids.unshift(newBid);
          console.log('Mock bids now:', mockBids.length);
          
          // Mock fallback için de haptic feedback
          HapticService.success();
          
          return { success: true };
        } else {
          // Hata durumunda error haptic
          HapticService.error();
          throw supabaseError;
        }
      }
    }
  } catch (err) {
    console.error('Error creating bid:', err);
    // Genel hata için error haptic
    HapticService.error();
    return { 
      success: false, 
      error: 'Teklif gönderilirken hata oluştu. Lütfen tekrar deneyin.' 
    };
  }
};

// Update bid status (accept, reject, counter)
export const updateBidStatus = async (
  bidId: string,
  status: 'accepted' | 'rejected' | 'countered',
  counterAmount?: number,
  counterMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Updating bid status:', { bidId, status, counterAmount, counterMessage });
    
    if (supabaseConfig.isPlaceholder) {
      // Mock mode
      console.log('Updating bid in mock mode');
      const bidIndex = mockBids.findIndex(bid => bid.id === bidId);
      console.log('Found bid at index:', bidIndex);
      
      if (bidIndex !== -1) {
        mockBids[bidIndex] = {
          ...mockBids[bidIndex],
          status,
          counter_offer_amount: counterAmount,
          counter_offer_message: counterMessage,
        };
        console.log('Updated bid:', mockBids[bidIndex]);
      }
      return { success: true };
    } else {
      console.log('Updating bid in Supabase');
      try {
        // Real Supabase
        const updateData: any = { status };
        if (counterAmount) updateData.counter_offer_amount = counterAmount;
        if (counterMessage) updateData.counter_offer_message = counterMessage;

        const { error } = await supabase
          .from('bids')
          .update(updateData)
          .eq('id', bidId);

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Bid updated successfully in Supabase');
        return { success: true };
      } catch (supabaseError: any) {
        console.log('Supabase error during bid update, falling back to mock:', supabaseError);
        if (supabaseError.code === 'PGRST205' || supabaseError.message?.includes('table')) {
          console.log('Database table not found, using mock mode for bid update');
          const bidIndex = mockBids.findIndex(bid => bid.id === bidId);
          if (bidIndex !== -1) {
            mockBids[bidIndex] = {
              ...mockBids[bidIndex],
              status,
              counter_offer_amount: counterAmount,
              counter_offer_message: counterMessage,
            };
            console.log('Updated bid in mock mode:', mockBids[bidIndex]);
          }
          return { success: true };
        } else {
          throw supabaseError;
        }
      }
    }
  } catch (err) {
    console.error('Error updating bid:', err);
    return { 
      success: false, 
      error: 'Teklif güncellenirken hata oluştu' 
    };
  }
};
