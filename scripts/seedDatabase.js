/**
 * Simple Node.js script to fetch shopping data and populate database
 * Run with: node scripts/seedDatabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://guvdkdyrmmoyadmapokx.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Turkish marketplace sample data generator
const generateTurkishListings = () => {
  const categories = [
    'Elektronik', 'Ev & Bahçe', 'Moda & Giyim', 'Otomobil', 'Emlak',
    'Hobi & Oyun', 'Spor & Outdoor', 'Kitap & Müzik', 'Bebek & Çocuk', 'Antika & Sanat'
  ];

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Gaziantep',
    'Konya', 'Kayseri', 'Mersin', 'Eskişehir', 'Trabzon', 'Adana'
  ];

  const conditions = ['new', 'like_new', 'good', 'fair', 'poor'];

  // Simple UUID generator for Node.js
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const sampleProducts = [
    { title: 'iPhone 14 Pro Max 256GB', category: 'Elektronik', basePrice: 45000 },
    { title: 'Samsung 55" QLED TV', category: 'Elektronik', basePrice: 12000 },
    { title: 'MacBook Air M2', category: 'Elektronik', basePrice: 35000 },
    { title: 'Sony WH-1000XM4 Kulaklık', category: 'Elektronik', basePrice: 2500 },
    { title: 'iPad Air 5. Nesil', category: 'Elektronik', basePrice: 18000 },
    
    { title: 'Vintage Deri Koltuk', category: 'Ev & Bahçe', basePrice: 3500 },
    { title: 'Ahşap Yemek Masası', category: 'Ev & Bahçe', basePrice: 2800 },
    { title: 'Bosch Bulaşık Makinesi', category: 'Ev & Bahçe', basePrice: 8500 },
    { title: 'Philips Hava Fritözü', category: 'Ev & Bahçe', basePrice: 1200 },
    { title: 'IKEA Gardırop', category: 'Ev & Bahçe', basePrice: 1500 },
    
    { title: 'Zara Erkek Mont', category: 'Moda & Giyim', basePrice: 450 },
    { title: 'Nike Air Max Ayakkabı', category: 'Moda & Giyim', basePrice: 800 },
    { title: 'H&M Kadın Elbise', category: 'Moda & Giyim', basePrice: 200 },
    { title: 'Mango Deri Çanta', category: 'Moda & Giyim', basePrice: 650 },
    { title: 'Adidas Eşofman Takımı', category: 'Moda & Giyim', basePrice: 400 },
    
    { title: '2018 Model Honda Civic', category: 'Otomobil', basePrice: 420000 },
    { title: 'Volkswagen Golf 2020', category: 'Otomobil', basePrice: 550000 },
    { title: 'Toyota Corolla 2019', category: 'Otomobil', basePrice: 480000 },
    { title: 'BMW 3 Serisi 2017', category: 'Otomobil', basePrice: 650000 },
    { title: 'Renault Clio 2021', category: 'Otomobil', basePrice: 380000 },
    
    { title: 'PlayStation 5 Console', category: 'Hobi & Oyun', basePrice: 12000 },
    { title: 'Nintendo Switch OLED', category: 'Hobi & Oyun', basePrice: 4500 },
    { title: 'Xbox Series X', category: 'Hobi & Oyun', basePrice: 11000 },
    { title: 'Monopoly Türkiye Edisyonu', category: 'Hobi & Oyun', basePrice: 150 },
    { title: 'Lego Creator Set', category: 'Hobi & Oyun', basePrice: 800 },
    
    { title: 'Decathlon Bisiklet', category: 'Spor & Outdoor', basePrice: 2200 },
    { title: 'Yoga Matı ve Aksesuarları', category: 'Spor & Outdoor', basePrice: 300 },
    { title: 'Kamp Çadırı 4 Kişilik', category: 'Spor & Outdoor', basePrice: 1200 },
    { title: 'Fitness Dumbell Set', category: 'Spor & Outdoor', basePrice: 450 },
    { title: 'Trekking Ayakkabısı', category: 'Spor & Outdoor', basePrice: 600 }
  ];

  const listings = [];

  for (let i = 0; i < 30; i++) {
    const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    // Adjust price based on condition
    let priceMultiplier = 1;
    switch (condition) {
      case 'new': priceMultiplier = 1; break;
      case 'like_new': priceMultiplier = 0.85; break;
      case 'good': priceMultiplier = 0.7; break;
      case 'fair': priceMultiplier = 0.55; break;
      case 'poor': priceMultiplier = 0.4; break;
    }

    const finalPrice = Math.round(product.basePrice * priceMultiplier * (0.8 + Math.random() * 0.4));

    listings.push({
      id: generateUUID(), // Generate proper UUID instead of string
      title: product.title,
      description: `${product.title} - ${condition === 'new' ? 'Sıfır' : 'İkinci el'} durumda. ${city} lokasyonunda satılık. Temiz ve bakımlı. Anında teslim.`,
      price: finalPrice,
      currency: 'TRY',
      category: product.category,
      location: city,
      images: [
        `https://picsum.photos/800/600?random=${i}`,
        `https://picsum.photos/800/600?random=${i + 100}`,
        `https://picsum.photos/800/600?random=${i + 200}`
      ],
      seller_name: `Satıcı ${Math.floor(Math.random() * 1000)}`,
      condition,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return listings;
};

// Function to create listings table if it doesn't exist
const createListingsTable = async () => {
  console.log('🔧 Creating listings table...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
      currency TEXT DEFAULT 'TRY',
      category TEXT,
      location TEXT,
      images JSONB DEFAULT '[]',
      seller_name TEXT,
      condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
    CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
    CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
    CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);

    -- Enable Row Level Security
    ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for listings
    DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
    DROP POLICY IF EXISTS "Users can insert listings" ON public.listings;
    DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;

    -- Everyone can view active listings
    CREATE POLICY "Listings are viewable by everyone" ON public.listings
        FOR SELECT USING (status = 'active');

    -- For now, allow anyone to insert listings (in production, restrict to authenticated users)
    CREATE POLICY "Users can insert listings" ON public.listings
        FOR INSERT WITH CHECK (true);

    -- Users can update listings (in production, restrict to listing owners)
    CREATE POLICY "Users can update their own listings" ON public.listings
        FOR UPDATE USING (true)
        WITH CHECK (true);

    -- Add updated_at trigger
    DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
    CREATE TRIGGER update_listings_updated_at 
        BEFORE UPDATE ON public.listings 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Add helpful comments
    COMMENT ON TABLE public.listings IS 'Marketplace listings for products and services';
    COMMENT ON COLUMN public.listings.price IS 'Price in the specified currency';
    COMMENT ON COLUMN public.listings.images IS 'Array of image URLs in JSON format';
    COMMENT ON COLUMN public.listings.condition IS 'Condition of the item: new, like_new, good, fair, poor';
  `;

  try {
    // Since we can't use rpc directly, we'll create the table using raw SQL
    // This might need to be run manually in Supabase SQL editor first
    console.log('⚠️ Please run the following SQL in your Supabase SQL editor first:');
    console.log(createTableSQL);
    return true;
  } catch (error) {
    console.error('❌ Error creating listings table:', error);
    return false;
  }
};

// Function to insert listings into database
const insertListings = async (listings) => {
  console.log(`📝 Inserting ${listings.length} listings into database...`);

  try {
    // Insert listings in batches of 10
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
          currency: listing.currency,
          category: listing.category,
          location: listing.location,
          images: listing.images,
          seller_name: listing.seller_name,
          condition: listing.condition,
          created_at: listing.created_at
        })));

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} items)`);
        successCount += batch.length;
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`✅ Successfully inserted: ${successCount} listings`);
    console.log(`❌ Failed to insert: ${errorCount} listings`);
    console.log(`🎯 Total processed: ${listings.length} listings`);

    return { successCount, errorCount };
  } catch (error) {
    console.error('❌ Error during insertion:', error);
    return { successCount: 0, errorCount: listings.length };
  }
};

// Function to verify data
const verifyData = async () => {
  console.log('\n🔍 Verifying inserted data...');

  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, price, category, location')
      .limit(5);

    if (error) {
      console.error('❌ Error verifying data:', error);
      return;
    }

    console.log('📋 Sample listings from database:');
    listings?.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.price} TRY (${listing.category}, ${listing.location})`);
    });

    // Get count by category
    const { data: categoryStats, error: statsError } = await supabase
      .from('listings')
      .select('category')
      .eq('status', 'active');

    if (!statsError && categoryStats) {
      const categoryCounts = categoryStats.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 Listings by category:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`- ${category}: ${count} items`);
      });
    }

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
};

// Main execution function
const main = async () => {
  console.log('🚀 Starting Turkish marketplace data import...\n');

  try {
    // Step 1: Create listings table (reminder to run SQL manually)
    console.log('📋 Note: Please ensure the listings table exists in your Supabase database.');
    console.log('💡 You can create it by running the SQL from the complete_setup.sql file.\n');

    // Step 2: Generate Turkish marketplace data
    console.log('📦 Generating Turkish marketplace listings...');
    const listings = generateTurkishListings();
    console.log(`✅ Generated ${listings.length} listings`);

    // Step 3: Insert data into database
    const { successCount, errorCount } = await insertListings(listings);

    // Step 4: Verify data
    if (successCount > 0) {
      await verifyData();
    }

    console.log('\n🎉 Data import completed!');
    console.log('💡 You can now use this data in your bidding system.');
    console.log('🔗 The listings are available through your Supabase database.');
    console.log('\n📱 Try accessing these listings in your app at the main listings page!');

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  }
};

// Run the main function
main().catch(console.error);
