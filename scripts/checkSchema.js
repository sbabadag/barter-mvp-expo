/**
 * Diagnostic script to check your current database schema
 * Run with: node scripts/checkSchema.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - using your existing credentials
const SUPABASE_URL = 'https://guvdkdyrmmoyadmapokx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const checkSchema = async () => {
  console.log('🔍 Checking your current database schema...\n');

  try {
    // Try to get a sample record to see what columns exist
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error checking listings table:', error);
      
      // Try to check if table exists at all
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'listings');

      if (tableError || !tables || tables.length === 0) {
        console.log('📋 The listings table does not exist yet.');
        console.log('💡 You need to run the SQL from sql/complete_setup.sql first.');
        return;
      }
    }

    if (data && data.length > 0) {
      console.log('✅ Listings table exists with sample data:');
      console.log('📋 Current columns:', Object.keys(data[0]));
      console.log('📄 Sample record:', data[0]);
    } else {
      // Try a test insert to see what columns are expected
      console.log('📋 Table exists but is empty. Testing column structure...');
      
      // Generate a test UUID
      const testUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      // Try basic insert first
      const { data: insertData, error: insertError } = await supabase
        .from('listings')
        .insert({
          id: testUUID,
          title: 'Test Listing',
          description: 'Test description',
          price: 100
        })
        .select();

      if (insertError) {
        console.log('❌ Basic insert failed:', insertError.message);
        
        // If it fails because of missing columns, let's check what's expected
        if (insertError.code === 'PGRST204') {
          console.log('💡 Some columns are missing from your table schema.');
          console.log('🔧 You need to add the missing columns using the SQL fix script.');
        }
      } else {
        console.log('✅ Basic insert successful!');
        console.log('📋 Your table supports these basic columns: id, title, description, price');
        
        // Clean up test record
        await supabase.from('listings').delete().eq('id', testUUID);
        console.log('🧹 Test record cleaned up.');
      }
    }

    // Check what tables exist
    console.log('\n📊 Database summary:');
    
    const { data: allTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (allTables) {
      console.log('📋 Available tables:', allTables.map(t => t.table_name).join(', '));
    }

  } catch (error) {
    console.error('❌ Error during schema check:', error);
  }
};

checkSchema().catch(console.error);
