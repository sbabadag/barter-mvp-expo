const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testBidWithAuth() {
  try {
    console.log('🧪 Testing bid creation with different users...');
    
    // Test 1: Android user trying to bid on iOS user's listing
    console.log('\n1️⃣ Testing Android user (Sevda) bidding on iOS listing...');
    const { data: androidAuth, error: androidAuthError } = await supabase.auth.signInWithPassword({
      email: 'sevdababadag@gmail.com',
      password: 'Deneme123.'
    });
    
    if (androidAuthError) {
      console.error('❌ Android user auth failed:', androidAuthError);
      
      // Test 2: Try iOS user
      console.log('\n2️⃣ Testing iOS user (sbabadag) bidding on test listing...');
      const { data: iosAuth, error: iosAuthError } = await supabase.auth.signInWithPassword({
        email: 'sbabadag@gmail.com', 
        password: 'Deneme123.'
      });
      
      if (iosAuthError) {
        console.error('❌ iOS user auth also failed:', iosAuthError);
        return;
      }
      
      console.log('✅ iOS user authenticated:', iosAuth.user.id);
      
      // Try to create bid with iOS user on their own listing (should fail due to our business logic)
      const testBidId = `test_bid_ios_${Date.now()}`;
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .insert({
          id: testBidId,
          listing_id: 'test_listing_1758219623231',
          bidder_id: iosAuth.user.id,
          amount: 75,
          message: 'Test bid from listing owner',
          status: 'pending'
        })
        .select()
        .single();
      
      if (bidError) {
        console.error('❌ Bid creation failed (expected for own listing):', bidError);
        
        // Try on a different listing
        console.log('\n3️⃣ Trying iOS user on different listing...');
        const { data: otherBidData, error: otherBidError } = await supabase
          .from('bids')
          .insert({
            id: `test_bid_ios_other_${Date.now()}`,
            listing_id: '65c9be17-618b-4c03-8b14-d8004beadf87', // Different listing
            bidder_id: iosAuth.user.id,
            amount: 50,
            message: 'Test bid on different listing',
            status: 'pending'
          })
          .select()
          .single();
        
        if (otherBidError) {
          console.error('❌ Bid creation also failed on different listing:', otherBidError);
        } else {
          console.log('✅ Bid created successfully on different listing:', otherBidData);
        }
      } else {
        console.log('⚠️ Bid created on own listing (unexpected):', bidData);
      }
      
    } else {
      console.log('✅ Android user authenticated:', androidAuth.user.id);
      
      // Try to create bid
      const testBidId = `test_bid_android_${Date.now()}`;
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .insert({
          id: testBidId,
          listing_id: 'test_listing_1758219623231',
          bidder_id: androidAuth.user.id,
          amount: 75,
          message: 'Test bid from Android user',
          status: 'pending'
        })
        .select()
        .single();
      
      if (bidError) {
        console.error('❌ Android bid creation failed:', bidError);
      } else {
        console.log('✅ Android bid created successfully:', bidData);
      }
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testBidWithAuth();