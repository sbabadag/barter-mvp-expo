const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check if we need service role key for admin operations
// For now, let's try with the anon key but focus on user's own data
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugRLS() {
  console.log('🔍 Debugging RLS and permissions...\n');

  try {
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('❌ No authenticated user:', userError.message);
      console.log('💡 This might be why deletions are failing - RLS policies may require authentication');
      return;
    }
    
    console.log('👤 Current user:', user?.email);
    console.log('🆔 User ID:', user?.id);

    // Try to delete listings owned by this user only
    console.log('\n🎯 Attempting to delete user-owned listings...');
    
    // First check how many listings this user has
    const { data: userListings, error: listError } = await supabase
      .from('listings')
      .select('id, title, seller_id')
      .eq('seller_id', user.id);
    
    if (listError) {
      console.log('❌ Error fetching user listings:', listError.message);
    } else {
      console.log(`📋 User has ${userListings?.length || 0} listings`);
    }

    // Try to delete one listing at a time for this user
    if (userListings && userListings.length > 0) {
      const firstListing = userListings[0];
      console.log(`🗑️ Trying to delete: ${firstListing.title}`);
      
      // First delete bids for this listing
      const { error: bidDeleteError } = await supabase
        .from('bids')
        .delete()
        .eq('listing_id', firstListing.id);
      
      if (bidDeleteError) {
        console.log('❌ Error deleting bids for listing:', bidDeleteError.message);
      } else {
        console.log('✅ Deleted bids for listing');
      }

      // Then delete the listing
      const { error: listingDeleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', firstListing.id);
      
      if (listingDeleteError) {
        console.log('❌ Error deleting listing:', listingDeleteError.message);
        console.log('🔍 This suggests RLS policies are preventing deletion');
      } else {
        console.log('✅ Successfully deleted listing');
      }
    }

    // Check all listings regardless of owner
    console.log('\n📊 Checking all listings...');
    const { data: allListings, error: allError } = await supabase
      .from('listings')
      .select('id, title, seller_id')
      .limit(10);
    
    if (allError) {
      console.log('❌ Error fetching all listings:', allError.message);
    } else {
      console.log(`📋 Total visible listings: ${allListings?.length || 0}`);
      allListings?.forEach((listing, index) => {
        const isOwner = listing.seller_id === user?.id ? '👤' : '👥';
        console.log(`  ${index + 1}. ${isOwner} ${listing.title} (${listing.seller_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugRLS();