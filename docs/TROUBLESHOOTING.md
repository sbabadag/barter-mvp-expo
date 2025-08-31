# Enhanced Registration Troubleshooting Guide

## ❌ Common Errors

---

### 📮 Error: 42703 - Postal Code Column Does Not Exist

**Error Message:**
```
ERROR: 42703: column "home_postal_code" does not exist
ERROR: 42703: column "work_postal_code" does not exist
```

**What This Means:**
The database is trying to add constraints to postal code columns that haven't been created yet.

**Quick Fix:**
1. Run: `npm run fix-postal-codes` for detailed instructions
2. Copy and run `sql/migrate_profiles_enhanced.sql` in Supabase SQL Editor
3. This will add all missing address columns with proper constraints

**Manual Fix:**
1. First add columns: Run `sql/migrate_profiles_enhanced.sql`
2. Then add constraints: Run `sql/add_postal_code_constraints.sql`

---

### 🔐 Error: 42501 - Row Level Security Policy Violation

**Error Message:**
```
ERROR Error creating profile: {"code": "42501", "details": null, "hint": null, "message": "new row violates row-level security policy for table \"profiles\""}
```

**What This Means:**
The database Row Level Security (RLS) policies are preventing profile creation during user registration.

**Quick Fix:**
1. Run: `npm run fix-rls-error` for detailed instructions
2. Copy the SQL from `sql/fix_rls_policies.sql`
3. Open Supabase Dashboard → SQL Editor
4. Paste and run the SQL
5. Test registration again

**What the fix does:**
- Updates RLS policies to allow profile creation
- Grants proper permissions to authenticated users
- Fixes the user registration trigger
- Allows users to manage their own profiles

---

### Error: PGRST204 - Schema Cache

**Error Message:**
```
Error creating profile: {"code": "PGRST204", "details": null, "hint": null, "message": "Could not find the 'birth_date' column of 'profiles' in the schema cache"}
```

**What This Means:**
The database schema hasn't been updated with the new columns needed for enhanced user registration.

**Quick Fix:**
1. Run: `npm run fix-registration`
2. Copy the SQL output
3. Open Supabase Dashboard → SQL Editor
4. Paste and run the SQL
5. Test registration again

### Error: 22008 - Date Format

**Error Message:**
```
Error creating profile: {"code": "22008", "details": null, "hint": "Perhaps you need a different \"datestyle\" setting.", "message": "date/time field value out of range: \"06081975\""}
```

**What This Means:**
The birth date format is incorrect. PostgreSQL expects YYYY-MM-DD format.

**Quick Fix:**
- ✅ Use the format: **GG/AA/YYYY** (e.g., 06/08/1975)
- ✅ The app now auto-formats input and validates dates
- ✅ Date validation prevents invalid dates
- ✅ App falls back gracefully if date format fails

## ✅ What Happens After Fix

- ✅ New registration form works with database
- ✅ All user fields are properly saved
- ✅ No more schema cache errors
- ✅ App stops falling back to mock mode

## 🔍 Verify Fix

After running the SQL migration:

1. Try creating a new user account
2. Check the app logs - should see no more PGRST204 errors
3. Check the profile page - should show all user information
4. Check Supabase dashboard - profiles table should have new columns

## 🚨 If Problems Persist

**Still getting errors?**
1. Check Supabase dashboard permissions
2. Verify RLS policies allow INSERT on profiles table
3. Check if the SQL migration completed successfully
4. Try running: `npm run db-guide` for comprehensive setup

**App not showing new fields?**
1. Clear app cache/restart
2. Check if form validation is working
3. Verify TypeScript types match database schema

**Mock mode still active?**
This is normal until database is properly configured. The app gracefully falls back to mock mode to ensure functionality.

## 📞 Support

For additional help:
- Check: `docs/ENHANCED_REGISTRATION.md`
- Run: `npm run db-guide`
- Review SQL files in `sql/` directory
