require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOffersStructure() {
  console.log('🤝 Checking offers table structure...\n');
  
  try {
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Offers table error:', error.message);
      return;
    }

    if (offers && offers.length > 0) {
      console.log('✅ Offers table columns:', Object.keys(offers[0]));
    } else {
      console.log('✅ Offers table exists but is empty');
      
      // Tüm offers verilerini al
      const { data: allOffers, error: allError } = await supabase
        .from('offers')
        .select('*');
      
      if (allError) {
        console.log('❌ Error fetching offers:', allError.message);
      } else {
        console.log('📊 Total offers found:', allOffers?.length || 0);
        if (allOffers && allOffers.length > 0) {
          console.log('Offers columns:', Object.keys(allOffers[0]));
        }
      }
    }
  } catch (error) {
    console.error('❌ Offers check failed:', error);
  }
}

checkOffersStructure();
