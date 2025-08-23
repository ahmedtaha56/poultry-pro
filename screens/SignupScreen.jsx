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
  ScrollView,
  Dimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updateProfile as updateProfileAction } from '../redux/profileslice/profileSlice';
import { setProfileLoadedOnce } from '../redux/appSlice';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // Focus states for each input field
  const [focusedField, setFocusedField] = React.useState('');
  
  // Error states for each field
  const [fieldErrors, setFieldErrors] = React.useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const validateFields = () => {
    const errors = {
      name: !name.trim(),
      email: !email.trim(),
      password: !password,
      confirmPassword: !confirmPassword
    };
    
    setFieldErrors(errors);
    
    // Check if any field has error
    const hasErrors = Object.values(errors).some(error => error);
    
    if (hasErrors) {
      // Create specific error message
      const emptyFields = [];
      if (errors.name) emptyFields.push('Name');
      if (errors.email) emptyFields.push('Email');
      if (errors.password) emptyFields.push('Password');
      if (errors.confirmPassword) emptyFields.push('Confirm Password');
      
      Alert.alert(
        'Required Fields Missing', 
        `Please fill in the following fields: ${emptyFields.join(', ')}`
      );
      return false;
    }
    
    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: true }));
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: true }));
      Alert.alert('Error', 'Password should be at least 6 characters');
      return false;
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

  const handleSignup = async () => {
    // Clear previous errors
    setFieldErrors({
      name: false,
      email: false,
      password: false,
      confirmPassword: false
    });
    
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            username: name.toLowerCase().replace(/\s+/g, '_'),
          }
        }
      });

      if (signUpError) throw signUpError;

      // 2. Get current user after signup
      const {
        data: { user },
        error: getUserError
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        throw new Error('Unable to fetch user after signup');
      }

      // 3. Optional: insert into Supabase 'profiles' table
      /*
      await supabase.from('profiles').insert([
        {
          id: user.id,
          name: name,
          username: name.toLowerCase().replace(/\s+/g, '_'),
          bio: '',
          profile_image: ''
        }
      ]);
      */

      // 4. Dispatch to Redux
      dispatch(updateProfileAction({
        uid: user.id,
        profile: {
          name: name,
          username: name.toLowerCase().replace(/\s+/g, '_'),
          bio: '',
          profileImage: ''
        }
      }));

      Alert.alert(
        'Success',
        'Account created successfully! Please check your email for verification link.',
        [{ text: 'OK', onPress: () => navigation.replace('JobCategory') }]
      );
    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.';

      switch (error.message) {
        case 'User already registered':
          errorMessage = 'This email is already in use.';
          setFieldErrors(prev => ({ ...prev, email: true }));
          break;
        case 'Email not confirmed':
          errorMessage = 'Please verify your email address.';
          break;
        case 'Password should be at least 6 characters':
          errorMessage = 'Password should be at least 6 characters.';
          setFieldErrors(prev => ({ ...prev, password: true }));
          break;
        default:
          console.log(error);
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join Poultry Pro today and start your journey</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={[
              styles.inputContainer,
              focusedField === 'name' && styles.inputContainerFocused,
              fieldErrors.name && styles.inputContainerError
            ]}>
              <Icon 
                name="person" 
                size={20} 
                color={fieldErrors.name ? '#FF4444' : (focusedField === 'name' ? '#E68A50' : '#E68A50')} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[
                  styles.input,
                  { outline: 'none' } // This removes the black box in web
                ]}
                placeholder="Full Name"
                placeholderTextColor={fieldErrors.name ? '#FF9999' : '#A0A0A0'}
                value={name}
                onChangeText={(value) => handleFieldChange('name', value, setName)}
                autoCapitalize="words"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                selectionColor="#E68A50"
              />
            </View>

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
                value={email}
                onChangeText={(value) => handleFieldChange('email', value, setEmail)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                selectionColor="#E68A50"
              />
            </View>

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
                value={password}
                onChangeText={(value) => handleFieldChange('password', value, setPassword)}
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                selectionColor="#E68A50"
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
                placeholder="Confirm Password"
                placeholderTextColor={fieldErrors.confirmPassword ? '#FF9999' : '#A0A0A0'}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(value) => handleFieldChange('confirmPassword', value, setConfirmPassword)}
                autoCapitalize="none"
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
                selectionColor="#E68A50"
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

            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
              {!isLoading && <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={styles.linkTextBold}>Login</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
  title: {
    fontSize: 28,
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
    transition: 'all 0.3s ease', // Smooth transition for focus effect
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
    outlineStyle: 'none', // Removes the black outline box
    outlineWidth: 0, // Additional safety for removing outline
    borderWidth: 0, // Ensure no border
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#E68A50',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
  footerSection: {
    alignItems: 'center',
    marginTop: 30,
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

export default SignupScreen;