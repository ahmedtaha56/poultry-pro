import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import { setProfileLoadedOnce } from '../appSlice';

// Async thunk to fetch profile and products data
export const fetchProfileData = createAsyncThunk(
  'profile/fetchProfileData',
  async (userId, { rejectWithValue }) => {
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        return rejectWithValue(profileError.message);
      }

      // Fetch user's products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*, product_images(image_url)')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (productsError) {
        return rejectWithValue(productsError.message);
      }

      // Calculate and fetch current rating
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating')
        .eq('seller_id', userId);

      let averageRating = 0;
      let totalRatings = 0;

      if (!ratingsError && ratings && ratings.length > 0) {
        totalRatings = ratings.length;
        const sum = ratings.reduce((acc, item) => acc + item.rating, 0);
        averageRating = parseFloat((sum / totalRatings).toFixed(1));
      }

      // Update profile with calculated rating and product count
      const updatedProfile = {
        ...profile,
        rating: averageRating,
        total_ratings: totalRatings,
        listings_count: products.length
      };

      // Update database if rating or product count has changed
      if (profile.rating !== averageRating || profile.listings_count !== products.length) {
        await supabase
          .from('profiles')
          .update({ 
            rating: averageRating,
            listings_count: products.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }

      return { profile: updatedProfile, products };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update rating
export const updateRating = createAsyncThunk(
  'profile/updateRating',
  async ({ sellerId, rating, userId }, { rejectWithValue, getState }) => {
    try {
      // Check if user has already rated this seller
      const { data: existingRating, error: checkError } = await supabase
        .from('ratings')
        .select('id')
        .eq('seller_id', sellerId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({
            rating: rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('ratings')
          .insert({
            seller_id: sellerId,
            user_id: userId,
            rating: rating
          });

        if (error) throw error;
      }

      // Recalculate average rating
      const { data: allRatings, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating')
        .eq('seller_id', sellerId);

      if (ratingsError) throw ratingsError;

      const totalRatings = allRatings.length;
      const sum = allRatings.reduce((acc, item) => acc + item.rating, 0);
      const averageRating = parseFloat((sum / totalRatings).toFixed(1));

      // Update profile rating in database
      await supabase
        .from('profiles')
        .update({ 
          rating: averageRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', sellerId);

      return { averageRating, totalRatings };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    products: [],
    loading: false,
    error: null,
    ratingUpdating: false,
    isFirstLoad: true,
    myProfileId: null,
    showSkeleton: false,
    myProfileLoaded: false // Track if my profile has been loaded at least once
  },
  reducers: {
    clearProfileData(state) {
      state.profile = null;
      state.products = [];
      state.error = null;
    },
    upsertProduct(state, action) {
      const updated = action.payload;
      const index = state.products.findIndex(p => p.id === updated.id);
      if (index >= 0) {
        state.products[index] = { ...state.products[index], ...updated };
      }
    },
    updateProfile(state, action) {
      state.profile = action.payload;
    },
    updateProfileRating(state, action) {
      if (state.profile) {
        state.profile.rating = action.payload.averageRating;
        state.profile.total_ratings = action.payload.totalRatings;
      }
    },
    incrementProductCount(state) {
      if (state.profile) {
        state.profile.listings_count = (state.profile.listings_count || 0) + 1;
      }
    },
    decrementProductCount(state) {
      if (state.profile) {
        state.profile.listings_count = Math.max((state.profile.listings_count || 0) - 1, 0);
      }
    },
    setMyProfileId(state, action) {
      state.myProfileId = action.payload;
    },
    setFirstLoadComplete(state) {
      state.isFirstLoad = false;
    },
    setShowSkeleton(state, action) {
      state.showSkeleton = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileData.pending, (state, action) => {
        const requestedUserId = action.meta.arg;
        // Show skeleton only when viewing someone else's profile
        state.loading = true;
        state.showSkeleton = requestedUserId !== state.myProfileId;
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.loading = false;
        state.showSkeleton = false;
        state.profile = action.payload.profile;
        state.products = action.payload.products;
        state.error = null;
        
        // If this is my profile, mark it as loaded
        if (action.payload.profile?.id === state.myProfileId) {
          state.myProfileLoaded = true;
          state.isFirstLoad = false;
        }
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile data';
      })
      .addCase(updateRating.pending, (state) => {
        state.ratingUpdating = true;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.ratingUpdating = false;
        if (state.profile) {
          state.profile.rating = action.payload.averageRating;
          state.profile.total_ratings = action.payload.totalRatings;
        }
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.ratingUpdating = false;
        state.error = action.payload || 'Failed to update rating';
      });
  },
});

export const { 
  clearProfileData, 
  updateProfile, 
  updateProfileRating, 
  setMyProfileId, 
  setFirstLoadComplete, 
  setShowSkeleton,
  setMyProfileLoaded,
  incrementProductCount,
  decrementProductCount,
  upsertProduct
} = profileSlice.actions;

export default profileSlice.reducer;
