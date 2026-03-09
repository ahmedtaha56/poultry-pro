import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

const MessageItem = ({ item }) => {
    const isUser = item.type === 'user';
    const messageAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(messageAnim, {
          toValue: 1,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
          {
            opacity: messageAnim,
            transform: [{
              scale: scaleAnim
            }, {
              translateY: messageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatarContainer}>
            <LinearGradient
              colors={['#FF6B35', '#FF8A5B']}
              style={styles.botAvatar}
            >
              <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
        )}

        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer
        ]}>
          {isUser ? (
            <LinearGradient
              colors={['#FF6B35', '#FF8A5B']}
              style={styles.userMessageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.userMessageText}>{item.text}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.botMessageContent}>
              <Text style={styles.botMessageText}>{item.text}</Text>
            </View>
          )}
          
          {item.timestamp && (
            <Text style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.botTimestamp
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          )}
        </View>

        {isUser && (
          <View style={styles.userAvatarContainer}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.userAvatar}
            >
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </LinearGradient>
          </View>
        )}
      </Animated.View>
    );
  };

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I am here to answer questions about your chickens. How can I help you?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputShakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) {
      Animated.sequence([
        Animated.timing(inputShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(inputShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(inputShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(inputShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      return;
    }

    const userMessage = { type: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await axios.post('http://10.119.7.185:8000/chat', {
        message: input
      });

      const botMessage = {
        type: 'bot',
        text: response.data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: '❌ Sorry, there was an error connecting to the server. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => <MessageItem item={item} />;

  const renderTypingIndicator = () => {
    if (!loading) return null;

    return (
      <View style={styles.typingIndicatorWrapper}>
        <View style={styles.botAvatarContainer}>
          <LinearGradient
            colors={['#FF6B35', '#FF8A5B']}
            style={styles.botAvatar}
          >
            <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <View style={styles.typingIndicatorContainer}>
          <View style={[styles.typingDot, { animationDelay: '0s' }]} />
          <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
          <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
      >
        {/* Header */}
        <LinearGradient
          colors={['#FF6B35', '#FF8A5B', '#FFA07A']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('JobCategory')}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <View style={styles.headerAvatarContainer}>
                <LinearGradient
                  colors={['#FFFFFF', '#FFE8E0']}
                  style={styles.headerAvatar}
                >
                  <MaterialCommunityIcons name="robot" size={28} color="#FF6B35" />
                </LinearGradient>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>AI Assistant</Text>
                <Text style={styles.headerSubtitle}>Online • Always ready to help</Text>
              </View>
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </LinearGradient>
        
        {/* Chat Area */}
        <View style={styles.chatArea}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          {renderTypingIndicator()}
        </View>

        {/* Input Container - Fixed at bottom */}
        <View style={styles.inputWrapper}>
          <LinearGradient
            colors={['#FFFFFF', '#FFF5F2']}
            style={styles.inputGradient}
          >
            <Animated.View style={[styles.inputContainer, { transform: [{ translateX: inputShakeAnim }] }]}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.input}
                  value={input}
                  placeholder="Type your question here..."
                  placeholderTextColor="#A0A0A0"
                  onChangeText={setInput}
                  multiline
                  maxLength={500}
                />
              </View>

              {input.trim() && (
                <TouchableOpacity 
                  style={styles.sendButtonWrapper} 
                  onPress={sendMessage}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FF8A5B']}
                    style={styles.sendButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="send" size={20} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatContent: {
    padding: 15,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  botAvatarContainer: {
    marginRight: 8,
    marginBottom: 5,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userAvatarContainer: {
    marginLeft: 8,
    marginBottom: 5,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageContainer: {
    maxWidth: width * 0.7,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  botMessageContent: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  botMessageText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  userTimestamp: {
    color: '#FF8A5B',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#A0A0A0',
    textAlign: 'left',
  },
  typingIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginHorizontal: 3,
    opacity: 0.3,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  inputGradient: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    maxHeight: 100,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 20,
  },
  sendButtonWrapper: {
    marginLeft: 10,
    marginBottom: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ChatbotScreen;