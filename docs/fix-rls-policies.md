# Fix RLS Policy Error for User Registration

## Problem
When users try to register, they get this error:
```
ERROR Error creating profile: {"code": "42501", "details": null, "hint": null, "message": "new row violates row-level security policy for table \"profiles\""}
```

## Solution
The Supabase database needs updated RLS policies to allow new users to create their profiles during registration.

## Steps to Fix

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `sql/fix_profile_policies.sql`
4. Click "Run" to execute the SQL

### Option 2: Via Command Line (if you have Supabase CLI)
```bash
supabase db reset --linked
# or
npx supabase db push
```

### Option 3: Manual Policy Creation
Go to Authentication > Policies in your Supabase dashboard and create these policies for the `profiles` table:

1. **Allow profile creation**
   - Policy name: `users can create their own profile`
   - Allowed operations: `INSERT`
   - Target roles: `authenticated`
   - USING expression: (leave empty)
   - WITH CHECK expression: `auth.uid() = id`

2. **Allow profile management**
   - Policy name: `users can read/write their profile`
   - Allowed operations: `ALL`
   - Target roles: `authenticated`
   - USING expression: `auth.uid() = id`
   - WITH CHECK expression: `auth.uid() = id`

3. **Allow public profile reading**
   - Policy name: `public can read profiles`
   - Allowed operations: `SELECT`
   - Target roles: `anon, authenticated`
   - USING expression: `true`
   - WITH CHECK expression: (leave empty)

## After Applying the Fix
1. Restart your Expo development server
2. Try registering a new user
3. The profile should now be created successfully

## Verification
Check the `profiles` table in your Supabase dashboard to confirm new user profiles are being created properly.
