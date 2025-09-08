require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testOfferCreation() {
  console.log('🧪 Testing offer creation to understand table structure...\n');
  
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log('❌ No authenticated user found');
      return;
    }

    console.log('✅ Authenticated user:', userData.user.id);

    // Get a listing to use for testing
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .limit(1);

    if (!listings || listings.length === 0) {
      console.log('❌ No listings found for testing');
      return;
    }

    console.log('✅ Found listing for testing:', listings[0].id);

    // Try different offer structures to see what works
    const testOffer = {
      listing_id: listings[0].id,
      message: 'Test offer message',
      created_at: new Date().toISOString()
    };

    console.log('📝 Attempting to create test offer...');
    
    const { data, error } = await supabase
      .from('offers')
      .insert(testOffer)
      .select();

    if (error) {
      console.log('❌ Error creating offer:', error.message);
      console.log('💡 This tells us the required fields...');
    } else {
      console.log('✅ Test offer created successfully!');
      console.log('📊 Offer structure:', data[0] ? Object.keys(data[0]) : 'No data returned');
      
      // Clean up test offer
      if (data && data[0]) {
        await supabase.from('offers').delete().eq('id', data[0].id);
        console.log('🧹 Test offer cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOfferCreation();
