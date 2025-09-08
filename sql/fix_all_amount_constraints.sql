-- COMPREHENSIVE FIX FOR ALL AMOUNT CONSTRAINTS
-- This script finds and fixes ALL amount-related constraints on the bids table

-- First, let's see all existing constraints on the bids table
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.bids'::regclass 
AND contype = 'c';

-- Drop ALL possible amount-related check constraints
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_amount_check;
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS valid_amount;
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_amount_positive;
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS check_amount_positive;

-- Add a single new constraint that allows amount >= 0 (including 0 for messages)
ALTER TABLE public.bids ADD CONSTRAINT bids_amount_check CHECK (amount >= 0);

-- Verify all constraints after the fix
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.bids'::regclass 
AND contype = 'c';
