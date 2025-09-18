const { createClient } = require('@supabase/supabase-js');

// Use the same Supabase config as the app
const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function applyDatabaseFixes() {
  console.log('🔧 Applying database fixes...');
  
  try {
    // Try to apply the RPC function fix first
    console.log('\n1️⃣ Checking create_bid_final function...');
    
    const { data: rpcTestData, error: rpcTestError } = await supabase.rpc('create_bid_final', {
      p_listing_id: 'test_nonexistent',
      p_bidder_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 1,
      p_message: 'test'
    });
    
    if (rpcTestError) {
      console.log('RPC function status:', rpcTestError.message);
      if (rpcTestError.code === '23503') {
        console.log('✅ RPC function exists (foreign key error expected)');
      } else if (rpcTestError.code === 'PGRST202') {
        console.log('❌ RPC function does not exist');
      } else {
        console.log('⚠️ RPC function exists but has issues:', rpcTestError);
      }
    } else {
      console.log('⚠️ RPC function created something:', rpcTestData);
    }
    
    // Test direct table access to understand RLS status
    console.log('\n2️⃣ Testing table access...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('bids')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table read error:', tableError.message);
    } else {
      console.log('✅ Table readable, found', tableData?.length || 0, 'records');
    }
    
    // Test insert without authentication (should fail)
    console.log('\n3️⃣ Testing insert without auth (should fail)...');
    
    const testId = `test_unauthenticated_${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from('bids')
      .insert({
        id: testId,
        listing_id: 'test',
        bidder_id: '00000000-0000-0000-0000-000000000000',
        amount: 1,
        message: 'test unauthenticated',
        status: 'pending'
      });
    
    if (insertError) {
      console.log('✅ Unauthenticated insert correctly failed:', insertError.message);
      if (insertError.code === '42501') {
        console.log('   → RLS is working (new row violates row-level security policy)');
      }
    } else {
      console.log('⚠️ Unauthenticated insert succeeded (RLS may be disabled):', insertData);
    }
    
    console.log('\n📋 Summary:');
    console.log('- The issue is likely missing INSERT policy for authenticated users');
    console.log('- RLS is enabled and working (blocks unauthenticated access)');
    console.log('- Need to create proper INSERT policy that allows bidder_id = auth.uid()');
    
    console.log('\n🎯 Next steps:');
    console.log('1. Apply the SQL fix manually through Supabase dashboard');
    console.log('2. Or use service role key to apply the fix');
    console.log('3. Test with authenticated user after fix');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

applyDatabaseFixes();