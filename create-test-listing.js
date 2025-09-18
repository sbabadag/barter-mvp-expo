// Test script to create listings from different users for testing the bidding system

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function createTestListings() {
  console.log('🧪 Creating test listings from different users...');
  
  try {
    // Create a test listing from iOS user (sbabadag@gmail.com)
    await supabase.auth.signInWithPassword({
      email: 'sbabadag@gmail.com',
      password: 'Deneme123.'
    });
    
    const iosUserId = 'c0c5d546-8608-4341-9919-b87c2c1edafd';
    
    const testListing = {
      id: `test_listing_${Date.now()}`,
      title: 'Test Ürün - iOS Kullanıcısından',
      description: 'Bu ürün iOS kullanıcısı tarafından oluşturuldu. Android kullanıcı bu ürüne teklif verebilir.',
      price: 150,
      category: 'Test',
      seller_id: iosUserId,
      status: 'active',
      condition: 'good',
      location: 'Test Lokasyon',
      image_url: 'https://picsum.photos/400/300?random=test'
    };
    
    const { data: listing, error } = await supabase
      .from('listings')
      .insert(testListing)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test listing:', error);
    } else {
      console.log('✅ Test listing created:', listing.id);
      console.log('📱 This listing can be used by Android user (Sevda) to test bidding');
      console.log('🔍 Listing details:', {
        id: listing.id,
        title: listing.title,
        seller_id: listing.seller_id,
        price: listing.price
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestListings();