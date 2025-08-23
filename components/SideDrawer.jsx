import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
} from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useDispatch } from 'react-redux';
import { clearProfileData } from '../redux/profileslice/profileSlice';
import { setProfileLoadedOnce } from '../redux/appSlice';
import { clearSessionTracking } from '../lib/analytics';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import FeedbackModal from './FeedbackModal';
import PropTypes from 'prop-types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

const SideDrawer = ({ visible, onClose, navigation }) => {
  const dispatch = useDispatch();
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = React.useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayOpacity]);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLogoutLoading(true);
    
    try {
      // Clear session tracking before logout
      clearSessionTracking();
      
      // Clear profile data and reset profileLoadedOnce flag
      dispatch(clearProfileData());
      dispatch(setProfileLoadedOnce(false));
      
      await supabase.auth.signOut();
      setLogoutModalVisible(false);
      onClose();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleLogoutModalClose = () => {
    if (!isLogoutLoading) {
      setLogoutModalVisible(false);
    }
  };

  const handleFeedback = () => {
    setFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'My Profile',
      icon: 'person-outline',
      iconType: 'Ionicons',
      onPress: () => {
        onClose();
        navigation.navigate('Profile');
      }
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      iconType: 'MaterialIcons',
      onPress: () => {
        onClose();
        navigation.navigate('Dashboard');
      }
    },
    {
      id: 'feedback',
      title: 'Feedback',
      icon: 'message-circle',
      iconType: 'Feather',
      onPress: handleFeedback
    }
  ];

  const renderIcon = (item) => {
    const iconProps = {
      name: item.icon,
      size: 24,
      color: '#5D6D7E'
    };

    switch (item.iconType) {
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />;
      case 'FontAwesome':
        return <FontAwesome {...iconProps} />;
      default:
        return <Feather {...iconProps} />;
    }
  };

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemIcon}>
        {renderIcon(item)}
      </View>
      <Text style={styles.menuItemText}>
        {item.title}
      </Text>
      <Feather 
        name="chevron-right" 
        size={20} 
        color="#BDC3C7"
      />
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
        
        <Animated.View 
          style={[
            styles.overlay, 
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.headerGradient} />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>Menu</Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </View>

          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View style={styles.logoutIconContainer}>
                <MaterialIcons name="logout" size={24} color="white" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </Modal>

      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={handleCloseFeedbackModal}
      />

      <LogoutConfirmationModal
        visible={logoutModalVisible}
        onClose={handleLogoutModalClose}
        onConfirm={handleLogoutConfirm}
        isLoading={isLogoutLoading}
      />
    </>
  );
};

SideDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  drawerHeader: {
    height: 120,
    backgroundColor: '#E68A50',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, #E68A50 0%, #D67741 100%)',
    opacity: 0.9,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  userInfo: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  versionText: {
    textAlign: 'center',
    color: '#BDC3C7',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SideDrawer;