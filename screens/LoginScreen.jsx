import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { supabase } from "../lib/supabase";
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearProfileData } from '../redux/profileslice/profileSlice';
import { setProfileLoadedOnce } from '../redux/appSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiNFNjhBNTAiLz48cGF0aCBkPSJNMzUgNDBDMzUgMzUgNDAgMzAgNTAgMzBDNjAgMzAgNjUgMzUgNjUgNDBWNjBINzBWNDBDNzAgMzAgNjAgMjUgNTAgMjVDNDAgMjUgMzAgMzAgMzAgNDBWNjBIMzVWNDBaIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjQyIiBjeT0iNDIiIHI9IjMiIGZpbGw9IiNFNjhBNTAiLz48Y2lyY2xlIGN4PSI1OCIgY3k9IjQyIiByPSIzIiBmaWxsPSIjRTY4QTUwIi8+PHBhdGggZD0iTTQ1IDUwSDU1QzU1IDU1IDUwIDU4IDUwIDU4QzUwIDU4IDQ1IDU1IDQ1IDUwWiIgZmlsbD0iI0U2OEE1MCIvPjwvc3ZnPg==' }}
                style={styles.logo}
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
              <Icon 
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
                <Icon 
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
                  <Icon 
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
                  <Icon 
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
                    <Icon 
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
                  <Icon 
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
                    <Icon 
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
                  <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 50,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#E68A50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E68A50',
    marginBottom: 5,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    marginBottom: 20,
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
    transition: 'all 0.3s ease',
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
    height: 55,
    fontSize: 16,
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
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#E68A50',
    fontSize: 15,
    fontWeight: '500',
  },
  cancelResetContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  cancelResetText: {
    color: '#7A7A7A',
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#E68A50',
    height: 55,
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
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '500',
  },
  footerSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#7A7A7A',
    fontSize: 16,
  },
  linkTextBold: {
    color: '#E68A50',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default LoginScreen;