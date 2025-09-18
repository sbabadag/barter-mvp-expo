-- Complete Notification System Setup for ESKICI App
-- This file creates database triggers, functions, and tables for automatic notifications

-- Drop existing notification objects if they exist
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_notification_settings CASCADE;
DROP FUNCTION IF EXISTS notify_new_bid() CASCADE;
DROP FUNCTION IF EXISTS notify_bid_response() CASCADE;
DROP FUNCTION IF EXISTS notify_new_message() CASCADE;
DROP FUNCTION IF EXISTS notify_listing_sold() CASCADE;
DROP TRIGGER IF EXISTS trigger_notify_new_bid ON public.bids;
DROP TRIGGER IF EXISTS trigger_notify_bid_response ON public.bids;

-- Create notifications table to store all notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_bid', 'bid_accepted', 'bid_rejected', 'bid_countered', 'new_message', 'listing_sold', 'listing_expired', 'reminder')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Notification metadata
    read BOOLEAN DEFAULT FALSE,
    sent BOOLEAN DEFAULT FALSE,
    delivery_method VARCHAR(20) DEFAULT 'push' CHECK (delivery_method IN ('push', 'email', 'sms', 'in_app')),
    
    -- Related entities
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE,
    message_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_related_entity CHECK (
        (type = 'new_bid' AND bid_id IS NOT NULL) OR
        (type IN ('bid_accepted', 'bid_rejected', 'bid_countered') AND bid_id IS NOT NULL) OR
        (type = 'new_message' AND message_id IS NOT NULL) OR
        (type IN ('listing_sold', 'listing_expired') AND listing_id IS NOT NULL) OR
        (type = 'reminder')
    )
);

-- Create user notification settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Push notification settings
    push_enabled BOOLEAN DEFAULT TRUE,
    push_new_bids BOOLEAN DEFAULT TRUE,
    push_bid_responses BOOLEAN DEFAULT TRUE,
    push_new_messages BOOLEAN DEFAULT TRUE,
    push_listing_updates BOOLEAN DEFAULT TRUE,
    
    -- Email notification settings
    email_enabled BOOLEAN DEFAULT FALSE,
    email_new_bids BOOLEAN DEFAULT FALSE,
    email_bid_responses BOOLEAN DEFAULT TRUE,
    email_weekly_summary BOOLEAN DEFAULT FALSE,
    
    -- Timing preferences
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification queue table for async push delivery
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    webhook_payload JSONB NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    succeeded BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add push token columns to the user metadata (handled via auth.users metadata)
-- Note: Tokens will be stored in auth.users.raw_user_meta_data as:
-- {"fcm_token": "...", "expo_token": "..."}
-- This requires updating tokens when they change in the app

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON public.notifications(sent);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON public.notifications(scheduled_for);

-- Notification queue indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_notification_id ON public.notification_queue(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_succeeded ON public.notification_queue(succeeded);
CREATE INDEX IF NOT EXISTS idx_notification_queue_attempts ON public.notification_queue(attempts);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON public.notification_queue(created_at);

-- Function to create notification and trigger push delivery
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}',
    p_listing_id UUID DEFAULT NULL,
    p_bid_id UUID DEFAULT NULL,
    p_message_id UUID DEFAULT NULL,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    user_settings RECORD;
    user_tokens RECORD;
    webhook_payload JSONB;
    webhook_response RECORD;
BEGIN
    -- Get user notification settings
    SELECT * INTO user_settings 
    FROM public.user_notification_settings 
    WHERE user_id = p_user_id;
    
    -- If no settings exist, create default settings
    IF user_settings IS NULL THEN
        INSERT INTO public.user_notification_settings (user_id)
        VALUES (p_user_id);
        
        SELECT * INTO user_settings 
        FROM public.user_notification_settings 
        WHERE user_id = p_user_id;
    END IF;
    
    -- Check if user wants this type of notification
    IF (p_type = 'new_bid' AND NOT user_settings.push_new_bids) OR
       (p_type IN ('bid_accepted', 'bid_rejected', 'bid_countered') AND NOT user_settings.push_bid_responses) OR
       (p_type = 'new_message' AND NOT user_settings.push_new_messages) OR
       (p_type IN ('listing_sold', 'listing_expired') AND NOT user_settings.push_listing_updates) OR
       (NOT user_settings.push_enabled) THEN
        RETURN NULL; -- Skip notification
    END IF;
    
    -- Create the notification
    INSERT INTO public.notifications (
        user_id, type, title, body, data, 
        listing_id, bid_id, message_id, scheduled_for
    )
    VALUES (
        p_user_id, p_type, p_title, p_body, p_data,
        p_listing_id, p_bid_id, p_message_id, p_scheduled_for
    )
    RETURNING id INTO notification_id;
    
    -- Get user push tokens (you'll need to add these to profiles table)
    SELECT 
        raw_user_meta_data->>'fcm_token' as fcm_token,
        raw_user_meta_data->>'expo_token' as expo_token
    INTO user_tokens
    FROM auth.users 
    WHERE id = p_user_id;
    
    -- Send push notification via webhook if tokens exist
    IF user_tokens.fcm_token IS NOT NULL OR user_tokens.expo_token IS NOT NULL THEN
        webhook_payload := jsonb_build_object(
            'user_id', p_user_id,
            'title', p_title,
            'body', p_body,
            'data', p_data,
            'fcm_token', user_tokens.fcm_token,
            'expo_token', user_tokens.expo_token
        );
        
        -- Call the edge function asynchronously (requires pg_net extension)
        -- This will be handled by a separate process to avoid blocking
        BEGIN
            INSERT INTO public.notification_queue (
                notification_id,
                webhook_payload,
                attempts,
                created_at
            ) VALUES (
                notification_id,
                webhook_payload,
                0,
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            -- If notification queue fails, just log and continue
            RAISE LOG 'Failed to queue push notification: %', SQLERRM;
        END;
    END IF;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger notification for new bid
CREATE OR REPLACE FUNCTION notify_new_bid()
RETURNS TRIGGER AS $$
DECLARE
    listing_record RECORD;
    seller_id UUID;
    notification_title TEXT;
    notification_body TEXT;
    notification_data JSONB;
BEGIN
    -- Only send notification for new bids
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        -- Get listing details and seller
        SELECT l.* INTO listing_record
        FROM public.listings l
        WHERE l.id = NEW.listing_id;
        
        seller_id := listing_record.seller_id;
        
        -- Don't notify if bidder is the seller (shouldn't happen, but safety check)
        IF seller_id = NEW.bidder_id THEN
            RETURN NEW;
        END IF;
        
        -- Prepare notification content
        notification_title := 'Yeni Teklif! 🎯';
        notification_body := format('%s için %s TL teklif aldınız', 
                                   COALESCE(listing_record.title, 'Ürününüz'), 
                                   NEW.amount::text);
        
        notification_data := jsonb_build_object(
            'bid_id', NEW.id,
            'listing_id', NEW.listing_id,
            'bidder_id', NEW.bidder_id,
            'amount', NEW.amount,
            'action_url', '/tekliflerim?tab=received'
        );
        
        -- Create notification
        PERFORM create_notification(
            seller_id,
            'new_bid',
            notification_title,
            notification_body,
            notification_data,
            NEW.listing_id,
            NEW.id
        );
        
        RAISE LOG 'Created new_bid notification for user % on listing %', seller_id, NEW.listing_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger notification for bid responses
CREATE OR REPLACE FUNCTION notify_bid_response()
RETURNS TRIGGER AS $$
DECLARE
    listing_record RECORD;
    notification_title TEXT;
    notification_body TEXT;
    notification_data JSONB;
    status_text TEXT;
BEGIN
    -- Only send notification for status changes (not new bids)
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status != 'pending' THEN
        -- Get listing details
        SELECT * INTO listing_record
        FROM public.listings
        WHERE id = NEW.listing_id;
        
        -- Determine status text and notification content
        CASE NEW.status
            WHEN 'accepted' THEN
                status_text := 'kabul edildi';
                notification_title := 'Teklif Kabul Edildi! ✅';
            WHEN 'rejected' THEN
                status_text := 'reddedildi';
                notification_title := 'Teklif Reddedildi ❌';
            WHEN 'countered' THEN
                status_text := 'karşı teklif yapıldı';
                notification_title := 'Karşı Teklif! 🔄';
            ELSE
                RETURN NEW; -- Unknown status, skip notification
        END CASE;
        
        notification_body := format('%s için %s TL teklifiniz %s', 
                                   COALESCE(listing_record.title, 'ürün'), 
                                   NEW.amount::text,
                                   status_text);
        
        -- Add counter offer info if applicable
        IF NEW.status = 'countered' AND NEW.counter_offer_amount IS NOT NULL THEN
            notification_body := notification_body || format(' (%s TL karşı teklif)', NEW.counter_offer_amount::text);
        END IF;
        
        notification_data := jsonb_build_object(
            'bid_id', NEW.id,
            'listing_id', NEW.listing_id,
            'status', NEW.status,
            'amount', NEW.amount,
            'counter_offer_amount', NEW.counter_offer_amount,
            'action_url', '/tekliflerim?tab=made'
        );
        
        -- Create notification for bidder
        PERFORM create_notification(
            NEW.bidder_id,
            'bid_' || NEW.status,
            notification_title,
            notification_body,
            notification_data,
            NEW.listing_id,
            NEW.id
        );
        
        RAISE LOG 'Created bid_response notification for user % on bid %', NEW.bidder_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark listing as sold and notify
CREATE OR REPLACE FUNCTION notify_listing_sold()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_body TEXT;
    notification_data JSONB;
BEGIN
    -- Only notify when listing status changes to sold
    IF TG_OP = 'UPDATE' AND OLD.status != 'sold' AND NEW.status = 'sold' THEN
        notification_title := 'Ürün Satıldı! 🎉';
        notification_body := format('%s başarıyla satıldı', COALESCE(NEW.title, 'Ürününüz'));
        
        notification_data := jsonb_build_object(
            'listing_id', NEW.id,
            'final_price', NEW.price,
            'action_url', '/listing/' || NEW.id::text
        );
        
        -- Create notification for seller
        PERFORM create_notification(
            NEW.seller_id,
            'listing_sold',
            notification_title,
            notification_body,
            notification_data,
            NEW.id
        );
        
        RAISE LOG 'Created listing_sold notification for user % on listing %', NEW.seller_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trigger_notify_new_bid
    AFTER INSERT ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_bid();

CREATE TRIGGER trigger_notify_bid_response
    AFTER UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION notify_bid_response();

CREATE TRIGGER trigger_notify_listing_sold
    AFTER UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION notify_listing_sold();

-- Function to get unread notification counts
CREATE OR REPLACE FUNCTION get_notification_counts(p_user_id UUID)
RETURNS TABLE (
    total_unread BIGINT,
    new_bids BIGINT,
    bid_responses BIGINT,
    new_messages BIGINT,
    other BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_unread,
        COUNT(*) FILTER (WHERE type = 'new_bid') as new_bids,
        COUNT(*) FILTER (WHERE type IN ('bid_accepted', 'bid_rejected', 'bid_countered')) as bid_responses,
        COUNT(*) FILTER (WHERE type = 'new_message') as new_messages,
        COUNT(*) FILTER (WHERE type NOT IN ('new_bid', 'bid_accepted', 'bid_rejected', 'bid_countered', 'new_message')) as other
    FROM public.notifications
    WHERE user_id = p_user_id 
    AND read = FALSE
    AND created_at > NOW() - INTERVAL '30 days'; -- Only count recent notifications
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
    p_user_id UUID,
    p_notification_ids UUID[] DEFAULT NULL,
    p_type VARCHAR(50) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    IF p_notification_ids IS NOT NULL THEN
        -- Mark specific notifications as read
        UPDATE public.notifications
        SET read = TRUE, read_at = NOW()
        WHERE user_id = p_user_id 
        AND id = ANY(p_notification_ids)
        AND read = FALSE;
    ELSIF p_type IS NOT NULL THEN
        -- Mark all notifications of a specific type as read
        UPDATE public.notifications
        SET read = TRUE, read_at = NOW()
        WHERE user_id = p_user_id 
        AND type = p_type
        AND read = FALSE;
    ELSE
        -- Mark all notifications as read
        UPDATE public.notifications
        SET read = TRUE, read_at = NOW()
        WHERE user_id = p_user_id 
        AND read = FALSE;
    END IF;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security) Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System can create notifications (for triggers)
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Users can manage their own notification settings
CREATE POLICY "Users can view their own notification settings" ON public.user_notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON public.user_notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON public.user_notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification queue is system-only (no user access needed)
CREATE POLICY "System can manage notification queue" ON public.notification_queue
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.user_notification_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_counts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read(UUID, UUID[], VARCHAR) TO authenticated;

-- Insert default notification settings for existing users
INSERT INTO public.user_notification_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_notification_settings)
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Notification system setup completed successfully! 🔔' as result;

-- Show summary of created objects
SELECT 'Created Objects:' as summary
UNION ALL
SELECT '- notifications table' 
UNION ALL
SELECT '- user_notification_settings table'
UNION ALL
SELECT '- Database triggers for bids and listings'
UNION ALL
SELECT '- Functions for notification management'
UNION ALL
SELECT '- RLS policies for data security';