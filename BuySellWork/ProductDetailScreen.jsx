import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackProductView, getCurrentUserId } from '../lib/analytics';
import { emit } from '../lib/eventBus';
import { useDispatch } from 'react-redux';
import { upsertProduct } from '../redux/profileslice/profileSlice';
import ContactSellerModal from '../components/ContactSellerModal'; // Import the modal

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // New state for ContactSellerModal
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('');

  // Get current user for ownership check
  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url),
          profiles!seller_id(id, full_name, profile_image, phone, whatsapp_link)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to fetch product details');
        console.error('Fetch product error:', error);
      } else {
        setProduct(data);
        setImages(data.product_images.map(img => img.image_url));
        setProductName(data.product_name);
        setPrice(data.price.toString());
        setWeight(data.weight || '');
        setDescription(data.description || '');
        setDeliveryOption(data.delivery_option || '');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching product details');
      console.error('Fetch product exception:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProduct(null);
    setLoading(true);
    getCurrentUser();
    fetchProduct();
  }, [productId]);

  // Check if current user is the owner
  const isOwner = currentUser && product && currentUser.id === product.seller_id;

  // Record a product view when a non-owner opens the product (once per session per user-product)
  useEffect(() => {
    // Don't block rendering with tracking
    const recordProductView = () => {
      if (!product || !currentUser) return;
      if (product.seller_id === currentUser.id) return; // don't count owner's own views
      
      // Use the centralized tracking function without awaiting to prevent delay
      trackProductView(product.id, currentUser.id, product.seller_id, 'ProductDetail')
        .catch(err => console.log('Background tracking error:', err));
    };

    recordProductView();
  }, [product, currentUser]);

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          product_name: productName,
          price: parseFloat(price),
          weight,
          description,
          delivery_option: deliveryOption,
        })
        .eq('id', productId);

      if (error) {
        Alert.alert('Error', 'Failed to update product');
      } else {
        Alert.alert('Success', 'Product updated successfully');
        // Update local detail view immediately (no skeleton, no navigation)
        setProduct(prev => ({
          ...prev,
          product_name: productName,
          price: parseFloat(price),
          weight,
          description,
          delivery_option: deliveryOption,
        }));
        setIsEditing(false);
        // Patch ProfileScreen list instantly via Redux
        dispatch(upsertProduct({
          id: productId,
          product_name: productName,
          price: parseFloat(price),
          weight,
          description,
          delivery_option: deliveryOption,
        }));
        // Broadcast to HomeScreen to patch its cards instantly
        emit('product:update', {
          id: productId,
          product_name: productName,
          price: parseFloat(price),
          weight,
          description,
          delivery_option: deliveryOption,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the product');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      // First delete product images if they exist in a separate table
      const { error: imageError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (imageError) throw imageError;

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        Alert.alert('Error', 'Failed to delete product');
      } else {
        Alert.alert('Success', 'Product deleted successfully', [
          {
            text: 'OK',
            onPress: () => {
              const origin = route.params?.origin;
              if (origin === 'Home') {
                navigation.navigate('Home', { refresh: true });
              } else if (origin === 'Profile') {
                navigation.navigate('ProfileMain', { refresh: true });
              } else {
                navigation.goBack();
              }
            }
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the product');
    }
  };

  // Updated Contact seller function - Now opens modal instead of Alert
  const handleContactSeller = () => {
    if (!product?.profiles) {
      Alert.alert('Error', 'Seller information not available');
      return;
    }
    
    // Open the ContactSellerModal
    setContactModalVisible(true);
  };

  // Handle contact updates (if needed for future functionality)
  const handleUpdateContacts = (updatedContacts) => {
    // Update the product's seller profile with new contact info
    if (product && product.profiles) {
      setProduct(prevProduct => ({
        ...prevProduct,
        profiles: {
          ...prevProduct.profiles,
          ...updatedContacts
        }
      }));
    }
  };

  // Navigate to seller profile
  const handleSellerProfile = () => {
    if (product?.profiles?.id) {
      // Navigate to Profile stack, ProfileMain screen
      navigation.navigate('Profile', {
        screen: 'ProfileMain',
        params: {
          userId: product.profiles.id,
          sellerName: product.profiles.full_name,
          fromProductDetail: true
        }
      });
    } else {
      Alert.alert('Error', 'Unable to view seller profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E68A50" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#E68A50', '#D4743C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            const origin = route.params?.origin;
            if (origin === 'Home') {
              navigation.navigate('Home');
              return;
            }
            if (origin === 'Profile') {
              navigation.goBack();
              return;
            }
            navigation.goBack();
          }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Enhanced Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView horizontal pagingEnabled style={styles.imageCarousel} showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageCounter}>{index + 1}/{images.length}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Enhanced seller card with better visual feedback */}
        {!isOwner && !isEditing && product.profiles && (
          <TouchableOpacity
            style={styles.sellerCard}
            onPress={handleSellerProfile}
            activeOpacity={0.7}
          >
            <View style={styles.sellerInfo}>
              <Image
                source={{
                  uri: product.profiles?.profile_image || require('../assets/avatar-placeholder.png')
                }}
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{product.profiles?.full_name || 'Unknown Seller'}</Text>
                <View style={styles.sellerSubInfo}>
                  <Text style={styles.sellerLabel}>View seller profile</Text>
                  <Feather name="external-link" size={14} color="#E68A50" />
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#E68A50" />
            </View>
          </TouchableOpacity>
        )}

        {/* Product Information Card */}
        <View style={styles.infoCard}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={styles.editTitle}>Edit Product</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name</Text>
                <TextInput
                  style={styles.input}
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="Enter product name"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter weight"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Option</Text>
                <TextInput
                  style={styles.input}
                  value={deliveryOption}
                  onChangeText={setDeliveryOption}
                  placeholder="Enter delivery option"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text style={styles.productName}>{product.product_name}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>₹{product.price}</Text>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>Best Price</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="scale-outline" size={20} color="#E68A50" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Weight</Text>
                    <Text style={styles.detailValue}>{product.weight || 'Not specified'}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="car-outline" size={20} color="#E68A50" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Delivery</Text>
                    <Text style={styles.detailValue}>{product.delivery_option || 'Standard'}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="apps-outline" size={20} color="#E68A50" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{product.category || 'Not specified'}</Text>
                  </View>
                </View>

                {product.min_order && (
                  <View style={styles.detailItem}>
                    <Ionicons name="cart-outline" size={20} color="#E68A50" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Min Order</Text>
                      <Text style={styles.detailValue}>{product.min_order}</Text>
                    </View>
                  </View>
                )}
              </View>

              {product.description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                </View>
              )}

              {/* Conditional Action Buttons */}
              <View style={styles.actionButtons}>
                {isOwner ? (
                  // Owner sees Edit and Delete buttons
                  <>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                      <LinearGradient
                        colors={['#E68A50', '#D4743C']}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Feather name="edit-3" size={20} color="white" />
                        <Text style={styles.editButtonText}>Edit Product</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                      <Ionicons name="trash-outline" size={20} color="#FF4757" />
                      <Text style={styles.deleteButtonText}>Delete Product</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Non-owners see Contact Seller button - Now opens modal
                  <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
                    <LinearGradient
                      colors={['#27AE60', '#2ECC71']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="call-outline" size={20} color="white" />
                      <Text style={styles.contactButtonText}>Contact Seller</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Contact Seller Modal */}
      <ContactSellerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        isProfileOwner={false} // Always false since this is for customers contacting sellers
        sellerData={product?.profiles || null}
        onUpdateContacts={handleUpdateContacts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginLeft: -24,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageCarousel: {
    height: 300,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 350,
    height: 300,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounter: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  // New Seller Card Styles
  sellerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#E68A50',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sellerSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerLabel: {
    fontSize: 14,
    color: '#E68A50',
    marginRight: 6,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  displayContainer: {
    // Container for display mode
  },
  productName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    lineHeight: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E68A50',
    marginRight: 12,
  },
  priceBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceBadgeText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  detailsGrid: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#5D6D7E',
    lineHeight: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E68A50',
  },
  actionButtons: {
    gap: 12,
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // New Contact Button Styles
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Edit Mode Styles
  editContainer: {
    // Container for edit mode
  },
  editTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E68A50',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProductDetailScreen;