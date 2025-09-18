import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string
  title: string
  body: string
  data?: any
  fcm_token?: string
  expo_token?: string
}

interface ExpoMessage {
  to: string
  title: string
  body: string
  data?: any
  sound?: string
  badge?: number
  channelId?: string
}

interface FCMMessage {
  token: string
  notification: {
    title: string
    body: string
  }
  data?: Record<string, string>
  android?: {
    channel_id?: string
    priority?: string
    notification?: {
      sound?: string
      channel_id?: string
    }
  }
  apns?: {
    payload?: {
      aps?: {
        sound?: string
        badge?: number
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: NotificationPayload = await req.json()
    const { user_id, title, body, data, fcm_token, expo_token } = payload

    console.log('📱 Processing notification for user:', user_id)
    console.log('📱 Notification content:', { title, body, data })

    const results = []

    // Send via Firebase FCM if token available
    if (fcm_token) {
      try {
        const fcmMessage: FCMMessage = {
          token: fcm_token,
          notification: { title, body },
          data: data ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          ) : {},
          android: {
            channel_id: getChannelId(data?.type),
            priority: 'high',
            notification: {
              sound: 'default',
              channel_id: getChannelId(data?.type)
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1
              }
            }
          }
        }

        const fcmResponse = await sendFCMNotification(fcmMessage)
        results.push({ method: 'FCM', success: fcmResponse.success, details: fcmResponse })
        console.log('🔥 FCM notification result:', fcmResponse)
      } catch (error) {
        console.error('❌ FCM notification failed:', error)
        results.push({ method: 'FCM', success: false, error: error.message })
      }
    }

    // Send via Expo Push if token available (fallback or alternative)
    if (expo_token) {
      try {
        const expoMessage: ExpoMessage = {
          to: expo_token,
          title,
          body,
          data,
          sound: 'default',
          channelId: getChannelId(data?.type)
        }

        const expoResponse = await sendExpoNotification(expoMessage)
        results.push({ method: 'Expo', success: expoResponse.success, details: expoResponse })
        console.log('📱 Expo notification result:', expoResponse)
      } catch (error) {
        console.error('❌ Expo notification failed:', error)
        results.push({ method: 'Expo', success: false, error: error.message })
      }
    }

    if (results.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'No valid push tokens provided',
        user_id 
      }, { 
        status: 400,
        headers: corsHeaders 
      })
    }

    const hasSuccess = results.some(r => r.success)
    
    return Response.json({
      success: hasSuccess,
      user_id,
      results,
      sent_at: new Date().toISOString()
    }, { 
      status: hasSuccess ? 200 : 500,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('❌ Notification webhook error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500,
      headers: corsHeaders 
    })
  }
})

function getChannelId(notificationType?: string): string {
  switch (notificationType) {
    case 'new_bid':
    case 'bid_accepted':
    case 'bid_rejected':
    case 'bid_countered':
      return 'bids'
    case 'new_message':
      return 'messages'
    case 'listing_sold':
    case 'listing_expired':
      return 'listings'
    default:
      return 'general'
  }
}

async function sendFCMNotification(message: FCMMessage) {
  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')
  
  if (!FCM_SERVER_KEY) {
    throw new Error('FCM_SERVER_KEY environment variable not set')
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: message.token,
      priority: 'high',
      notification: message.notification,
      data: message.data,
      android: message.android,
      apns: message.apns
    })
  })

  const result = await response.json()
  
  return {
    success: response.ok && result.success === 1,
    status: response.status,
    result
  }
}

async function sendExpoNotification(message: ExpoMessage) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  })

  const result = await response.json()
  
  return {
    success: response.ok && !result.errors,
    status: response.status,
    result
  }
}

/* How to use this function:

1. Deploy to Supabase Edge Functions:
   supabase functions deploy send-push-notification

2. Set environment variable:
   supabase secrets set FCM_SERVER_KEY=your_fcm_server_key

3. Call from your app or database trigger:
   
   -- From SQL trigger:
   SELECT net.http_post(
     url := 'https://your-project.supabase.co/functions/v1/send-push-notification',
     headers := '{"Authorization": "Bearer your-anon-key", "Content-Type": "application/json"}',
     body := jsonb_build_object(
       'user_id', 'user-uuid',
       'title', 'New Bid!',
       'body', 'You received a bid',
       'data', jsonb_build_object('type', 'new_bid', 'bid_id', 'bid-uuid'),
       'fcm_token', 'user-fcm-token',
       'expo_token', 'user-expo-token'
     )::text
   );

   -- From TypeScript:
   const { data } = await supabase.functions.invoke('send-push-notification', {
     body: {
       user_id: 'user-uuid',
       title: 'New Bid!',
       body: 'You received a bid',
       data: { type: 'new_bid', bid_id: 'bid-uuid' },
       fcm_token: 'user-fcm-token',
       expo_token: 'user-expo-token'
     }
   })
*/