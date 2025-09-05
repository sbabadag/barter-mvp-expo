const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://guvdkdyrmmoyadmapokx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestBidSimple() {
  console.log('🔍 Test teklifi oluşturuluyor (RLS bypass)...');
  
  try {
    // Önce tabloyu kontrol et
    const { data, error } = await supabase.rpc('version');
    console.log('📡 Supabase bağlantısı:', error ? 'HATA' : 'BAŞARILI');
    
    // Basit bir raw SQL query ile teklif ekle
    const { data: bid, error: bidError } = await supabase
      .rpc('exec_sql', {
        sql: `
          INSERT INTO bids (listing_id, bidder_id, amount, message, status, created_at)
          VALUES (
            '9bfa692d-ebee-438f-afa2-6e63b8ea7053',
            '550e8400-e29b-41d4-a716-446655440000', 
            40,
            'Test teklifi',
            'pending',
            NOW()
          )
          RETURNING id;
        `
      });
    
    if (bidError) {
      console.error('❌ RPC hatası:', bidError);
      
      // Alternatif: Doğrudan teklif eklemeyi dene
      console.log('📝 Doğrudan teklif ekleniyor...');
      const { data: directBid, error: directError } = await supabase
        .from('bids')
        .insert({
          listing_id: '9bfa692d-ebee-438f-afa2-6e63b8ea7053',
          bidder_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 40,
          message: 'Test teklifi',
          status: 'pending'
        })
        .select();
      
      if (directError) {
        console.error('❌ Doğrudan teklif hatası:', directError.message);
      } else {
        console.log('✅ Test teklifi oluşturuldu:', directBid);
      }
    } else {
      console.log('✅ RPC ile teklif oluşturuldu:', bid);
    }
    
    // Tüm teklifleri göster
    const { data: allBids } = await supabase
      .from('bids')
      .select('*');
    
    console.log('📊 Toplam teklif sayısı:', allBids?.length || 0);
    
  } catch (error) {
    console.error('💥 Genel hata:', error);
  }
}

createTestBidSimple();
