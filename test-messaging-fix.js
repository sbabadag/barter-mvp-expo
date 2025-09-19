const { createClient } = require('@supabase/supabase-js');

// Use the app's Supabase configuration
const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testMessagingSystem() {
  console.log('🧪 Testing Messaging System After RLS Fix');
  console.log('==========================================\n');

  try {
    // Test 1: Check if RLS is enabled
    console.log('📋 Test 1: Checking RLS policies...');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd 
          FROM pg_policies 
          WHERE tablename = 'bids';
        `
      });
    
    if (policyError) {
      console.log('❌ Cannot check policies (this is expected if not admin)');
    } else {
      console.log('✅ RLS policies found:', policies?.length || 0);
    }

    // Test 2: Test unauthenticated access (should fail)
    console.log('\n📋 Test 2: Testing unauthenticated access...');
    
    const { data: unauthData, error: unauthError } = await supabase
      .from('bids')
      .insert({
        listing_id: 'test-listing',
        bidder_id: 'test-user',
        message: 'Test message without auth',
        amount: 0,
        status: 'pending'
      });
    
    if (unauthError) {
      console.log('✅ Unauthenticated insert failed (as expected):', unauthError.message);
    } else {
      console.log('❌ Unauthenticated insert succeeded (RLS not working!)');
    }

    // Test 3: Test authenticated access
    console.log('\n📋 Test 3: Testing with authentication...');
    
    // Try to sign in with test user
    const testCredentials = [
      { email: 'cesbabadag@gmail.com', password: 'test123' },
      { email: 'cessbabadag@gmail.com', password: 'test123' },
      { email: 'sbabadag@engineer.com', password: 'test123' }
    ];

    let authenticatedUser = null;
    
    for (const creds of testCredentials) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(creds);
      
      if (!signInError && signInData.user) {
        console.log('✅ Authenticated as:', signInData.user.email);
        authenticatedUser = signInData.user;
        break;
      }
    }

    if (!authenticatedUser) {
      console.log('❌ Could not authenticate with test accounts');
      console.log('ℹ️  You may need to create a test account or use your actual credentials');
      return;
    }

    // Test 4: Test authenticated message sending
    console.log('\n📋 Test 4: Testing authenticated message sending...');
    
    // Get a listing to test with
    const { data: testListings } = await supabase
      .from('listings')
      .select('id, seller_id, title')
      .neq('seller_id', authenticatedUser.id)
      .limit(1);
    
    if (!testListings || testListings.length === 0) {
      console.log('❌ No test listings found from other users');
      return;
    }

    const testListing = testListings[0];
    console.log(`📦 Testing with listing: "${testListing.title}" (${testListing.id})`);

    const { data: messageData, error: messageError } = await supabase
      .from('bids')
      .insert({
        listing_id: testListing.id,
        bidder_id: authenticatedUser.id,
        message: `Test message from messaging fix - ${new Date().toISOString()}`,
        amount: 0,
        status: 'pending'
      })
      .select()
      .single();

    if (messageError) {
      console.log('❌ Authenticated message sending failed:', messageError.message);
      console.log('Error code:', messageError.code);
      console.log('Error details:', messageError.details);
    } else {
      console.log('✅ Message sent successfully!');
      console.log('Message ID:', messageData.id);
      
      // Test 5: Verify the message can be read back
      console.log('\n📋 Test 5: Testing message retrieval...');
      
      const { data: retrievedMessage, error: retrieveError } = await supabase
        .from('bids')
        .select('id, message, created_at, amount')
        .eq('id', messageData.id)
        .single();
      
      if (retrieveError) {
        console.log('❌ Message retrieval failed:', retrieveError.message);
      } else {
        console.log('✅ Message retrieved successfully:', retrievedMessage.message);
      }
    }

    console.log('\n🎉 Messaging system test completed!');
    console.log('\nResults Summary:');
    console.log('- RLS Policies:', policies?.length > 0 ? '✅ Active' : '❌ Missing');
    console.log('- Unauthenticated Access:', unauthError ? '✅ Blocked' : '❌ Allowed');
    console.log('- Authentication:', authenticatedUser ? '✅ Working' : '❌ Failed');
    console.log('- Message Sending:', messageError ? '❌ Failed' : '✅ Working');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMessagingSystem().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});