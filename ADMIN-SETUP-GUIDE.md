# 🔐 Admin System Setup Guide

## 🚨 Current Issue
The admin portal is not working because the `admin_users` table doesn't exist in your Supabase database.

## 🛠️ Quick Fix (Manual Setup)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Setup Script
1. Copy the contents of `scripts/setup-admin-manual.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify Setup
After running the script, you should see:
```
✅ Admin setup completed successfully!
total_users: 1
super_admins: 1
```

## 🔑 Default Admin Credentials
- **Email**: `admin@internationalcarcompanyinc.com`
- **Password**: `Admin123!`
- **Role**: Super Admin

## 🚀 Test the Admin Portal
1. Visit `/admin/login` in your application
2. Use the credentials above
3. You should be redirected to the admin dashboard

## 🔧 If You Still Have Issues

### Check Environment Variables
Make sure your `.env.local` file has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Check Supabase Connection
1. Go to Supabase Dashboard → Settings → API
2. Verify your project URL and keys
3. Make sure your project is active

### Check Database Tables
In Supabase Dashboard → Table Editor, you should see:
- `admin_users` table with the correct structure

## 🆘 Troubleshooting

### "Table doesn't exist" Error
- Run the SQL script again
- Check if you're in the right Supabase project

### "Invalid credentials" Error
- Verify the admin user was created in the `admin_users` table
- Check if the password hash is correct

### "CSRF token" Error
- Make sure your `.env.local` file is loaded
- Check if the CSRF protection is working

## 📋 Admin Features Available
- ✅ User Management
- ✅ Car Inventory Management
- ✅ Review Management
- ✅ Analytics Dashboard
- ✅ Session Management

## 🔒 Security Notes
- Change the default password after first login
- The admin system uses email verification for security
- All admin actions are logged and monitored

## 📞 Need Help?
If you're still having issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Make sure Supabase is accessible from your network
4. Check if there are any CORS or CSP issues

---

**Quick Test**: After setup, try visiting `/admin/login` and logging in with the default credentials above.
