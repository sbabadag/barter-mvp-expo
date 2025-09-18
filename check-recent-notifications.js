const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function checkRecentNotifications() {
  console.log('🔍 Checking recent notifications...');
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('❌ Error getting notifications:', error);
  } else {
    console.log(`✅ Found ${data.length} recent notifications:`);
    data.forEach((notification, index) => {
      console.log(`\n${index + 1}. ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Body: ${notification.body}`);
      console.log(`   User: ${notification.user_id}`);
      console.log(`   Created: ${notification.created_at}`);
      console.log(`   Read: ${notification.read}`);
    });
    
    // Count unread notifications by user
    const userNotifications = {};
    data.forEach(notification => {
      if (!userNotifications[notification.user_id]) {
        userNotifications[notification.user_id] = { total: 0, unread: 0 };
      }
      userNotifications[notification.user_id].total++;
      if (!notification.read) {
        userNotifications[notification.user_id].unread++;
      }
    });
    
    console.log('\n📊 Notification counts by user:');
    Object.entries(userNotifications).forEach(([userId, counts]) => {
      console.log(`   ${userId}: ${counts.unread} unread / ${counts.total} total`);
    });
  }
}

checkRecentNotifications().catch(console.error);