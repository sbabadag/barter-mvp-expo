const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRatings() {
  console.log('🔍 Checking rating data consistency...\n');

  try {
    // Check user rating stats
    const { data: stats, error: statsError } = await supabase
      .from('user_rating_stats')
      .select('*')
      .limit(5);

    if (statsError) {
      console.error('Stats error:', statsError);
      return;
    }

    console.log('📊 User Rating Stats:');
    if (stats && stats.length > 0) {
      stats.forEach(stat => {
        console.log(`User: ${stat.user_id}`);
        console.log(`  Overall: ${stat.average_rating} (${stat.total_reviews} reviews)`);
        console.log(`  Seller: ${stat.seller_average_rating} (${stat.seller_total_reviews} reviews)`);
        console.log(`  Buyer: ${stat.buyer_average_rating} (${stat.buyer_total_reviews} reviews)`);
        console.log('---');
      });
    } else {
      console.log('No rating stats found');
    }

    // Check individual ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select(`
        id,
        rating,
        communication_rating,
        item_condition_rating,
        delivery_rating,
        transaction_type,
        reviewer:profiles!ratings_reviewer_id_fkey(display_name),
        reviewed_user:profiles!ratings_reviewed_user_id_fkey(display_name)
      `)
      .limit(5);

    if (ratingsError) {
      console.error('Ratings error:', ratingsError);
      return;
    }

    console.log('\n⭐ Individual Ratings:');
    if (ratings && ratings.length > 0) {
      ratings.forEach(rating => {
        const reviewer = Array.isArray(rating.reviewer) ? rating.reviewer[0] : rating.reviewer;
        const reviewed = Array.isArray(rating.reviewed_user) ? rating.reviewed_user[0] : rating.reviewed_user;
        
        console.log(`Rating ID: ${rating.id}`);
        console.log(`  From: ${reviewer?.display_name || 'Unknown'}`);
        console.log(`  To: ${reviewed?.display_name || 'Unknown'}`);
        console.log(`  Type: ${rating.transaction_type}`);
        console.log(`  Overall: ${rating.rating}/5`);
        console.log(`  Communication: ${rating.communication_rating}/5`);
        console.log(`  Item Condition: ${rating.item_condition_rating}/5`);
        console.log(`  Delivery: ${rating.delivery_rating}/5`);
        console.log('---');
      });
    } else {
      console.log('No individual ratings found');
    }

    // Check if averages are calculated correctly
    const { data: manualCalc } = await supabase
      .from('ratings')
      .select('reviewed_user_id, rating, transaction_type');

    if (manualCalc) {
      console.log('\n🧮 Manual Average Calculation:');
      const userRatings = {};
      
      manualCalc.forEach(rating => {
        if (!userRatings[rating.reviewed_user_id]) {
          userRatings[rating.reviewed_user_id] = {
            all: [],
            seller: [],
            buyer: []
          };
        }
        userRatings[rating.reviewed_user_id].all.push(rating.rating);
        userRatings[rating.reviewed_user_id][rating.transaction_type].push(rating.rating);
      });

      Object.entries(userRatings).forEach(([userId, data]) => {
        const overallAvg = data.all.reduce((a, b) => a + b, 0) / data.all.length;
        const sellerAvg = data.seller.length > 0 ? data.seller.reduce((a, b) => a + b, 0) / data.seller.length : 0;
        const buyerAvg = data.buyer.length > 0 ? data.buyer.reduce((a, b) => a + b, 0) / data.buyer.length : 0;
        
        console.log(`User ${userId}:`);
        console.log(`  Manual Overall: ${overallAvg.toFixed(2)} (${data.all.length} ratings)`);
        console.log(`  Manual Seller: ${sellerAvg.toFixed(2)} (${data.seller.length} ratings)`);
        console.log(`  Manual Buyer: ${buyerAvg.toFixed(2)} (${data.buyer.length} ratings)`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRatings();
