const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function createTestNotification() {
  console.log('🧪 Creating test notification...');
  
  const testNotification = {
    user_id: 'c0c5d546-8608-4341-9919-b87c2c1edafd', // iOS user (sbabadag)
    type: 'reminder',
    title: '🚀 Live Test Notification',
    body: `Live test created at ${new Date().toLocaleTimeString()} - This should appear immediately in iOS app`,
    data: {
      test: true,
      timestamp: Date.now()
    },
    read: false,
    sent: false,
    delivery_method: 'in_app',
    created_at: new Date().toISOString(),
    scheduled_for: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create test notification:', error);
    } else {
      console.log('✅ Test notification created successfully:', data);
      console.log('📱 This should now appear in the iOS app with enhanced debugging');
    }
  } catch (error) {
    console.error('❌ Exception creating test notification:', error);
  }
}

createTestNotification();