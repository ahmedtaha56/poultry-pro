import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
  Keyboard,
  StatusBar,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const UserSearchModal = ({ visible, onClose, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchIdRef = useRef(0);
  
  const searchInputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      StatusBar.setBarStyle('light-content', true);
      
      // Beautiful entrance animation with shimmer
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous shimmer animation
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Auto-focus search input
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      
      loadInitialData();
    } else {
      StatusBar.setBarStyle('dark-content', true);
      // Reset animations
      slideAnim.setValue(-screenHeight);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setSearchQuery('');
      setSearchResults([]);
      setNoResults(false);
    }
  }, [visible]);

  // Pulse animation for loading
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const loadInitialData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, profile_image, bio')
        .limit(8)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecentSearches(data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setLoading(true);
    setNoResults(false);
    const id = ++searchIdRef.current;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, profile_image, bio')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(12);

      if (error) throw error;

      // Ignore stale responses
      if (id !== searchIdRef.current) return;

      if (data && data.length > 0) {
        setSearchResults(data);
        setNoResults(false);
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      if (id === searchIdRef.current) setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserPress = async (user) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const currentUserId = currentUser?.id;
      const isOwnProfile = user.id === currentUserId;

      closeModal();

      setTimeout(() => {
        if (isOwnProfile) {
          navigation.navigate('Profile', {
            screen: 'ProfileMain',
            params: {
              forceViewMode: 'owner',
              sellerName: user.full_name,
              isOwnProfile: true,
              fromSearch: true,
              skipInitialLoad: true
            }
          });
        } else {
          navigation.navigate('Profile', {
            screen: 'ProfileMain',
            params: {
              userId: user.id,
              forceViewMode: 'viewer',
              sellerName: user.full_name,
              isOwnProfile: false,
              fromSearch: true,
              skipInitialLoad: true
            }
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  };

  const closeModal = () => {
    Keyboard.dismiss();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -screenHeight,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setNoResults(false);
    searchInputRef.current?.focus();
  };

  const renderUserItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.userItem,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [-screenHeight, 0],
              outputRange: [60 * (index + 1), 0],
              extrapolate: 'clamp',
            })
          }],
          opacity: slideAnim.interpolate({
            inputRange: [-screenHeight, 0],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })
        }
      ]}
    >
      <TouchableOpacity
        style={styles.userItemContent}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#ffffff', '#fefefe', '#f8fafc']}
          style={styles.userItemGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={['rgba(230,138,80,0.1)', 'rgba(208,122,71,0.05)', 'transparent']}
            style={styles.userItemShimmer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#E68A50', '#D07A47', '#C06F40']}
              style={styles.avatarBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={{ 
                  uri: item.profile_image || require('../assets/avatar-placeholder.png') 
                }}
                style={styles.userAvatar}
              />
            </LinearGradient>
            <LinearGradient
              colors={['#4CAF50', '#45A049', '#3D8B40']}
              style={styles.onlineIndicator}
            />
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.full_name}
            </Text>
            {item.username && (
              <Text style={styles.userUsername} numberOfLines={1}>
                @{item.username}
              </Text>
            )}
            {item.bio && (
              <Text style={styles.userBio} numberOfLines={1}>
                {item.bio}
              </Text>
            )}
          </View>
          
          <View style={styles.viewProfileButton}>
            <LinearGradient
              colors={['#E68A50', '#D07A47', '#C06F40']}
              style={styles.profileButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileButtonInner}>
                <Feather name="arrow-right" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRecentItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.recentItem,
        {
          transform: [{
            scale: slideAnim.interpolate({
              inputRange: [-screenHeight, 0],
              outputRange: [0.8, 1],
              extrapolate: 'clamp',
            })
          }],
          opacity: slideAnim.interpolate({
            inputRange: [-screenHeight, 0],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })
        }
      ]}
    >
      <TouchableOpacity
        style={styles.recentItemContent}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#ffffff', '#fefefe', '#f8fafc']}
          style={styles.recentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={['rgba(230,138,80,0.08)', 'rgba(208,122,71,0.04)', 'transparent']}
            style={styles.recentShimmer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.recentAvatarContainer}>
            <LinearGradient
              colors={['#E68A50', '#D07A47', '#C06F40']}
              style={styles.recentAvatarBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={{ 
                  uri: item.profile_image || require('../assets/avatar-placeholder.png') 
                }}
                style={styles.recentAvatar}
              />
            </LinearGradient>
          </View>
          <Text style={styles.recentName} numberOfLines={1}>
            {item.full_name}
          </Text>
          {item.username && (
            <Text style={styles.recentUsername} numberOfLines={1}>
              @{item.username}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      {/* Enhanced Backdrop with Blur Effect */}
      <TouchableWithoutFeedback onPress={closeModal}>
        <Animated.View
          style={[
            styles.modalBackdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              })
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(30,41,59,0.6)', 'rgba(0,0,0,0.5)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Main Search Container with Enhanced Design */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Enhanced Search Header with Multi-layer Gradient */}
        <View style={styles.searchHeaderContainer}>
          <LinearGradient
            colors={['#FF8A50', '#E68A50', '#D07A47', '#C06F40']}
            style={styles.searchHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'transparent', 'rgba(0,0,0,0.1)']}
              style={styles.headerOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.headerTop}>
              <LinearGradient
                colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
                style={styles.headerIndicator}
              />
            </View>
            
            <View style={styles.searchInputContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                style={styles.searchInputBackground}
              >
                <View style={styles.searchIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                    style={styles.searchIconGradient}
                  >
                    <Feather name="search" size={20} color="#E68A50" />
                  </LinearGradient>
                </View>
                
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search users by name or username..."
                  placeholderTextColor="rgba(255,255,255,0.85)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#fff"
                />
                
                {searchQuery.length > 0 ? (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearSearch}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                      style={styles.actionButtonGradient}
                    >
                      <Feather name="x" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                      style={styles.actionButtonGradient}
                    >
                      <Feather name="chevron-up" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Search Results Content */}
        <View style={styles.searchContent}>
          <LinearGradient
            colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
            style={styles.contentBackground}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View
                  style={[
                    styles.loadingIconContainer,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <LinearGradient
                    colors={['#FF8A50', '#E68A50', '#D07A47']}
                    style={styles.loadingIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'transparent', 'rgba(0,0,0,0.1)']}
                      style={styles.loadingIconOverlay}
                    />
                    <ActivityIndicator size="large" color="#fff" />
                  </LinearGradient>
                </Animated.View>
                <LinearGradient
                  colors={['#64748b', '#475569']}
                  style={styles.loadingTextGradient}
                >
                  <Text style={styles.loadingText}>Searching amazing users...</Text>
                </LinearGradient>
              </View>
            ) : noResults ? (
              <View style={styles.noResultsContainer}>
                <LinearGradient
                  colors={['#f1f5f9', '#e2e8f0', '#cbd5e1']}
                  style={styles.noResultsIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name="user-x" size={32} color="#94a3b8" />
                </LinearGradient>
                <LinearGradient
                  colors={['#374151', '#1f2937']}
                  style={styles.noResultsTitleGradient}
                >
                  <Text style={styles.noResultsTitle}>No Users Found</Text>
                </LinearGradient>
                <Text style={styles.noResultsSubtitle}>
                  Sorry, we couldn't find any users matching "{searchQuery}". Try a different search term.
                </Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionsHeader}>
                  <LinearGradient
                    colors={['#FF8A50', '#E68A50', '#D07A47', '#C06F40']}
                    style={styles.suggestionsHeaderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.2)', 'transparent', 'rgba(0,0,0,0.1)']}
                      style={styles.suggestionsHeaderOverlay}
                    />
                    <View style={styles.suggestionsIconContainer}>
                      <Feather name="users" size={18} color="#fff" />
                    </View>
                    <Text style={styles.suggestionsTitle}>Discover Users</Text>
                  </LinearGradient>
                </View>
                
                {recentSearches.length > 0 ? (
                  <FlatList
                    data={recentSearches}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRecentItem}
                    numColumns={2}
                    columnWrapperStyle={styles.recentRow}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.recentList}
                  />
                ) : (
                  <View style={styles.emptyRecent}>
                    <LinearGradient
                      colors={['#f1f5f9', '#e2e8f0', '#cbd5e1']}
                      style={styles.emptyIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Feather name="search" size={24} color="#94a3b8" />
                    </LinearGradient>
                    <LinearGradient
                      colors={['#64748b', '#475569']}
                      style={styles.emptyTextGradient}
                    >
                      <Text style={styles.emptyRecentText}>
                        Start typing to discover amazing users
                      </Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.85,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  searchHeaderContainer: {
    elevation: 12,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  searchHeader: {
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerIndicator: {
    width: 50,
    height: 5,
    borderRadius: 3,
    elevation: 2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  searchInputContainer: {
    marginTop: 20,
  },
  searchInputBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  searchIconContainer: {
    marginRight: 16,
  },
  searchIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  actionButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContent: {
    flex: 1,
  },
  contentBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingIconContainer: {
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  loadingTextGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  noResultsIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    elevation: 4,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  noResultsTitleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  resultsList: {
    padding: 24,
    paddingTop: 28,
  },
  userItem: {
    marginBottom: 18,
  },
  userItemContent: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  userItemGradient: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(230,138,80,0.1)',
  },
  userItemShimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 18,
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f1f5f9',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  userUsername: {
    fontSize: 14,
    color: '#E68A50',
    fontWeight: '700',
    marginBottom: 6,
  },
  userBio: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    fontWeight: '500',
  },
  viewProfileButton: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  profileButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  suggestionsContainer: {
    padding: 24,
    paddingTop: 28,
  },
  suggestionsHeader: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  suggestionsHeaderGradient: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  suggestionsHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  suggestionsIconContainer: {
    marginRight: 12,
  },
  suggestionsTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recentList: {
    paddingBottom: 24,
  },
  recentRow: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  recentItem: {
    flex: 0.48,
  },
  recentItemContent: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  recentGradient: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(230,138,80,0.08)',
  },
  recentShimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  recentAvatarContainer: {
    marginBottom: 16,
  },
  recentAvatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  recentAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f1f5f9',
  },
  recentName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  recentUsername: {
    fontSize: 12,
    color: '#E68A50',
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emptyTextGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyRecentText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default UserSearchModal;