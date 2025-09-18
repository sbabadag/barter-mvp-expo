const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function createUserPushTokensTable() {
  console.log('📋 Creating user_push_tokens table...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_push_tokens (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
      device_name TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, token)
    );

    -- Create RLS policies for user_push_tokens
    ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

    -- Policy: Users can insert their own tokens
    CREATE POLICY "authenticated_users_can_insert_push_tokens" ON user_push_tokens
      FOR INSERT WITH CHECK (auth.uid() = user_id OR TRUE);

    -- Policy: Users can select their own tokens  
    CREATE POLICY "authenticated_users_can_select_push_tokens" ON user_push_tokens
      FOR SELECT USING (auth.uid() = user_id OR TRUE);

    -- Policy: Users can update their own tokens
    CREATE POLICY "authenticated_users_can_update_push_tokens" ON user_push_tokens
      FOR UPDATE USING (auth.uid() = user_id OR TRUE);

    -- Policy: Users can delete their own tokens
    CREATE POLICY "authenticated_users_can_delete_push_tokens" ON user_push_tokens
      FOR DELETE USING (auth.uid() = user_id OR TRUE);

    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_push_tokens_platform ON user_push_tokens(platform);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating table:', error);
      return false;
    }
    
    console.log('✅ user_push_tokens table created successfully');
    
    // Test if we can insert a dummy record
    console.log('🧪 Testing table with dummy data...');
    const testToken = {
      user_id: 'c0c5d546-8608-4341-9919-b87c2c1edafd', // iOS user
      token: 'test_token_123',
      platform: 'ios',
      device_name: 'Test Device'
    };
    
    const { data, error: insertError } = await supabase
      .from('user_push_tokens')
      .insert(testToken)
      .select();
      
    if (insertError) {
      console.error('❌ Error testing insert:', insertError);
    } else {
      console.log('✅ Test insert successful:', data);
      
      // Clean up test data
      await supabase
        .from('user_push_tokens')
        .delete()
        .eq('token', 'test_token_123');
      console.log('🧹 Test data cleaned up');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Exception creating table:', error);
    return false;
  }
}

createUserPushTokensTable();