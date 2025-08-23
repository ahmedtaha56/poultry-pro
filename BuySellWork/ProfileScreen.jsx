import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchProfileData, 
  clearProfileData, 
  updateRating, 
  updateProfile,
  setShowSkeleton,
  setFirstLoadComplete,
  setMyProfileId
} from '../redux/profileslice/profileSlice';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  Share,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
  MaterialIcons,
  Entypo
} from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import PropTypes from 'prop-types';
import SideDrawer from '../components/SideDrawer';
import ContactSellerModal from '../components/ContactSellerModal';
import { trackProductView, trackProfileView, getCurrentUserId } from '../lib/analytics';
import { setSellEntryFrom } from '../lib/navHistory';

const { width } = Dimensions.get('window');

const productFilters = [
  { id: 'all', label: 'All', icon: 'th' },
  { id: 'live', label: 'Live', icon: 'github' },
  { id: 'frozen', label: 'Frozen', icon: 'cube' },
  { id: 'eggs', label: 'Eggs', icon: 'circle' },
  { id: 'feed', label: 'Feed', icon: 'leaf' },
];

const ProfileSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonText} />
        <View style={[styles.skeletonText, { width: '60%' }]} />
      </View>
    </View>
    <View style={styles.skeletonStats}>
      <View style={styles.skeletonStat} />
      <View style={styles.skeletonStat} />
      <View style={styles.skeletonStat} />
    </View>
  </View>
);

const ProfileScreen = React.memo(({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [currentUserRating, setCurrentUserRating] = useState(0);

  // Side drawer and contact modal states
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);

  // Get Redux state
  const {
    profile: seller,
    products: userProducts,
    loading,
    ratingUpdating
  } = useSelector(state => state.profile);
  
  // Local loading state
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  const isOwnProfile = !route.params?.userId || route.params?.userId === currentUser?.id;
  const requestedUserId = route.params?.userId || currentUser?.id;
  const isCorrectProfile = seller && seller.id === requestedUserId;

  // Header title: avoid showing stale names while switching profiles
  const headerTitleText = useMemo(() => {
    if (isOwnProfile) return 'Profile';
    if (isCorrectProfile) return seller?.business_name || seller?.full_name || 'Profile';
    return 'Profile';
  }, [isOwnProfile, isCorrectProfile, seller]);

  const filteredProducts = useMemo(() => {
    if (!userProducts || userProducts.length === 0) return [];
    if (activeFilter === 'all') return userProducts;
    return userProducts.filter(product =>
      product.category?.toLowerCase() === activeFilter
    );
  }, [activeFilter, userProducts]);

  // Memoize the navigation callback to prevent unnecessary re-renders
  const handleSeeAllPress = useCallback(() => {
    const targetUserId = isOwnProfile ? currentUser?.id : route.params?.userId;
    console.log('ProfileScreen - Navigating to AllProducts with userId:', targetUserId);
    navigation.navigate('AllProducts', {
      userId: targetUserId,
      initialProducts: userProducts || []
    });
  }, [isOwnProfile, currentUser?.id, route.params?.userId, userProducts, navigation]);

  // Fetch current user's rating for this seller
  const fetchCurrentUserRating = useCallback(async (sellerId, userId) => {
    if (!userId || !sellerId) return;

    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('seller_id', sellerId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current user rating:', error);
        return;
      }

      if (data) {
        setCurrentUserRating(data.rating);
        setSelectedRating(data.rating);
      } else {
        setCurrentUserRating(0);
        setSelectedRating(0);
      }
    } catch (error) {
      console.error('Error fetching current user rating:', error);
    }
  }, []);

  const fetchUser = useCallback(async (forceRefresh = false) => {
    // Show loading immediately
    setIsLocalLoading(true);

    let userId = route.params?.userId;
    const isViewingOtherProfile = !!userId; // Define if we're viewing another profile

    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        setUser(user);
      }

      if (!userId) {
        return;
      }

      // Fetch data
      console.log('ProfileScreen - Fetching profile data for userId:', userId);

      // If viewing own profile, mark first load as complete
      if (!isViewingOtherProfile) {
        dispatch(setFirstLoadComplete());
      }

      // Fetch current user's rating for this seller
      if (currentUser?.id) {
        await fetchCurrentUserRating(userId, currentUser.id);
      }

      // Fetch profile data
      await dispatch(fetchProfileData(userId));
    } catch (error) {
      console.error('Error in fetchUser:', error);
    } finally {
      setIsLocalLoading(false);
    }
  }, [route.params?.userId, fetchCurrentUserRating, currentUser?.id, dispatch, seller]);

  const fetchMoreProducts = useCallback(async () => {
    if (!pagination.hasMore) return;
    const userId = route.params?.userId || user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url)')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .range(
        pagination.page * pagination.pageSize,
        (pagination.page + 1) * pagination.pageSize - 1
      );
    if (!error && data.length > 0) {
      setUserProducts(prev => [...prev, ...data]);
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1,
        hasMore: data.length === pagination.pageSize
      }));
    }
  }, [pagination, user?.id, route.params?.userId]);

  // Handle rating submission using Redux action
  const submitRating = useCallback(async () => {
    if (!selectedRating || !seller || !currentUser) return;

    setIsSubmittingRating(true);
    try {
      const result = await dispatch(updateRating({
        sellerId: seller.id,
        rating: selectedRating,
        userId: currentUser.id
      })).unwrap();

      if (result) {
        Alert.alert('Success', 'Thank you for your rating!');
        setCurrentUserRating(selectedRating);
        setShowRatingModal(false);
        setSelectedRating(0);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  }, [selectedRating, seller, currentUser, dispatch]);

  // Handle pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUser(true).finally(() => {
      setRefreshing(false);
    });
  }, [fetchUser]);

  // Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('ProfileScreen - Current user from Supabase:', user?.id);
      setCurrentUser(user);
      if (user?.id) {
        dispatch(setMyProfileId(user.id));
      }
    };
    getCurrentUser();
  }, [dispatch]);

  // Record a profile visit when viewing someone else's correct profile
  useEffect(() => {
    const recordProfileVisit = async () => {
      if (!seller?.id || !currentUser?.id) return;
      if (seller.id === currentUser.id) return;

      await trackProfileView(seller.id, currentUser.id, 'Profile');
    };

    if (isCorrectProfile && !isOwnProfile) {
      recordProfileVisit();
    }
  }, [isCorrectProfile, isOwnProfile, seller?.id, currentUser?.id]);

  // Removed manual transition effect to avoid conflicting loaders

  // Removed duplicate initial load effect to avoid double fetch and flicker

  // Handle focus effect for navigation: simplified, single fetch per target user
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        const targetUserId = route.params?.userId || currentUser?.id;
        if (!targetUserId) return;

        if (route.params?.refresh) {
          setIsLocalLoading(true);
          try {
            await dispatch(fetchProfileData(targetUserId)).unwrap();
          } finally {
            if (isActive) setIsLocalLoading(false);
          }
          navigation.setParams({ refresh: false });
          return;
        }

        if (!seller || seller.id !== targetUserId) {
          setIsLocalLoading(true);
          try {
            await dispatch(fetchProfileData(targetUserId)).unwrap();
          } finally {
            if (isActive) setIsLocalLoading(false);
          }
        } else {
          setIsLocalLoading(false);
        }
      };

      run();

      return () => { isActive = false; };
    }, [route.params?.userId, route.params?.refresh, currentUser?.id, seller?.id, dispatch, navigation])
  );

  const handleShareProfile = async () => {
    try {
      if (!seller) return;
      await Share.share({
        message: `Check out ${seller.full_name}'s poultry profile`,
        url: 'https://your-app-link.com/profile',
        title: `Share ${seller.full_name}'s Profile`
      });
    } catch (error) {
      console.log('Error sharing profile:', error.message);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        activeFilter === item.id && styles.activeCategoryItem
      ]}
      onPress={() => setActiveFilter(item.id)}
    >
      <View style={[
        styles.categoryIconContainer,
        activeFilter === item.id && styles.activeCategoryIconContainer
      ]}>
        <FontAwesome
          name={item.icon}
          size={18}
          color={activeFilter === item.id ? 'white' : '#E68A50'}
        />
      </View>
      <Text
        style={[
          styles.categoryText,
          activeFilter === item.id && styles.activeCategoryText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        // First navigate immediately to reduce perceived delay
        navigation.navigate('ProductDetail', { productId: item.id, origin: 'Profile' });
        
        // Then track the view in the background without awaiting
        getCurrentUserId().then(currentUserId => {
          if (currentUserId && item.seller_id) {
            trackProductView(item.id, currentUserId, item.seller_id, 'Profile')
              .catch(err => console.log('Background tracking error:', err));
          }
        });
      }}
    >
              <View style={styles.productImageContainer}>
          <Image
            source={
              item.product_images?.[0]?.image_url
                ? { uri: item.product_images[0].image_url }
                : require('../assets/placeholder.jpg')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.product_name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <View style={styles.productMetaContainer}>
          <View style={styles.productMeta}>
            <Feather name="box" size={14} color="#666" />
            <Text style={styles.metaText}>{item.weight || '-'}</Text>
          </View>
          <View style={styles.productMeta}>
            <MaterialIcons name="delivery-dining" size={16} color="#666" />
            <Text style={styles.metaText}>{item.delivery_option || '-'}</Text>
          </View>
        </View>
        {isOwnProfile && (
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id, origin: 'Profile' })}
            >
              <Feather name="edit-2" size={16} color="#E68A50" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id, origin: 'Profile', action: 'delete' })}
            >
              <MaterialIcons name="delete-outline" size={16} color="#E74C3C" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!pagination.hasMore) return null;
    return (
      <ActivityIndicator size="small" color="#E68A50" style={{ marginVertical: 20 }} />
    );
  };

  const ProfileSkeleton = () => (
    <View style={styles.profileContent}>
      <View style={styles.profileHeader}>
        <View style={[styles.skeletonProfileImage, styles.skeleton]} />
        <View style={styles.statsContainer}>
          {[1, 2].map((i) => (
            <View key={i} style={[styles.statItem, { backgroundColor: '#F8F9FA' }]}>
              <View style={[styles.skeleton, { width: 30, height: 20 }]} />
              <View style={[styles.skeleton, { width: 40, height: 12, marginTop: 4 }]} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.userInfo}>
        <View style={[styles.skeleton, { width: 150, height: 24, marginBottom: 8 }]} />
        <View style={[styles.skeleton, { width: 100, height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeleton, { width: '100%', height: 16, marginBottom: 4 }]} />
        <View style={[styles.skeleton, { width: '80%', height: 16, marginBottom: 4 }]} />
        <View style={[styles.skeleton, { width: '60%', height: 16, marginBottom: 15 }]} />
      </View>

      <View style={styles.buttonContainer}>
        <View style={[styles.skeletonButton, styles.skeleton]} />
        <View style={[styles.skeletonButton, styles.skeleton]} />
      </View>
    </View>
  );

  const RatingModal = () => (
    <Modal
      visible={showRatingModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRatingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Rate this Seller</Text>
          <Text style={styles.modalSubtitle}>
            {currentUserRating > 0
              ? `You rated ${seller?.business_name || seller?.full_name} ${currentUserRating} stars. Update your rating?`
              : `How would you rate ${seller?.business_name || seller?.full_name}?`
            }
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setSelectedRating(star)}
                style={styles.starButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome
                  name={star <= selectedRating ? "star" : "star-o"}
                  size={32}
                  color={star <= selectedRating ? "#FFD700" : "#DDD"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowRatingModal(false);
                setSelectedRating(0);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton,
              (!selectedRating || isSubmittingRating) && styles.disabledButton]}
              onPress={submitRating}
              disabled={!selectedRating || isSubmittingRating}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isSubmittingRating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {currentUserRating > 0 ? 'Update Rating' : 'Submit Rating'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  console.log('ProfileScreen - Debug:', {
    isOwnProfile,
    loading,
    isLocalLoading,
    currentUserId: currentUser?.id,
    sellerId: seller?.id,
    requestedUserId: route.params?.userId || currentUser?.id
  });

  // Show skeleton loader when loading
  if (isLocalLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerOverlay} />
          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => setShowSideDrawer(true)}
            >
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={[styles.headerIcon, { opacity: 0 }]} />
          )}
          <Text style={styles.headerTitle}>{headerTitleText}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView>
          <View style={styles.profileCard}>
            <ProfileSkeleton />
          </View>
        </ScrollView>
        <SideDrawer
          visible={showSideDrawer}
          onClose={() => setShowSideDrawer(false)}
          navigation={navigation}
        />
      </View>
    );
  }

  // Profile loaded: show actual profile
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerOverlay} />
        {isOwnProfile ? (
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setShowSideDrawer(true)}
          >
            <Feather name="menu" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.headerIcon, { opacity: 0 }]} />
        )}
        <Text style={styles.headerTitle}>{headerTitleText}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E68A50']}
            tintColor="#E68A50"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {seller && (
          <View style={styles.profileCard}>
            <View style={styles.profileBackground} />
            <View style={styles.profileContent}>
              <View style={styles.profileHeader}>
                                  <View style={styles.profileImageContainer}>
                    <Image
                      source={{ uri: seller.profile_image }}
                      style={styles.profileImage}
                      defaultSource={require('../assets/profile-placeholder.png')}
                      resizeMode="cover"
                    />
                  </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{seller.listings_count || 0}</Text>
                    <Text style={styles.statLabel}>Products</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {ratingUpdating ? '...' : (seller.rating || '0.0')}
                    </Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                </View>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.name}>
                    {seller.business_name || seller.full_name}
                  </Text>
                  <TouchableOpacity
                    style={styles.ratingContainer}
                    onPress={() => !isOwnProfile && setShowRatingModal(true)}
                    disabled={isOwnProfile}
                  >
                    <FontAwesome name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {ratingUpdating ? '...' : (seller.rating || '0.0')}
                    </Text>
                    <Text style={styles.totalRatingsText}>({seller.total_ratings || 0})</Text>
                    {!isOwnProfile && (
                      <>
                        {currentUserRating > 0 && (
                          <Text style={styles.userRatingText}> • You: {currentUserRating}★</Text>
                        )}
                        <Feather name="edit-3" size={12} color="#856404" style={{ marginLeft: 4 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.username}>@{seller.username}</Text>
                <Text style={styles.bio}>{seller.bio || 'Premium poultry farmer specializing in organic chicken and fresh eggs 🐔'}</Text>
              </View>

              <View style={styles.buttonContainer}>
                {isOwnProfile ? (
                  <>
                    <TouchableOpacity
                      style={[styles.profileButton, styles.editProfileButton]}
                      onPress={() => navigation.navigate('EditProfile')}
                    >
                      <Feather name="edit" size={16} color="white" />
                      <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.profileButton, styles.whatsappButton]}
                      onPress={() => setShowContactModal(true)}
                    >
                      <FontAwesome name="whatsapp" size={16} color="white" />
                      <Text style={styles.whatsappButtonText}>Your Contacts</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.profileButton, styles.rateButton]}
                      onPress={() => setShowRatingModal(true)}
                    >
                      <FontAwesome name="star" size={16} color="white" />
                      <Text style={styles.rateButtonText}>Rate Seller</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.profileButton, styles.whatsappButton]}
                      onPress={() => setShowContactModal(true)}
                    >
                      <FontAwesome name="whatsapp" size={16} color="white" />
                      <Text style={styles.whatsappButtonText}>Contact Seller</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {isOwnProfile && (
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E68A50' }]}>
                <MaterialCommunityIcons name="view-dashboard" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={handleShareProfile}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#3498DB' }]}>
                <Feather name="share-2" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Share Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                setSellEntryFrom('Profile');
                navigation.navigate('Sell', { screen: 'SellMain', params: { from: 'Profile' } });
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#27AE60' }]}>
                <Ionicons name="add-circle-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{isOwnProfile ? 'Your Products' : 'Products'}</Text>
            <Text style={styles.sectionSubtitle}>{filteredProducts.length} items found</Text>
          </View>
          <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllPress}>
            <Text style={styles.seeAll}>See All</Text>
            <Feather name="arrow-right" size={16} color="#E68A50" />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={productFilters}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
        />

        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            scrollEnabled={false}
            onEndReached={fetchMoreProducts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            removeClippedSubviews={true}
            maxToRenderPerBatch={6}
            windowSize={10}
            initialNumToRender={6}
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * Math.floor(index / 2),
              index,
            })}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <MaterialCommunityIcons name="egg-off" size={60} color="#E68A50" />
            </View>
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubText}>
              {isOwnProfile
                ? 'Start selling your premium poultry products today!'
                : 'This seller hasn\'t added any products yet.'
              }
            </Text>
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => {
                  setSellEntryFrom('Profile');
                  navigation.navigate('Sell', { screen: 'SellMain', params: { from: 'Profile' } });
                }}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.addProductButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <RatingModal />

      {/* Contact Seller Modal */}
      <ContactSellerModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        isProfileOwner={isOwnProfile}
        sellerData={seller}
        onUpdateContacts={(contacts) => {
          // Create a new profile object with updated contacts
          const updatedProfile = {
            ...seller,
            phone: contacts.phone,
            whatsapp_link: contacts.whatsapp_link,
            updated_at: new Date().toISOString()
          };
          dispatch(updateProfile(updatedProfile));
        }}
      />

      {/* Side Drawer Component */}
      <SideDrawer
        visible={showSideDrawer}
        onClose={() => setShowSideDrawer(false)}
        navigation={navigation}
      />
    </View>
  );
});

ProfileScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#E68A50',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 8,
  },

  profileCard: {
    backgroundColor: 'white',
    marginTop: -25,
    marginHorizontal: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  profileBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'linear-gradient(135deg, #E68A50 0%, #D67741 100%)',
  },
  profileContent: {
    padding: 25,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
    minWidth: 60,
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontWeight: '500',
  },
  userInfo: {
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#2C3E50',
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#856404',
    fontWeight: '600',
  },
  totalRatingsText: {
    fontSize: 11,
    marginLeft: 2,
    color: '#856404',
    fontWeight: '500',
  },
  userRatingText: {
    fontSize: 10,
    marginLeft: 4,
    color: '#856404',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  username: {
    color: '#7F8C8D',
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5D6D7E',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 12,
  },
  profileButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editProfileButton: {
    backgroundColor: '#E68A50',
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  rateButton: {
    backgroundColor: '#FFD700',
  },
  rateButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  whatsappButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#2C3E50',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAll: {
    color: '#E68A50',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  categoriesContainer: {
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minWidth: 80,
  },
  activeCategoryItem: {
    backgroundColor: '#E68A50',
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  categoryIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    marginBottom: 6,
  },
  activeCategoryIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: '700',
  },
  productsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  productItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    margin: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },

  productInfo: {
    padding: 15,
  },
  productTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    color: '#2C3E50',
  },
  productPrice: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#E68A50',
    marginBottom: 10,
  },
  productMetaContainer: {
    marginBottom: 12,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#5D6D7E',
    marginLeft: 6,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editButtonText: {
    fontSize: 12,
    color: '#E68A50',
    marginLeft: 6,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#E74C3C',
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 4,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  addProductButton: {
    backgroundColor: '#E68A50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addProductButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  skeleton: {
    backgroundColor: '#e1e1e1',
    borderRadius: 4,
  },
  skeletonProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  skeletonText: {
    height: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  skeletonButton: {
    height: 48,
    borderRadius: 15,
  },
  // Rating Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 350,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  starButton: {
    padding: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#ECF0F1',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#E68A50',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    opacity: 0.6,
  },
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1E9EE',
  },
  skeletonInfo: {
    marginLeft: 16,
    justifyContent: 'center',
    flex: 1,
  },
  skeletonText: {
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  skeletonStat: {
    width: '28%',
    height: 60,
    backgroundColor: '#E1E9EE',
    borderRadius: 8,
  }
});

export default ProfileScreen;