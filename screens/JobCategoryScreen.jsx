import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  ImageBackground,
} from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import FeedbackModal from "../components/FeedbackModal";

const { width, height } = Dimensions.get("window");
const COLORS = {
  primary: "#E68A50",
  primaryLight: "#F4A261", 
  primaryDark: "#D67635",
  secondary: "#FFF8F3",
  accent: "#FF6B6B",
  accentLight: "#FF8E8E",
  white: "#FFFFFF",
  lightWhite: "#FFFCF8",
  gray: "#6B7280",
  lightGray: "#F9F7F4",
  dark: "#2C1810",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  cardBg: "#FFFFFF",
  shadow: "rgba(230, 138, 80, 0.3)",
  darkShadow: "rgba(44, 24, 16, 0.15)",
  gold: "#FFD700",
  orange: "#FF8C42",
};

const scaleFont = (size) => size * Math.min(width / 375, 1.2);
const scaleVertical = (size) => size * (height / 812);
const scaleHorizontal = (size) => size * (width / 375);

const categories = [
  { 
    name: "Buy/Sell Chickens", 
    icon: "storefront-outline", 
    color: "#10B981",
    bgGradient: ["#10B981", "#34D399"],
    description: "Trade poultry" 
  },
  { 
    name: "Chicken Diseases & Care", 
    icon: "medical-outline", 
    color: "#EF4444",
    bgGradient: ["#EF4444", "#F87171"],
    description: "Health & wellness" 
  },
  { 
    name: "Poultry Farming Guide", 
    icon: "library-outline", 
    color: "#8B5CF6",
    bgGradient: ["#8B5CF6", "#A78BFA"],
    description: "Learn farming" 
  },
  { 
    name: "Latest News", 
    icon: "newspaper-outline", 
    color: "#F59E0B",
    bgGradient: ["#F59E0B", "#FBBF24"],
    description: "Stay updated" 
  },
  { 
    name: "Talk with Chatbot", 
    icon: "chatbubbles-outline", 
    color: "#06B6D4",
    bgGradient: ["#06B6D4", "#22D3EE"],
    description: "AI assistance" 
  },
  { 
    name: "Monitor Chickens Health", 
    icon: "pulse-outline", 
    color: "#FF6B35",
    bgGradient: ["#FF6B35", "#FF8F65"],
    description: "Health monitoring" 
  },
];

const CategoryItem = React.memo(({ category, isSelected, onPress, index, isTablet }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        delay: index * 120,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(glowValue, {
        toValue: 1,
        duration: 1000,
        delay: (index * 120) + 400,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.92,
          duration: 150,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateValue.setValue(0);
    });
    onPress();
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.cardTouchable,
        isTablet && styles.cardTouchableTablet,
        {
          opacity,
          transform: [{ translateY }, { scale: scaleValue }, { rotate }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.categoryContainer}
      >
        {/* Glow Effect */}
        <Animated.View 
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
              backgroundColor: category.color,
            }
          ]} 
        />
        
        <LinearGradient
          colors={
            isSelected
              ? category.bgGradient
              : [COLORS.white, COLORS.lightWhite, '#FFF8F5']
          }
          style={[
            styles.categoryBox,
            isSelected && styles.selectedBox,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.6, 1]}
        >
          {/* Floating Elements Background */}
          <View style={styles.floatingElements}>
            <View style={[styles.floatingDot, styles.dot1, { backgroundColor: `${category.color}20` }]} />
            <View style={[styles.floatingDot, styles.dot2, { backgroundColor: `${category.color}15` }]} />
            <View style={[styles.floatingDot, styles.dot3, { backgroundColor: `${category.color}25` }]} />
          </View>

          <View style={styles.cardContent}>
            {/* Icon Container with Multiple Effects */}
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: isSelected
                  ? 'rgba(255,255,255,0.25)'
                  : `${category.color}10`,
                borderColor: isSelected ? 'rgba(255,255,255,0.4)' : `${category.color}30`,
                shadowColor: category.color,
                shadowOpacity: isSelected ? 0.6 : 0.3,
              }
            ]}>
              {/* Inner glow effect */}
              <View style={[
                styles.iconInnerGlow,
                { backgroundColor: `${category.color}${isSelected ? '40' : '20'}` }
              ]} />
              
              <Ionicons
                name={category.icon}
                size={scaleFont(36)}
                color={isSelected ? COLORS.white : category.color}
                style={styles.iconStyle}
              />
              
              {/* Icon badge */}
              {isSelected && (
                <View style={styles.iconBadge}>
                  <Ionicons name="checkmark" size={scaleFont(14)} color={COLORS.white} />
                </View>
              )}
            </View>

            {/* Text Section */}
            <View style={styles.textContainer}>
              <Text style={[
                styles.categoryText,
                isSelected && styles.selectedText,
                { color: isSelected ? COLORS.white : COLORS.dark }
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryDescription,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : COLORS.gray }
              ]}>
                {category.description}
              </Text>
            </View>

            {/* Selection Indicator */}
            {isSelected && (
              <Animated.View style={styles.selectionOverlay}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.selectionGradient}
                />
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={scaleFont(24)} color={COLORS.white} />
                </View>
              </Animated.View>
            )}

            {/* Hover Effect Border */}
            <View style={[
              styles.hoverBorder,
              { borderColor: category.color }
            ]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function JobCategoryScreen() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const navigation = useNavigation();
  
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Enhanced header entrance animation
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButton = (scale) => {
    Animated.spring(buttonScale, {
      toValue: scale,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const toggleCategory = useCallback((category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleBackPress = () => {
    animateButton(0.85);
    setTimeout(() => {
      animateButton(1);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }, 150);
  };

  const handleSignupPress = () => {
    animateButton(0.85);
    setTimeout(() => {
      animateButton(1);
      navigation.navigate('Signup');
    }, 150);
  };

  const handleFeedbackPress = () => {
    setIsFeedbackVisible(true);
  };

  const handleCategoryPress = (category) => {
    try {
      const screenMap = {
        "Buy/Sell Chickens": "MainApp",
        "Chicken Diseases & Care": "Diseases",
        "Poultry Farming Guide": "Guide",
        "Latest News": "LatestNews",
        "Talk with Chatbot": "ChatBot",
        "Monitor Chickens Health": "HealthMonitor"
      };

      if (screenMap[category.name]) {
        navigation.navigate(screenMap[category.name]);
      } else {
        toggleCategory(category.name);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      setErrorModalVisible(true);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      <View style={styles.container}>
        {/* Redesigned Professional Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
            <Animated.View 
              style={[
                styles.headerContent,
                { opacity: headerOpacity }
              ]}
            >
              {/* Top Navigation Row */}
              <View style={styles.headerTopRow}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    onPress={handleBackPress} 
                    style={styles.modernBackButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.backButtonContent}>
                      <Feather 
                        name="arrow-left" 
                        size={scaleFont(20)} 
                        color={COLORS.white}
                        strokeWidth={2.5}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    onPress={handleSignupPress} 
                    style={styles.signupButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.signupContent}>
                      <Ionicons 
                        name="person-add-outline" 
                        size={scaleFont(16)} 
                        color={COLORS.white}
                      />
                      <Text style={styles.signupText}>Sign Up</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Compact Title Section */}
              <Animated.View 
                style={[
                  styles.headerTitleSection,
                  { transform: [{ scale: titleScale }] }
                ]}
              >
                <View style={styles.compactTitleContainer}>
                  <View style={styles.compactLogoContainer}>
                    <Ionicons 
                      name="leaf-outline" 
                      size={scaleFont(24)} 
                      color={COLORS.white} 
                    />
                  </View>
                  <Text style={styles.compactHeaderTitle}>Poultry Pro</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content Section */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContainer}
          style={styles.scrollView}
        >
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <LinearGradient
              colors={['rgba(230, 138, 80, 0.1)', 'rgba(244, 162, 97, 0.05)']}
              style={styles.bannerGradient}
            >
              <Text style={styles.bannerText}>Choose your farming journey</Text>
            </LinearGradient>
          </View>

          <View style={[styles.gridContainer, Math.min(width, height) >= 768 && styles.gridContainerTablet]}>
            {categories.map((category, index) => (
              <CategoryItem
                key={category.name}
                category={category}
                index={index}
                isSelected={selectedCategories.includes(category.name)}
                onPress={() => handleCategoryPress(category)}
                isTablet={Math.min(width, height) >= 768}
              />
            ))}
          </View>

          {/* Beautiful Feedback Button */}
          <View style={styles.feedbackSection}>
            <TouchableOpacity 
              onPress={handleFeedbackPress}
              style={styles.feedbackButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight, COLORS.primaryDark]}
                style={styles.feedbackGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.5, 1]}
              >
                <View style={styles.feedbackContent}>
                  <View style={styles.feedbackIconContainer}>
                    <Ionicons 
                      name="chatbox-ellipses-outline" 
                      size={scaleFont(24)} 
                      color={COLORS.white}
                    />
                  </View>
                  <View style={styles.feedbackTextContainer}>
                    <Text style={styles.feedbackTitle}>Share Your Feedback</Text>
                    <Text style={styles.feedbackSubtitle}>Help us improve your farming experience</Text>
                  </View>
                  <View style={styles.feedbackArrow}>
                    <Ionicons 
                      name="arrow-forward" 
                      size={scaleFont(20)} 
                      color={COLORS.white}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom CTA Section */}
          <View style={styles.bottomCTA}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTitle}>Ready to get started?</Text>
              <Text style={styles.ctaSubtitle}>Join thousands of successful farmers!</Text>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Enhanced Error Modal */}
        <Modal
          visible={isErrorModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalContent}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.errorIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="alert-circle-outline" size={scaleFont(48)} color={COLORS.white} />
              </LinearGradient>
              
              <Text style={styles.errorModalTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorModalText}>
                We couldn't navigate to that screen right now. Please try selecting one of the available options below.
              </Text>
              
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={() => setErrorModalVisible(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.errorModalButtonText}>I understand</Text>
                  <Ionicons 
                    name="checkmark-outline" 
                    size={scaleFont(20)} 
                    color={COLORS.white}
                    style={{ marginLeft: 8 }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Feedback Modal */}
        <FeedbackModal
          visible={isFeedbackVisible}
          onClose={() => setIsFeedbackVisible(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  
  // Redesigned Compact Header Styles
  headerGradient: {
    paddingBottom: scaleVertical(20),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 0,
  },
  headerContent: {
    paddingHorizontal: scaleHorizontal(20),
    paddingTop: scaleVertical(10),
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scaleVertical(15),
  },
  modernBackButton: {
    width: scaleHorizontal(42),
    height: scaleVertical(42),
    borderRadius: scaleHorizontal(21),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButton: {
    borderRadius: scaleHorizontal(21),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  signupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleHorizontal(16),
    paddingVertical: scaleVertical(10),
  },
  signupText: {
    color: COLORS.white,
    fontSize: scaleFont(14),
    fontWeight: "700",
    marginLeft: scaleHorizontal(6),
  },
  headerTitleSection: {
    alignItems: 'center',
    paddingBottom: scaleVertical(15),
  },
  compactTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactLogoContainer: {
    width: scaleHorizontal(40),
    height: scaleVertical(40),
    borderRadius: scaleHorizontal(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleHorizontal(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  compactHeaderTitle: {
    fontSize: scaleFont(24),
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  
  // Content Styles
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: scaleVertical(20),
    paddingBottom: scaleVertical(100),
  },
  welcomeBanner: {
    marginHorizontal: scaleHorizontal(20),
    marginBottom: scaleVertical(25),
    borderRadius: scaleHorizontal(15),
    overflow: 'hidden',
  },
  bannerGradient: {
    paddingVertical: scaleVertical(15),
    paddingHorizontal: scaleHorizontal(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 80, 0.2)',
  },
  bannerText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: scaleHorizontal(20),
  },
  gridContainerTablet: {
    justifyContent: 'flex-start',
  },
  cardTouchable: {
    width: "48%",
    marginBottom: scaleVertical(20),
  },
  cardTouchableTablet: {
    width: '31%',
    marginRight: '3.5%',
  },
  categoryContainer: {
    borderRadius: scaleHorizontal(25),
    overflow: 'hidden',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: scaleHorizontal(30),
    opacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  categoryBox: {
    aspectRatio: 1,
    borderRadius: scaleHorizontal(25),
    borderWidth: 1.5,
    borderColor: 'rgba(230, 138, 80, 0.2)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  selectedBox: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    width: scaleHorizontal(20),
    height: scaleVertical(20),
    top: scaleVertical(15),
    right: scaleHorizontal(15),
  },
  dot2: {
    width: scaleHorizontal(15),
    height: scaleVertical(15),
    bottom: scaleVertical(20),
    left: scaleHorizontal(20),
  },
  dot3: {
    width: scaleHorizontal(12),
    height: scaleVertical(12),
    top: scaleVertical(60),
    right: scaleHorizontal(30),
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scaleHorizontal(20),
    position: 'relative',
  },
  iconContainer: {
    width: scaleHorizontal(80),
    height: scaleVertical(80),
    borderRadius: scaleHorizontal(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleVertical(15),
    borderWidth: 2,
    position: 'relative',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 12,
  },
  iconInnerGlow: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: scaleHorizontal(32),
    top: '10%',
    left: '10%',
  },
  iconStyle: {
    zIndex: 2,
  },
  iconBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: scaleHorizontal(24),
    height: scaleVertical(24),
    borderRadius: scaleHorizontal(12),
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  categoryText: {
    fontSize: scaleFont(14),
    fontWeight: "800",
    textAlign: "center",
    lineHeight: scaleFont(18),
    marginBottom: scaleVertical(5),
  },
  selectedText: {
    fontWeight: "900",
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  categoryDescription: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scaleHorizontal(25),
    overflow: 'hidden',
  },
  selectionGradient: {
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: scaleVertical(15),
    right: scaleHorizontal(15),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: scaleHorizontal(20),
    padding: scaleHorizontal(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hoverBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: scaleHorizontal(27),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  // Beautiful Feedback Button Styles
  feedbackSection: {
    marginHorizontal: scaleHorizontal(20),
    marginTop: scaleVertical(30),
    marginBottom: scaleVertical(20),
  },
  feedbackButton: {
    borderRadius: scaleHorizontal(20),
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  feedbackGradient: {
    paddingVertical: scaleVertical(18),
    paddingHorizontal: scaleHorizontal(20),
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackIconContainer: {
    width: scaleHorizontal(50),
    height: scaleVertical(50),
    borderRadius: scaleHorizontal(25),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  feedbackTextContainer: {
    flex: 1,
    marginLeft: scaleHorizontal(15),
    marginRight: scaleHorizontal(10),
  },
  feedbackTitle: {
    fontSize: scaleFont(18),
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: scaleVertical(2),
  },
  feedbackSubtitle: {
    fontSize: scaleFont(13),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  feedbackArrow: {
    width: scaleHorizontal(36),
    height: scaleVertical(36),
    borderRadius: scaleHorizontal(18),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  bottomCTA: {
    marginHorizontal: scaleHorizontal(20),
    marginTop: scaleVertical(10),
    borderRadius: scaleHorizontal(20),
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  ctaGradient: {
    paddingVertical: scaleVertical(25),
    paddingHorizontal: scaleHorizontal(20),
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: scaleFont(20),
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: scaleVertical(8),
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scaleHorizontal(20),
  },
  errorModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: scaleHorizontal(30),
    padding: scaleVertical(35),
    alignItems: "center",
    width: '90%',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 80, 0.1)',
  },
  errorIconContainer: {
    width: scaleHorizontal(90),
    height: scaleVertical(90),
    borderRadius: scaleHorizontal(45),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleVertical(25),
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  errorModalTitle: {
    fontSize: scaleFont(24),
    fontWeight: "900",
    color: COLORS.dark,
    marginBottom: scaleVertical(12),
    textAlign: 'center',
  },
  errorModalText: {
    fontSize: scaleFont(16),
    color: COLORS.gray,
    textAlign: "center",
    marginVertical: scaleVertical(15),
    lineHeight: scaleFont(24),
    paddingHorizontal: scaleHorizontal(10),
  },
  errorModalButton: {
    marginTop: scaleVertical(25),
    borderRadius: scaleHorizontal(30),
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: scaleVertical(18),
    paddingHorizontal: scaleHorizontal(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorModalButtonText: {
    fontSize: scaleFont(16),
    fontWeight: "700",
    color: COLORS.white,
  },
});