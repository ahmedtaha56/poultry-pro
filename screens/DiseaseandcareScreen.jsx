import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Static disease data with categories
const DISEASE_DATA = [
  { title: 'Avian Influenza', icon: 'virus', category: 'Viral', severity: 'High' },
  { title: 'Newcastle Disease', icon: 'biohazard', category: 'Viral', severity: 'High' },
  { title: 'Coccidiosis', icon: 'bug', category: 'Parasitic', severity: 'Medium' },
  { title: 'Marek\'s Disease', icon: 'disease', category: 'Viral', severity: 'High' },
  { title: 'Infectious Bronchitis', icon: 'lungs', category: 'Viral', severity: 'Medium' },
  { title: 'Fowl Pox', icon: 'virus', category: 'Viral', severity: 'Medium' },
  { title: 'Salmonellosis', icon: 'bacteria', category: 'Bacterial', severity: 'High' },
  { title: 'Aspergillosis', icon: 'leaf', category: 'Fungal', severity: 'Medium' },
  { title: 'Egg Drop Syndrome', icon: 'egg', category: 'Viral', severity: 'Medium' },
  { title: 'Infectious Coryza', icon: 'head-side-cough', category: 'Bacterial', severity: 'Medium' },
  { title: 'Cold', icon: 'thermometer', category: 'General', severity: 'Low' },
  { title: 'Canker', icon: 'head-side-virus', category: 'Parasitic', severity: 'Medium' },
  { title: 'Fever', icon: 'thermometer', category: 'Symptom', severity: 'Low' },
  { title: 'Mucus', icon: 'head-side-virus', category: 'Symptom', severity: 'Low' },
  { title: 'Leg Swelling', icon: 'walking', category: 'Symptom', severity: 'Medium' },
  { title: 'H-9 Disease', icon: 'virus', category: 'Viral', severity: 'High' },
  { title: 'Eye Infection', icon: 'eye', category: 'Bacterial', severity: 'Medium' },
  { title: 'Cough', icon: 'head-side-cough', category: 'Symptom', severity: 'Low' },
  { title: 'BumbleFoot', icon: 'paw', category: 'Bacterial', severity: 'Medium' },
  { title: 'Paralysis', icon: 'wheelchair', category: 'Symptom', severity: 'High' },
  { title: 'Lethargy', icon: 'bed', category: 'Symptom', severity: 'Low' },
  { title: 'Stomach Blockage', icon: 'tired', category: 'General', severity: 'High' },
  { title: 'Infection Bursal Disease', icon: 'virus', category: 'Viral', severity: 'High' },
  { title: 'Candidiasis', icon: 'bacteria', category: 'Fungal', severity: 'Medium' },
  { title: 'Vitamin A Deficiency', icon: 'capsules', category: 'Nutritional', severity: 'Medium' },
  { title: 'Vitamin D Deficiency', icon: 'capsules', category: 'Nutritional', severity: 'Medium' },
  { title: 'Calcium Deficiency', icon: 'capsules', category: 'Nutritional', severity: 'Medium' },
  { title: 'Respiratory Issues', icon: 'lungs', category: 'General', severity: 'Medium' },
];

const DiseaseandcareScreen = () => {
  const navigation = useNavigation();
  const [filteredDiseases, setFilteredDiseases] = useState(DISEASE_DATA);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    if (query) {
      const filtered = DISEASE_DATA.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDiseases(filtered);
    } else {
      setFilteredDiseases(DISEASE_DATA);
    }
  };

  const handleDiseasePress = useCallback((title) => {
    navigation.navigate('ArticleDetail', { title });
  }, [navigation]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#FF4757';
      case 'Medium': return '#FFA726';
      case 'Low': return '#66BB6A';
      default: return '#E68A50';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Viral': '#E74C3C',
      'Bacterial': '#3498DB',
      'Fungal': '#9B59B6',
      'Parasitic': '#E67E22',
      'Nutritional': '#2ECC71',
      'General': '#95A5A6',
      'Symptom': '#F39C12'
    };
    return colors[category] || '#E68A50';
  };

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleDiseasePress(item.title)}
      activeOpacity={0.95}
    >
      <View style={styles.itemContent}>
        {/* Icon Container with Dynamic Background */}
        <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <FontAwesome5 name={item.icon} size={20} color={getCategoryColor(item.category)} />
        </View>
        
        {/* Content Container */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.itemText}>{item.title}</Text>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
              <Text style={styles.severityText}>{item.severity}</Text>
            </View>
          </View>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                {item.category}
              </Text>
            </View>
          </View>
        </View>
        
        <MaterialIcons name="keyboard-arrow-right" size={24} color="#BDC3C7" />
      </View>
    </TouchableOpacity>
  ), [handleDiseasePress]);

  const StatsCard = () => (
    <View style={styles.statsContainer}>
      <LinearGradient
        colors={['#E68A50', '#D17843']}
        style={styles.statsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{DISEASE_DATA.length}</Text>
          <Text style={styles.statLabel}>Total Diseases</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{DISEASE_DATA.filter(d => d.severity === 'High').length}</Text>
          <Text style={styles.statLabel}>Critical Cases</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{new Set(DISEASE_DATA.map(d => d.category)).size}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const RecommendationBox = () => (
    <View style={styles.recommendationContainer}>
      <LinearGradient
        colors={['#FFF8F3', '#FFF0E6']}
        style={styles.recommendationGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.recommendationHeader}>
          <View style={styles.bulbIconContainer}>
            <FontAwesome5 name="lightbulb" size={16} color="#E68A50" />
          </View>
          <Text style={styles.recommendationTitle}>Prevention Tips</Text>
        </View>
        <Text style={styles.recommendationText}>
          Maintain cleanliness, provide fresh water daily, and ensure proper ventilation. 
          Most infections stem from poor hygiene and contaminated environments.
        </Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Clean coop weekly</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Fresh water daily</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Proper ventilation</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#E68A50', '#D17843', '#C56B36']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <View style={styles.backButtonCircle}>
            <Feather name="chevron-left" size={24} color="#E68A50" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <FontAwesome5 name="shield-virus" size={18} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.headerSubtitle}>Poultry Health Companion</Text>
          <Text style={styles.headerTitle}>Disease Management</Text>
        </View>

        {/* Removed notification icon */}
      </LinearGradient>

      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInnerContainer}>
          <View style={styles.searchIconContainer}>
            <Feather name="search" size={20} color="#E68A50" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search diseases, symptoms or categories..."
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                handleSearch('');
              }}
              style={styles.clearButton}
            >
              <Feather name="x-circle" size={18} color="#BDC3C7" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Stats Card */}
      <StatsCard />

      {/* Enhanced Recommendation Box */}
      <RecommendationBox />

      {/* Enhanced Disease List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Disease Directory</Text>
        <Text style={styles.listSubtitle}>{filteredDiseases.length} conditions found</Text>
      </View>

      <FlatList
        data={filteredDiseases}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <View style={styles.noResultsIconContainer}>
              <MaterialIcons name="search-off" size={60} color="#E0E0E0" />
            </View>
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try adjusting your search terms</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                handleSearch('');
              }}
            >
              <Text style={styles.resetButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  backButton: {
    zIndex: 1,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerIconContainer: {
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // removed notification styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  item: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 80, 0.15)',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulbIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(230, 138, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E68A50',
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    marginBottom: 16,
  },
  tipsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E68A50',
    marginRight: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIconContainer: {
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginBottom: 24,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#E68A50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default React.memo(DiseaseandcareScreen);