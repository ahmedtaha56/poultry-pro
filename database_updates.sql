-- Database Updates for Analytics Tracking
-- Run these SQL commands in your Supabase SQL editor

-- 1. Add source column to product_views table if it doesn't exist
ALTER TABLE product_views 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Unknown';

-- 2. Add source column to profile_views table if it doesn't exist  
ALTER TABLE profile_views 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Unknown';

-- 3. Create index on source column for better query performance
CREATE INDEX IF NOT EXISTS idx_product_views_source ON product_views(source);
CREATE INDEX IF NOT EXISTS idx_profile_views_source ON profile_views(source);

-- 4. Create a function to get user products with view counts and sources
CREATE OR REPLACE FUNCTION get_user_products_with_views(user_id UUID, limit_count INTEGER DEFAULT 15)
RETURNS TABLE (
    id UUID,
    product_name TEXT,
    price DECIMAL,
    product_image TEXT,
    view_count BIGINT,
    source_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.product_name,
        p.price,
        pi.image_url as product_image,
        COUNT(pv.id) as view_count,
        jsonb_object_agg(
            COALESCE(pv.source, 'Unknown'), 
            COUNT(pv.id)
        ) FILTER (WHERE pv.id IS NOT NULL) as source_breakdown
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_views pv ON p.id = pv.product_id
    WHERE p.seller_id = user_id
    GROUP BY p.id, p.product_name, p.price, pi.image_url
    ORDER BY view_count DESC, p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a view for dashboard analytics
CREATE OR REPLACE VIEW dashboard_analytics AS
SELECT 
    p.seller_id,
    p.id as product_id,
    p.product_name,
    COUNT(pv.id) as total_views,
    COUNT(CASE WHEN pv.source = 'Home' THEN 1 END) as home_views,
    COUNT(CASE WHEN pv.source = 'Profile' THEN 1 END) as profile_views,
    COUNT(CASE WHEN pv.source = 'AllProducts' THEN 1 END) as all_products_views,
    COUNT(CASE WHEN pv.source = 'ProductDetail' THEN 1 END) as product_detail_views,
    MAX(pv.created_at) as last_viewed_at
FROM products p
LEFT JOIN product_views pv ON p.id = pv.product_id
GROUP BY p.seller_id, p.id, p.product_name;

-- 6. Create a function to get profile visit analytics
CREATE OR REPLACE FUNCTION get_profile_visit_analytics(profile_id UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_visits BIGINT,
    unique_visitors BIGINT,
    source_breakdown JSONB,
    daily_visits JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT pv.viewer_id) as unique_visitors,
        jsonb_object_agg(
            COALESCE(pv.source, 'Unknown'), 
            COUNT(*)
        ) as source_breakdown,
        jsonb_object_agg(
            DATE(pv.created_at)::TEXT, 
            COUNT(*)
        ) as daily_visits
    FROM profile_views pv
    WHERE pv.profile_id = profile_id
    AND pv.created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- 7. Add comments for documentation
COMMENT ON COLUMN product_views.source IS 'Source of the product view (Home, Profile, AllProducts, ProductDetail, etc.)';
COMMENT ON COLUMN profile_views.source IS 'Source of the profile view (Profile, Home, etc.)';
COMMENT ON FUNCTION get_user_products_with_views IS 'Get user products with view counts and source breakdown';
COMMENT ON VIEW dashboard_analytics IS 'Dashboard analytics view for products';
COMMENT ON FUNCTION get_profile_visit_analytics IS 'Get profile visit analytics with source breakdown';
