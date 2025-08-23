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
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
        
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={['#F4A261', '#E9C46A']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health News & Tips</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

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
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#F4A261', '#E9C46A']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health News & Tips</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

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
              <Icon name="newspaper-outline" size={80} color="#F4A261" />
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
                    <Icon name="time-outline" size={14} color="#8E8E93" />
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                
                {/* Title with Icon */}
                <View style={styles.titleContainer}>
                  <View style={styles.titleIcon}>
                    <Icon name="medical" size={20} color="#F4A261" />
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
                            <Icon name="shield-checkmark" size={16} color="#FFFFFF" />
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
                            <Icon name="medical" size={16} color="#FFFFFF" />
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
                            <Icon name="heart" size={16} color="#FFFFFF" />
                          </View>
                          <Text style={styles.tipTitle}>Care Information</Text>
                        </View>
                        <Text style={styles.tipContent}>{item.care_info}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Removed Read More Button */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // removed refreshButton styles
  placeholder: {
    width: 44,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#264653',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#264653',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
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
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4A261',
  },
  categoryText: {
    fontSize: 12,
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
    fontSize: 13,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#264653',
    flex: 1,
    lineHeight: 28,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: 220,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  newsContent: {
    fontSize: 17,
    lineHeight: 26,
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
    padding: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#264653',
  },
  tipContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#495057',
    fontWeight: '400',
  },
  // removed readMore button styles
});

export default NewsModule;