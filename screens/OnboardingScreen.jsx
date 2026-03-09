import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_700Bold,
  Poppins_600SemiBold,
  Poppins_400Regular,
  Poppins_500Medium,
} from "@expo-google-fonts/poppins";
import { Feather } from "@expo/vector-icons";
import {SafeAreaProvider} from 'react-native-safe-area-context';

import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get("window");
const isSmallScreen = height < 700;
const isTablet = width > 600;
const isIOS = Platform.OS === 'ios';

// Safe area insets for different platforms
const getBottomInset = () => {
  if (Platform.OS === 'ios') {
    return height > 800 ? 44 : 30; // iPhone X+ vs older iPhones
  } else {
    return 30; // Android - more padding for navigation bar
  }
};

const getStatusBarHeight = () => {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 24;
  }
  return 0; // iOS handles this with SafeAreaView
};

// Helper function to convert shadow props to boxShadow string for web
const shadowToBoxShadow = (shadowColor, shadowOffset, shadowOpacity, shadowRadius) => {
  const offsetX = shadowOffset?.width || 0;
  const offsetY = shadowOffset?.height || 0;
  const color = shadowColor || 'black';
  const opacity = shadowOpacity !== undefined ? shadowOpacity : 1;
  const radius = shadowRadius !== undefined ? shadowRadius : 0;
  const rgbaColor = color.replace(/rgba?\(([^)]+)\)/, (match, colorValues) => {
    const parts = colorValues.split(',').map(s => s.trim());
    if(parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
    }
    return match;
  });
  return `${offsetX}px ${offsetY}px ${radius}px ${rgbaColor}`;
};

export default function OnboardingScreen() {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = React.useRef(new Animated.Value(1)).current;
  const iconRotateAnim = React.useRef(new Animated.Value(0)).current;
  const floatingAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      )
    ]).start();
  }, []);

  const handleLetsBeginPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    console.log("Get Started button pressed");
    console.log("Navigating to Signup screen");
    navigation.navigate("Signup");
  };

  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatingTranslate = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  let [fontsLoaded, fontError] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Poppins_400Regular,
    Poppins_500Medium,
  });
  
  if (!fontsLoaded) {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
    return (
      <View style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#E68A50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFF4F0"
        translucent={Platform.OS === 'android'}
      />
      
      <LinearGradient
        colors={["#FFF4F0", "#FFE8DC", "#FFFFFF"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Modern Decorative Elements */}
          <View style={styles.decorativeElements}>
            <Animated.View style={[
              styles.floatingShape, 
              styles.shape1,
              { transform: [{ translateY: floatingTranslate }] }
            ]} />
            <Animated.View style={[
              styles.floatingShape, 
              styles.shape2,
              { transform: [{ translateY: floatingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 8],
              }) }] }
            ]} />
            <Animated.View style={[
              styles.floatingShape, 
              styles.shape3,
              { transform: [{ translateY: floatingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -15],
              }) }] }
            ]} />
            <View style={[styles.floatingShape, styles.shape4]} />
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
              {/* Enhanced Icon Container */}  
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <View style={styles.iconInnerGlow}>
                    <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                      <Feather 
                        name="cpu" 
                        size={Math.max(40, Math.min(55, width * 0.12))} 
                        color="#E68A50" 
                      />
                    </Animated.View>
                  </View>
                </View>
                <View style={styles.brandContainer}>
                  <Text style={styles.brandName}>PoultryPro</Text>
                  <Text style={styles.brandTagline}>Smart Farming Solutions</Text>
                </View>
              </View>

              {/* Enhanced Heading */}
              <View style={styles.headingContainer}>
                <Text style={styles.mainHeading}>Revolutionize Your</Text>
                <View style={styles.highlightedTextContainer}>
                  <LinearGradient
                    colors={["#E68A50", "#F4A460", "#FF9F40"]}
                    style={styles.textGradientBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.highlightedText}>Poultry Business</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.subHeading}>with AI-Powered Intelligence</Text>
              </View>

              {/* Enhanced Feature Cards */}
              <View style={styles.featuresContainer}>
                <View style={[styles.featureCard, styles.featureCard1]}>
                  <View style={styles.featureIconContainer}>
                    <Feather name="shield" size={Math.max(18, Math.min(24, width * 0.055))} color="#E68A50" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Smart Disease Detection</Text>
                    <Text style={styles.featureDescription}>AI-powered health monitoring</Text>
                  </View>
                  <View style={styles.featureAccent} />
                </View>
                
                <View style={[styles.featureCard, styles.featureCard2]}>
                  <View style={styles.featureIconContainer}>
                    <Feather name="bar-chart-2" size={Math.max(18, Math.min(24, width * 0.055))} color="#E68A50" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Analytics & Insights</Text>
                    <Text style={styles.featureDescription}>Data-driven farm optimization</Text>
                  </View>
                  <View style={styles.featureAccent} />
                </View>
                
                <View style={[styles.featureCard, styles.featureCard3]}>
                  <View style={styles.featureIconContainer}>
                    <Feather name="headphones" size={Math.max(18, Math.min(24, width * 0.055))} color="#E68A50" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Expert Consultation</Text>
                    <Text style={styles.featureDescription}>24/7 professional support</Text>
                  </View>
                  <View style={styles.featureAccent} />
                </View>
              </View>

              {/* CTA Button inside content */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleLetsBeginPress}
                  activeOpacity={0.9}
                  style={styles.button}
                >
                  <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                    <LinearGradient
                      colors={["#E68A50", "#F4A460", "#FF9F40"]}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>Start Your Journey</Text>
                      <View style={styles.arrowContainer}>
                        <Feather name="arrow-right" size={Math.max(16, Math.min(18, width * 0.045))} color="#E68A50" />
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF4F0',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    paddingBottom: 0, // Remove any bottom padding
  },
  gradientBackground: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.08,
  },
  shape1: {
    width: Math.max(80, Math.min(100, width * 0.2)),
    height: Math.max(80, Math.min(100, width * 0.2)),
    backgroundColor: '#E68A50',
    top: '8%',
    right: '5%',
  },
  shape2: {
    width: Math.max(60, Math.min(70, width * 0.15)),
    height: Math.max(60, Math.min(70, width * 0.15)),
    backgroundColor: '#F4A460',
    bottom: '35%',
    left: '2%',
  },
  shape3: {
    width: Math.max(70, Math.min(85, width * 0.18)),
    height: Math.max(70, Math.min(85, width * 0.18)),
    backgroundColor: '#FF9F40',
    top: '35%',
    left: '85%',
  },
  shape4: {
    width: Math.max(50, Math.min(60, width * 0.13)),
    height: Math.max(50, Math.min(60, width * 0.13)),
    backgroundColor: '#E68A50',
    top: '65%',
    right: '10%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Math.max(16, width * 0.04),
    paddingTop: Math.max(15, height * 0.02), // Reduced from 0.025
    paddingBottom: Math.max(40, getBottomInset() + 20), // Increased bottom padding for safety
  },
  content: {
    alignItems: "center",
    width: "100%",
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Math.max(18, height * 0.025), // Reduced from 0.035
  },
  iconBackground: {
    width: Math.max(100, Math.min(120, width * 0.25)),
    height: Math.max(100, Math.min(120, width * 0.25)),
    borderRadius: Math.max(50, Math.min(60, width * 0.125)),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Math.max(12, height * 0.015), // Reduced from 0.02
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.25)', { width: 0, height: 8 }, 1, 20),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
  },
  iconInnerGlow: {
    width: Math.max(80, Math.min(95, width * 0.2)),
    height: Math.max(80, Math.min(95, width * 0.2)),
    borderRadius: Math.max(40, Math.min(47.5, width * 0.1)),
    backgroundColor: '#FFF4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: Math.max(20, Math.min(24, width * 0.06)),
    fontFamily: "Poppins_700Bold",
    color: "#B85A3E",
    marginBottom: 3, // Reduced from 4
  },
  brandTagline: {
    fontSize: Math.max(12, Math.min(14, width * 0.035)),
    fontFamily: "Poppins_500Medium",
    color: "#E68A50",
    opacity: 0.9,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: Math.max(18, height * 0.025), // Reduced from 0.035
    paddingHorizontal: Math.max(10, width * 0.025),
    maxWidth: isTablet ? '80%' : '100%',
  },
  mainHeading: {
    fontSize: Math.max(24, Math.min(30, width * 0.07)),
    fontFamily: "Poppins_600SemiBold",
    color: "#B85A3E",
    textAlign: 'center',
    lineHeight: Math.max(30, Math.min(36, width * 0.085)),
    marginBottom: 6, // Reduced from 8
  },
  highlightedTextContainer: {
    borderRadius: Math.max(15, width * 0.04),
    marginVertical: Math.max(6, height * 0.008), // Reduced from 0.01
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.2)', { width: 0, height: 6 }, 1, 12),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      }
    }),
  },
  textGradientBackground: {
    paddingHorizontal: Math.max(18, width * 0.045),
    paddingVertical: Math.max(8, height * 0.01),
  },
  highlightedText: {
    fontSize: Math.max(26, Math.min(32, width * 0.075)),
    fontFamily: "Poppins_700Bold",
    color: "white",
    textAlign: 'center',
    lineHeight: Math.max(32, Math.min(38, width * 0.09)),
  },
  subHeading: {
    fontSize: Math.max(14, Math.min(16, width * 0.04)),
    fontFamily: "Poppins_400Regular",
    color: "#E68A50",
    textAlign: 'center',
    marginTop: 6, // Reduced from 8
    opacity: 0.95,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: Math.max(20, height * 0.025), // Reduced from 0.04
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: Math.max(16, width * 0.04),
    paddingVertical: Math.max(14, height * 0.018), // Reduced from 0.02
    marginBottom: Math.max(10, height * 0.012), // Reduced from 0.015
    borderRadius: Math.max(16, width * 0.04),
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.12)', { width: 0, height: 4 }, 1, 12),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
      }
    }),
  },
  featureAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#E68A50',
    borderTopRightRadius: Math.max(16, width * 0.04),
    borderBottomRightRadius: Math.max(16, width * 0.04),
  },
  featureIconContainer: {
    width: Math.max(40, Math.min(46, width * 0.1)),
    height: Math.max(40, Math.min(46, width * 0.1)),
    borderRadius: Math.max(20, Math.min(23, width * 0.05)),
    backgroundColor: '#FFF4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Math.max(12, width * 0.03),
    borderWidth: 1.5,
    borderColor: '#FFE8DC',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Math.max(14, Math.min(16, width * 0.04)),
    fontFamily: 'Poppins_600SemiBold',
    color: '#B85A3E',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: Math.max(12, Math.min(13, width * 0.032)),
    fontFamily: 'Poppins_400Regular',
    color: '#E68A50',
    opacity: 0.85,
  },
  // Button container inside content - moved closer to features
  buttonContainer: {
    width: '100%',
    paddingHorizontal: Math.max(8, width * 0.02),
    marginTop: Math.max(15, height * 0.018), // Reduced from 0.025
    alignItems: 'center',
  },
  button: {
    borderRadius: Math.max(25, width * 0.065),
    overflow: "hidden",
    width: '100%',
    maxWidth: Math.min(300, width - 60),
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.35)', { width: 0, height: 8 }, 1, 16),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      }
    }),
  },
  gradientButton: {
    paddingVertical: Math.max(14, height * 0.018),
    paddingHorizontal: Math.max(20, width * 0.05),
    borderRadius: Math.max(25, width * 0.065),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: Math.max(48, height * 0.06),
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    fontSize: Math.max(15, Math.min(16, width * 0.04)),
    letterSpacing: 0.5,
    marginRight: 10,
  },
  arrowContainer: {
    width: Math.max(26, width * 0.065),
    height: Math.max(26, width * 0.065),
    borderRadius: Math.max(13, width * 0.0325),
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.15)', { width: 0, height: 2 }, 1, 4),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      }
    }),
  },
});