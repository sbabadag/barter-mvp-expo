const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
require('dotenv').config();

async function fixDatabase() {
  console.log('🔧 Fixing database relationships...');
  
  // Check if we have Supabase credentials
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found. Make sure your .env file is configured.');
    console.log('The app will continue to work in mock mode.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // First, let's check if the bids table exists
    console.log('📋 Checking if bids table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'bids');
    
    if (tablesError) {
      console.log('⚠️ Could not check tables:', tablesError.message);
      console.log('Using direct SQL approach...');
    }
    
    // Read and execute the bids table setup SQL
    const sqlPath = path.join(__dirname, '..', 'sql', 'setup_bids_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔨 Creating/updating bids table...');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log('📝 Executing:', trimmedStatement.substring(0, 60) + '...');
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: trimmedStatement + ';' 
        });
        
        if (error) {
          console.log(`⚠️ SQL execution warning: ${error.message}`);
          // Continue with other statements even if one fails
        }
      }
    }
    
    console.log('✅ Database setup completed');
    
    // Test the relationship
    console.log('🔍 Testing bids-listings relationship...');
    const { data: testData, error: testError } = await supabase
      .from('bids')
      .select('*, listings(*)')
      .limit(1);
    
    if (testError) {
      console.log('❌ Relationship test failed:', testError.message);
      console.log('The app will fallback to mock mode.');
    } else {
      console.log('✅ Database relationship is working correctly!');
    }
    
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    console.log('The app will continue to work in mock mode.');
  }
}

fixDatabase().catch(console.error);
