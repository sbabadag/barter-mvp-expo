const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testRLSDebug() {
  console.log('🔐 Testing RLS with known user ID...');
  
  // Use the known user ID from app logs
  const userId = 'f60082e2-4ca5-4534-a682-a30a7b039af9';
  console.log('🔍 Testing with user ID:', userId);
  
  // Test bid creation without auth (should fail but let's see the error)
  const testBid = {
    id: 'test_rls_' + Date.now(),
    listing_id: 'test_listing_1758219623231',
    bidder_id: userId,
    amount: 250,
    message: 'RLS debug test - no auth',
    status: 'pending'
  };
  
  console.log('🧪 Testing bid insert WITHOUT authentication:', testBid);
  
  const { data, error } = await supabase
    .from('bids')
    .insert(testBid)
    .select()
    .single();
    
  if (error) {
    console.error('❌ INSERT FAILED (expected):', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    // Now let's check what policies are actually active
    console.log('🔍 Checking active policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'bids')
      .eq('cmd', 'INSERT');
      
    if (policyError) {
      console.error('❌ Policy check failed:', policyError);
    } else {
      console.log('📋 Active INSERT policies:', policies);
    }
  } else {
    console.log('✅ INSERT SUCCESS (unexpected):', data.id);
  }
}

testRLSDebug().catch(console.error);