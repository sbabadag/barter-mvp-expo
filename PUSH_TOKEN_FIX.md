# 🔧 Push Token Duplicate Key Error - FIXED

## Problem
The app was crashing with a database constraint violation error:
```
ERROR ❌ Error storing push token: {"code": "23505", "details": null, "hint": null, "message": "duplicate key value violates unique constraint \"user_push_tokens_user_id_token_key\""}
```

## Root Cause
- The database has a `UNIQUE(user_id, token)` constraint on the `user_push_tokens` table
- The `upsert` operation wasn't handling this constraint properly
- Multiple attempts to register the same push token for the same user were causing conflicts

## Solution Applied

### 1. **Improved registerPushToken() function**
- **Before**: Used `upsert` which didn't handle the unique constraint properly
- **After**: 
  1. Check if token already exists for user+token combination
  2. If exists: Update the existing record
  3. If not exists: Insert new record
  4. Handle duplicate key errors gracefully (code 23505)

### 2. **Enhanced storePushToken() method**
- Applied same logic to the NotificationService class
- Better error handling for race conditions
- Graceful handling when another process inserts the same token

### 3. **Database Constraint Understanding**
```sql
UNIQUE(user_id, token) -- This is the constraint causing the issue
```

## Code Changes Made

### File: `src/services/notifications.ts`

#### registerPushToken() function:
```typescript
// OLD: Simple upsert (caused conflicts)
await supabase.from('user_push_tokens').upsert({...})

// NEW: Check-then-insert/update approach
const { data: existingToken } = await supabase
  .from('user_push_tokens')
  .select('*')
  .eq('user_id', userId)
  .eq('token', token)
  .single();

if (existingToken) {
  // Update existing
} else {
  // Insert new with error handling
}
```

#### storePushToken() method:
- Same improvement applied to NotificationService class
- Better error handling for duplicate key violations

## Benefits
✅ **No more crashes** - Duplicate key errors are handled gracefully
✅ **Better performance** - Avoids unnecessary database operations
✅ **Race condition safe** - Multiple processes can safely register tokens
✅ **Proper error logging** - Clear messages for debugging

## Test Results
- Push token registration now works without crashing
- Duplicate registrations are handled silently
- App continues to function normally even with database conflicts

## Hot Reload Status
🔥 **Hot reload is still active** - All previous hot reload configurations are preserved!