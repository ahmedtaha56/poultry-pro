import React, { useState, useEffect, useCallback, memo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  currentUserId: null,
  dataFetchInProgress: false // Add flag to prevent concurrent fetches
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
      case 'Equipment': return 'tool';
      case 'Eggs': return 'circle';
      case 'Feed': return 'shopping-cart';
      default: return 'package';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Live': return ['#4CAF50', '#45A049'];
      case 'Equipment': return ['#9C27B0', '#7B1FA2'];
      case 'Eggs': return ['#FF9800', '#F57C00'];
      case 'Feed': return ['#2196F3', '#1976D2'];
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
    <Text style={styles.modernPriceText}>Rs {item.price}</Text>
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
              <Text style={styles.modernSellerName} numberOfLines={1}>
                {item.profiles?.full_name || 'Unknown Seller'}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {item.profiles?.rating ? item.profiles.rating.toFixed(1) : '0.0'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const HomeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  
  // Initialize state - Always start with cached data if available and user session is valid
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [ratingFilterModalVisible, setRatingFilterModalVisible] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');

  const isFocused = useIsFocused();

  // Categories updated with Equipment instead of Frozen
  const categories = ['All', 'Live', 'Equipment', 'Eggs', 'Feed'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'All': return 'grid';
      case 'Live': return 'activity';
      case 'Equipment': return 'tool';
      case 'Eggs': return 'circle';
      case 'Feed': return 'shopping-cart';
      default: return 'package';
    }
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case 'All': return ['#E68A50', '#D07A47'];
      case 'Live': return ['#4CAF50', '#45A049'];
      case 'Equipment': return ['#9C27B0', '#7B1FA2'];
      case 'Eggs': return ['#FF9800', '#F57C00'];
      case 'Feed': return ['#2196F3', '#1976D2'];
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
    navigation.navigate('JobCategory');
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

  // Check if user has changed and determine if we should use cache
  const checkUserSessionAndCache = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // If user changed, clear cache
      if (currentUserId !== globalAppState.currentUserId) {
        console.log('User session changed, clearing cache');
        globalProductsData.length = 0;
        globalAppState.hasInitialized = false;
        globalAppState.productsLoaded = false;
        globalAppState.currentUserId = currentUserId;
        globalAppState.timestamp = 0;
        return { userChanged: true, canUseCache: false };
      }

      // Check if cache is valid and usable
      const cacheValid = globalAppState.hasInitialized && 
                         globalAppState.productsLoaded && 
                         globalProductsData.length > 0 &&
                         (Date.now() - globalAppState.timestamp < CACHE_EXPIRY_TIME);

      return { userChanged: false, canUseCache: cacheValid };
    } catch (error) {
      console.error('Error checking user session:', error);
      return { userChanged: true, canUseCache: false };
    }
  }, []);

  // Load cached data immediately if available
  const loadCachedDataIfAvailable = useCallback(async () => {
    const { canUseCache } = await checkUserSessionAndCache();
    
    if (canUseCache) {
      console.log('HomeScreen: Loading cached data immediately');
      setAllProducts(globalProductsData);
      let filteredProducts = filterProducts(globalProductsData, selectedCategory);
      filteredProducts = filterProductsByRating(filteredProducts, selectedRatingFilter);
      setProducts(filteredProducts);
      setLoading(false);
      return true;
    }
    return false;
  }, [selectedCategory, selectedRatingFilter, filterProducts, filterProductsByRating, checkUserSessionAndCache]);

  // Enhanced fetchProducts with better cache handling
  const fetchProducts = useCallback(async (pageNum = 1, refresh = false) => {
    // Prevent concurrent fetches
    if (globalAppState.dataFetchInProgress && !refresh) {
      console.log('Data fetch already in progress, skipping');
      return;
    }

    const { userChanged, canUseCache } = await checkUserSessionAndCache();

    // If we can use cache and it's not a refresh, use cached data
    if (!userChanged && !refresh && canUseCache) {
      console.log('HomeScreen: Using cached products data');
      setAllProducts(globalProductsData);
      let filteredProducts = filterProducts(globalProductsData, selectedCategory);
      filteredProducts = filterProductsByRating(filteredProducts, selectedRatingFilter);
      setProducts(filteredProducts);
      setLoading(false);
      return;
    }

    // Set loading states
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    globalAppState.dataFetchInProgress = true;

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
      globalAppState.dataFetchInProgress = false;
    }
  }, [selectedCategory, selectedRatingFilter, allProducts, filterProducts, filterProductsByRating, checkUserSessionAndCache]);

  // Initial load effect - Load cached data first, then fetch if needed
  useEffect(() => {
    console.log('HomeScreen: Initial mount effect');
    
    const initializeScreen = async () => {
      // Try to load cached data first
      const cacheLoaded = await loadCachedDataIfAvailable();
      
      // If no cache was loaded, fetch fresh data
      if (!cacheLoaded) {
        console.log('HomeScreen: No valid cache, fetching fresh data');
        fetchProducts(1, false);
      }
    };
    
    initializeScreen();
  }, []); // Remove dependencies to prevent re-runs

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

  // Focus effect - Only refresh if explicitly requested or cache expired
  useEffect(() => {
    if (isFocused) {
      console.log('HomeScreen: Screen focused');

      if (route.params?.refresh) {
        console.log('HomeScreen: Explicit refresh requested');
        fetchProducts(1, true);
        navigation.setParams({ refresh: false });
        return;
      }

      // Check cache expiry only if we have initialized data
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

  // Show loading only if we have no products and are actually loading
  if (loading && products.length === 0) {
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
      {/* Modern Header with Back Arrow - Made Smaller */}
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
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.modernHeaderLeft}>
            <Text style={styles.modernHeaderTitle}>Fresh Market • {products.length} products</Text>
          </View>
          
          <View style={styles.modernHeaderActions}>
            <TouchableOpacity
              style={styles.modernActionButton}
              onPress={() => setSearchModalVisible(true)}
            >
              <Feather name="search" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.modernActionButton,
                selectedRatingFilter !== 'all' && styles.activeFilterButton
              ]}
              onPress={() => setRatingFilterModalVisible(true)}
            >
              <Feather name="filter" size={18} color="#fff" />
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
        contentContainerStyle={[styles.modernListContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 16 }]}
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
                {getRatingFilterText(selectedRatingFilter)}
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
                        <Feather name={getCategoryIcon(category)} size={18} color="#fff" />
                      </View>
                      <Text style={styles.modernSelectedCategoryLabel}>{category}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.modernCategoryContent}>
                      <View style={styles.modernInactiveCategoryIconContainer}>
                        <Feather name={getCategoryIcon(category)} size={18} color="#999" />
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
  // Updated Header Styles - Made Smaller
  modernHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12, // Reduced from 20
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modernHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernBackButton: {
    width: 36, // Reduced from 44
    height: 36, // Reduced from 44
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernHeaderLeft: {
    flex: 1,
  },
  modernHeaderTitle: {
    fontSize: 18, // Reduced from 28
    fontWeight: 'bold',
    color: '#fff',
  },
  modernHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modernActionButton: {
    width: 36, // Reduced from 44
    height: 36, // Reduced from 44
    borderRadius: 18,
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
    top: 6,
    right: 6,
  },
  filterBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  modernCategoriesSection: {
    paddingVertical: 16, // Reduced from 20
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12, // Reduced from 16
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modernSectionTitle: {
    fontSize: 18, // Reduced from 20
    fontWeight: 'bold',
    color: '#1a202c',
  },
  modernProductCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  modernCategoryScrollContainer: {
    paddingHorizontal: 16,
  },
  modernCategoryCard: {
    marginRight: 10,
    borderRadius: 14,
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
    paddingVertical: 10, // Reduced from 14
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 75, // Reduced from 90
  },
  modernCategoryContent: {
    paddingVertical: 10, // Reduced from 14
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    minWidth: 75, // Reduced from 90
  },
  modernCategoryIconContainer: {
    width: 30, // Reduced from 36
    height: 30, // Reduced from 36
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  modernInactiveCategoryIconContainer: {
    width: 30, // Reduced from 36
    height: 30, // Reduced from 36
    borderRadius: 15,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  modernSelectedCategoryLabel: {
    fontSize: 11, // Reduced from 12
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  modernCategoryLabel: {
    fontSize: 11, // Reduced from 12
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
    marginBottom: 12, // Reduced from 16
  },
  // Updated Product Card Styles - Made Smaller
  modernProductCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 16, // Reduced from 20
    overflow: 'hidden',
    elevation: 3, // Reduced from 4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Reduced from 4
    shadowOpacity: 0.1, // Reduced from 0.12
    shadowRadius: 6, // Reduced from 8
  },
  modernImageContainer: {
    position: 'relative',
    height: 160, // Reduced from 200
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
    height: 60, // Reduced from 80
  },
  modernPriceContainer: {
    position: 'absolute',
    top: 10, // Reduced from 12
    right: 10, // Reduced from 12
  },
  modernPriceTag: {
    paddingVertical: 6, // Reduced from 8
    paddingHorizontal: 10, // Reduced from 12
    borderRadius: 14, // Reduced from 16
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modernPriceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12, // Reduced from 14
  },
  modernCategoryBadge: {
    position: 'absolute',
    top: 10, // Reduced from 12
    left: 10, // Reduced from 12
  },
  modernCategoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3, // Reduced from 4
    paddingHorizontal: 6, // Reduced from 8
    borderRadius: 10, // Reduced from 12
  },
  modernCategoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 9, // Reduced from 10
    marginLeft: 3, // Reduced from 4
  },
  modernWeightBadge: {
    position: 'absolute',
    bottom: 10, // Reduced from 12
    left: 10, // Reduced from 12
  },
  modernWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3, // Reduced from 4
    paddingHorizontal: 6, // Reduced from 8
    borderRadius: 10, // Reduced from 12
  },
  modernWeightText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 9, // Reduced from 10
    marginLeft: 3, // Reduced from 4
  },
  modernProductInfo: {
    padding: 12, // Reduced from 16
  },
  modernProductTitle: {
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8, // Reduced from 12
    lineHeight: 18, // Reduced from 20
  },
  modernSellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernAvatarContainer: {
    position: 'relative',
    marginRight: 8, // Reduced from 12
  },
  modernAvatar: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Reduced from 16
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modernSellerInfo: {
    flex: 1,
  },
  modernSellerName: {
    fontSize: 12, // Reduced from 14
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  sellerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed from gap: 4
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 3, // Reduced from 4
    borderRadius: 10, // Reduced from 12
    marginLeft: 6, // Added to ensure spacing
  },
  ratingText: {
    fontSize: 10, // Reduced from 12
    fontWeight: '600',
    color: '#374151',
    marginLeft: 2, // Reduced from 4
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