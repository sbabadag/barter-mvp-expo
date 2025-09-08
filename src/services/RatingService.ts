import { supabase } from '../utils/supabase';

export interface Rating {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id?: string;
  transaction_type: 'buyer' | 'seller';
  rating: number;
  review_text?: string;
  communication_rating?: number;
  item_condition_rating?: number;
  delivery_rating?: number;
  is_anonymous: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RatingStats {
  user_id: string;
  average_rating: number;
  total_reviews: number;
  seller_average_rating: number;
  seller_total_reviews: number;
  buyer_average_rating: number;
  buyer_total_reviews: number;
  seller_5_star: number;
  seller_4_star: number;
  seller_3_star: number;
  seller_2_star: number;
  seller_1_star: number;
  buyer_5_star: number;
  buyer_4_star: number;
  buyer_3_star: number;
  buyer_2_star: number;
  buyer_1_star: number;
  avg_communication: number;
  avg_item_condition: number;
  avg_delivery: number;
  last_updated: string;
}

export interface CreateRatingData {
  reviewed_user_id: string;
  listing_id?: string;
  transaction_type: 'buyer' | 'seller';
  rating: number;
  review_text?: string;
  communication_rating?: number;
  item_condition_rating?: number;
  delivery_rating?: number;
  is_anonymous?: boolean;
}

class RatingService {
  /**
   * Create a new rating
   */
  async createRating(ratingData: CreateRatingData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('ratings')
        .insert({
          reviewer_id: user.id,
          ...ratingData,
          is_verified: true, // Assume verified for now
        });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Bu işlem için zaten değerlendirme yapmışsınız' };
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Create rating error:', error);
      return { success: false, error: 'Değerlendirme oluşturulurken hata oluştu' };
    }
  }

  /**
   * Get ratings for a specific user
   */
  async getUserRatings(
    userId: string, 
    transactionType?: 'buyer' | 'seller',
    limit: number = 10
  ): Promise<Rating[]> {
    try {
      let query = supabase
        .from('ratings')
        .select(`
          *,
          reviewer:profiles!ratings_reviewer_id_fkey(display_name),
          listing:listings(title)
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (transactionType) {
        query = query.eq('transaction_type', transactionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user ratings error:', error);
      return [];
    }
  }

  /**
   * Get rating statistics for a user
   */
  async getUserRatingStats(userId: string): Promise<RatingStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_rating_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get user rating stats error:', error);
      return null;
    }
  }

  /**
   * Check if user can rate another user for a specific listing
   */
  async canUserRate(
    reviewedUserId: string, 
    listingId?: string
  ): Promise<{ canRate: boolean; reason?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { canRate: false, reason: 'User not authenticated' };
      }

      if (user.id === reviewedUserId) {
        return { canRate: false, reason: 'Cannot rate yourself' };
      }

      // Check if already rated for this specific transaction
      if (listingId) {
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('reviewer_id', user.id)
          .eq('reviewed_user_id', reviewedUserId)
          .eq('listing_id', listingId)
          .single();

        if (existingRating) {
          return { canRate: false, reason: 'Already rated this transaction' };
        }
      }

      return { canRate: true };
    } catch (error) {
      console.error('Can user rate error:', error);
      return { canRate: false, reason: 'Error checking rating eligibility' };
    }
  }

  /**
   * Get average rating for quick display
   */
  async getQuickRating(userId: string): Promise<{ rating: number; count: number }> {
    try {
      const stats = await this.getUserRatingStats(userId);
      
      if (!stats) {
        return { rating: 0, count: 0 };
      }

      return {
        rating: stats.average_rating,
        count: stats.total_reviews
      };
    } catch (error) {
      console.error('Get quick rating error:', error);
      return { rating: 0, count: 0 };
    }
  }

  /**
   * Update an existing rating
   */
  async updateRating(
    ratingId: string, 
    updateData: Partial<CreateRatingData>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('ratings')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ratingId)
        .eq('reviewer_id', user.id); // Ensure user can only update their own ratings

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Update rating error:', error);
      return { success: false, error: 'Değerlendirme güncellenirken hata oluştu' };
    }
  }

  /**
   * Delete a rating
   */
  async deleteRating(ratingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId)
        .eq('reviewer_id', user.id); // Ensure user can only delete their own ratings

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Delete rating error:', error);
      return { success: false, error: 'Değerlendirme silinirken hata oluştu' };
    }
  }

  /**
   * Get ratings that need to be given (based on completed transactions)
   */
  async getPendingRatings(): Promise<Array<{
    listingId: string;
    otherUserId: string;
    otherUserName: string;
    listingTitle: string;
    transactionType: 'buyer' | 'seller';
  }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      // Get bids where user was involved and could rate
      const { data: bids } = await supabase
        .from('bids')
        .select(`
          id,
          listing_id,
          bidder_id,
          status,
          listing:listings(
            id,
            title,
            seller_id,
            seller:profiles!listings_seller_id_fkey(display_name)
          )
        `)
        .or(`bidder_id.eq.${user.id},listing.seller_id.eq.${user.id}`)
        .eq('status', 'accepted'); // Only accepted bids

      if (!bids) return [];

      const pendingRatings = [];

      for (const bid of bids) {
        const listing = Array.isArray(bid.listing) ? bid.listing[0] : bid.listing;
        if (!listing) continue;
        
        const isUserBuyer = bid.bidder_id === user.id;
        const otherUserId = isUserBuyer ? listing.seller_id : bid.bidder_id;
        const transactionType: 'buyer' | 'seller' = isUserBuyer ? 'seller' : 'buyer';

        // Check if rating already exists
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('reviewer_id', user.id)
          .eq('reviewed_user_id', otherUserId)
          .eq('listing_id', bid.listing_id)
          .eq('transaction_type', transactionType)
          .single();

        if (!existingRating) {
          // Get other user's name
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', otherUserId)
            .single();

          pendingRatings.push({
            listingId: bid.listing_id,
            otherUserId,
            otherUserName: otherUser?.display_name || 'Unknown',
            listingTitle: listing.title,
            transactionType,
          });
        }
      }

      return pendingRatings;
    } catch (error) {
      console.error('Get pending ratings error:', error);
      return [];
    }
  }
}

export const ratingService = new RatingService();
