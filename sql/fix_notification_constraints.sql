-- NOTIFICATION CONSTRAINT FIX
-- This fixes the valid_related_entity constraint error

-- Step 1: Create a test notification that satisfies the constraint
-- For 'new_bid' type, we need a bid_id
-- For 'reminder' type, we don't need any related entity

-- Let's use 'reminder' type first (no constraint requirements)
INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    body,
    data,
    delivery_method,
    read,
    sent,
    created_at
) VALUES (
    gen_random_uuid(),
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid,
    'reminder',  -- This type doesn't require related entities
    '🚀 Real-time Test (Fixed)',
    'If you see this in your app, real-time notifications are working!',
    '{"test": true, "method": "constraint_fixed"}'::jsonb,
    'in_app',
    false,
    true,
    NOW()
);

-- Step 2: Create a proper new_bid notification with a real bid_id
-- First, let's get a real bid ID from your bids table
DO $$
DECLARE
    test_bid_id text;
    notification_id uuid;
BEGIN
    -- Get a real bid ID (TEXT type from ultimate fix)
    SELECT id INTO test_bid_id 
    FROM public.bids 
    WHERE bidder_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid 
    LIMIT 1;
    
    -- If we found a bid, create a proper new_bid notification
    IF test_bid_id IS NOT NULL THEN
        notification_id := gen_random_uuid();
        
        INSERT INTO public.notifications (
            id,
            user_id,
            type,
            title,
            body,
            data,
            delivery_method,
            read,
            sent,
            bid_id,  -- This satisfies the constraint
            created_at
        ) VALUES (
            notification_id,
            'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid,
            'new_bid',
            '💰 New Bid Notification',
            'Someone placed a bid on your listing!',
            jsonb_build_object('test', true, 'bid_id', test_bid_id),
            'in_app',
            false,
            true,
            test_bid_id,
            NOW()
        );
        
        RAISE NOTICE 'Created new_bid notification with bid_id: %', test_bid_id;
    ELSE
        RAISE NOTICE 'No bids found for user, skipping new_bid test notification';
    END IF;
END
$$;

-- Step 3: Update the create_test_notification function to handle constraints properly
CREATE OR REPLACE FUNCTION public.create_test_notification(
    p_user_id uuid,
    p_title text DEFAULT 'Test Notification',
    p_body text DEFAULT 'This is a test notification'
)
RETURNS uuid
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id uuid;
BEGIN
    -- Generate new ID
    new_id := gen_random_uuid();
    
    -- Insert the test notification using 'reminder' type (no constraints)
    INSERT INTO public.notifications (
        id,
        user_id,
        type,
        title,
        body,
        data,
        delivery_method,
        read,
        sent
    ) VALUES (
        new_id,
        p_user_id,
        'reminder',  -- Use reminder type to avoid constraint issues
        p_title,
        p_body,
        '{"test": true, "source": "test_function"}'::jsonb,
        'in_app',
        false,
        true
    );
    
    RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;

-- Step 4: Test the fixed function
SELECT create_test_notification(
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid, 
    '🧪 Test Fixed', 
    'This notification should work without constraint errors!'
) as test_notification_id;

-- Check notification count
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications,
    COUNT(*) FILTER (WHERE type = 'reminder') as reminder_notifications,
    COUNT(*) FILTER (WHERE type = 'new_bid') as bid_notifications
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;

-- Show recent notifications
SELECT 
    id,
    type,
    title,
    body,
    bid_id,
    read,
    created_at
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Notification constraint fix completed! 🎉' as status;