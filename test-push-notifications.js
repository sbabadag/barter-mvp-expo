const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testPushNotifications() {
  console.log('📤 Testing push notifications...');
  
  try {
    // Get push tokens for both users
    const users = [
      { name: 'sevdababadag (Android)', id: 'f60082e2-4ca5-4534-a682-a30a7b039af9' },
      { name: 'sbabadag (iOS)', id: 'c0c5d546-8608-4341-9919-b87c2c1edafd' }
    ];

    for (const user of users) {
      console.log(`\n📱 Checking push tokens for ${user.name}:`);
      
      const { data: tokens, error } = await supabase
        .from('user_push_tokens')
        .select('token, platform, device_name, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error(`❌ Error fetching tokens for ${user.name}:`, error);
        continue;
      }

      if (!tokens || tokens.length === 0) {
        console.log(`📭 No push tokens found for ${user.name}`);
        continue;
      }

      console.log(`✅ Found ${tokens.length} push tokens for ${user.name}:`);
      tokens.forEach((token, index) => {
        console.log(`  ${index + 1}. ${token.platform} - ${token.device_name || 'Unknown Device'}`);
        console.log(`     Token: ${token.token.substring(0, 30)}...`);
        console.log(`     Created: ${token.created_at}`);
      });

      // Send test push notification
      for (const tokenData of tokens) {
        try {
          const message = {
            to: tokenData.token,
            sound: 'default',
            title: `🧪 Test Push Notification`,
            body: `Test notification sent to ${user.name} at ${new Date().toLocaleTimeString()}`,
            data: {
              test: true,
              timestamp: Date.now(),
              userId: user.id
            },
          };

          console.log(`📤 Sending test push to ${tokenData.platform}...`);

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
          
          if (result.data && result.data.status === 'ok') {
            console.log(`✅ Push notification sent successfully to ${tokenData.platform}`);
            console.log(`   Ticket ID: ${result.data.id}`);
          } else {
            console.error(`❌ Push notification failed for ${tokenData.platform}:`, result);
          }
        } catch (pushError) {
          console.error(`❌ Error sending push to ${tokenData.platform}:`, pushError);
        }
      }
    }

  } catch (error) {
    console.error('❌ Exception in testPushNotifications:', error);
  }
}

testPushNotifications();