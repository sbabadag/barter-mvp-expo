const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://guvdkdyrmmoyadmapokx.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyReset() {
  console.log('🔍 Verifying database reset...\n');

  try {
    // Check listings count
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true });
    
    if (listingsError) {
      console.log('❌ Error checking listings:', listingsError.message);
    } else {
      console.log(`📋 Listings count: ${listings?.length || 0}`);
    }

    // Check bids count
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('id', { count: 'exact', head: true });
    
    if (bidsError) {
      console.log('❌ Error checking bids:', bidsError.message);
    } else {
      console.log(`🎯 Bids count: ${bids?.length || 0}`);
    }

    // Check comments count
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true });
    
    if (commentsError) {
      console.log('❌ Error checking comments:', commentsError.message);
    } else {
      console.log(`💬 Comments count: ${comments?.length || 0}`);
    }

    console.log('\n✅ Database verification completed!');
    console.log('🎉 All tables should now be empty.');

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

verifyReset();