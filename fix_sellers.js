const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://guvdkdyrmmoyadmapokx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixListings() {
  try {
    console.log('🔧 Updating listings with different seller...');
    
    // Update some listings to have different seller_id
    const { data, error } = await supabase
      .from('listings')
      .update({ seller_id: '96ac9ca4-b166-423b-bca9-6f89160c250d' })
      .neq('seller_id', 'c0c5d546-8608-4341-9919-b87c2c1edafd')
      .limit(10);
    
    if (error) {
      console.log('❌ Error:', error);
    } else {
      console.log('✅ Updated 10 listings with different seller');
    }
    
    // Check current distribution
    const { data: counts } = await supabase
      .from('listings')
      .select('seller_id')
      .not('seller_id', 'is', null);
      
    const myListings = counts.filter(l => l.seller_id === 'c0c5d546-8608-4341-9919-b87c2c1edafd').length;
    const otherListings = counts.filter(l => l.seller_id !== 'c0c5d546-8608-4341-9919-b87c2c1edafd').length;
    
    console.log('📊 Results:');
    console.log('- Your listings:', myListings);
    console.log('- Other seller listings:', otherListings);
    console.log('- Total:', counts.length);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fixListings().then(() => {
  console.log('✅ Done! Now test the rating button on listings with different sellers.');
  process.exit(0);
});
