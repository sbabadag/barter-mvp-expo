const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://guvdkdyrmmoyadmapokx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestBid() {
  console.log('🔍 Test teklifi oluşturuluyor...');
  
  try {
    // Önce listingsleri kontrol et
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, price, seller_id')
      .limit(3);
    
    if (listingsError) {
      console.error('❌ Listings hatası:', listingsError);
      return;
    }
    
    console.log('📋 Mevcut listingsler:', listings?.length || 0);
    if (listings && listings.length > 0) {
      listings.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title} - ${listing.price} TL (ID: ${listing.id})`);
      });
    }
    
    // Test kullanıcısı oluştur (geçerli UUID formatı)
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const targetListing = listings?.[0];
    
    if (!targetListing) {
      console.log('❌ Teklif verilecek listing bulunamadı');
      return;
    }
    
    // Test teklifi oluştur
    const bidData = {
      listing_id: targetListing.id,
      bidder_id: testUserId,
      amount: Math.round(targetListing.price * 0.8), // %20 indirim teklifi
      message: 'Test teklifi - Mobil uygulamadan yapıldı',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    console.log('📝 Teklif veriliyor:', bidData);
    
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert(bidData)
      .select()
      .single();
    
    if (bidError) {
      console.error('❌ Teklif hatası:', bidError);
      return;
    }
    
    console.log('✅ Test teklifi oluşturuldu:', bid.id);
    
    // Tüm teklifleri göster
    const { data: allBids } = await supabase
      .from('bids')
      .select('*');
    
    console.log('📊 Toplam teklif sayısı:', allBids?.length || 0);
    
  } catch (error) {
    console.error('💥 Genel hata:', error);
  }
}

createTestBid();
