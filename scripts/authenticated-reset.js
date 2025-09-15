const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function authenticatedReset() {
  console.log('🔐 Starting authenticated database reset...\n');

  try {
    // First, we need to sign in with a user account
    // From the app logs, we can see a user email: sbabadag@gmail.com
    // We'll need the password for this - let me first check if there are any test credentials

    console.log('👤 Attempting to authenticate...');
    
    // For now, let's see what happens if we try to get existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    }
    
    if (!session) {
      console.log('❌ No existing session found');
      console.log('💡 We need valid credentials to delete data due to RLS policies');
      console.log('🔧 Options:');
      console.log('   1. Use Supabase dashboard SQL editor to run: DELETE FROM listings;');
      console.log('   2. Temporarily disable RLS on tables');
      console.log('   3. Use service role key (not recommended for client apps)');
      console.log('   4. Sign in with a valid user account');
      
      // Let's try option 4 - we need to sign in
      // Check if there are any test user credentials we can use
      console.log('\n🔍 Checking for test user credentials in scripts...');
      
      return;
    }

    console.log('✅ Found existing session');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 User:', user?.email);

    // Now try to delete data as authenticated user
    await performAuthenticatedDeletion(user);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function performAuthenticatedDeletion(user) {
  console.log('\n🗑️ Performing authenticated deletion...');

  try {
    // Get all listings to see what we're working with
    const { data: allListings, error: fetchError } = await supabase
      .from('listings')
      .select('id, title, seller_id');
    
    if (fetchError) {
      console.log('❌ Error fetching listings:', fetchError.message);
      return;
    }

    console.log(`📋 Found ${allListings?.length || 0} total listings`);
    
    const userOwned = allListings?.filter(l => l.seller_id === user.id) || [];
    const otherOwned = allListings?.filter(l => l.seller_id !== user.id) || [];
    
    console.log(`👤 User owns: ${userOwned.length} listings`);
    console.log(`👥 Others own: ${otherOwned.length} listings`);

    // Delete user's own listings first
    if (userOwned.length > 0) {
      console.log('\n🗑️ Deleting user-owned listings...');
      
      for (const listing of userOwned) {
        // Delete bids for this listing
        const { error: bidError } = await supabase
          .from('bids')
          .delete()
          .eq('listing_id', listing.id);
        
        if (bidError) {
          console.log(`❌ Error deleting bids for ${listing.title}:`, bidError.message);
        }

        // Delete comments for this listing
        const { error: commentError } = await supabase
          .from('comments')
          .delete()
          .eq('listing_id', listing.id);
        
        if (commentError) {
          console.log(`❌ Error deleting comments for ${listing.title}:`, commentError.message);
        }

        // Delete the listing
        const { error: listingError } = await supabase
          .from('listings')
          .delete()
          .eq('id', listing.id);
        
        if (listingError) {
          console.log(`❌ Error deleting listing ${listing.title}:`, listingError.message);
        } else {
          console.log(`✅ Deleted: ${listing.title}`);
        }
      }
    }

    // For listings owned by others, we can only delete bids/comments made by current user
    console.log('\n🧹 Cleaning up user interactions on other listings...');
    
    // Delete user's bids on any listing
    const { error: allBidsError } = await supabase
      .from('bids')
      .delete()
      .eq('bidder_id', user.id);
    
    if (allBidsError) {
      console.log('❌ Error deleting user bids:', allBidsError.message);
    } else {
      console.log('✅ Deleted all user bids');
    }

    // Delete user's comments on any listing
    const { error: allCommentsError } = await supabase
      .from('comments')
      .delete()
      .eq('user_id', user.id);
    
    if (allCommentsError) {
      console.log('❌ Error deleting user comments:', allCommentsError.message);
    } else {
      console.log('✅ Deleted all user comments');
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const { data: remainingListings } = await supabase
      .from('listings')
      .select('id, seller_id');
    
    const userListingsRemaining = remainingListings?.filter(l => l.seller_id === user.id) || [];
    
    console.log(`📋 User listings remaining: ${userListingsRemaining.length}`);
    console.log(`📋 Total listings remaining: ${remainingListings?.length || 0}`);
    
    if (remainingListings && remainingListings.length > 0) {
      console.log('\n⚠️  Some listings remain (owned by other users)');
      console.log('💡 To delete ALL data, use Supabase dashboard SQL editor with service role');
    } else {
      console.log('\n🎉 All data cleared successfully!');
    }

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  }
}

authenticatedReset();