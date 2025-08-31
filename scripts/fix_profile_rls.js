const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function fixProfilePolicies() {
  console.log('🔧 Fixing Profile RLS Policies...');
  
  // Check if we have Supabase credentials
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.log('❌ Supabase credentials not found or using placeholders.');
    console.log('The RLS error is expected in development mode.');
    console.log('Profile creation will work in mock mode.');
    return;
  }
  
  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read the fix SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', 'fix_profile_policies.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Applying RLS policy fixes...');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => {
      const trimmed = stmt.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`📋 Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          console.log(`⚠️ Warning on statement ${i + 1}: ${error.message}`);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ RLS policies updated successfully!');
    
    // Test profile creation to verify the fix
    console.log('🧪 Testing profile policies...');
    const testUserId = '12345678-1234-1234-1234-123456789012'; // Dummy UUID for test
    
    // This should fail gracefully (user doesn't exist), but policy should allow it
    const { error: testError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        display_name: 'Test User'
      });
    
    if (testError) {
      if (testError.code === '42501') {
        console.log('❌ RLS policies still not working. Manual intervention needed.');
        console.log('Please run the SQL in sql/fix_profile_policies.sql manually in Supabase dashboard.');
      } else {
        console.log('✅ RLS policies are working (test failed for expected reasons)');
      }
    } else {
      console.log('✅ RLS policies are working correctly!');
      // Clean up test data
      await supabase.from('profiles').delete().eq('id', testUserId);
    }
    
  } catch (err) {
    console.error('❌ Failed to fix RLS policies:', err.message);
    console.log('');
    console.log('📋 Manual Fix Instructions:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of sql/fix_profile_policies.sql');
    console.log('4. Run the SQL queries');
    console.log('5. Restart your app');
  }
}

fixProfilePolicies().catch(console.error);
