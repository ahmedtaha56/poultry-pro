import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');



// Initialize Supabase client
const supabaseUrl = 'https://bprdfdroaybigmecfsqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcmRmZHJvYXliaWdtZWNmc3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODA0NDcsImV4cCI6MjA2ODI1NjQ0N30.uotYgkfsSrLDlTO4UmJMJWv7ZRhQV3glrkNk3oVFu3E';
const supabase = createClient(supabaseUrl, supabaseKey);

const NewsModule = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch news from Supabase
  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching news:', error);
        return;
      }
      
      setNews(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Navigate back to JobCategory
  const handleBackPress = () => {
    navigation.navigate('JobCategory');
  };

  // Get category color with new palette
  const getCategoryColor = (category) => {
    const colors = {
      'health': '#F4A261',
      'prevention': '#E9C46A',
      'medicine': '#2A9D8F',
      'care': '#E76F51',
      'tips': '#264653',
      'default': '#F4A261'
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#F4A261" />
        
        {/* Responsive Header Container */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#F4A261', '#E9C46A']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.header}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health News & Tips</Text>
            <View style={styles.placeholder} />
          </LinearGradient>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#F4A261" />
            <Text style={styles.loadingText}>Loading health news...</Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, { backgroundColor: '#F4A261' }]} />
              <View style={[styles.dot, { backgroundColor: '#E9C46A' }]} />
              <View style={[styles.dot, { backgroundColor: '#2A9D8F' }]} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F4A261" />
      
      {/* Responsive Header Container */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#F4A261', '#E9C46A']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health News & Tips</Text>
          <View style={styles.placeholder} />
        </LinearGradient>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Stay Healthy, Stay Informed</Text>
        <Text style={styles.heroSubtitle}>Latest health updates & expert tips</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#F4A261']}
            tintColor="#F4A261"
            progressBackgroundColor="#FFFFFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="newspaper-outline" size={80} color="#F4A261" />
            </View>
            <Text style={styles.emptyTitle}>No News Available</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh and check for new health updates</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          news.map((item, index) => (
            <TouchableOpacity key={item.id} activeOpacity={0.9}>
              <View style={[styles.newsCard, { marginTop: index === 0 ? 0 : 24 }]}>
                {/* Modern Card Header */}
                <View style={styles.newsHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                    <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Ionicons name="time-outline" size={14} color="#8E8E93" />
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                
                {/* Title with Icon */}
                <View style={styles.titleContainer}>
                  <View style={styles.titleIcon}>
                    <Ionicons name="medical" size={20} color="#F4A261" />
                  </View>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                </View>
                
                {/* Image with Overlay */}
                {item.image_url && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: item.image_url }} 
                      style={styles.newsImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.3)']}
                      style={styles.imageOverlay}
                    />
                  </View>
                )}
                
                {/* Content */}
                <Text style={styles.newsContent}>{item.content}</Text>
                
                {/* Enhanced Tips Section */}
                <View style={styles.tipsSection}>
                  {item.prevention && (
                    <TouchableOpacity style={styles.tipCard} activeOpacity={0.8}>
                      <LinearGradient
                        colors={['#E9F7EF', '#F0FFF4']}
                        style={styles.tipGradient}
                      >
                        <View style={styles.tipHeader}>
                          <View style={[styles.tipIconContainer, { backgroundColor: '#2A9D8F' }]}>
                            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                          </View>
                          <Text style={styles.tipTitle}>Prevention</Text>
                        </View>
                        <Text style={styles.tipContent}>{item.prevention}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  
                  {item.medicine && (
                    <TouchableOpacity style={styles.tipCard} activeOpacity={0.8}>
                      <LinearGradient
                        colors={['#E3F2FD', '#F0F8FF']}
                        style={styles.tipGradient}
                      >
                        <View style={styles.tipHeader}>
                          <View style={[styles.tipIconContainer, { backgroundColor: '#F4A261' }]}>
                            <Ionicons name="medical" size={16} color="#FFFFFF" />
                          </View>
                          <Text style={styles.tipTitle}>Medicine</Text>
                        </View>
                        <Text style={styles.tipContent}>{item.medicine}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  
                  {item.care_info && (
                    <TouchableOpacity style={styles.tipCard} activeOpacity={0.8}>
                      <LinearGradient
                        colors={['#FFEBEE', '#FFF5F5']}
                        style={styles.tipGradient}
                      >
                        <View style={styles.tipHeader}>
                          <View style={[styles.tipIconContainer, { backgroundColor: '#E76F51' }]}>
                            <Ionicons name="heart" size={16} color="#FFFFFF" />
                          </View>
                          <Text style={styles.tipTitle}>Care Information</Text>
                        </View>
                        <Text style={styles.tipContent}>{item.care_info}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // New responsive header container
  headerContainer: {
    width: '100%',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(20, width * 0.05), // Responsive horizontal padding
    paddingBottom: 16,
    minHeight: Platform.OS === 'android' ? 70 : 60, // Minimum height for different platforms
  },
  backButton: {
    width: Math.max(44, width * 0.11), // Responsive button size
    height: Math.max(44, width * 0.11),
    borderRadius: Math.max(22, width * 0.055),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    fontSize: Math.max(18, Math.min(22, width * 0.055)), // Responsive font size
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginHorizontal: 10,
  },
  placeholder: {
    width: Math.max(44, width * 0.11), // Same as back button width
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingVertical: Math.max(20, height * 0.025),
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroTitle: {
    fontSize: Math.max(20, Math.min(24, width * 0.06)),
    fontWeight: '700',
    color: '#264653',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Math.max(14, Math.min(16, width * 0.04)),
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Math.max(16, width * 0.04),
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: width * 0.8,
  },
  loadingText: {
    marginTop: 20,
    fontSize: Math.max(16, Math.min(18, width * 0.045)),
    color: '#264653',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: Math.max(100, width * 0.25),
    height: Math.max(100, width * 0.25),
    borderRadius: Math.max(50, width * 0.125),
    backgroundColor: '#FFF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: Math.max(20, Math.min(24, width * 0.06)),
    fontWeight: '700',
    color: '#264653',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Math.max(14, Math.min(16, width * 0.04)),
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#F4A261',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Math.max(14, Math.min(16, width * 0.04)),
    fontWeight: '600',
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Math.max(20, width * 0.05),
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4A261',
  },
  categoryText: {
    fontSize: Math.max(10, Math.min(12, width * 0.03)),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: Math.max(11, Math.min(13, width * 0.032)),
    color: '#8E8E93',
    fontWeight: '500',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  newsTitle: {
    fontSize: Math.max(18, Math.min(22, width * 0.055)),
    fontWeight: '700',
    color: '#264653',
    flex: 1,
    lineHeight: Math.max(24, Math.min(28, width * 0.07)),
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: Math.max(180, Math.min(220, height * 0.25)),
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  newsContent: {
    fontSize: Math.max(15, Math.min(17, width * 0.042)),
    lineHeight: Math.max(22, Math.min(26, width * 0.065)),
    color: '#495057',
    marginBottom: 24,
    fontWeight: '400',
  },
  tipsSection: {
    gap: 16,
    marginBottom: 20,
  },
  tipCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipGradient: {
    padding: Math.max(16, width * 0.04),
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: Math.max(14, Math.min(16, width * 0.04)),
    fontWeight: '700',
    color: '#264653',
  },
  tipContent: {
    fontSize: Math.max(13, Math.min(15, width * 0.037)),
    lineHeight: Math.max(20, Math.min(22, width * 0.055)),
    color: '#495057',
    fontWeight: '400',
  },
});
export default NewsModule;