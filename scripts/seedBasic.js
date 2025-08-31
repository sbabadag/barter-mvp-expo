/**
 * Simple fallback script for basic listings table
 * Run this if your database doesn't have the extended columns yet
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - using your existing credentials
const SUPABASE_URL = 'https://guvdkdyrmmoyadmapokx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate basic Turkish listings that work with current schema
const generateBasicListings = () => {
  // Simple UUID generator for Node.js
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const sampleProducts = [
    { title: 'iPhone 14 Pro Max 256GB', basePrice: 45000 },
    { title: 'Samsung 55" QLED TV', basePrice: 12000 },
    { title: 'MacBook Air M2', basePrice: 35000 },
    { title: 'Sony WH-1000XM4 Kulaklık', basePrice: 2500 },
    { title: 'iPad Air 5. Nesil', basePrice: 18000 },
    { title: 'Vintage Deri Koltuk', basePrice: 3500 },
    { title: 'Ahşap Yemek Masası', basePrice: 2800 },
    { title: 'Bosch Bulaşık Makinesi', basePrice: 8500 },
    { title: 'Philips Hava Fritözü', basePrice: 1200 },
    { title: 'IKEA Gardırop', basePrice: 1500 },
    { title: 'Zara Erkek Mont', basePrice: 450 },
    { title: 'Nike Air Max Ayakkabı', basePrice: 800 },
    { title: 'H&M Kadın Elbise', basePrice: 200 },
    { title: 'Mango Deri Çanta', basePrice: 650 },
    { title: 'Adidas Eşofman Takımı', basePrice: 400 },
    { title: '2018 Model Honda Civic', basePrice: 420000 },
    { title: 'Volkswagen Golf 2020', basePrice: 550000 },
    { title: 'Toyota Corolla 2019', basePrice: 480000 },
    { title: 'PlayStation 5 Console', basePrice: 12000 },
    { title: 'Nintendo Switch OLED', basePrice: 4500 }
  ];

  const listings = [];

  for (let i = 0; i < 20; i++) {
    const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const finalPrice = Math.round(product.basePrice * (0.8 + Math.random() * 0.4));

    listings.push({
      id: generateUUID(), // Generate proper UUID
      title: product.title,
      description: `${product.title} - İkinci el durumda. Temiz ve bakımlı. Anında teslim. Fiyat pazarlık payı var.`,
      price: finalPrice,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return listings;
};

// Function to insert basic listings
const insertBasicListings = async (listings) => {
  console.log(`📝 Inserting ${listings.length} basic listings...`);

  try {
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('listings')
        .insert(batch.map(listing => ({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          created_at: listing.created_at
        })));

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} items)`);
        successCount += batch.length;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`✅ Successfully inserted: ${successCount} listings`);
    console.log(`❌ Failed to insert: ${errorCount} listings`);

    return { successCount, errorCount };
  } catch (error) {
    console.error('❌ Error during insertion:', error);
    return { successCount: 0, errorCount: listings.length };
  }
};

// Verify data
const verifyBasicData = async () => {
  console.log('\n🔍 Verifying inserted data...');

  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, price')
      .limit(5);

    if (error) {
      console.error('❌ Error verifying data:', error);
      return;
    }

    console.log('📋 Sample listings from database:');
    listings?.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.price} TRY`);
    });

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Starting basic Turkish marketplace data import...\n');

  try {
    console.log('📦 Generating basic Turkish marketplace listings...');
    const listings = generateBasicListings();
    console.log(`✅ Generated ${listings.length} listings`);

    const { successCount, errorCount } = await insertBasicListings(listings);

    if (successCount > 0) {
      await verifyBasicData();
    }

    console.log('\n🎉 Basic data import completed!');
    if (successCount > 0) {
      console.log('💡 Now you can update your database schema and run the full script.');
      console.log('📋 Run sql/fix_listings_table.sql in Supabase SQL Editor for full features.');
    }

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  }
};

main().catch(console.error);
