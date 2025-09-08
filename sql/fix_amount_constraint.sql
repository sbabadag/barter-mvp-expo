-- FIX CHECK CONSTRAINT FOR MESSAGING FUNCTIONALITY
-- This script removes the amount > 0 constraint to allow messages with 0 amount

-- Drop the existing check constraint that requires amount > 0
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_amount_check;

-- Add a new constraint that allows amount >= 0 (including 0 for messages)
ALTER TABLE public.bids ADD CONSTRAINT bids_amount_check CHECK (amount >= 0);

-- Verify the constraint was updated (modern PostgreSQL syntax)
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.bids'::regclass 
AND contype = 'c';
