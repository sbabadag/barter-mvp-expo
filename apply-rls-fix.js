const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase connection
const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function applyRLSFix() {
  try {
    // Read the RLS fix SQL file
    const fixSql = fs.readFileSync('./sql/fix_messaging_rls.sql', 'utf8');
    
    console.log('📝 Applying RLS fix for messaging...');
    console.log('SQL to execute:');
    console.log(fixSql);
    
    // Execute the fix
    const { error } = await supabase.rpc('exec_sql', { sql: fixSql });
    
    if (error) {
      console.error('❌ Error applying RLS fix:', error);
    } else {
      console.log('✅ RLS fix applied successfully');
    }
    
    // Test if we can now create bids with authentication
    console.log('🧪 Testing bid creation...');
    
    // Sign in first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sevdababadag@gmail.com',
      password: 'Deneme123.'
    });
    
    if (authError || !authData.user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    
    console.log('✅ Authenticated as:', authData.user.id);
    
    // Try to create a bid
    const testBidId = `test_bid_${Date.now()}`;
    const { data: bidData, error: bidError } = await supabase
      .from('bids')
      .insert({
        id: testBidId,
        listing_id: 'test_listing_1758219623231',
        bidder_id: authData.user.id,
        amount: 75,
        message: 'Test bid after RLS fix',
        status: 'pending'
      })
      .select()
      .single();
    
    if (bidError) {
      console.error('❌ Bid creation still failed:', bidError);
    } else {
      console.log('✅ Bid created successfully:', bidData);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

applyRLSFix();