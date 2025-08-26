-- Admin Users Table Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  lockout_until TIMESTAMP WITH TIME ZONE,
  verification_code VARCHAR(10),
  verification_code_expires_at TIMESTAMP WITH TIME ZONE,
  trusted_devices TEXT[] DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a default super admin user
-- Password: Admin123! (bcrypt hash)
INSERT INTO admin_users (
  email, 
  password_hash, 
  role, 
  permissions, 
  is_active
) VALUES (
  'admin@internationalcarcompanyinc.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHqGm',
  'super_admin',
  '["*"]',
  true
) ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users can view all users" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Admin users can insert new users" ON admin_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can update users" ON admin_users
  FOR UPDATE USING (true);

CREATE POLICY "Admin users can delete users" ON admin_users
  FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;

-- Verify the setup
SELECT 
  '✅ Admin setup completed successfully!' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins
FROM admin_users;
