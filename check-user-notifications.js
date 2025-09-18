const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function checkUserNotifications() {
  console.log('🔍 Checking notifications by user...');
  
  // Test both users from logs
  const users = [
    { name: 'sevdababadag (Android)', id: 'f60082e2-4ca5-4534-a682-a30a7b039af9' },
    { name: 'sbabadag (iOS)', id: 'c0c5d546-8608-4341-9919-b87c2c1edafd' }
  ];

  for (const user of users) {
    console.log(`\n📱 Checking notifications for ${user.name}:`);
    console.log(`User ID: ${user.id}`);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error(`❌ Error for ${user.name}:`, error);
        continue;
      }

      console.log(`✅ Found ${data?.length || 0} notifications for ${user.name}`);
      
      if (data && data.length > 0) {
        data.forEach((notification, index) => {
          console.log(`  ${index + 1}. ${notification.title}`);
          console.log(`     Body: ${notification.body}`);
          console.log(`     Type: ${notification.type}`);
          console.log(`     Read: ${notification.read}`);
          console.log(`     Created: ${notification.created_at}`);
        });
      } else {
        console.log(`  📭 No notifications found for ${user.name}`);
      }
    } catch (error) {
      console.error(`❌ Exception for ${user.name}:`, error);
    }
  }
}

checkUserNotifications();