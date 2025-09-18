// Test push notification sending
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testPushNotification() {
  try {
    console.log('🧪 Testing push notification sending...');
    
    // Get available push tokens
    const { data: tokens, error } = await supabase
      .from('user_push_tokens')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      console.error('❌ Error fetching tokens:', error);
      return;
    }
    
    if (!tokens || tokens.length === 0) {
      console.log('📭 No active push tokens found');
      return;
    }
    
    console.log(`📱 Found ${tokens.length} active push tokens`);
    
    for (const tokenData of tokens) {
      console.log(`\n🎯 Testing token for user ${tokenData.user_id.substring(0, 8)}... (${tokenData.platform})`);
      
      const message = {
        to: tokenData.token,
        sound: 'default',
        title: '🧪 Test Push Notification',
        body: 'Bu test push bildirimi başarıyla gönderildi! 🎉',
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📤 Sending push notification...');

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      
      console.log('📋 Expo Response:', result);
      
      if (result.data && result.data.status === 'ok') {
        console.log('✅ Push notification sent successfully!');
        console.log('📨 Receipt ID:', result.data.id);
      } else {
        console.error('❌ Push notification failed:', result);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testPushNotification();