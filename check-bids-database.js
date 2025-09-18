const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function checkBidsInDatabase() {
  console.log('🔍 Checking all bids in database...');
  
  try {
    // Get all bids
    const { data: allBids, error } = await supabase
      .from('bids')
      .select('id, listing_id, bidder_id, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error fetching bids:', error);
      return;
    }

    console.log(`✅ Found ${allBids.length} bids in database`);
    
    // Check received bids for user c0c5d546-8608-4341-9919-b87c2c1edafd (iOS user from logs)
    console.log('\n📱 Checking received bids for iOS user (sbabadag):');
    
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title')
      .eq('seller_id', 'c0c5d546-8608-4341-9919-b87c2c1edafd');
      
    if (listingsError) {
      console.error('❌ Error fetching user listings:', listingsError);
    } else {
      console.log(`📋 User has ${listings.length} listings`);
      
      for (const listing of listings) {
        const listingBids = allBids.filter(bid => bid.listing_id === listing.id);
        console.log(`\n📦 Listing: "${listing.title}" (${listing.id})`);
        console.log(`   Bids: ${listingBids.length}`);
        
        listingBids.forEach((bid, index) => {
          console.log(`   ${index + 1}. ID: ${bid.id}`);
          console.log(`      Amount: ${bid.amount} TL`);
          console.log(`      Status: ${bid.status}`);
          console.log(`      Bidder: ${bid.bidder_id}`);
          console.log(`      Created: ${bid.created_at}`);
        });
      }
    }
    
    console.log('\n🔍 Recent bids (all users):');
    allBids.slice(0, 10).forEach((bid, index) => {
      console.log(`${index + 1}. ${bid.id} - ${bid.amount} TL (${bid.status})`);
    });

  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

checkBidsInDatabase();