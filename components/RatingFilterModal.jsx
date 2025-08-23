import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  Vibration,
} from 'react-native';
import { Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RatingFilterModal = ({ visible, onClose, onRatingSelect, selectedRating }) => {
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // Rating options with their configurations
  const ratingOptions = [
    {
      id: 'all',
      title: 'All Ratings',
      subtitle: 'Show all products',
      icon: 'grid',
      iconType: 'feather',
      gradient: ['#6B73FF', '#5A67D8'],
      stars: 0,
      description: 'No filter applied'
    },
    {
      id: '5',
      title: '5 Stars',
      subtitle: 'Premium sellers only',
      icon: 'star',
      iconType: 'feather',
      gradient: ['#FFD700', '#FFA500'],
      stars: 5,
      description: 'Top rated sellers'
    },
    {
      id: '4',
      title: '4 Stars & Above',
      subtitle: 'Great sellers & above',
      icon: 'star',
      iconType: 'feather',
      gradient: ['#4CAF50', '#45A049'],
      stars: 4,
      description: 'Excellent to premium sellers'
    },
    {
      id: '3',
      title: '3 Stars & Above',
      subtitle: 'Good sellers & above',
      icon: 'star',
      iconType: 'feather',
      gradient: ['#FF9800', '#F57C00'],
      stars: 3,
      description: 'Good to premium sellers'
    },
    {
      id: '2',
      title: '2 Stars & Above',
      subtitle: 'Average sellers & above',
      icon: 'star',
      iconType: 'feather',
      gradient: ['#FF5722', '#E64A19'],
      stars: 2,
      description: 'Average to premium sellers'
    },
    {
      id: '1',
      title: '1 Star & Above',
      subtitle: 'All rated sellers',
      icon: 'star',
      iconType: 'feather',
      gradient: ['#9E9E9E', '#757575'],
      stars: 1,
      description: 'All sellers with ratings'
    }
  ];

  useEffect(() => {
    if (visible) {
      StatusBar.setBarStyle('light-content');
      
      // Start animations
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    } else {
      StatusBar.setBarStyle('dark-content');
      
      // Reset animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Vibration.vibrate(50);
    onClose();
  };

  const handleRatingSelect = (rating) => {
    Vibration.vibrate(100);
    onRatingSelect(rating);
    setTimeout(() => {
      handleClose();
    }, 200);
  };

  const renderStars = (count, size = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AntDesign
            key={star}
            name="star"
            size={size}
            color={star <= count ? '#FFD700' : '#E0E0E0'}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderRatingOption = (option) => {
    const isSelected = selectedRating === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.ratingOption,
          isSelected && styles.selectedRatingOption
        ]}
        onPress={() => handleRatingSelect(option.id)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.ratingOptionContent,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {isSelected ? (
            <LinearGradient
              colors={option.gradient}
              style={styles.ratingOptionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.ratingOptionLeft}>
                <View style={styles.selectedIconContainer}>
                  <Feather name={option.icon} size={24} color="#fff" />
                </View>
                <View style={styles.ratingOptionText}>
                  <Text style={styles.selectedRatingTitle}>{option.title}</Text>
                  <Text style={styles.selectedRatingSubtitle}>{option.subtitle}</Text>
                  {option.stars > 0 && (
                    <View style={styles.starsWrapper}>
                      {renderStars(option.stars, 14)}
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.selectedCheckContainer}>
                <AntDesign name="checkcircle" size={24} color="#fff" />
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.ratingOptionDefault}>
              <View style={styles.ratingOptionLeft}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: option.gradient[0] + '20' }
                ]}>
                  <Feather name={option.icon} size={20} color={option.gradient[0]} />
                </View>
                <View style={styles.ratingOptionText}>
                  <Text style={styles.ratingTitle}>{option.title}</Text>
                  <Text style={styles.ratingSubtitle}>{option.subtitle}</Text>
                  {option.stars > 0 && (
                    <View style={styles.starsWrapper}>
                      {renderStars(option.stars, 12)}
                    </View>
                  )}
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#CBD5E0" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Background Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: fadeAnim }
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <LinearGradient
              colors={['#E68A50', '#D07A47']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIconContainer}>
                    <Feather name="filter" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Filter by Rating</Text>
                    <Text style={styles.headerSubtitle}>Choose quality level</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AntDesign name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.optionsContainer}>
              <Text style={styles.sectionTitle}>Quality Levels</Text>
              <Text style={styles.sectionSubtitle}>
                Filter products based on their average ratings
              </Text>

              {ratingOptions.map(renderRatingOption)}

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoIconContainer}>
                  <Feather name="info" size={20} color="#4299E1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>How ratings work</Text>
                  <Text style={styles.infoText}>
                    Ratings are based on customer reviews and feedback. Higher rated products indicate better quality and customer satisfaction.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => handleRatingSelect('all')}
              activeOpacity={0.8}
            >
              <Feather name="refresh-cw" size={16} color="#666" />
              <Text style={styles.resetButtonText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  optionsContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 24,
    lineHeight: 22,
  },
  ratingOption: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedRatingOption: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  ratingOptionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ratingOptionGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingOptionDefault: {
    backgroundColor: '#F7FAFC',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  ratingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingOptionText: {
    flex: 1,
  },
  selectedRatingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  selectedRatingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  starsWrapper: {
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCheckContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4299E1',
  },
  infoIconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B6CB0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2C5282',
    lineHeight: 20,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
});

export default RatingFilterModal;