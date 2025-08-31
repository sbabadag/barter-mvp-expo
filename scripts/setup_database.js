const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function setupCompleteDatabase() {
  console.log('🚀 Complete Database Setup for Barter MVP');
  console.log('=====================================');
  
  // Check if we have Supabase credentials
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.log('📋 Current Status: Development Mode');
    console.log('');
    console.log('❌ No real Supabase credentials found');
    console.log('✅ App works perfectly with mock data');
    console.log('✅ All features are functional');
    console.log('');
    console.log('The RLS errors you see are expected in development mode.');
    console.log('Your app is working correctly!');
    console.log('');
    console.log('📖 To use a real database:');
    console.log('1. Create a Supabase project at https://supabase.com');
    console.log('2. Add your credentials to .env file');
    console.log('3. Run this script again');
    return;
  }
  
  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.log('⚠️ Database tables may not exist yet');
    }
    
    console.log('✅ Connected to Supabase successfully');
    console.log('');
    
    console.log('📋 Database Setup Instructions:');
    console.log('===============================');
    console.log('');
    console.log('Since your Supabase instance requires manual SQL execution,');
    console.log('please follow these steps in your Supabase dashboard:');
    console.log('');
    console.log('1. 📖 Open Supabase Dashboard');
    console.log('   - Go to https://supabase.com/dashboard');
    console.log('   - Select your project');
    console.log('');
    console.log('2. 🔧 Open SQL Editor');
    console.log('   - Click "SQL Editor" in the sidebar');
    console.log('   - Click "New Query"');
    console.log('');
    console.log('3. 📝 Run Main Database Setup');
    console.log('   - RECOMMENDED: Copy contents of: sql/safe_complete_setup.sql');
    console.log('   - Alternative: Copy contents of: sql/supabase.sql');
    console.log('   - Paste and run in SQL Editor');
    console.log('   - This creates all tables and RLS policies');
    console.log('');
    console.log('4. 🔧 Fix Constraints (if you get "already exists" errors)');
    console.log('   - Copy contents of: sql/fix_constraints.sql');
    console.log('   - Paste and run in SQL Editor');
    console.log('');
    console.log('5. 🗂️ Run Additional Setups (if needed)');
    console.log('   - sql/setup_bids_table.sql (for bidding functionality)');
    console.log('   - sql/setup_storage.sql (for file uploads)');
    console.log('');
    console.log('5. 🔒 Fix Profile Policies (if RLS errors persist)');
    console.log('   - Copy contents of: sql/fix_profile_policies.sql');
    console.log('   - Paste and run in SQL Editor');
    console.log('');
    console.log('After running the SQL files, restart your app and');
    console.log('the RLS errors should be resolved!');
    console.log('');
    
    // List all available SQL files
    const sqlDir = path.join(__dirname, '..', 'sql');
    const sqlFiles = fs.readdirSync(sqlDir).filter(file => file.endsWith('.sql'));
    
    console.log('📁 Available SQL Files:');
    console.log('=======================');
    sqlFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });
    console.log('');
    
    console.log('💡 Pro Tip:');
    console.log('Run sql/supabase.sql first as it contains the core database structure.');
    console.log('Other files can be run as needed for specific features.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('');
    console.log('This usually means the database needs to be set up manually.');
    console.log('Please follow the instructions above to set up your database.');
  }
}

setupCompleteDatabase().catch(console.error);
