import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Disease Database with Prevention & Medicines
const DISEASE_DATABASE = {
  'Coccidiosis': {
    prevention: 'Essential Prevention Strategies:\n\n🛡️ Biosecurity Measures:\n- Maintain clean and dry litter\n- Protect them from mosquitoes\n- Avoid overcrowding in poultry houses\n- Regularly clean and disinfect feeders and waterers\n\n💊 Vaccination Program:\n- Use live vaccines for young chicks\n- Follow proper vaccination schedules\n- Monitor vaccine efficacy\n\n🧼 Hygiene Practices:\n- Provide clean drinking water\n- Remove wet litter promptly\n- Prevent access to contaminated areas',
    remedies: 'Management and Treatment Options:\n\n⚠️ Immediate Actions:\n- Isolate infected birds\n- Provide supportive care (electrolytes, vitamins)\n- Notify a veterinarian for proper diagnosis\n\n💊 Medicines:\n- Use medicines like Amprolium, Sulfadimethoxine, or Toltrazuril (Veterinary Store)\n- OR\n- For 1-2 months old chickens: divide one Disprin tablet into 8 parts and give one part with half Velosef capsule daily for 8 days\n- For 2-6 months old chickens: divide one Disprin tablet into 4 parts and give one part with half Velosef capsule daily for 8 days\n\n🌿 Natural Supportive Measures:\n- Add apple cider vinegar to drinking water (2 caps in 1 liter water)\n- Provide boiled egg daily or protein-based diets like dry worms\n- Provide a balanced diet to boost immunity'
  },
  'New Castle Disease': {
    prevention: 'Essential Prevention Strategies:\n\n🛡️ Biosecurity Measures:\n- Strict quarantine protocols\n- Controlled farm access\n- Keep your eating and drinking utensils neat and clean\n- Regular disinfection routines\n\n💉 Vaccination Program:\n- Implement routine vaccination\n- Maintain proper vaccine storage\n- Follow recommended schedules\n\n🧼 Hygiene Practices:\n- Daily cleaning of facilities\n- Proper waste management\n- Regular equipment sterilization',
    remedies: 'Management and Treatment Options:\n\n⚠️ Immediate Actions:\n- Isolate infected birds immediately\n- Currently, there is no proper medicine for this because it is extremely dangerous. However, if this condition still occurs, use this remedy: Neurobion and Methycobal with Dexamethasone injection. Mix them together and inject 1cc for adult chickens. For smaller ones (around 6 months old), inject half cc.\n- Notify local veterinary authorities\n\n💊 Supportive Care:\n- Provide electrolyte solutions\n- Maintain optimal temperature\n- Ensure proper ventilation\n\n🚨 Critical Consideration:\nDue to the extremely high mortality rate (99%) and rapid spread, culling of infected birds is often the most effective containment strategy to protect the remaining flock.'
  },
  'Salmonella': {
    prevention: 'Prevention Strategies:\n\n🛡️ Biosecurity:\n- Maintain proper hygiene\n- Avoid contaminated feed and water\n- Regularly disinfect the coop\n\n🧤 Personal Protection:\n- Use gloves when handling birds\n- Wash hands thoroughly after contact',
    remedies: 'Management and Treatment:\n\n💊 Antibiotics:\n- Use antibiotics like Enrofloxacin or Amoxicillin\n- Give one Amoxil tablet if the bird is over 6 months old, otherwise give half a tablet\n\n🌿 Supportive Care:\n- Provide electrolytes in drinking water\n- Ensure proper nutrition like protein and vitamins\n\n⚠️ Important:\nEarly diagnosis and treatment are crucial.'
  }
};

export default function DiseaseDetectionScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const resultCardRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedTab, setExpandedTab] = useState('prevention'); // prevention or remedies

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission is required to access gallery!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
      setConfidence(null);
      setTips(null);
      setExpandedTab('prevention');
    }
  };

  const clearImage = () => {
    setImage(null);
    setPrediction(null);
    setConfidence(null);
    setTips(null);
    setExpandedTab('prevention');
  };

  const scrollToResults = () => {
    setTimeout(() => {
      resultCardRef.current?.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 100,
            animated: true,
          });
        },
        (error) => console.log('Scroll error:', error)
      );
    }, 500);
  };

  const predictDisease = async () => {
    if (!image) {
      Alert.alert('No image selected');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image.startsWith('file://') ? image : `file://${image}`,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const res = await fetch('http://10.119.7.185:8000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setPrediction(data.disease);
      setConfidence(data.confidence);
      setTips(data.tips);
      setLoading(false);
      setExpandedTab('prevention');
      
      // Auto scroll to results
      scrollToResults();
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', `Something went wrong: ${error.message}`);
    }
  };

  const getDiseaseDetails = () => {
    if (prediction && DISEASE_DATABASE[prediction]) {
      return DISEASE_DATABASE[prediction];
    }
    return null;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#E68A50" />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#E68A50' }}>
        <LinearGradient
          colors={['#E68A50', '#D97942', '#CC6835']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonInner}>
                <Text style={styles.backArrow}>‹</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Disease Detection</Text>
            </View>
            <View style={styles.headerRight} />
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.iconGradient}
              >
                <Text style={styles.headerEmoji}>🐔</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerSubtitle}>AI-Powered Health Analysis</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.contentSafeArea}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces={false}
        >
        {/* Enhanced Results Card - Shown First After Analysis */}
        {prediction && !loading && (
          <View 
            ref={resultCardRef}
            style={styles.resultCard}
          >
            <LinearGradient
              colors={['#E68A50', '#D97942']}
              style={styles.resultHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.resultHeaderIcon}>📊</Text>
              <Text style={styles.resultHeaderText}>Analysis Results</Text>
            </LinearGradient>
            
            <View style={styles.resultContent}>
              <View style={styles.predictionSection}>
                <Text style={styles.predictionLabel}>DETECTED DISEASE</Text>
                <View style={[styles.predictionBadge, prediction === 'Unknown' && styles.unknownBadge]}>
                  <Text style={[styles.predictionText, prediction === 'Unknown' && styles.unknownText]}>
                    {prediction}
                  </Text>
                  <View style={[styles.predictionIndicator, prediction === 'Unknown' && styles.unknownIndicator]} />
                </View>
              </View>

              {confidence !== null && (
                <View style={styles.confidenceSection}>
                  <View style={styles.confidenceHeader}>
                    <View>
                      <Text style={styles.confidenceLabel}>CONFIDENCE LEVEL</Text>
                      <Text style={styles.confidenceDescription}>AI Prediction Accuracy</Text>
                    </View>
                    <View style={styles.confidenceValueContainer}>
                      <Text style={styles.confidenceValue}>{(confidence * 100).toFixed(1)}</Text>
                      <Text style={styles.confidencePercent}>%</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#E68A50', '#D97942']}
                        style={[styles.progressFill, { width: `${confidence * 100}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Tab Switcher for Prevention & Remedies */}
              {getDiseaseDetails() && (
                <>
                  <View style={styles.tabContainer}>
                    <TouchableOpacity 
                      style={[styles.tab, expandedTab === 'prevention' && styles.tabActive]}
                      onPress={() => setExpandedTab('prevention')}
                    >
                      <Text style={[styles.tabText, expandedTab === 'prevention' && styles.tabTextActive]}>
                        🛡️ Prevention
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.tab, expandedTab === 'remedies' && styles.tabActive]}
                      onPress={() => setExpandedTab('remedies')}
                    >
                      <Text style={[styles.tabText, expandedTab === 'remedies' && styles.tabTextActive]}>
                        💊 Remedies
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Prevention Content */}
                  {expandedTab === 'prevention' && (
                    <View style={styles.detailsCard}>
                      <Text style={styles.detailsText}>{getDiseaseDetails().prevention}</Text>
                    </View>
                  )}

                  {/* Remedies Content */}
                  {expandedTab === 'remedies' && (
                    <View style={styles.detailsCard}>
                      <Text style={styles.detailsText}>{getDiseaseDetails().remedies}</Text>
                    </View>
                  )}
                </>
              )}

              {tips && (
                <View style={styles.tipsSection}>
                  <View style={styles.tipsHeader}>
                    <View style={styles.tipsIconContainer}>
                      <Text style={styles.tipsIcon}>💡</Text>
                    </View>
                    <Text style={styles.tipsTitle}>QUICK NOTES</Text>
                  </View>
                  <View style={styles.tipsContent}>
                    <Text style={styles.tipsText}>{tips}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Image Display Card with Enhanced Design & Clear Button */}
        {image ? (
          <View style={styles.imageCard}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)']}
                style={styles.imageGradientOverlay}
              />
            </View>
            <View style={styles.imageOverlay}>
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeIcon}>✓</Text>
                <Text style={styles.imageBadgeText}>Image Selected</Text>
              </View>
            </View>
            
            {/* Clear Image Button */}
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearImage}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <LinearGradient
              colors={['rgba(230, 138, 80, 0.05)', 'rgba(230, 138, 80, 0.02)']}
              style={styles.placeholderGradient}
            >
              <View style={styles.placeholderIcon}>
                <Text style={styles.placeholderEmoji}>📸</Text>
              </View>
              <Text style={styles.placeholderText}>No Image Selected</Text>
              <Text style={styles.placeholderSubtext}>Upload a poultry image for AI analysis</Text>
              <View style={styles.placeholderDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Enhanced Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E68A50', '#D97942']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconWrapper}>
                  <Text style={styles.buttonIcon}>🖼️</Text>
                </View>
                <Text style={styles.primaryButtonText}>Select Image</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {image && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={predictDisease}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconWrapper}>
                    <Text style={styles.buttonIcon}>🔍</Text>
                  </View>
                  <Text style={styles.secondaryButtonText}>{loading ? 'Analyzing...' : 'Analyze Disease'}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Enhanced Loading Indicator */}
        {loading && (
          <View style={styles.loadingCard}>
            <LinearGradient
              colors={['rgba(230, 138, 80, 0.05)', 'rgba(230, 138, 80, 0.02)']}
              style={styles.loadingGradient}
            >
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#E68A50" />
              </View>
              <Text style={styles.loadingText}>Analyzing Image...</Text>
              <Text style={styles.loadingSubtext}>Our AI is processing your image</Text>
              <View style={styles.loadingDots}>
                <View style={[styles.loadingDot, styles.loadingDotAnim1]} />
                <View style={[styles.loadingDot, styles.loadingDotAnim2]} />
                <View style={[styles.loadingDot, styles.loadingDotAnim3]} />
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  contentSafeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingBottom: 50,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backArrow: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 44,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerEmoji: {
    fontSize: 50,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  imageCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'visible',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  imageBadgeIcon: {
    fontSize: 16,
    color: '#fff',
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  clearButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  clearButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  placeholderCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  placeholderGradient: {
    padding: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E68A50',
    borderStyle: 'dashed',
    borderRadius: 25,
    margin: 2,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(230, 138, 80, 0.2)',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  placeholderDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#E68A50',
    width: 24,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 25,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 22,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingCard: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  loadingGradient: {
    padding: 50,
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E68A50',
  },
  loadingDotAnim1: {
    opacity: 0.4,
  },
  loadingDotAnim2: {
    opacity: 0.7,
  },
  loadingDotAnim3: {
    opacity: 1,
  },
  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  resultHeaderIcon: {
    fontSize: 24,
  },
  resultHeaderText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  resultContent: {
    padding: 24,
  },
  predictionSection: {
    marginBottom: 28,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  predictionBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unknownBadge: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#F44336',
  },
  predictionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 0.3,
  },
  unknownText: {
    color: '#C62828',
  },
  predictionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  unknownIndicator: {
    backgroundColor: '#F44336',
  },
  confidenceSection: {
    marginBottom: 28,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  confidenceDescription: {
    fontSize: 11,
    color: '#95A5A6',
  },
  confidenceValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  confidenceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E68A50',
  },
  confidencePercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E68A50',
    marginTop: 4,
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 6,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#95A5A6',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#E68A50',
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#FFF9F5',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 80, 0.2)',
    marginBottom: 24,
  },
  detailsText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 24,
    fontWeight: '500',
  },
  tipsSection: {
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  tipsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsIcon: {
    fontSize: 20,
  },
  tipsTitle: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tipsContent: {
    paddingLeft: 4,
  },
  tipsText: {
    fontSize: 15,
    color: '#1B5E20',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});