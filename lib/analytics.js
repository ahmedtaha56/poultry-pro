import { supabase } from './supabase';

// Global session tracking to prevent double-counting
const viewedProductsInSession = new Set();
const viewedProfilesInSession = new Set();

/**
 * Track product view - prevents duplicate views in same session
 * @param {string} productId - The product ID being viewed
 * @param {string} viewerId - The user ID viewing the product
 * @param {string} sellerId - The seller ID of the product
 * @param {string} source - Where the view came from (Home, Profile, AllProducts, etc.)
 */
export const trackProductView = async (productId, viewerId, sellerId, source = 'Unknown') => {
  try {
    // Don't track if viewer is the seller
    if (viewerId === sellerId) return;
    
    // Check if already viewed in this session
    const sessionKey = `${viewerId}_${productId}`;
    if (viewedProductsInSession.has(sessionKey)) return;
    
    // Mark as viewed in session
    viewedProductsInSession.add(sessionKey);
    
    // Insert into database
    const { error } = await supabase
      .from('product_views')
      .insert({
        product_id: productId,
        viewer_id: viewerId,
        seller_id: sellerId, // Add the missing seller_id field
        source: source, // Track where the view came from
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.log('Error tracking product view:', error?.message || error);
    } else {
      console.log(`Product view tracked: ${productId} from ${source}`);
    }
  } catch (error) {
    // Silently ignore tracking errors to not break user experience
    console.log('Error tracking product view:', error?.message || error);
  }
};

/**
 * Track profile view - prevents duplicate views in same session
 * @param {string} profileId - The profile ID being viewed
 * @param {string} viewerId - The user ID viewing the profile
 * @param {string} source - Where the view came from
 */
export const trackProfileView = async (profileId, viewerId, source = 'Unknown') => {
  try {
    // Don't track if viewer is viewing their own profile
    if (profileId === viewerId) return;
    
    // Check if already viewed in this session
    const sessionKey = `${viewerId}_${profileId}`;
    if (viewedProfilesInSession.has(sessionKey)) return;
    
    // Mark as viewed in session
    viewedProfilesInSession.add(sessionKey);
    
    // Insert into database
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        viewer_id: viewerId,
        source: source, // Track where the view came from
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.log('Error tracking profile view:', error?.message || error);
    } else {
      console.log(`Profile view tracked: ${profileId} from ${source}`);
    }
  } catch (error) {
    // Silently ignore tracking errors
    console.log('Error tracking profile view:', error?.message || error);
  }
};

/**
 * Get current user ID from Supabase auth
 * @returns {Promise<string|null>} Current user ID or null if not authenticated
 */
export const getCurrentUserId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Clear session tracking (useful for logout)
 */
export const clearSessionTracking = () => {
  viewedProductsInSession.clear();
  viewedProfilesInSession.clear();
};
