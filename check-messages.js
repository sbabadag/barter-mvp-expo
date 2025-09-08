require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMessagesStructure() {
  console.log('💬 Checking messages table structure...\n');
  
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Messages table error:', error.message);
      return;
    }

    if (messages && messages.length > 0) {
      console.log('✅ Messages table columns:', Object.keys(messages[0]));
    } else {
      console.log('✅ Messages table exists but is empty');
      console.log('Creating sample message structure...');
      
      // Try to understand the structure by attempting a minimal insert
      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          content: 'Test message',
          created_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.log('Required fields for messages:', insertError.message);
      } else {
        console.log('✅ Sample message created:', data);
        // Clean up test message
        if (data && data[0]) {
          await supabase.from('messages').delete().eq('id', data[0].id);
        }
      }
    }
  } catch (error) {
    console.error('❌ Messages check failed:', error);
  }
}

checkMessagesStructure();
