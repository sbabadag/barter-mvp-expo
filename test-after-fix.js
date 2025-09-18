const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N0.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testBidCreationAfterFix() {
  console.log('🧪 Testing bid creation after RLS policy fix...');
  
  try {
    // Test with a mock authenticated user first
    console.log('\n1️⃣ Testing RPC function approach...');
    
    // Since we can't authenticate easily from terminal, test the RPC function directly
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_bid_final', {
      p_listing_id: 'test_listing_1758219623231',
      p_bidder_id: 'f60082e2-4ca5-4534-a682-a30a7b039af9', // Android user (Sevda)
      p_amount: 85,
      p_message: 'Test bid after RLS policy fix'
    });
    
    if (rpcError) {
      console.log('❌ RPC function failed:', rpcError.message);
      console.log('Error code:', rpcError.code);
      
      if (rpcError.code === '42501') {
        console.log('❌ RLS policy still blocking - fix may not have been applied correctly');
      } else if (rpcError.code === 'P0001') {
        console.log('⚠️ RPC function requires authenticated user context');
      }
    } else {
      console.log('✅ RPC function succeeded! Bid ID:', rpcData);
    }
    
    // Test direct insert (should still fail without auth context)
    console.log('\n2️⃣ Testing direct insert (should fail without auth)...');
    
    const testId = `test_bid_direct_${Date.now()}`;
    const { data: directData, error: directError } = await supabase
      .from('bids')
      .insert({
        id: testId,
        listing_id: 'test_listing_1758219623231',
        bidder_id: 'f60082e2-4ca5-4534-a682-a30a7b039af9',
        amount: 75,
        message: 'Direct insert test after fix',
        status: 'pending'
      })
      .select()
      .single();
    
    if (directError) {
      console.log('✅ Direct insert correctly failed:', directError.message);
      if (directError.code === '42501') {
        console.log('   → Policy is working: requires authenticated context');
      }
    } else {
      console.log('⚠️ Direct insert succeeded (unexpected):', directData);
    }
    
    // Check if any bids exist now
    console.log('\n3️⃣ Checking for existing bids...');
    
    const { data: existingBids, error: fetchError } = await supabase
      .from('bids')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.log('❌ Failed to fetch bids:', fetchError.message);
    } else {
      console.log('✅ Found', existingBids?.length || 0, 'bids in database');
      if (existingBids && existingBids.length > 0) {
        console.log('Sample bid:', {
          id: existingBids[0].id,
          listing_id: existingBids[0].listing_id,
          bidder_id: existingBids[0].bidder_id,
          amount: existingBids[0].amount,
          created_at: existingBids[0].created_at
        });
      }
    }
    
    console.log('\n📋 Results:');
    if (!rpcError) {
      console.log('✅ RLS policy fix SUCCESS - bids can now be created!');
      console.log('🎯 Ready to test in the app');
    } else {
      console.log('⚠️ RLS policy may need authentication context from app');
      console.log('🎯 Test directly in the mobile app now');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBidCreationAfterFix();