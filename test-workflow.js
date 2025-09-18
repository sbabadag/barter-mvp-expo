// Test end-to-end push notification workflow
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://guvdkdyrmmoyadmapokx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmRrZHlybW1veWFkbWFwb2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzQ3ODcsImV4cCI6MjA3MjA1MDc4N30.im804Kl-WJ3s_6HLt0oXHJ66ROeClPy-EGXAg46LwVg'
);

async function testFullWorkflow() {
  try {
    console.log('🔄 Testing full push notification workflow...');
    
    // Skip authentication for now and just create bid directly
    console.log('⚠️  Skipping authentication, creating bid directly...');
    
    // Find a listing to bid on (seller has push token)
    const sellerId = 'c0c5d546-8608-4341-9919-b87c2c1edafd'; // User with push token (seller)
    const bidderId = 'f60082e2-4ca5-4534-a682-a30a7b039af9'; // Different user (bidder)
    
    // First, let's check if we need to create a listing for the seller
    let { data: listings, error: listingError } = await supabase
      .from('listings')
      .select('id, title, seller_id')
      .eq('seller_id', sellerId)
      .limit(1);
      
    if (listingError) {
      console.error('❌ Error fetching listings:', listingError);
      return;
    }
    
    if (!listings || listings.length === 0) {
      console.log('📝 Creating test listing for seller with push token...');
      
      const { data: newListing, error: createError } = await supabase
        .from('listings')
        .insert({
          id: `test_listing_push_${Date.now()}`,
          title: 'Test Listing for Push Notifications',
          description: 'This listing is for testing push notifications',
          price: 100,
          category: 'electronics',
          seller_id: sellerId,
          status: 'active',
          city: 'İzmir',
          postal_code: '35000'
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating listing:', createError);
        return;
      }
      
      listings = [newListing];
      console.log('✅ Created test listing:', newListing.id);
    }
    
    const listing = listings[0];
    console.log(`📋 Found listing: "${listing.title}" (${listing.id})`);
    
    // Create a bid
    const bidAmount = Math.floor(Math.random() * 100) + 50;
    const bidId = `bid_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    console.log(`💰 Creating bid: ${bidAmount} TL`);
    
    const { data: bidData, error: bidError } = await supabase
      .from('bids')
      .insert({
        id: bidId,
        listing_id: listing.id,
        bidder_id: bidderId,
        amount: bidAmount,
        message: 'Test push notification workflow bid',
        status: 'pending'
      })
      .select()
      .single();
      
    if (bidError) {
      console.error('❌ Error creating bid:', bidError);
      return;
    }
    
    console.log('✅ Bid created successfully:', bidData.id);
    
    // Wait a moment for any triggers to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if notification was created
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', sellerId)
      .eq('type', 'new_bid')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (notifError) {
      console.error('❌ Error checking notifications:', notifError);
      return;
    }
    
    if (notifications && notifications.length > 0) {
      const notification = notifications[0];
      console.log('📧 Notification created:', notification.title);
      console.log('📝 Body:', notification.body);
      
      // Now manually trigger push notification (since our trigger might not be set up)
      const { data: tokens, error: tokenError } = await supabase
        .from('user_push_tokens')
        .select('token')
        .eq('user_id', sellerId)
        .eq('is_active', true);
        
      if (tokenError || !tokens || tokens.length === 0) {
        console.log('❌ No push tokens found for seller');
        return;
      }
      
      console.log(`📱 Sending push notification to ${tokens.length} devices...`);
      
      for (const tokenData of tokens) {
        const message = {
          to: tokenData.token,
          sound: 'default',
          title: notification.title,
          body: notification.body,
          data: notification.data || {}
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();
        
        if (result.data && result.data.status === 'ok') {
          console.log('✅ Push notification sent to device!');
          console.log('📨 Receipt ID:', result.data.id);
          console.log('🎉 Check your iOS device notification center!');
        } else {
          console.error('❌ Push failed:', result);
        }
      }
    } else {
      console.log('❌ No notification was created');
    }
    
  } catch (error) {
    console.error('❌ Error in workflow test:', error);
  }
}

testFullWorkflow();