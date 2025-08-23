import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, TextInput, Dimensions, Modal, Alert } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { getSellEntryFrom, clearSellEntryFrom, getLastFocusedTab, getPrevFocusedTab } from '../lib/navHistory';

const { width } = Dimensions.get('window');

const SellScreen = ({ navigation, route }) => {
  // Form state
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('Live');
  const [deliveryOption, setDeliveryOption] = useState('Both');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [images, setImages] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Live', 'Frozen', 'Eggs', 'Feed',];
  const deliveryOptions = ['Home Delivery', 'Pickup', 'Both'];

  const pickImage = async () => {
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Maximum Limit', 'You can only upload maximum 5 images');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload images');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      // Only take the allowed number of images
      const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
      setImages(prevImages => {
        const updatedImages = [...prevImages, ...newImages];
        // Ensure we don't exceed 5 images
        return updatedImages.slice(0, 5);
      });
    }
  };

  const takePhoto = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum Limit', 'You can only upload maximum 5 images');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your camera to take photos');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImages(prevImages => {
        const updatedImages = [...prevImages, result.assets[0].uri];
        // Ensure we don't exceed 5 images
        return updatedImages.slice(0, 5);
      });
    }
  };

  const removeImage = (index) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!productName.trim()) errors.push('Product name is required');
    if (!price || isNaN(parseFloat(price))) errors.push('Valid price is required');
    if (images.length === 0) errors.push('At least one image is required');
    if (!category) errors.push('Category is required');

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Please login to list products');

      const userId = user.id;

      // 2. Upload images with progress tracking
      const uploadedImageUrls = [];
      for (const [index, imageUri] of images.entries()) {
        const fileName = `product_${Date.now()}_${index}.jpg`;
        const filePath = `products/${userId}/${fileName}`;

        // Convert image to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Upload with error handling
        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: false,
            cacheControl: '3600' // 1 hour cache
          });

        if (uploadError) {
          console.error(`Failed to upload image ${index}:`, uploadError);
          throw new Error(`Failed to upload image ${index + 1}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      }

      // 3. Insert product data
      const productData = {
        product_name: productName,
        price: parseFloat(price),
        weight: weight || null,
        description,
        min_order: minOrder || null,
        stock_quantity: stockQuantity ? parseInt(stockQuantity) : null,
        category,
        delivery_option: deliveryOption,
        expiry_date: category === 'Processed' ? expiryDate.toISOString() : null,
        seller_id: userId
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // 4. Insert product images
      if (uploadedImageUrls.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(
            uploadedImageUrls.map(url => ({
              product_id: product.id,
              image_url: url,
              seller_id: userId
            }))
          );

        if (imagesError) throw imagesError;
      }

      // Success - reset form and navigate
      // Reset all form fields immediately after success
      setProductName('');
      setPrice('');
      setWeight('');
      setDescription('');
      setMinOrder('');
      setStockQuantity('');
      setCategory('Live');
      setDeliveryOption('Both');
      setExpiryDate(new Date());
      setImages([]);

      Alert.alert('Success', 'Product listed successfully!', [{
        text: 'OK',
        onPress: () => {
          // Navigate back to Profile screen with refresh param to update product list immediately
          navigation.navigate('Profile', { refresh: true });
        }
      }]);

    } catch (error) {
      console.error('Full error:', error);
      Alert.alert(
        'Submission Failed',
        error.message || 'An error occurred while listing your product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#E68A50', '#D67B41']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          onPress={() => {
            // Priority: explicit route param -> remembered entry -> previous tab -> last tab -> goBack -> Home
            const explicitFrom = route?.params?.from;
            const remembered = getSellEntryFrom();
            const prevTab = getPrevFocusedTab();
            const lastTab = getLastFocusedTab();

            const target = explicitFrom || remembered || prevTab || lastTab;
            if (target === 'Profile') {
              clearSellEntryFrom();
              navigation.navigate('Profile', { screen: 'ProfileMain' });
              return;
            }
            if (target === 'Home') {
              clearSellEntryFrom();
              navigation.navigate('Home');
              return;
            }
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('Home');
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List New Product</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Enhanced Product Images Section */}
        <View style={styles.imageSection}>
          <View style={styles.sectionHeader}>
            <Feather name="camera" size={20} color="#E68A50" />
            <Text style={styles.sectionTitle}>Product Images</Text>
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{images.length}/5</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContainer}
            snapToInterval={145} // Snap to each image width + margin
            decelerationRate="fast"
          >
            {images.map((img, index) => (
              <View key={`image-${index}`} style={styles.imageContainer}>
                <Image source={{ uri: img }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageNumber}>{index + 1}</Text>
                </View>
              </View>
            ))}

            {images.length < 5 && (
              <View style={styles.imageActionContainer}>
                <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
                  <LinearGradient
                    colors={['#E68A50', '#D67B41']}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Feather name="image" size={24} color="white" />
                    <Text style={styles.imageActionText}>Gallery</Text>
                    <Text style={styles.remainingText}>
                      {5 - images.length} left
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.imageActionButton} onPress={takePhoto}>
                  <LinearGradient
                    colors={['#2E8B57', '#228B22']}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Feather name="camera" size={24} color="white" />
                    <Text style={styles.imageActionText}>Camera</Text>
                    <Text style={styles.remainingText}>Take Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {images.length > 0 && (
            <Text style={styles.imageHintText}>
              Swipe to see all images • First image will be the main display
            </Text>
          )}
        </View>

        {/* Enhanced Product Details Form */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={20} color="#E68A50" />
            <Text style={styles.sectionTitle}>Product Information</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Product Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Organic Free-Range Eggs"
                placeholderTextColor="#999"
                value={productName}
                onChangeText={setProductName}
              />
              <Feather name="package" size={18} color="#E68A50" style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>
                Price (₹) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
                <Feather name="dollar-sign" size={18} color="#E68A50" style={styles.inputIcon} />
              </View>
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Weight</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1.5-2kg"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Feather name="trending-up" size={18} color="#E68A50" style={styles.inputIcon} />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>
                Min Order Qty <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5kg"
                  placeholderTextColor="#999"
                  value={minOrder}
                  onChangeText={setMinOrder}
                />
                <Feather name="shopping-cart" size={18} color="#E68A50" style={styles.inputIcon} />
              </View>
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Stock Quantity</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Available units"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                />
                <Feather name="package" size={18} color="#E68A50" style={styles.inputIcon} />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={styles.categoryContent}>
                <View style={styles.categoryIconWrapper}>
                  {category === 'Live' && <Feather name="activity" size={20} color="#E68A50" />}
                  {category === 'Frozen' && <Feather name="cloud" size={20} color="#E68A50" />}
                  {category === 'Eggs' && <Feather name="circle" size={20} color="#E68A50" />}
                  {category === 'Feed' && <Feather name="shopping-cart" size={20} color="#E68A50" />}
                </View>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
              <Feather name="chevron-down" size={20} color="#E68A50" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Delivery Options <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.deliveryOptions}>
              {deliveryOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.deliveryOption,
                    deliveryOption === option && styles.selectedDeliveryOption
                  ]}
                  onPress={() => setDeliveryOption(option)}
                >
                  <LinearGradient
                    colors={deliveryOption === option ? ['#E68A50', '#D67B41'] : ['#f8f9fa', '#f8f9fa']}
                    style={styles.deliveryOptionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[
                      styles.deliveryOptionText,
                      deliveryOption === option && styles.selectedDeliveryOptionText
                    ]}>
                      {option}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Expiry Date (if applicable)</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateContent}>
                <Feather name="calendar" size={18} color="#E68A50" />
                <Text style={styles.dateText}>
                  {expiryDate.toLocaleDateString()}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#E68A50" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Product Description <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Describe your product in detail (quality, breed, feed, etc.)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
              <Feather name="file-text" size={18} color="#E68A50" style={[styles.inputIcon, styles.descriptionIcon]} />
            </View>
          </View>
        </View>

        {/* Enhanced Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isSubmitting ? ['#a5d6a7', '#a5d6a7'] : ['#E68A50', '#D67B41']}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.submitButtonText}>Publishing...</Text>
              </View>
            ) : (
              <View style={styles.submitContainer}>
                <Feather name="check-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Publish Listing</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Enhanced Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#E68A50', '#D67B41']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalScrollView}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.selectedCategoryOption
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryOptionContent}>
                    <View style={[
                      styles.categoryIconContainer,
                      category === cat && styles.selectedCategoryIcon
                    ]}>
                      {cat === 'Live' && <Feather name="activity" size={22} color={category === cat ? 'white' : '#E68A50'} />}
                      {cat === 'Frozen' && <Feather name="cloud" size={22} color={category === cat ? 'white' : '#E68A50'} />}
                      {cat === 'Eggs' && <Feather name="circle" size={22} color={category === cat ? 'white' : '#E68A50'} />}
                      {cat === 'Feed' && <Feather name="shopping-cart" size={22} color={category === cat ? 'white' : '#E68A50'} />}
                    </View>
                    <Text style={[
                      styles.categoryOptionText,
                      category === cat && styles.selectedCategoryText
                    ]}>{cat}</Text>
                  </View>
                  {category === cat && (
                    <View style={styles.checkIconContainer}>
                      <Feather name="check" size={20} color="#E68A50" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  imageSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    color: '#2c3e50',
    flex: 1,
  },
  imageBadge: {
    backgroundColor: '#E68A50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  imageBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageScrollContainer: {
    paddingVertical: 5,
    paddingRight: 20, // Add right padding to prevent cut-off
  },
  imageContainer: {
    width: 130,
    height: 130,
    borderRadius: 15,
    marginRight: 15,
    position: 'relative',
    backgroundColor: '#f8f9fa',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(230, 138, 80, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageActionContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  imageActionButton: {
    width: 110,
    height: 130,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 8,
  },
  imageActionText: {
    marginTop: 8,
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  remainingText: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  imageHintText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  formSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  required: {
    color: '#E68A50',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    paddingRight: 45,
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 17,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  descriptionIcon: {
    top: 20,
  },
  row: {
    flexDirection: 'row',
  },
  priceUnit: {
    position: 'absolute',
    right: 50,
    top: 17,
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  categorySelector: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconWrapper: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  deliveryOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  deliveryOption: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryOptionGradient: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedDeliveryOptionText: {
    color: 'white',
  },
  dateSelector: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    fontWeight: '500',
  },
  submitButton: {
    marginHorizontal: 20,
    marginVertical: 25,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
  },
  modalCloseButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalScrollView: {
    padding: 10,
  },
  categoryOption: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCategoryOption: {
    backgroundColor: '#fff5f0',
    borderWidth: 2,
    borderColor: '#E68A50',
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  categoryIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  selectedCategoryIcon: {
    backgroundColor: '#E68A50',
  },
  categoryOptionText: {
    fontSize: 18,
    flex: 1,
    color: '#2c3e50',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#E68A50',
    fontWeight: 'bold',
  },
  checkIconContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: '#fff5f0',
    borderRadius: 15,
    padding: 5,
  },
});

export default SellScreen;