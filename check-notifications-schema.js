const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function checkNotificationsSchema() {
  console.log('🔍 Checking notifications table schema...');
  
  // Try to get one notification to see the structure
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error getting notifications:', error);
  } else {
    console.log('✅ Notifications data structure:', data);
    if (data && data.length > 0) {
      console.log('📋 Available columns:', Object.keys(data[0]));
    } else {
      console.log('📋 No notifications found - table might be empty');
      
      // Try a simple insert to see what columns are expected
      const testNotification = {
        id: 'test_schema_check',
        user_id: 'test_user',
        type: 'test',
        title: 'Test'
      };
      
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(testNotification);
        
      if (insertError) {
        console.log('📋 Insert error reveals schema:', insertError.message);
      }
    }
  }
}

checkNotificationsSchema().catch(console.error);