# Messaging Error Fix - "Mesaj gönderilemedi"

## Problem
When users try to send messages to sellers, they get the error:
```
Mesaj gönderilemedi new row for relation "bids" violates check constraint "bids_amount_check"
```

## Root Cause
The chat functionality uses the `bids` table to store messages, setting `amount: 0` for messages (as opposed to actual bids which have `amount > 0`). However, the database constraint `bids_amount_check` was set to `CHECK (amount > 0)`, which prevents inserting messages with 0 amount.

## Location of the Issue
File: `app/chat/[userId].tsx` around line 131:
```tsx
const { data, error } = await supabase
  .from('bids')
  .insert({
    listing_id: listing,
    bidder_id: user.id,
    message: newMessage.trim(),
    amount: 0, // ← This causes the constraint violation
    status: 'pending'
  })
```

## Solution
Change the database constraint to allow `amount >= 0` instead of `amount > 0`:

1. Run the SQL file: `sql/fix_messaging_constraint.sql`
2. Or manually execute in Supabase SQL Editor:
```sql
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_amount_check;
ALTER TABLE public.bids ADD CONSTRAINT bids_amount_check CHECK (amount >= 0);
```

## How to Apply the Fix
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `sql/fix_messaging_constraint.sql`
4. Click "Run" to execute the SQL

## Verification
After applying the fix, messages should work properly without the constraint violation error.

## Status
- ❌ **Issue**: Database constraint prevents messages with 0 amount
- 🔧 **Fix**: SQL script created (`sql/fix_messaging_constraint.sql`)
- ⏳ **Status**: Ready to apply - needs manual execution in Supabase dashboard

## Files Modified
- `sql/fix_messaging_constraint.sql` - SQL fix script
- `MESSAGING_ERROR_FIX.md` - This documentation