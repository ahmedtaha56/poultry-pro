import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/profileslice/profileSlice';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Enhanced cache implementation with session tracking
const editProfileCache = new Map();
const editSessionCache = new Map(); // Track if user has loaded edit profile in this session
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    bio: '',
    business_name: '',
    address: '',
    profile_image: ''
  });
  const [authUser, setAuthUser] = useState(null);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Track if this is first load in session
  const [saving, setSaving] = useState(false); // Track saving state

  // Check if user profile has been loaded in current session
  const getUserSessionKey = useCallback((userId) => {
    return `edit_profile_session_${userId}`;
  }, []);

  const hasLoadedInSession = useCallback((userId) => {
    const sessionKey = getUserSessionKey(userId);
    return editSessionCache.has(sessionKey);
  }, [getUserSessionKey]);

  const markAsLoadedInSession = useCallback((userId) => {
    const sessionKey = getUserSessionKey(userId);
    editSessionCache.set(sessionKey, {
      loaded: true,
      timestamp: Date.now()
    });
  }, [getUserSessionKey]);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setAuthUser(user);

      // Check if this is first load in session
      const isFirstLoadInSession = !hasLoadedInSession(user.id);
      
      // Only show loading for first load in session or force refresh
      if (isFirstLoadInSession || forceRefresh) {
        setLoading(true);
      }

      // Check cache first (but not for force refresh)
      if (!forceRefresh) {
        const cachedData = editProfileCache.get(user.id);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRY_TIME)) {
          setProfile(cachedData.profile);
          
          // Mark as loaded in session if first time
          if (isFirstLoadInSession) {
            markAsLoadedInSession(user.id);
          }
          
          setLoading(false);
          setInitialLoad(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const profileData = data || {
        username: '',
        full_name: '',
        bio: '',
        business_name: '',
        address: '',
        profile_image: ''
      };

      setProfile(profileData);

      // Cache the data
      editProfileCache.set(user.id, {
        profile: profileData,
        timestamp: Date.now()
      });

      // Mark as loaded in session
      markAsLoadedInSession(user.id);

    } catch (error) {
      console.error('Fetch profile error:', error);
      if (loading) { // Only show alert during initial loading
        Alert.alert('Error', 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [hasLoadedInSession, markAsLoadedInSession, loading]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      if (authUser?.id) {
        if (!hasLoadedInSession(authUser.id)) {
          // First time loading in session
          fetchProfile();
        } else {
          // Already loaded in session, check cache expiry
          const cachedData = editProfileCache.get(authUser.id);
          if (cachedData && (Date.now() - cachedData.timestamp > CACHE_EXPIRY_TIME)) {
            // Cache expired, refresh silently
            fetchProfile(true);
          }
        }
      }
    }, [authUser?.id, fetchProfile, hasLoadedInSession])
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to change profile image');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setProfile({ ...profile, profile_image: result.assets[0].uri });
    }
  };

  const handleInputChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    console.log('handleSave called with authUser:', authUser, 'profile:', profile);
    if (!profile?.username || !profile?.bio) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      setSaving(true); // Show saving state instead of main loading

      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          business_name: profile.business_name,
          address: profile.address,
          profile_image: profile.profile_image,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      dispatch(updateProfile({
        userId: user.id,
        profileData: {
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          business_name: profile.business_name,
          address: profile.address,
          profile_image: profile.profile_image
        }
      }));

      // Update cache with new data
      editProfileCache.set(user.id, {
        profile: profile,
        timestamp: Date.now()
      });

      setEditable(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back with refresh flag to update ProfileScreen
            navigation.navigate('Profile', { refresh: true });
          }
        }
      ]);

    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (editable) {
      handleSave();
    } else {
      setEditable(true);
    }
  };

  // Show loading only for initial load in session
  if (loading && initialLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E68A50" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#E68A50', '#F4A460']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleEditToggle}
            style={[styles.editButton, saving && styles.editButtonDisabled]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.editButtonText}>
                {editable ? 'Save' : 'Edit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture Section with Enhanced Design */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profile.profile_image }}
                style={styles.profileImage}
                defaultSource={require('../assets/profile-placeholder.png')}
              />
              <View style={styles.imageOverlay} />
              {editable && (
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={pickImage}
                  disabled={saving}
                >
                  <Feather name="camera" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.profileImageShadow} />
          </View>
          {editable && (
            <Text style={styles.profileImageText}>Tap camera to change photo</Text>
          )}
        </View>

        {/* Profile Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={24} color="#E68A50" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, editable && styles.inputWrapperEditable]}>
                <Ionicons name="at" size={18} color="#E68A50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  editable={editable && !saving}
                  placeholder="Your username"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, editable && styles.inputWrapperEditable]}>
                <Ionicons name="person" size={18} color="#E68A50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.full_name}
                  onChangeText={(text) => handleInputChange('full_name', text)}
                  editable={editable && !saving}
                  placeholder="Your full name"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Bio <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, editable && styles.inputWrapperEditable]}>
                <Ionicons name="chatbubble-outline" size={18} color="#E68A50" style={styles.inputIconTop} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={profile.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  editable={editable && !saving}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell about your business"
                  placeholderTextColor="#B0B0B0"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Business Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={24} color="#E68A50" />
            <Text style={styles.sectionTitle}>Business Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <View style={[styles.inputWrapper, editable && styles.inputWrapperEditable]}>
                <Ionicons name="storefront" size={18} color="#E68A50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.business_name}
                  onChangeText={(text) => handleInputChange('business_name', text)}
                  editable={editable && !saving}
                  placeholder="Your business name"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Address</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, editable && styles.inputWrapperEditable]}>
                <Ionicons name="location-outline" size={18} color="#E68A50" style={styles.inputIconTop} />
                <TextInput
                  style={[styles.input, styles.textAreaSmall]}
                  value={profile.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                  editable={editable && !saving}
                  multiline
                  numberOfLines={3}
                  placeholder="Your business address"
                  placeholderTextColor="#B0B0B0"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Save Button with Gradient */}
        {editable && (
          <LinearGradient
            colors={saving ? ['#BDC3C7', '#95A5A6'] : ['#E68A50', '#D4804F']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >
              {saving ? (
                <>
                  <ActivityIndicator size={24} color="white" style={styles.saveIcon} />
                  <Text style={styles.saveButtonText}>Saving Changes...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" style={styles.saveIcon} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Loading Overlay for Save Operation */}
        {saving && (
          <View style={styles.savingOverlay}>
            <View style={styles.savingContainer}>
              <ActivityIndicator size="large" color="#E68A50" />
              <Text style={styles.savingText}>Saving your changes...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
    color: 'white',
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonDisabled: {
    opacity: 0.7,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: -20,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 12,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 66,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 66,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  profileImageShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 70,
    backgroundColor: '#E68A50',
    opacity: 0.2,
    zIndex: -1,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#E68A50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImageText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 12,
    color: '#2C3E50',
    letterSpacing: 0.3,
  },
  inputGroup: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: '#34495E',
    letterSpacing: 0.2,
  },
  required: {
    color: '#E74C3C',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: 'hidden',  // This will prevent the black box from appearing
  },
  inputWrapperEditable: {
    backgroundColor: 'white',
    borderColor: '#E68A50',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconTop: {
    marginRight: 12,
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 12,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  textAreaSmall: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButtonGradient: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  saveIcon: {
    marginRight: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  savingContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  savingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
});

export default EditProfileScreen;