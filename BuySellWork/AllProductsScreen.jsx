import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { trackProductView, getCurrentUserId } from '../lib/analytics';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const isTablet = width > 768;
const isSmallDevice = width < 350;
const numColumns = isTablet ? 3 : 2;
const cardWidth = (width - (numColumns + 1) * 16) / numColumns;

const AllProductsScreen = ({ navigation }) => {
  const route = useRoute();
  const { userId, initialProducts } = route.params || {};
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [scrollY] = useState(new Animated.Value(0));
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  // Cache for storing fetched products
  const productsCache = useRef(new Map());
  const lastFetchParams = useRef({ userId: null, category: null });
  const activeRequestIdRef = useRef(0);

  const categories = ['All', 'Live', 'Frozen', 'Eggs', 'Feed'];

  // Memoize the cache key
  const cacheKey = useMemo(() => {
    return `${userId || 'all'}_${selectedCategory}`;
  }, [userId, selectedCategory]);

  // Check if we have cached data
  const getCachedProducts = useCallback(() => {
    return productsCache.current.get(cacheKey);
  }, [cacheKey]);

  // Cache the products
  const cacheProducts = useCallback((data, reset = false) => {
    const existing = productsCache.current.get(cacheKey) || [];
    const newData = reset ? data : [...existing, ...data];
    productsCache.current.set(cacheKey, newData);
  }, [cacheKey]);

  const fetchProducts = useCallback(async (reset = false) => {
    // Prevent multiple simultaneous requests
    if (loading) return;
    const requestId = ++activeRequestIdRef.current;
    if (reset) setResetLoading(true);
    
    // Check if we have cached data and it's not a refresh
    if (!reset && !refreshing) {
      const cached = getCachedProducts();
      if (cached && cached.length > 0) {
        setProducts(cached);
        setHasMore(cached.length >= 10);
        return;
      }
    }

    setLoading(true);
    try {
      console.log('AllProductsScreen - Fetching products for userId:', userId);
      let query = supabase
        .from('products')
        .select('*, product_images(image_url), profiles(username, profile_image)')
        .order('created_at', { ascending: false });

      // Apply user filter only if userId is provided
      if (userId) {
        query = query.eq('seller_id', userId);
      }

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      if (!reset) {
        query = query.range(page * 10, (page + 1) * 10 - 1);
      } else {
        query = query.limit(10);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (reset) {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }
        setProducts(data || []);
        setPage(1);
        setHasMore((data || []).length === 10);
        cacheProducts(data || [], true);
        console.log('AllProductsScreen - Reset fetch completed, products count:', (data || []).length);
      } else {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }
        if (data && data.length > 0) {
          setProducts(prev => [...prev, ...data]);
          setPage(prev => prev + 1);
          setHasMore(data.length === 10);
          cacheProducts(data, false);
        } else {
          setHasMore(false);
          console.log('AllProductsScreen - No more products to load');
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setLoading(false);
        setCategoryLoading(false);
        setRefreshing(false);
        setResetLoading(false);
      }
    }
  }, [userId, selectedCategory, page, loading, refreshing, getCachedProducts, cacheProducts]);

  const handleRefresh = useCallback(() => {
    if (categoryLoading) return;
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    // Clear cache for this combination
    productsCache.current.delete(cacheKey);
    fetchProducts(true);
  }, [fetchProducts, cacheKey, categoryLoading]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProducts(false);
    }
  }, [loading, hasMore, fetchProducts]);

  // Initialize with initial products if available
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0 && !isInitialized) {
      setProducts(initialProducts);
      cacheProducts(initialProducts, true);
      setIsInitialized(true);
      console.log('AllProductsScreen - Using initial products:', initialProducts.length);
    }
  }, [initialProducts, isInitialized, cacheProducts]);

  // Handle category or userId changes
  useEffect(() => {
    if (isInitialized) {
      const paramsChanged = 
        lastFetchParams.current.userId !== userId || 
        lastFetchParams.current.category !== selectedCategory;
      
      if (paramsChanged) {
        console.log('AllProductsScreen - Parameters changed, refetching');
        lastFetchParams.current = { userId, category: selectedCategory };
        setPage(1);
        setHasMore(true);
        setCategoryLoading(true);
        // Keep existing products to avoid blink; fetch new data and replace on arrival
        fetchProducts(true);
      }
    }
  }, [selectedCategory, userId, isInitialized, fetchProducts]);

  // Focus effect: do a single initial fetch (or hydrate from cache) on first focus
  useFocusEffect(
    useCallback(() => {
      if (!isInitialized) {
        const cached = getCachedProducts();
        if (cached && cached.length > 0) {
          setProducts(cached);
          setHasMore(cached.length >= 10);
        } else {
          setCategoryLoading(true);
          fetchProducts(true);
        }
      }
    }, [isInitialized, getCachedProducts, fetchProducts])
  );

  // Memoize the filtered products count
  const filteredProductsCount = useMemo(() => {
    return products.length;
  }, [products.length]);

  // Memoize empty state messages
  const emptyStateMessage = useMemo(() => {
    if (selectedCategory !== 'All') {
      return `No ${selectedCategory} products found`;
    }
    return 'No products found';
  }, [selectedCategory]);

  const emptyStateSubtitle = useMemo(() => {
    if (selectedCategory !== 'All') {
      return 'Try selecting a different category';
    }
    return 'Start adding products to see them here';
  }, [selectedCategory]);

  // Memoize the render product function
  const renderProduct = useCallback(({ item, index }) => (
    <Animated.View
      style={[
        styles.productItem,
        {
          width: cardWidth,
          opacity: scrollY.interpolate({
            inputRange: [0, 100 * index, 100 * (index + 1)],
            outputRange: [1, 1, 0.8],
            extrapolate: 'clamp',
          }),
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          // First navigate immediately to reduce perceived delay
          navigation.navigate('ProductDetail', { productId: item.id });
          
          // Then track the view in the background without awaiting
          getCurrentUserId().then(currentUserId => {
            if (currentUserId && item.seller_id) {
              trackProductView(item.id, currentUserId, item.seller_id, 'AllProducts')
                .catch(err => console.log('Background tracking error:', err));
            }
          });
        }}
        style={styles.productTouchable}
        activeOpacity={0.85}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.product_images?.[0]?.image_url || 'https://via.placeholder.com/150' }}
            style={[styles.productImage, { height: cardWidth * 0.75 }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)']}
            style={styles.imageOverlay}
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.product_name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.category || 'General'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [cardWidth, scrollY, navigation]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  // Memoized category selection handler
  const handleCategorySelect = useCallback((category) => {
    if (category === selectedCategory || categoryLoading) return;
    // If cached data exists for target category, render immediately to avoid empty flicker
    const targetKey = `${userId || 'all'}_${category}`;
    const cached = productsCache.current.get(targetKey);
    if (cached && cached.length > 0) {
      setProducts(cached);
    }
    setSelectedCategory(category);
  }, [selectedCategory, categoryLoading, userId]);

  // Memoize the category chips
  const categoryChips = useMemo(() => (
    categories.map((category) => (
              <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.selectedCategoryChip,
            categoryLoading && styles.disabledCategoryChip
          ]}
          onPress={() => handleCategorySelect(category)}
          activeOpacity={0.8}
          disabled={categoryLoading}
        >
        {selectedCategory === category ? (
          <LinearGradient
            colors={['#E68A50', '#FF6B35']}
            style={styles.categoryChipGradient}
          >
            <Text style={[styles.categoryChipText, styles.selectedCategoryChipText]}>
              {category}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.categoryChipDefault}>
            <Text style={styles.categoryChipText}>{category}</Text>
          </View>
        )}
      </TouchableOpacity>
    ))
  ), [categories, selectedCategory, handleCategorySelect, categoryLoading]);

  // Memoize the footer component
  const FooterComponent = useMemo(() => (
    loading && !refreshing && !categoryLoading && !resetLoading && products.length > 0 ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#E68A50" />
        <Text style={styles.footerText}>Loading more products...</Text>
      </View>
    ) : null
  ), [loading, refreshing, categoryLoading, resetLoading, products.length]);

  // Immediate handler for "Show all products" to avoid empty flicker
  const handleShowAllPress = useCallback(() => {
    // Turn on loading immediately so empty state doesn't flash
    setCategoryLoading(true);
    // If we have cached 'All' products, render them immediately
    const allKey = `${userId || 'all'}_All`;
    const cachedAll = productsCache.current.get(allKey);
    if (cachedAll && cachedAll.length > 0) {
      setProducts(cachedAll);
    }
    // Trigger category change
    setSelectedCategory('All');
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Fixed Header */}
      <Animated.View 
        style={[styles.header, { opacity: headerOpacity }]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderHeight(height);
        }}
      >
        <BlurView intensity={80} style={styles.blurHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={width > 400 ? 24 : 20} color="black" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>All Products</Text>
              <Text style={styles.headerSubtitle}>{filteredProductsCount} items</Text>
            </View>
            <View style={{ width: width > 400 ? 40 : 32 }} />
          </View>
        </BlurView>
      </Animated.View>

      {/* Category Filter Section */}
      <View style={[styles.categorySection, { paddingTop: headerHeight || 90 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
          style={styles.categoryScrollView}
        >
          {categoryChips}
        </ScrollView>
      </View>
      
      {/* Content Area */}
      <View style={styles.contentContainer}>
        <Animated.FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={numColumns}
          key={`${numColumns}`}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#E68A50', '#FF6B35']}
              tintColor="#E68A50"
              progressBackgroundColor="white"
            />
          }
          ListFooterComponent={FooterComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={6}
          getItemLayout={(data, index) => ({
            length: cardWidth * 0.75 + 120, // Approximate item height
            offset: (cardWidth * 0.75 + 120) * Math.floor(index / numColumns),
            index,
          })}
          ListEmptyComponent={(
            (categoryLoading || resetLoading || loading) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E68A50" />
                <Text style={styles.loadingText}>Loading {selectedCategory} products...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['#E68A50', '#FF6B35']}
                  style={[styles.emptyIcon, { 
                    width: isSmallDevice ? 80 : 100, 
                    height: isSmallDevice ? 80 : 100,
                    borderRadius: isSmallDevice ? 40 : 50 
                  }]}
                >
                  <Feather name="box" size={isSmallDevice ? 40 : 50} color="white" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>{emptyStateMessage}</Text>
                <Text style={styles.emptySubtitle}>{emptyStateSubtitle}</Text>
                {selectedCategory !== 'All' && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={handleShowAllPress}
                    disabled={categoryLoading}
                  >
                    <LinearGradient
                      colors={['#E68A50', '#FF6B35']}
                      style={styles.clearButtonGradient}
                    >
                      <Text style={styles.clearButtonText}>Show all products</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            )
          )}
        />
        {(categoryLoading || resetLoading) && products.length > 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E68A50" />
            <Text style={styles.loadingText}>Loading {selectedCategory} products...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  blurHeader: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width > 400 ? 20 : 16,
    paddingTop: 10,
    minHeight: 60,
  },
  backButton: {
    width: width > 400 ? 40 : 32,
    height: width > 400 ? 40 : 32,
    borderRadius: width > 400 ? 20 : 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: isTablet ? 26 : isSmallDevice ? 18 : 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: isTablet ? 14 : isSmallDevice ? 10 : 12,
    color: '#666',
    marginTop: 2,
  },
  categorySection: {
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  categoryScrollView: {
    paddingHorizontal: 16,
  },
  categoryScrollContainer: {
    paddingRight: 20,
    alignItems: 'center',
  },
  categoryChip: {
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryChipGradient: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 6 : 8,
  },
  categoryChipDefault: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 6 : 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  selectedCategoryChip: {
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryChipText: {
    fontSize: isTablet ? 16 : isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  disabledCategoryChip: {
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 8,
    flexGrow: 1,
  },
  productItem: {
    margin: 8,
  },
  productTouchable: {
    backgroundColor: 'white',
    borderRadius: isTablet ? 24 : 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  productInfo: {
    padding: isTablet ? 20 : isSmallDevice ? 12 : 16,
  },
  productTitle: {
    fontSize: isTablet ? 18 : isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: isTablet ? 24 : isSmallDevice ? 18 : 22,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: isTablet ? 20 : isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#E68A50',
  },
  categoryTag: {
    backgroundColor: 'rgba(230, 138, 80, 0.1)',
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: isTablet ? 12 : isSmallDevice ? 10 : 11,
    color: '#E68A50',
    fontWeight: '600',
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 60 : isSmallDevice ? 30 : 40,
  },
  emptyIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: isTablet ? 18 : isSmallDevice ? 14 : 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: isTablet ? 26 : isSmallDevice ? 20 : 22,
    marginBottom: 32,
    maxWidth: isTablet ? 400 : 300,
  },
  clearButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  clearButtonGradient: {
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 20 : 24,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: isTablet ? 18 : isSmallDevice ? 14 : 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 12,
    color: '#666',
    fontSize: isTablet ? 16 : 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: isTablet ? 18 : 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)'
  },
});

export default AllProductsScreen;