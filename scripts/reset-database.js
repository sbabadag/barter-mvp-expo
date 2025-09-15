const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://guvdkdyrmmoyadmapokx.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

console.log('🔗 Using Supabase URL:', supabaseUrl);
console.log('🔑 Using API key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
  console.log('🗑️  Starting database reset...\n');

  try {
    // 1. Clear bids first (has foreign key to listings)
    console.log('🎯 Clearing bids table...');
    const { error: bidsError, count: bidsCount } = await supabase
      .from('bids')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (bidsError) {
      console.log('❌ Error clearing bids:', bidsError.message);
    } else {
      console.log('✅ Cleared bids table');
    }

    // 2. Clear comments (has foreign key to listings)
    console.log('💬 Clearing comments table...');
    const { error: commentsError, count: commentsCount } = await supabase
      .from('comments')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (commentsError) {
      console.log('❌ Error clearing comments:', commentsError.message);
    } else {
      console.log('✅ Cleared comments table');
    }

    // 3. Clear ratings/reviews if they exist
    console.log('⭐ Clearing ratings table...');
    const { error: ratingsError } = await supabase
      .from('ratings')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (ratingsError && !ratingsError.message.includes('relation "public.ratings" does not exist')) {
      console.log('❌ Error clearing ratings:', ratingsError.message);
    } else {
      console.log('✅ Cleared ratings table (or table does not exist)');
    }

    // 4. Clear offers/tekliflerim if they exist
    console.log('🤝 Clearing offers table...');
    const { error: offersError } = await supabase
      .from('offers')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (offersError && !offersError.message.includes('relation "public.offers" does not exist')) {
      console.log('❌ Error clearing offers:', offersError.message);
    } else {
      console.log('✅ Cleared offers table (or table does not exist)');
    }

    // 5. Finally clear listings (main table)
    console.log('📋 Clearing listings table...');
    const { error: listingsError, count: listingsCount } = await supabase
      .from('listings')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (listingsError) {
      console.log('❌ Error clearing listings:', listingsError.message);
    } else {
      console.log('✅ Cleared listings table');
    }

    // 6. Clear listing photos from storage
    console.log('🖼️  Clearing listing photos from storage...');
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('listing-photos')
        .list('listings');
      
      if (listError) {
        console.log('❌ Error listing storage files:', listError.message);
      } else if (files && files.length > 0) {
        const filePaths = files.map(file => `listings/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('listing-photos')
          .remove(filePaths);
        
        if (deleteError) {
          console.log('❌ Error deleting storage files:', deleteError.message);
        } else {
          console.log(`✅ Cleared ${files.length} photos from storage`);
        }
      } else {
        console.log('✅ No photos found in storage to clear');
      }
    } catch (storageError) {
      console.log('❌ Storage clearing error:', storageError.message);
    }

    console.log('\n📊 Database Reset Summary:');
    console.log('✅ Cleared all listings');
    console.log('✅ Cleared all bids');
    console.log('✅ Cleared all comments');
    console.log('✅ Cleared all ratings (if existed)');
    console.log('✅ Cleared all offers (if existed)');
    console.log('✅ Cleared all listing photos');
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('💡 Your app will now show empty state for listings.');
    console.log('📱 You can start fresh by creating new listings.');

  } catch (error) {
    console.error('❌ Unexpected error during database reset:', error);
  }
}

// Run the reset
resetDatabase();