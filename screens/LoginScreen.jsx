import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { supabase } from "../lib/supabase";
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearProfileData } from '../redux/profileslice/profileSlice';
import { setProfileLoadedOnce } from '../redux/appSlice';
import { MaterialIcons } from '@expo/vector-icons';
import PoultryLogo from '../components/PoultryLogo'; 

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUsername = useSelector(state => state.profile.username);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isResetMode, setIsResetMode] = React.useState(false);
  
  // Focus states for each input field
  const [focusedField, setFocusedField] = React.useState('');
  
  // Error states for each field
  const [fieldErrors, setFieldErrors] = React.useState({
    email: false,
    password: false,
    newPassword: false,
    confirmPassword: false
  });

  React.useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace('JobCategory');
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigation]);

  const validateFields = () => {
    if (isResetMode) {
      const errors = {
        email: !email.trim(),
        newPassword: !newPassword,
        confirmPassword: !confirmPassword
      };
      
      setFieldErrors(errors);
      
      // Check if any field has error
      const hasErrors = Object.values(errors).some(error => error);
      
      if (hasErrors) {
        const emptyFields = [];
        if (errors.email) emptyFields.push('Email');
        if (errors.newPassword) emptyFields.push('New Password');
        if (errors.confirmPassword) emptyFields.push('Confirm Password');
        
        Alert.alert(
          'Required Fields Missing', 
          `Please fill in the following fields: ${emptyFields.join(', ')}`
        );
        return false;
      }

      // Password match validation
      if (newPassword !== confirmPassword) {
        setFieldErrors(prev => ({ ...prev, newPassword: true, confirmPassword: true }));
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      // Password strength validation
      if (newPassword.length < 6) {
        setFieldErrors(prev => ({ ...prev, newPassword: true }));
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return false;
      }
    } else {
      const errors = {
        email: !email.trim(),
        password: !password
      };
      
      setFieldErrors(errors);
      
      // Check if any field has error
      const hasErrors = Object.values(errors).some(error => error);
      
      if (hasErrors) {
        // Create specific error message
        const emptyFields = [];
        if (errors.email) emptyFields.push('Email');
        if (errors.password) emptyFields.push('Password');
        
        Alert.alert(
          'Required Fields Missing', 
          `Please fill in the following fields: ${emptyFields.join(', ')}`
        );
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: true }));
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setFieldErrors({
      email: false,
      password: false,
      newPassword: false,
      confirmPassword: false
    });
    
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      // Supabase sign in
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if email is confirmed (Supabase handles this differently)
      if (user && !user.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address. Check your inbox.',
          [
            {
              text: 'Resend Email',
              onPress: async () => {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: user.email
                });
                if (error) Alert.alert('Error', 'Failed to resend verification email');
              }
            },
            { text: 'OK' }
          ]
        );
        return;
      }

      // Dispatch updateProfile with user's data
      if (user && (!currentUsername || currentUsername.trim() === '')) {
        dispatch(updateProfile({
          uid: user.id, // Supabase uses user.id instead of user.uid
          profile: {
            name: user.user_metadata?.full_name || email.split('@')[0],
            username: user.user_metadata?.username || email.split('@')[0]
          }
        }));
      }

      dispatch(clearProfileData()); // Clear previous profile data
      dispatch(setProfileLoadedOnce(false)); // Reset profileLoadedOnce to show skeleton

      navigation.navigate("JobCategory");
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';

      // Supabase error codes are different from Firebase
      switch (error.message) {
        case 'Email not confirmed':
          errorMessage = 'Please verify your email address first.';
          break;
        case 'Invalid login credentials':
          errorMessage = 'Invalid email or password.';
          setFieldErrors({ email: true, password: true });
          break;
        case 'Email rate limit exceeded':
          errorMessage = 'Too many attempts. Try again later.';
          break;
        default:
          console.log("Login Error:", error);
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // The validation for newPassword and confirmPassword should not happen here.
    // Only email is needed.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: true }));
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      Alert.alert(
        'Password Reset Email Sent',
        'We have sent you a password reset link. Please check your email and follow the instructions.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsResetMode(false);
              setNewPassword('');
              setConfirmPassword('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      setFieldErrors(prev => ({ ...prev, email: true }));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: true }));
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsResetMode(true);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({
      email: false,
      password: false,
      newPassword: false,
      confirmPassword: false
    });
  };

  // Helper function to clear field error when user starts typing
  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
            <View style={styles.inner}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <PoultryLogo 
                    size={Math.max(65, width * 0.16)} 
                    color="#E68A50"
                  />
                </View>
                <Text style={styles.welcomeText}>
                  {isResetMode ? 'Reset Password' : 'Welcome Back!'}
                </Text>
                <Text style={styles.title}>Poultry Pro</Text>
                <Text style={styles.subtitle}>
                  {isResetMode ? 'Enter your new password below' : 'Sign in to continue your poultry journey'}
                </Text>
              </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={[
                styles.inputContainer,
                focusedField === 'email' && styles.inputContainerFocused,
                fieldErrors.email && styles.inputContainerError
              ]}>
                <MaterialIcons 
                  name="email" 
                  size={20} 
                  color={fieldErrors.email ? '#FF4444' : (focusedField === 'email' ? '#E68A50' : '#E68A50')} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[
                    styles.input,
                    { outline: 'none' }
                  ]}
                  placeholder="Email Address"
                  placeholderTextColor={fieldErrors.email ? '#FF9999' : '#A0A0A0'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  selectionColor="#E68A50"
                  underlineColorAndroid="transparent"
                  cursorColor="#E68A50"
                  autoComplete="off"
                  importantForAutofill="no"
                  disableFullscreenUI={true}
                  value={email}
                  onChangeText={(value) => handleFieldChange('email', value, setEmail)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  editable={!isResetMode}
                />
              </View>

              {!isResetMode && (
                <View style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused,
                  fieldErrors.password && styles.inputContainerError
                ]}>
                  <MaterialIcons 
                    name="lock" 
                    size={20} 
                    color={fieldErrors.password ? '#FF4444' : (focusedField === 'password' ? '#E68A50' : '#E68A50')} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { outline: 'none' }
                    ]}
                    placeholder="Password"
                    placeholderTextColor={fieldErrors.password ? '#FF9999' : '#A0A0A0'}
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    spellCheck={false}
                    selectionColor="#E68A50"
                    underlineColorAndroid="transparent"
                    cursorColor="#E68A50"
                    autoComplete="new-password"
                    importantForAutofill="no"
                    disableFullscreenUI={true}
                    value={password}
                    onChangeText={(value) => handleFieldChange('password', value, setPassword)}
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color={fieldErrors.password ? '#FF4444' : '#A0A0A0'} 
                    />
                  </TouchableOpacity>
                </View>
              )}

              {isResetMode && (
                <>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'newPassword' && styles.inputContainerFocused,
                    fieldErrors.newPassword && styles.inputContainerError
                  ]}>
                    <MaterialIcons 
                      name="lock" 
                      size={20} 
                      color={fieldErrors.newPassword ? '#FF4444' : (focusedField === 'newPassword' ? '#E68A50' : '#E68A50')} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { outline: 'none' }
                      ]}
                      placeholder="New Password"
                      placeholderTextColor={fieldErrors.newPassword ? '#FF9999' : '#A0A0A0'}
                      secureTextEntry={!showNewPassword}
                      autoCorrect={false}
                      spellCheck={false}
                      selectionColor="#E68A50"
                      underlineColorAndroid="transparent"
                      cursorColor="#E68A50"
                      autoComplete="new-password"
                      importantForAutofill="no"
                      disableFullscreenUI={true}
                      value={newPassword}
                      onChangeText={(value) => handleFieldChange('newPassword', value, setNewPassword)}
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField('')}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialIcons 
                        name={showNewPassword ? "visibility-off" : "visibility"} 
                        size={20} 
                        color={fieldErrors.newPassword ? '#FF4444' : '#A0A0A0'} 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={[
                    styles.inputContainer,
                    focusedField === 'confirmPassword' && styles.inputContainerFocused,
                    fieldErrors.confirmPassword && styles.inputContainerError
                  ]}>
                    <MaterialIcons 
                      name="lock" 
                      size={20} 
                      color={fieldErrors.confirmPassword ? '#FF4444' : (focusedField === 'confirmPassword' ? '#E68A50' : '#E68A50')} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { outline: 'none' }
                      ]}
                      placeholder="Confirm New Password"
                      placeholderTextColor={fieldErrors.confirmPassword ? '#FF9999' : '#A0A0A0'}
                      secureTextEntry={!showConfirmPassword}
                      autoCorrect={false}
                      spellCheck={false}
                      selectionColor="#E68A50"
                      underlineColorAndroid="transparent"
                      cursorColor="#E68A50"
                      autoComplete="new-password"
                      importantForAutofill="no"
                      disableFullscreenUI={true}
                      value={confirmPassword}
                      onChangeText={(value) => handleFieldChange('confirmPassword', value, setConfirmPassword)}
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialIcons 
                        name={showConfirmPassword ? "visibility-off" : "visibility"} 
                        size={20} 
                        color={fieldErrors.confirmPassword ? '#FF4444' : '#A0A0A0'} 
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {!isResetMode && (
                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.disabledButton]}
                onPress={isResetMode ? handleResetPassword : handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      {isResetMode ? 'Reset Password' : 'Login'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>

              {isResetMode && (
                <TouchableOpacity 
                  onPress={() => {
                    setIsResetMode(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setFieldErrors({
                      email: false,
                      password: false,
                      newPassword: false,
                      confirmPassword: false
                    });
                  }}
                  style={styles.cancelResetContainer}
                >
                  <Text style={styles.cancelResetText}>Cancel Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isResetMode && (
              <>
                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>

                {/* Footer Section */}
                <View style={styles.footerSection}>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Signup')}
                    style={styles.linkContainer}
                  >
                    <Text style={styles.linkText}>Don't have an account? </Text>
                    <Text style={styles.linkTextBold}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height, // Ensure full height is used
    justifyContent: 'center', // Center content vertically
    paddingVertical: 20,
  },
  inner: {
    paddingHorizontal: Math.max(25, width * 0.06),
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.85, // Container takes most of screen height
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30, // Reduced margin
  },
  logoContainer: {
    width: Math.max(100, width * 0.25), // Back to original size
    height: Math.max(100, width * 0.25),
    borderRadius: Math.max(50, width * 0.125),
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Restored margin
    shadowColor: '#E68A50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  welcomeText: {
    fontSize: Math.max(20, width * 0.055), // Back to original size
    fontWeight: '600',
    color: '#E68A50',
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: Math.max(28, width * 0.07), // Back to original size
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.max(14, width * 0.035),
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: Math.max(20, width * 0.05),
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 15, // Reduced margin
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    marginBottom: 14, // Reduced margin
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainerFocused: {
    borderColor: '#E68A50',
    borderWidth: 2,
    backgroundColor: '#FFF5F0',
    shadowColor: '#E68A50',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainerError: {
    borderColor: '#FF4444',
    borderWidth: 1.5,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: Math.max(50, height * 0.06),
    fontSize: Math.max(15, width * 0.038),
    color: '#2C2C2C',
    outlineStyle: 'none',
    outlineWidth: 0,
    borderWidth: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 18, // Reduced margin
  },
  forgotPasswordText: {
    color: '#E68A50',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: '500',
  },
  cancelResetContainer: {
    alignSelf: 'center',
    marginTop: 12, // Reduced margin
  },
  cancelResetText: {
    color: '#7A7A7A',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#E68A50',
    height: Math.max(50, height * 0.06),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E68A50',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#F4B896',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Math.max(16, width * 0.04),
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20, // Reduced margin
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#A0A0A0',
    fontSize: Math.max(13, width * 0.032),
    fontWeight: '500',
  },
  footerSection: {
    alignItems: 'center',
    paddingBottom: 0, // Removed bottom padding
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#7A7A7A',
    fontSize: Math.max(14, width * 0.035),
  },
  linkTextBold: {
    color: '#E68A50',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: '600',
  },
});

export default LoginScreen;