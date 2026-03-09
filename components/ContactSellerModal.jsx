import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ContactSellerModal = ({ visible, onClose, isProfileOwner, sellerData, onUpdateContacts }) => {
  const [phone, setPhone] = useState(sellerData?.phone || '');
  const [whatsappLink, setWhatsappLink] = useState(sellerData?.whatsapp_link || '');
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (number) => {
    // Basic phone number validation - at least 10 digits
    const digits = number.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleSave = async () => {
    if (!phone && !whatsappLink) {
      Alert.alert('Error', 'Please provide at least one contact method');
      return;
    }

    if (phone && !validatePhoneNumber(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits)');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: phone || null,
          whatsapp_link: whatsappLink || null
        })
        .eq('id', sellerData.id);

      if (error) throw error;

      const updatedContacts = {
        phone: phone || null,
        whatsapp_link: whatsappLink || null
      };

      Alert.alert('Success', 'Contact information updated successfully');
      onUpdateContacts(updatedContacts);
      onClose();
    } catch (error) {
      console.error('Error updating contact info:', error);
      Alert.alert('Error', 'Failed to update contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (method) => {
    if (method === 'phone' && sellerData?.phone) {
      Linking.openURL(`tel:${sellerData.phone}`);
    } else if (method === 'whatsapp') {
      if (sellerData?.whatsapp_link) {
        Linking.openURL(sellerData.whatsapp_link);
      } else if (sellerData?.phone) {
        const formattedNumber = sellerData.phone.replace(/\D/g, '').replace(/^0+/, '');
        const whatsappNumber = formattedNumber.startsWith('92') ? formattedNumber : `92${formattedNumber}`;
        Linking.openURL(`whatsapp://send?phone=${whatsappNumber}`);
      } else {
        Alert.alert('Error', 'Contact information not available');
      }
    } else {
      Alert.alert('Error', 'Contact information not available');
    }
  };

  const hasPhone = !!sellerData?.phone;
  const hasWhatsAppLink = !!sellerData?.whatsapp_link;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContent}>
                {/* Modern Gradient Header with Glass Effect */}
                <LinearGradient
                  colors={['#FF8C42', '#FF6B35', '#E85A4F']}
                  style={styles.modalHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.headerTopLine} />
                  <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                      <View style={styles.iconContainer}>
                        <Ionicons 
                          name={isProfileOwner ? "settings-outline" : "chatbubbles-outline"} 
                          size={22} 
                          color="#FFF" 
                        />
                      </View>
                      <Text style={styles.modalTitle}>
                        {isProfileOwner ? 'Manage Contacts' : 'Connect with Seller'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <View style={styles.closeButtonInner}>
                        <Ionicons name="close" size={20} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {/* Scrollable Content */}
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {isProfileOwner ? (
                    // Profile owner view - Modern form design
                    <View style={styles.formContainer}>
                      <Text style={styles.sectionTitle}>Contact Information</Text>
                      <Text style={styles.sectionSubtitle}>
                        Update your contact details to help buyers reach you
                      </Text>

                      <View style={styles.inputContainer}>
                        <View style={styles.inputGroup}>
                          <View style={styles.inputHeader}>
                            <Ionicons name="call-outline" size={18} color="#E85A4F" />
                            <Text style={styles.label}>Phone Number</Text>
                          </View>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.input}
                              value={phone}
                              onChangeText={setPhone}
                              placeholder="Enter your phone number"
                              keyboardType="phone-pad"
                              placeholderTextColor="#A0A0A0"
                            />
                          </View>
                        </View>

                        <View style={styles.inputGroup}>
                          <View style={styles.inputHeader}>
                            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                            <Text style={styles.label}>WhatsApp Link</Text>
                            <Text style={styles.optionalTag}>Optional</Text>
                          </View>
                          
                          {/* Beautiful WhatsApp Example Container */}
                          <View style={styles.exampleContainer}>
                            <View style={styles.exampleHeader}>
                              <Ionicons name="information-circle-outline" size={16} color="#25D366" />
                              <Text style={styles.exampleTitle}>Format Example</Text>
                            </View>
                            <View style={styles.exampleBox}>
                              <Text style={styles.exampleText}>https://wa.me/92xxxxxxxxxx</Text>
                              <View style={styles.exampleNote}>
                                <Text style={styles.exampleNoteText}>
                                  Replace 'xxxxxxxxxx' with your phone number (without +92)
                                </Text>
                              </View>
                            </View>
                          </View>
                          
                          <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.input}
                              value={whatsappLink}
                              onChangeText={setWhatsappLink}
                              placeholder="https://wa.me/92xxxxxxxxxx"
                              keyboardType="url"
                              placeholderTextColor="#A0A0A0"
                            />
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={loading ? ['#CCC', '#AAA'] : ['#E85A4F', '#FF6B35']}
                          style={styles.saveButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {loading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator color="#FFF" size="small" />
                              <Text style={styles.saveButtonText}>Updating...</Text>
                            </View>
                          ) : (
                            <View style={styles.buttonContent}>
                              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                              <Text style={styles.saveButtonText}>Save Changes</Text>
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // Visitor view - Modern contact options
                    <View style={styles.contactOptionsContainer}>
                      <Text style={styles.sectionTitle}>Choose Contact Method</Text>
                      <Text style={styles.sectionSubtitle}>
                        Select how you'd like to get in touch
                      </Text>

                      {(!hasPhone && !hasWhatsAppLink) ? (
                        // No contact information available - Beautiful UI
                        <View style={styles.noContactContainer}>
                          <View style={styles.noContactBackground}>
                            <View style={styles.noContactIconWrapper}>
                              <LinearGradient
                                colors={['#FF6B6B', '#FF8E8E']}
                                style={styles.noContactGradientIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <Ionicons name="person-circle-outline" size={32} color="#FFF" />
                              </LinearGradient>
                            </View>
                            <View style={styles.noContactTextContainer}>
                              <Text style={styles.noContactTitle}>No Contact Information</Text>
                              <Text style={styles.noContactSubtitle}>
                                This seller hasn't added their contact details yet
                              </Text>
                            </View>
                            <View style={styles.noContactDecoration}>
                              <View style={styles.decorationDot} />
                              <View style={styles.decorationDot} />
                              <View style={styles.decorationDot} />
                            </View>
                          </View>
                        </View>
                      ) : (
                        // Contact options available
                        <View style={styles.optionsGrid}>
                          {hasPhone && (
                            <TouchableOpacity
                              style={styles.contactOption}
                              onPress={() => handleContact('phone')}
                              activeOpacity={0.7}
                            >
                              <LinearGradient
                                colors={['#4A90E2', '#357ABD']}
                                style={styles.contactOptionGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <View style={styles.contactIconContainer}>
                                  <Ionicons name="call" size={26} color="#FFF" />
                                </View>
                                <Text style={styles.contactOptionTitle}>Phone Call</Text>
                                <Text style={styles.contactOptionSubtitle}>Direct call</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          )}

                          {hasWhatsAppLink && (
                            <TouchableOpacity
                              style={styles.contactOption}
                              onPress={() => handleContact('whatsapp')}
                              activeOpacity={0.7}
                            >
                              <LinearGradient
                                colors={['#25D366', '#1EAE52']}
                                style={styles.contactOptionGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <View style={styles.contactIconContainer}>
                                  <Ionicons name="logo-whatsapp" size={26} color="#FFF" />
                                </View>
                                <Text style={styles.contactOptionTitle}>WhatsApp</Text>
                                <Text style={styles.contactOptionSubtitle}>Chat now</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // ScrollView styles
  scrollView: {
    flex: 1,
    maxHeight: '80%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // Beautiful No Contact Information Styles
  noContactContainer: {
    marginTop: 20,
  },
  noContactBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  noContactIconWrapper: {
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noContactGradientIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  noContactTextContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  noContactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  noContactSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  noContactDecoration: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  decorationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 350,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    flex: 1,
  },
  modalHeader: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTopLine: {
    height: 4,
    width: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  optionalTag: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '500',
  },
  
  // WhatsApp example styles
  exampleContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#25D366',
    marginLeft: 6,
  },
  exampleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  exampleText: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  exampleNote: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 8,
  },
  exampleNoteText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#E85A4F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  contactOptionsContainer: {
    padding: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  contactOption: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  contactOptionGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactOptionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ContactSellerModal;