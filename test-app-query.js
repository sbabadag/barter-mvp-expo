const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testAppQuery() {
  console.log('🔍 Testing exact app notification query...');
  
  const userId = 'c0c5d546-8608-4341-9919-b87c2c1edafd'; // iOS user
  
  console.log(`\n📱 Testing query for iOS user: ${userId}`);
  
  try {
    // This is the exact query from the app
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    console.log('Query result:');
    console.log('  Error:', error);
    console.log('  Data length:', data?.length || 0);
    console.log('  Data:', data);

    if (error) {
      console.error('❌ Query failed:', error);
    } else if (data && data.length > 0) {
      console.log(`✅ Query successful - found ${data.length} notifications`);
      data.forEach((notification, index) => {
        console.log(`  ${index + 1}. ${notification.title} (${notification.type})`);
      });
    } else {
      console.log('❌ Query returned empty result but no error');
    }

    // Test RLS policies
    console.log('\n🔐 Testing RLS status...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_policies', { table_name: 'notifications' })
      .single();

    if (rlsError) {
      console.log('RLS check failed (expected if function doesn\'t exist):', rlsError.message);
    } else {
      console.log('RLS data:', rlsData);
    }

  } catch (error) {
    console.error('❌ Exception during query:', error);
  }
}

testAppQuery();