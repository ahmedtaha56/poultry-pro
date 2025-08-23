import React, { useState, useEffect, useCallback, memo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackProductView, getCurrentUserId } from '../lib/analytics';
import { on } from '../lib/eventBus';
import UserSearchModal from '../components/UserSearchModal';
import RatingFilterModal from '../components/RatingFilterModal';

// Enhanced global cache with session management
const productsCache = new Map();
const globalProductsData = [];
const globalAppState = {
  hasInitialized: false,
  productsLoaded: false,
  timestamp: 0,
  currentUserId: null
};
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

// Memoized Product Item Component with Modern Design
const ProductItem = memo(({ item, navigation }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSellerPress = () => {
    const sellerId = item.profiles?.id;
    
    navigation.navigate('Profile', {
      screen: 'ProfileMain',
      params: {
        userId: sellerId,
        sellerName: item.profiles?.full_name,
        fromHome: true
      }
    });
  };

  const handleProductPress = () => {
    // First navigate immediately to reduce perceived delay
    navigation.navigate('Profile', {
      screen: 'ProductDetail',
      params: {
        productId: item.id,
        origin: 'Home',
        sellerId: item.profiles?.id
      },
      key: item.id.toString()
    });
    
    // Then track the view in the background without awaiting
    getCurrentUserId().then(currentUserId => {
      if (currentUserId && item.profiles?.id) {
        trackProductView(item.id, currentUserId, item.profiles.id, 'Home')
          .catch(err => console.log('Background tracking error:', err));
      }
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Live': return 'activity';
      case 'Frozen': return 'cloud';
      case 'Eggs': return 'circle';
      case 'Feed': return 'shopping-cart';
      default: return 'package';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Live': return ['#4CAF50', '#45A049'];
      case 'Frozen': return ['#2196F3', '#1976D2'];
      case 'Eggs': return ['#FF9800', '#F57C00'];
      case 'Feed': return ['#9C27B0', '#7B1FA2'];
      default: return ['#607D8B', '#455A64'];
    }
  };

  return (
    <TouchableOpacity
      style={styles.modernProductCard}
      onPress={handleProductPress}
      activeOpacity={0.95}
    >
      <View style={styles.modernImageContainer}>
        {!imageLoaded && (
          <View style={styles.modernImagePlaceholder}>
            <ActivityIndicator size="small" color="#E68A50" />
          </View>
        )}
        <Image
          source={{ uri: item.product_images?.[0]?.image_url || require('../assets/placeholder.jpg') }}
          style={styles.modernProductImage}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Modern Price Tag */}
        <View style={styles.modernPriceContainer}>
          <LinearGradient
            colors={['#E68A50', '#D07A47']}
            style={styles.modernPriceTag}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.modernPriceText}>₹{item.price}</Text>
          </LinearGradient>
        </View>

        {/* Category Badge */}
        <View style={styles.modernCategoryBadge}>
          <LinearGradient
            colors={getCategoryColor(item.category)}
            style={styles.modernCategoryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name={getCategoryIcon(item.category)} size={10} color="#fff" />
            <Text style={styles.modernCategoryText}>{item.category}</Text>
          </LinearGradient>
        </View>

        {/* Weight Badge */}
        {item.weight && (
          <View style={styles.modernWeightBadge}>
            <View style={styles.modernWeightContainer}>
              <Feather name="box" size={10} color="#fff" />
              <Text style={styles.modernWeightText}>{item.weight}</Text>
            </View>
          </View>
        )}

        {/* Image Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.modernImageOverlay}
        />
      </View>

      <View style={styles.modernProductInfo}>
        <Text style={styles.modernProductTitle} numberOfLines={2}>{item.product_name}</Text>

        <View style={styles.modernSellerSection}>
          <View style={styles.modernAvatarContainer}>
            <Image
              source={{ uri: item.profiles?.profile_image || require('../assets/avatar-placeholder.png') }}
              style={styles.modernAvatar}
            />
          </View>

          <TouchableOpacity
            style={styles.modernSellerInfo}
            onPress={handleSellerPress}
            activeOpacity={0.8}
          >
            <View style={styles.sellerInfoContainer}>
              <Text style={styles.modernSellerName}>{item.profiles?.full_name || 'Unknown Seller'}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.profiles?.rating ? item.profiles.rating.toFixed(1) : '0.0'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const HomeScreen = ({ navigation, route }) => {
  // Initialize with cached data if app has been initialized
  const [products, setProducts] = useState(() => {
    if (globalAppState.hasInitialized && globalAppState.productsLoaded &&
      globalProductsData.length > 0) {
      console.log('HomeScreen: Initializing with cached data');
      return globalProductsData;
    }
    return [];
  });

  const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
  const [loading, setLoading] = useState(() => {
    return !globalAppState.hasInitialized || !globalAppState.productsLoaded;
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  
  // New state for rating filter
  const [ratingFilterModalVisible, setRatingFilterModalVisible] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');

  const isFocused = useIsFocused();

  // Categories from SellScreen
  const categories = ['All', 'Live', 'Frozen', 'Eggs', 'Feed'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'All': return 'grid';
      case 'Live': return 'activity';
      case 'Frozen': return 'cloud';
      case 'Eggs': return 'circle';
      case 'Feed': return 'shopping-cart';
      default: return 'package';
    }
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case 'All': return ['#E68A50', '#D07A47'];
      case 'Live': return ['#4CAF50', '#45A049'];
      case 'Frozen': return ['#2196F3', '#1976D2'];
      case 'Eggs': return ['#FF9800', '#F57C00'];
      case 'Feed': return ['#9C27B0', '#7B1FA2'];
      default: return ['#607D8B', '#455A64'];
    }
  };

  // Helper function to get rating filter text
  const getRatingFilterText = (ratingFilter) => {
    switch (ratingFilter) {
      case 'all': return 'All Products';
      case '5': return '5⭐';
      case '4': return '4⭐ & Above';
      case '3': return '3⭐ & Above';
      case '2': return '2⭐ & Above';
      case '1': return '1⭐ & Above';
      default: return 'All Products';
    }
  };

  // Handle back arrow press - navigate to specific screen
  const handleBackPress = () => {
    // Replace 'TargetScreen' with the actual screen name you want to navigate to
    // For example: 'Dashboard', 'Menu', 'Settings', etc.
    navigation.navigate('JobCategory'); // Change this to your desired screen
    
    // Alternative navigation options:
    // navigation.goBack(); // Go back to previous screen
    // navigation.navigate('TabNavigator', { screen: 'Dashboard' }); // Navigate to specific tab
    // navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }); // Reset stack to specific screen
  };

  // Filter products based on selected category
  const filterProducts = useCallback((productsData, category) => {
    if (category === 'All') {
      return productsData;
    }
    return productsData.filter(product => product.category === category);
  }, []);

  // Filter products by rating
  const filterProductsByRating = useCallback((productsData, ratingFilter) => {
    if (ratingFilter === 'all') {
      return productsData;
    }
    
    return productsData.filter(product => {
      const sellerRating = product.profiles?.rating || 0;
      
      switch (ratingFilter) {
        case '5':
          return sellerRating >= 5;
        case '4':
          return sellerRating >= 4;
        case '3':
          return sellerRating >= 3;
        case '2':
          return sellerRating >= 2;
        case '1':
          return sellerRating >= 1;
        default:
          return true;
      }
    });
  }, []);

  // Handle category selection with rating filter
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    let filteredProducts = filterProducts(allProducts, category);
    filteredProducts = filterProductsByRating(filteredProducts, selectedRatingFilter);
    setProducts(filteredProducts);
  }, [allProducts, filterProducts, filterProductsByRating, selectedRatingFilter]);

  // Handle rating filter selection
  const handleRatingSelect = useCallback((ratingFilter) => {
    setSelectedRatingFilter(ratingFilter);
    let filteredProducts = filterProducts(allProducts, selectedCategory);
    filteredProducts = filterProductsByRating(filteredProducts, ratingFilter);
    setProducts(filteredProducts);
  }, [allProducts, filterProducts, filterProductsByRating, selectedCategory]);

  // Check if user has changed (for logout/login scenarios)
  const checkUserSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      if (currentUserId !== globalAppState.currentUserId) {
        console.log('User session changed, clearing cache');
        globalProductsData.length = 0;
        globalAppState.hasInitialized = false;
        globalAppState.productsLoaded = false;
        globalAppState.currentUserId = currentUserId;
        globalAppState.timestamp = 0;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking user session:', error);
      return false;
    }
  }, []);

  // Enhanced fetchProducts with both category and rating filtering
  const fetchProducts = useCallback(async (pageNum = 1, refresh = false) => {
    const userChanged = await checkUserSession();

    if (!userChanged && !refresh && globalAppState.hasInitialized &&
      globalAppState.productsLoaded && globalProductsData.length > 0 &&
      (Date.now() - globalAppState.timestamp < CACHE_EXPIRY_TIME)) {
      console.log('HomeScreen: Using cached products data');
      let filteredProducts = filterProducts(globalProductsData, selectedCategory);
      filteredProducts = filterProductsByRating(filteredProducts, selectedRatingFilter);
      setProducts(filteredProducts);
      setAllProducts(globalProductsData);
      setLoading(false);
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else if (!globalAppState.hasInitialized) {
      setLoading(true);
    }

    try {
      const PAGE_SIZE = 20;
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url),
          profiles!seller_id(id, full_name, profile_image, rating)
        `)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);

      if (error) throw error;

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      const newProducts = refresh || pageNum === 1 ? data : [...allProducts, ...data];
      setAllProducts(newProducts);

      // Apply both category and rating filters
      let filteredProducts = filterProducts(newProducts, selectedCategory);
      filteredProducts = filterProductsByRating(filteredProducts, selectedRatingFilter);
      setProducts(filteredProducts);

      // Update global state
      if (refresh || pageNum === 1) {
        globalProductsData.length = 0;
        globalProductsData.push(...newProducts);
        globalAppState.productsLoaded = true;
        globalAppState.hasInitialized = true;
        globalAppState.timestamp = Date.now();
        console.log('HomeScreen: Data cached globally');
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedRatingFilter, allProducts, filterProducts, filterProductsByRating, checkUserSession]);

  // Initial load effect
  useEffect(() => {
    console.log('HomeScreen: Mount effect - App initialized:', globalAppState.hasInitialized);

    if (!globalAppState.hasInitialized) {
      console.log('HomeScreen: First time initialization');
      fetchProducts(1, false);
    } else if (globalProductsData.length > 0) {
      console.log('HomeScreen: Using existing cached data');
      setAllProducts(globalProductsData);
      let filteredProducts = filterProducts(globalProductsData, selectedCategory);
      filteredProducts = filterProductsByRating(filteredProducts, selectedRatingFilter);
      setProducts(filteredProducts);
      setLoading(false);
    }
  }, []);

  // Listen to product update events to update UI instantly
  useEffect(() => {
    const unsubscribe = on('product:update', (updated) => {
      // Update both allProducts and filtered products in place
      const patch = (arr) => arr.map(p => p.id === updated.id ? { ...p, ...updated } : p);
      setAllProducts(prev => patch(prev));
      setProducts(prev => patch(prev));
    });
    return unsubscribe;
  }, []);

  // Focus effect
  useEffect(() => {
    if (isFocused) {
      console.log('HomeScreen: Screen focused');

      if (route.params?.refresh) {
        console.log('HomeScreen: Explicit refresh requested');
        fetchProducts(1, true);
        navigation.setParams({ refresh: false });
        return;
      }

      if (globalAppState.hasInitialized && globalAppState.productsLoaded &&
        (Date.now() - globalAppState.timestamp > CACHE_EXPIRY_TIME)) {
        console.log('HomeScreen: Cache expired, refreshing silently');
        fetchProducts(1, true);
      }
    }
  }, [isFocused, route.params?.refresh, fetchProducts, navigation]);

  // Listen for navigation events
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.fromSell) {
        console.log('HomeScreen: Coming from SellScreen, refreshing products');
        fetchProducts(1, true);
        navigation.setParams({ fromSell: false });
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.fromSell, fetchProducts]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchProducts(page + 1);
    }
  };

  const onRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  // Modern Loading Screen
  if (!globalAppState.hasInitialized && loading && products.length === 0) {
    return (
      <View style={styles.modernLoadingContainer}>
        <LinearGradient
          colors={['#E68A50', '#D07A47']}
          style={styles.modernLoadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.modernLoadingContent}>
            <View style={styles.modernLoadingIcon}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingTitle}>Discovering Fresh Products</Text>
            <Text style={styles.modernLoadingSubtitle}>Finding the best deals for you...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.modernContainer}>
      {/* Modern Header with Back Arrow */}
      <LinearGradient
        colors={['#E68A50', '#D07A47']}
        style={styles.modernHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.modernHeaderContent}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.modernBackButton}
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.modernHeaderLeft}>
            <Text style={styles.modernHeaderTitle}>Fresh Market</Text>
            <Text style={styles.modernHeaderSubtitle}>
              {getRatingFilterText(selectedRatingFilter)} • {products.length} products
            </Text>
          </View>
          
          <View style={styles.modernHeaderActions}>
            <TouchableOpacity
              style={styles.modernActionButton}
              onPress={() => setSearchModalVisible(true)}
            >
              <Feather name="search" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.modernActionButton,
                selectedRatingFilter !== 'all' && styles.activeFilterButton
              ]}
              onPress={() => setRatingFilterModalVisible(true)}
            >
              <Feather name="filter" size={20} color="#fff" />
              {selectedRatingFilter !== 'all' && (
                <View style={styles.filterBadge}>
                  <View style={styles.filterBadgeDot} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductItem item={item} navigation={navigation} />}
        contentContainerStyle={styles.modernListContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.modernColumnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E68A50', '#D07A47']}
            tintColor="#E68A50"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.modernCategoriesSection}>
            <View style={styles.modernSectionHeader}>
              <Text style={styles.modernSectionTitle}>Categories</Text>
              <Text style={styles.modernProductCount}>
                {products.length} products
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modernCategoryScrollContainer}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.modernCategoryCard,
                    selectedCategory === category && styles.modernSelectedCategoryCard
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.8}
                >
                  {selectedCategory === category ? (
                    <LinearGradient
                      colors={getCategoryGradient(category)}
                      style={styles.modernCategoryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.modernCategoryIconContainer}>
                        <Feather name={getCategoryIcon(category)} size={20} color="#fff" />
                      </View>
                      <Text style={styles.modernSelectedCategoryLabel}>{category}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.modernCategoryContent}>
                      <View style={styles.modernInactiveCategoryIconContainer}>
                        <Feather name={getCategoryIcon(category)} size={20} color="#999" />
                      </View>
                      <Text style={styles.modernCategoryLabel}>{category}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.modernEmptyContainer}>
              <View style={styles.modernEmptyIcon}>
                <Feather name="package" size={48} color="#ccc" />
              </View>
              <Text style={styles.modernEmptyTitle}>No Products Found</Text>
              <Text style={styles.modernEmptySubtitle}>
                {selectedCategory === 'All'
                  ? selectedRatingFilter === 'all' 
                    ? 'Be the first one to list a product!'
                    : `No products found with ${getRatingFilterText(selectedRatingFilter).toLowerCase()}`
                  : `No products found in ${selectedCategory} category with ${getRatingFilterText(selectedRatingFilter).toLowerCase()}`
                }
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <View style={styles.modernFooterLoader}>
              <ActivityIndicator size="small" color="#E68A50" />
              <Text style={styles.modernLoadingFooterText}>Loading more products...</Text>
            </View>
          ) : null
        }
      />
      
      <UserSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        navigation={navigation}
      />
      
      {/* Rating Filter Modal */}
      <RatingFilterModal
        visible={ratingFilterModalVisible}
        onClose={() => setRatingFilterModalVisible(false)}
        onRatingSelect={handleRatingSelect}
        selectedRating={selectedRatingFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modernContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modernLoadingContainer: {
    flex: 1,
  },
  modernLoadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernLoadingContent: {
    alignItems: 'center',
  },
  modernLoadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modernLoadingTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modernLoadingSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  modernHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  modernHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modernHeaderLeft: {
    flex: 1,
  },
  modernHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  modernHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modernActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  filterBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  modernCategoriesSection: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modernSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  modernProductCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modernCategoryScrollContainer: {
    paddingHorizontal: 20,
  },
  modernCategoryCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernSelectedCategoryCard: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  modernCategoryGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 90,
  },
  modernCategoryContent: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    minWidth: 90,
  },
  modernCategoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernInactiveCategoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernSelectedCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  modernCategoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  modernListContent: {
    padding: 16,
    paddingTop: 8,
  },
  modernColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modernProductCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  modernImageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  modernImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    zIndex: 1,
  },
  modernProductImage: {
    width: '100%',
    height: '100%',
  },
  modernImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  modernPriceContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modernPriceTag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modernPriceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modernCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  modernCategoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  modernCategoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
    marginLeft: 4,
  },
  modernWeightBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  modernWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  modernWeightText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
    marginLeft: 4,
  },
  modernProductInfo: {
    padding: 16,
  },
  modernProductTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 12,
    lineHeight: 20,
  },
  modernSellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  modernAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#fff',
  },

  modernSellerInfo: {
    flex: 1,
  },
  modernSellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  sellerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  modernEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  modernEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modernEmptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  modernEmptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  modernFooterLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  modernLoadingFooterText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
export default HomeScreen;