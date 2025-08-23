import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Platform
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

const { width, height } = Dimensions.get("window");

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
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={["#FFF4F0", "#FFE8DC", "#FFFFFF"]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
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

          <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
            {/* Enhanced Icon Container */}  
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <View style={styles.iconInnerGlow}>
                  <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                    <Feather name="cpu" size={65} color="#E68A50" />
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
                  <Feather name="shield" size={26} color="#E68A50" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Smart Disease Detection</Text>
                  <Text style={styles.featureDescription}>AI-powered health monitoring</Text>
                </View>
                <View style={styles.featureAccent} />
              </View>
              
              <View style={[styles.featureCard, styles.featureCard2]}>
                <View style={styles.featureIconContainer}>
                  <Feather name="bar-chart-2" size={26} color="#E68A50" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Analytics & Insights</Text>
                  <Text style={styles.featureDescription}>Data-driven farm optimization</Text>
                </View>
                <View style={styles.featureAccent} />
              </View>
              
              <View style={[styles.featureCard, styles.featureCard3]}>
                <View style={styles.featureIconContainer}>
                  <Feather name="headphones" size={26} color="#E68A50" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Expert Consultation</Text>
                  <Text style={styles.featureDescription}>24/7 professional support</Text>
                </View>
                <View style={styles.featureAccent} />
              </View>
            </View>

            {/* Enhanced CTA Button */}
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
                    <Feather name="arrow-right" size={22} color="#E68A50" />
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
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
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: '100%',
    position: 'relative',
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
    opacity: 0.12,
  },
  shape1: {
    width: 120,
    height: 120,
    backgroundColor: '#E68A50',
    top: '12%',
    right: '8%',
    borderRadius: 60,
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: '#F4A460',
    bottom: '25%',
    left: '3%',
    borderRadius: 40,
  },
  shape3: {
    width: 100,
    height: 100,
    backgroundColor: '#FF9F40',
    top: '45%',
    left: '82%',
    borderRadius: 50,
  },
  shape4: {
    width: 60,
    height: 60,
    backgroundColor: '#E68A50',
    top: '70%',
    right: '15%',
    borderRadius: 30,
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 45,
  },
  iconBackground: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.35)', { width: 0, height: 15 }, 1, 30),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.35,
        shadowRadius: 30,
        elevation: 15,
      }
    }),
  },
  iconInnerGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#B85A3E",
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#E68A50",
    opacity: 0.9,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 45,
    paddingHorizontal: 10,
  },
  mainHeading: {
    fontSize: 34,
    fontFamily: "Poppins_600SemiBold",
    color: "#B85A3E",
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 10,
  },
  highlightedTextContainer: {
    borderRadius: 20,
    marginVertical: 10,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.3)', { width: 0, height: 8 }, 1, 16),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      }
    }),
  },
  textGradientBackground: {
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  highlightedText: {
    fontSize: 38,
    fontFamily: "Poppins_700Bold",
    color: "white",
    textAlign: 'center',
    lineHeight: 44,
  },
  subHeading: {
    fontSize: 17,
    fontFamily: "Poppins_400Regular",
    color: "#E68A50",
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.95,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 45,
    paddingHorizontal: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.15)', { width: 0, height: 6 }, 1, 18),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
        elevation: 6,
      }
    }),
  },
  featureAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#E68A50',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#FFE8DC',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: '#B85A3E',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#E68A50',
    opacity: 0.85,
  },
  button: {
    borderRadius: 35,
    overflow: "hidden",
    width: '88%',
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.45)', { width: 0, height: 15 }, 1, 25),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.45,
        shadowRadius: 25,
        elevation: 15,
      }
    }),
  },
  gradientButton: {
    paddingVertical: 22,
    paddingHorizontal: 36,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 19,
    letterSpacing: 0.8,
    marginRight: 14,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: shadowToBoxShadow('rgba(230, 138, 80, 0.2)', { width: 0, height: 4 }, 1, 8),
      },
      default: {
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }
    }),
  },
});