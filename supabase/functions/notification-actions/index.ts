import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'accept_bid':
        return await handleAcceptBid(supabaseClient, data)
      case 'reject_bid':
        return await handleRejectBid(supabaseClient, data)
      case 'counter_bid':
        return await handleCounterBid(supabaseClient, data)
      case 'send_message':
        return await handleSendMessage(supabaseClient, data)
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Notification action error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAcceptBid(supabase: any, data: any) {
  const { bidId, userId } = data

  // Verify user owns the listing
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select(`
      id,
      amount,
      bidder_id,
      listing:listings(id, title, seller_id)
    `)
    .eq('id', bidId)
    .single()

  if (bidError || !bid) {
    throw new Error('Bid not found')
  }

  if (bid.listing.seller_id !== userId) {
    throw new Error('Unauthorized')
  }

  // Accept the bid
  const { error: updateError } = await supabase
    .from('bids')
    .update({ 
      status: 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('id', bidId)

  if (updateError) {
    throw new Error('Failed to accept bid')
  }

  // Mark listing as sold
  const { error: listingError } = await supabase
    .from('listings')
    .update({ 
      status: 'sold',
      final_price: bid.amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', bid.listing.id)

  if (listingError) {
    console.error('Failed to update listing status:', listingError)
  }

  // Reject all other pending bids for this listing
  const { error: rejectError } = await supabase
    .from('bids')
    .update({ 
      status: 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('listing_id', bid.listing.id)
    .neq('id', bidId)
    .eq('status', 'pending')

  if (rejectError) {
    console.error('Failed to reject other bids:', rejectError)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Bid accepted successfully',
      bidId: bidId,
      listingTitle: bid.listing.title
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleRejectBid(supabase: any, data: any) {
  const { bidId, userId } = data

  // Verify user owns the listing
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select(`
      id,
      bidder_id,
      listing:listings(id, title, seller_id)
    `)
    .eq('id', bidId)
    .single()

  if (bidError || !bid) {
    throw new Error('Bid not found')
  }

  if (bid.listing.seller_id !== userId) {
    throw new Error('Unauthorized')
  }

  // Reject the bid
  const { error: updateError } = await supabase
    .from('bids')
    .update({ 
      status: 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('id', bidId)

  if (updateError) {
    throw new Error('Failed to reject bid')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Bid rejected successfully',
      bidId: bidId,
      listingTitle: bid.listing.title
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleCounterBid(supabase: any, data: any) {
  const { bidId, userId, counterAmount, message } = data

  // Verify user owns the listing
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select(`
      id,
      amount,
      bidder_id,
      listing:listings(id, title, seller_id)
    `)
    .eq('id', bidId)
    .single()

  if (bidError || !bid) {
    throw new Error('Bid not found')
  }

  if (bid.listing.seller_id !== userId) {
    throw new Error('Unauthorized')
  }

  // Update bid with counter offer
  const { error: updateError } = await supabase
    .from('bids')
    .update({ 
      status: 'countered',
      counter_offer_amount: counterAmount,
      counter_offer_message: message,
      updated_at: new Date().toISOString()
    })
    .eq('id', bidId)

  if (updateError) {
    throw new Error('Failed to create counter offer')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Counter offer sent successfully',
      bidId: bidId,
      counterAmount: counterAmount,
      listingTitle: bid.listing.title
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleSendMessage(supabase: any, data: any) {
  const { senderId, receiverId, listingId, message, replyToNotificationId } = data

  // Insert message
  const { data: newMessage, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      listing_id: listingId,
      message: message,
      message_type: 'text',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (messageError) {
    throw new Error('Failed to send message')
  }

  // Mark the notification as read if it was a reply
  if (replyToNotificationId) {
    await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', replyToNotificationId)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: newMessage.id
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}