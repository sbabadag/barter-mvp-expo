// Database Connection Test Script
import { supabase, supabaseConfig } from '../src/utils/supabase';

async function testDatabaseConnection() {
  console.log('=== DATABASE CONNECTION TEST ===');
  console.log('Supabase URL:', supabaseConfig.url);
  console.log('Is Placeholder:', supabaseConfig.isPlaceholder);
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('Profiles data:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

// Run the test
testDatabaseConnection();