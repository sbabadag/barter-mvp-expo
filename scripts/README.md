# Shopping Data Import Scripts

This folder contains scripts to fetch and import shopping data into your Supabase database for testing and development purposes.

## Files

- **`seedDatabase.js`** - Simple Node.js script to populate your database with Turkish marketplace sample data
- **`fetchShoppingData.ts`** - Advanced TypeScript version with external API support (requires ts-node)

## Quick Setup

### 1. Prepare Database

First, make sure your database has the listings table by running the SQL from `sql/complete_setup.sql` in your Supabase SQL editor.

### 2. Set Environment Variables

Make sure your Supabase credentials are set in your environment or update them in the script:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the Script

```bash
# Simple way - use the Node.js script
npm run seed-db

# Or run directly
node scripts/seedDatabase.js
```

## What the Script Does

1. **Generates Sample Data**: Creates 30 realistic Turkish marketplace listings with:
   - Product titles in Turkish
   - Realistic prices in TRY (Turkish Lira)
   - Categories: Elektronik, Ev & Bahçe, Moda & Giyim, Otomobil, etc.
   - Turkish cities as locations
   - Different item conditions (new, like_new, good, fair, poor)
   - Sample images from picsum.photos

2. **Inserts to Database**: Saves all listings to your Supabase `listings` table

3. **Verification**: Shows a summary of imported data and sample listings

## Sample Data Categories

- **Elektronik**: iPhone, MacBook, Samsung TV, Sony headphones, iPad
- **Ev & Bahçe**: Furniture, appliances, home decor
- **Moda & Giyim**: Clothing, shoes, accessories from popular brands
- **Otomobil**: Used cars from various brands and years
- **Hobi & Oyun**: Gaming consoles, board games, toys
- **Spor & Outdoor**: Sports equipment, outdoor gear

## Expected Output

```
🚀 Starting Turkish marketplace data import...

📦 Generating Turkish marketplace listings...
✅ Generated 30 listings

📝 Inserting 30 listings into database...
✅ Inserted batch 1 (10 items)
✅ Inserted batch 2 (10 items)
✅ Inserted batch 3 (10 items)

📊 Import Summary:
✅ Successfully inserted: 30 listings
❌ Failed to insert: 0 listings
🎯 Total processed: 30 listings

🔍 Verifying inserted data...
📋 Sample listings from database:
1. iPhone 14 Pro Max 256GB - 42500 TRY (Elektronik, İstanbul)
2. Vintage Deri Koltuk - 2800 TRY (Ev & Bahçe, Ankara)
...

📈 Listings by category:
- Elektronik: 6 items
- Ev & Bahçe: 5 items
- Moda & Giyim: 7 items
...

🎉 Data import completed!
💡 You can now use this data in your bidding system.
🔗 The listings are available through your Supabase database.
```

## Integration with Your App

After running the script, your listings will be available through:

1. **Main App**: The listings will show up in your app's main page
2. **Bidding System**: Users can bid on these listings
3. **API**: Access via your existing `src/services/listings.ts` service

## Customization

You can modify `seedDatabase.js` to:
- Change the number of listings generated
- Add more product categories
- Adjust price ranges
- Add more Turkish cities
- Include real product data from external APIs

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and anon key
- Make sure RLS policies allow data insertion
- Check if the listings table exists

### Import Errors
- Ensure all required columns exist in your listings table
- Check for data type mismatches
- Verify that RLS policies don't block the insertion

### No Data Showing in App
- Clear your app cache/restart
- Check React Query cache invalidation
- Verify the listings service is fetching from the right table

## Next Steps

1. **Real Data**: Replace sample data with real marketplace data
2. **External APIs**: Integrate with real e-commerce APIs
3. **Image Uploads**: Add real product images
4. **User-Generated**: Allow users to create their own listings
5. **Categories**: Add a proper categories management system

## Notes

- This is temporary code for testing and development
- In production, implement proper authentication and user ownership
- Consider data privacy and terms of service for real marketplace data
- Always backup your database before running import scripts
