require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');
  
  try {
    // Listings tablosunu kontrol et
    console.log('📋 Checking listings table...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .limit(1);
    
    if (listingsError) {
      console.log('❌ Listings table error:', listingsError.message);
    } else {
      console.log('✅ Listings table exists');
      if (listings && listings.length > 0) {
        console.log('Columns:', Object.keys(listings[0]));
      }
    }

    // Profiles tablosunu kontrol et
    console.log('\n👤 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists');
      if (profiles && profiles.length > 0) {
        console.log('Columns:', Object.keys(profiles[0]));
      }
    }

    // Messages tablosunu kontrol et
    console.log('\n� Checking messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.log('❌ Messages table error:', messagesError.message);
    } else {
      console.log('✅ Messages table exists');
      if (messages && messages.length > 0) {
        console.log('Columns:', Object.keys(messages[0]));
      }
    }

    // Conversations tablosunu kontrol et
    console.log('\n� Checking conversations table...');
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (conversationsError) {
      console.log('❌ Conversations table error:', conversationsError.message);
    } else {
      console.log('✅ Conversations table exists');
      if (conversations && conversations.length > 0) {
        console.log('Columns:', Object.keys(conversations[0]));
      }
    }

    // Bids tablosunu kontrol et
    console.log('\n💰 Checking bids table...');
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('*')
      .limit(1);
    
    if (bidsError) {
      console.log('❌ Bids table error:', bidsError.message);
    } else {
      console.log('✅ Bids table exists');
      if (bids && bids.length > 0) {
        console.log('Columns:', Object.keys(bids[0]));
      } else {
        console.log('📊 Bids table is empty');
      }
    }

    // Offers tablosunu kontrol et
    console.log('\n🤝 Checking offers table...');
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .limit(1);
    
    if (offersError) {
      console.log('❌ Offers table error:', offersError.message);
    } else {
      console.log('✅ Offers table exists');
      if (offers && offers.length > 0) {
        console.log('Columns:', Object.keys(offers[0]));
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkTables();
