import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LogoutConfirmationModal = ({ visible, onClose, onConfirm, isLoading = false }) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [overlayOpacity] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      // Open animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.6)" barStyle="light-content" />
      
      {/* Overlay */}
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
        
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header with Icon */}
          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="logout" size={32} color="#E74C3C" />
            </View>
            <Text style={styles.modalTitle}>Logout Confirmation</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Feather name="x" size={20} color="#7F8C8D" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, isLoading && styles.disabledButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <MaterialIcons name="logout" size={20} color="white" />
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Logging out...' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

LogoutConfirmationModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 30,
    maxWidth: SCREEN_WIDTH - 60,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 25,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(231, 76, 60, 0.2)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#ECF0F1',
    borderBottomLeftRadius: 20,
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
    borderBottomRightRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#C0392B',
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default LogoutConfirmationModal;