const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the exact same configuration as the app
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 App Supabase URL:', SUPABASE_URL);
console.log('🔑 App API key (first 20 chars):', SUPABASE_ANON_KEY?.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkActualData() {
  console.log('\n🔍 Checking what the app actually sees...\n');

  try {
    // Check listings - exactly like the app does
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select(`
        id, 
        title, 
        description, 
        price, 
        currency,
        category,
        location,
        seller_name,
        condition,
        status,
        images,
        created_at
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (listingsError) {
      console.log('❌ Error fetching listings:', listingsError.message);
    } else {
      console.log(`📋 Active listings found: ${listings?.length || 0}`);
      if (listings && listings.length > 0) {
        console.log('📝 First few listings:');
        listings.slice(0, 3).forEach((listing, index) => {
          console.log(`  ${index + 1}. ${listing.title} (${listing.id})`);
        });
      }
    }

    // Check all listings regardless of status
    const { data: allListings, error: allError } = await supabase
      .from("listings")
      .select('id, title, status')
      .limit(100);
    
    if (allError) {
      console.log('❌ Error fetching all listings:', allError.message);
    } else {
      console.log(`📊 Total listings (all statuses): ${allListings?.length || 0}`);
      if (allListings && allListings.length > 0) {
        const statusCounts = allListings.reduce((acc, listing) => {
          acc[listing.status || 'undefined'] = (acc[listing.status || 'undefined'] || 0) + 1;
          return acc;
        }, {});
        console.log('📈 Status breakdown:', statusCounts);
      }
    }

    // Check bids
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select('id, listing_id, status')
      .limit(100);
    
    if (bidsError) {
      console.log('❌ Error fetching bids:', bidsError.message);
    } else {
      console.log(`🎯 Total bids: ${bids?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkActualData();