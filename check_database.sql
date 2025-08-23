-- Check if the source column exists in your tables
-- Run this in your Supabase SQL Editor to see what's happening

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_views' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profile_views' 
ORDER BY ordinal_position;

-- Check if there are any rows in these tables
SELECT COUNT(*) as product_views_count FROM product_views;
SELECT COUNT(*) as profile_views_count FROM profile_views;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('product_views', 'profile_views');

-- Check if you can select from these tables (this will show any permission errors)
-- Try this in your SQL Editor:
-- SELECT * FROM product_views LIMIT 1;
-- SELECT * FROM profile_views LIMIT 1;
