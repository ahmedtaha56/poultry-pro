import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PoultryFarmingGuideScreen = () => {
  const navigation = useNavigation();

  const months = [
    { 
      id: '0-1', 
      label: '0-1 Month', 
      subtitle: 'Day-old chick care & brooding', 
      icon: 'egg', 
      color: '#E68A50',
      darkColor: '#D4743A' 
    },
    { 
      id: '1-2', 
      label: '1-2 Months', 
      subtitle: 'Early growth & development', 
      icon: 'feather', 
      color: '#F19A66',
      darkColor: '#E68A50' 
    },
    { 
      id: '2-3', 
      label: '2-3 Months', 
      subtitle: 'Vaccination & health monitoring', 
      icon: 'shield-virus', 
      color: '#C2663A',
      darkColor: '#A85829' 
    },
    { 
      id: '3-4', 
      label: '3-4 Months', 
      subtitle: 'Development & growth tracking', 
      icon: 'layer-group', 
      color: '#E68A50',
      darkColor: '#D4743A' 
    },
    { 
      id: '4-5', 
      label: '4-5 Months', 
      subtitle: 'Pre-laying preparation phase', 
      icon: 'calendar-plus', 
      color: '#F2A770',
      darkColor: '#E68A50' 
    },
    { 
      id: '6-7', 
      label: '6-7 Months', 
      subtitle: 'Peak production period', 
      icon: 'calendar-check', 
      color: '#D4743A',
      darkColor: '#C2663A' 
    },
    { 
      id: '7-8', 
      label: '7-8 Months', 
      subtitle: 'Maintenance & care routine', 
      icon: 'calendar-day', 
      color: '#E68A50',
      darkColor: '#D4743A' 
    },
    { 
      id: '8-9', 
      label: '8-9 Months', 
      subtitle: 'Health & productivity monitoring', 
      icon: 'calendar-week', 
      color: '#F19A66',
      darkColor: '#E68A50' 
    },
    { 
      id: '9-10', 
      label: '9-10 Months', 
      subtitle: 'Production optimization', 
      icon: 'calendar-alt', 
      color: '#C2663A',
      darkColor: '#A85829' 
    },
    { 
      id: '10-12', 
      label: '10-12 Months', 
      subtitle: 'Mature birds management', 
      icon: 'calendar-times', 
      color: '#E68A50',
      darkColor: '#D4743A' 
    },
    { 
      id: 'hens-not-laying', 
      label: 'Hens Not Laying', 
      subtitle: 'Troubleshooting & solutions', 
      icon: 'exclamation-triangle', 
      color: '#D73027',
      darkColor: '#B91C1C' 
    },
    { 
      id: 'housing', 
      label: 'Housing Setup', 
      subtitle: 'Coop design & ventilation systems', 
      icon: 'home', 
      color: '#E68A50',
      darkColor: '#D4743A' 
    }, 
    { 
      id: 'feeding', 
      label: 'Feeding Guide', 
      subtitle: 'Nutrition plans & supplements', 
      icon: 'utensils', 
      color: '#F2A770',
      darkColor: '#E68A50' 
    }
  ];

  const handleMonthSelect = (monthId) => {
    if (monthId) {
      navigation.navigate('GuideDetail', { monthId });
    } else {
      Alert.alert('Error', 'Invalid selection.');
    }
  };

  const renderMonthItem = ({ item, index }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => handleMonthSelect(item.id)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Learn more about ${item.label}`}
        accessibilityHint="Press to view details about this guide"
      >
        <LinearGradient
          colors={['rgba(230, 138, 80, 0.02)', 'rgba(230, 138, 80, 0.06)']}
          style={styles.itemBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.itemLeft}>
          <LinearGradient 
            colors={[item.color, item.darkColor]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconGlow} />
            <FontAwesome5 name={item.icon} size={24} color="#fff" />
          </LinearGradient>
          
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.label}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            <View style={styles.progressIndicator}>
              <View style={[styles.progressBar, { backgroundColor: item.color + '30' }]} />
            </View>
          </View>
        </View>
        
        <View style={styles.arrowContainer}>
          <LinearGradient
            colors={['#E68A50', '#D4743A']}
            style={styles.arrowGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FontAwesome5 name="chevron-right" size={18} color="#fff" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      <LinearGradient
        colors={['#ffffff', '#fefefe']}
        style={styles.listHeaderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerIconWrapper}>
          <LinearGradient
            colors={['#E68A50', '#D4743A']}
            style={styles.headerIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FontAwesome5 name="feather-alt" size={28} color="#fff" />
          </LinearGradient>
        </View>
        
        <Text style={styles.listHeader}>Complete Poultry Farming Guide</Text>
        <Text style={styles.listSubheader}>
          Comprehensive information for every stage of poultry care
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>13</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Expert Approved</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* StatusBar ko transparent rakho, SafeAreaView adjust karega */}
      <StatusBar barStyle="light-content" backgroundColor="#D4743A" />

      {/* Top Gradient Header */}
      <LinearGradient 
        colors={['#E68A50', '#D4743A', '#C2663A']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
            style={styles.backButtonInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FontAwesome5 name="arrow-left" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconTitleRow}>
            <View style={styles.headerMainIconContainer}>
              <FontAwesome5 name="dove" size={32} color="#fff" style={styles.headerMainIcon} />
              <View style={styles.headerIconGlow} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Poultry Farming</Text>
              <Text style={styles.headerSubtitle}>Professional Guide System</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* List Section */}
      <View style={styles.container}>
        <FlatList
          data={months}
          renderItem={renderMonthItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          bounces={true}
          overScrollMode="always"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 18,
    elevation: 15,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  backButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  backButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerIconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMainIconContainer: {
    position: 'relative',
    marginRight: 14,
  },
  headerMainIcon: {
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerIconGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.8,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  listHeaderContainer: {
    marginBottom: 28,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  listHeaderGradient: {
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 80, 0.1)',
  },
  headerIconWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeader: {
    fontSize: 22,
    color: '#1f2937',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  listSubheader: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E68A50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  separator: {
    height: 16,
  },
  item: {
    borderRadius: 22,
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 80, 0.08)',
    position: 'relative',
  },
  itemBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
    paddingHorizontal: 22,
    position: 'relative',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    elevation: 4,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8,
  },
  progressIndicator: {
    height: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '75%',
    borderRadius: 2,
  },
  arrowContainer: {
    marginLeft: 16,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  arrowGradient: {
    width: 38,
    height: 38,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default PoultryFarmingGuideScreen;