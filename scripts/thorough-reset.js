const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the exact same configuration as the app
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Using Supabase URL:', SUPABASE_URL);
console.log('🔑 Using API key (first 20 chars):', SUPABASE_ANON_KEY?.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function thoroughReset() {
  console.log('🗑️  Starting thorough database reset...\n');

  try {
    // 1. First, let's check what we're dealing with
    const { data: initialListings } = await supabase
      .from('listings')
      .select('id, title')
      .limit(5);
    
    console.log('📋 Sample listings before reset:');
    initialListings?.forEach((listing, index) => {
      console.log(`  ${index + 1}. ${listing.title} (${listing.id})`);
    });
    console.log();

    // 2. Clear bids one by one if needed
    console.log('🎯 Clearing bids...');
    let bidsDeleted = 0;
    let hasMoreBids = true;
    
    while (hasMoreBids) {
      const { data: bidsToDelete } = await supabase
        .from('bids')
        .select('id')
        .limit(50);
      
      if (bidsToDelete && bidsToDelete.length > 0) {
        for (const bid of bidsToDelete) {
          const { error } = await supabase
            .from('bids')
            .delete()
            .eq('id', bid.id);
          
          if (error) {
            console.log('❌ Error deleting bid:', error.message);
          } else {
            bidsDeleted++;
          }
        }
      } else {
        hasMoreBids = false;
      }
    }
    console.log(`✅ Deleted ${bidsDeleted} bids`);

    // 3. Clear comments one by one if needed
    console.log('💬 Clearing comments...');
    let commentsDeleted = 0;
    let hasMoreComments = true;
    
    while (hasMoreComments) {
      const { data: commentsToDelete } = await supabase
        .from('comments')
        .select('id')
        .limit(50);
      
      if (commentsToDelete && commentsToDelete.length > 0) {
        for (const comment of commentsToDelete) {
          const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', comment.id);
          
          if (error) {
            console.log('❌ Error deleting comment:', error.message);
          } else {
            commentsDeleted++;
          }
        }
      } else {
        hasMoreComments = false;
      }
    }
    console.log(`✅ Deleted ${commentsDeleted} comments`);

    // 4. Clear listings one by one
    console.log('📋 Clearing listings...');
    let listingsDeleted = 0;
    let hasMoreListings = true;
    
    while (hasMoreListings) {
      const { data: listingsToDelete } = await supabase
        .from('listings')
        .select('id')
        .limit(50);
      
      if (listingsToDelete && listingsToDelete.length > 0) {
        for (const listing of listingsToDelete) {
          const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listing.id);
          
          if (error) {
            console.log('❌ Error deleting listing:', listing.id, error.message);
          } else {
            listingsDeleted++;
            if (listingsDeleted % 10 === 0) {
              console.log(`  Deleted ${listingsDeleted} listings...`);
            }
          }
        }
      } else {
        hasMoreListings = false;
      }
    }
    console.log(`✅ Deleted ${listingsDeleted} listings`);

    // 5. Verify the reset
    console.log('\n🔍 Verifying reset...');
    const { data: remainingListings } = await supabase
      .from('listings')
      .select('id')
      .limit(5);
    
    const { data: remainingBids } = await supabase
      .from('bids')
      .select('id')
      .limit(5);
    
    const { data: remainingComments } = await supabase
      .from('comments')
      .select('id')
      .limit(5);

    console.log(`📋 Remaining listings: ${remainingListings?.length || 0}`);
    console.log(`🎯 Remaining bids: ${remainingBids?.length || 0}`);
    console.log(`💬 Remaining comments: ${remainingComments?.length || 0}`);

    if ((remainingListings?.length || 0) === 0 && 
        (remainingBids?.length || 0) === 0 && 
        (remainingComments?.length || 0) === 0) {
      console.log('\n🎉 Database reset completed successfully!');
    } else {
      console.log('\n⚠️  Some data may still remain in the database.');
    }

  } catch (error) {
    console.error('❌ Unexpected error during reset:', error);
  }
}

thoroughReset();