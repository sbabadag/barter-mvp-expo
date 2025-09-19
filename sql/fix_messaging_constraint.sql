-- Fix for "Mesaj gönderilemedi" error
-- The error occurs because bids table constraint requires amount > 0
-- But for messaging functionality, we need to allow amount = 0

-- Step 1: Drop the existing amount constraint
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_amount_check;

-- Step 2: Add new constraint that allows amount >= 0 (including 0 for messages)
ALTER TABLE public.bids ADD CONSTRAINT bids_amount_check CHECK (amount >= 0);

-- Step 3: Verify the constraint change
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.bids'::regclass 
AND contype = 'c' 
AND conname = 'bids_amount_check';

-- Success message
SELECT 'Messaging constraint fixed! Messages with 0 amount are now allowed ✅' as status;