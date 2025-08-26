-- Add verification_code columns to admin_users table
-- Run this script in your Supabase SQL editor if the columns don't exist

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add verification_code column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'verification_code'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN verification_code TEXT;
        RAISE NOTICE 'Added verification_code column to admin_users table';
    ELSE
        RAISE NOTICE 'verification_code column already exists in admin_users table';
    END IF;

    -- Add verification_code_expires_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'verification_code_expires_at'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN verification_code_expires_at TIMESTAMPTZ;
        RAISE NOTICE 'Added verification_code_expires_at column to admin_users table';
    ELSE
        RAISE NOTICE 'verification_code_expires_at column already exists in admin_users table';
    END IF;

END $$;

-- Create index on verification_code for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_verification_code 
ON admin_users(verification_code) 
WHERE verification_code IS NOT NULL;

-- Create index on verification_code_expires_at for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_verification_code_expires 
ON admin_users(verification_code_expires_at) 
WHERE verification_code_expires_at IS NOT NULL;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
AND column_name IN ('verification_code', 'verification_code_expires_at')
ORDER BY column_name;
