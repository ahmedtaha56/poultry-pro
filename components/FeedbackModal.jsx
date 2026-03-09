import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions
} from 'react-native';
import {
    Feather,
    MaterialIcons,
    Ionicons
} from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import PropTypes from 'prop-types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FeedbackModal = ({ visible, onClose }) => {
    // State variables
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Debug logging
    useEffect(() => {
        console.log('=== SIMPLIFIED FEEDBACK MODAL DEBUG ===');
        console.log('Modal visible prop:', visible);
        console.log('Platform:', Platform.OS);
        console.log('Show Success:', showSuccess);
        console.log('Is Submitting:', isSubmitting);
        console.log('======================================');
    }, [visible, showSuccess, isSubmitting]);

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);
                console.log('User fetched:', user?.id || 'No user found');
            } catch (error) {
                console.error('Error getting user:', error);
            }
        };
        
        if (visible) {
            getUser();
        }
    }, [visible]);

    // Reset states when modal closes
    useEffect(() => {
        if (!visible) {
            setFeedback('');
            setShowSuccess(false);
            setIsSubmitting(false);
        }
    }, [visible]);

    // Handle feedback submission
    const handleSubmitFeedback = useCallback(async () => {
        console.log('Submit feedback called');
        
        if (!feedback.trim()) {
            Alert.alert(
                'Error',
                'Please enter your feedback before submitting.',
                [{ text: 'OK' }]
            );
            return;
        }

        const userId = currentUser?.id || 'anonymous';
        console.log('Submitting feedback for user:', userId);

        setIsSubmitting(true);

        try {
            if (currentUser?.id) {
                console.log('Inserting feedback to database');
                const { error } = await supabase
                    .from('platform_feedback')
                    .insert([
                        {
                            user_id: currentUser.id,
                            feedback_text: feedback.trim(),
                            is_reviewed: false
                        }
                    ]);

                if (error) {
                    console.error('Database error:', error);
                    throw error;
                }
                console.log('Database insert successful');
            }

            console.log('SUCCESS: Feedback submitted successfully!', {
                user_id: userId,
                feedback_text: feedback.trim(),
                timestamp: new Date().toISOString()
            });

            // Show success screen
            setShowSuccess(true);

            // Auto close after 2 seconds
            setTimeout(() => {
                console.log('Auto-closing modal after success');
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            Alert.alert(
                'Submission Failed',
                'Failed to submit feedback. Please try again.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Retry', style: 'default', onPress: handleSubmitFeedback }
                ]
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [feedback, currentUser?.id, onClose]);

    // Handle text change
    const handleTextChange = useCallback((text) => {
        setFeedback(text);
    }, []);

    // Handle close
    const handleClose = useCallback(() => {
        console.log('Close button pressed');
        if (!isSubmitting) {
            onClose();
        }
    }, [onClose, isSubmitting]);

    // Success Screen Component
    const renderSuccessScreen = () => (
        <View style={styles.container}>
            <View style={styles.modalContent}>
                <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#27AE60" />
                    <Text style={styles.successTitle}>Feedback Submitted!</Text>
                    <Text style={styles.successMessage}>
                        Thank you for your feedback. We appreciate your input.
                    </Text>
                </View>
            </View>
        </View>
    );

    // Main Feedback Form Component
    const renderFeedbackForm = () => (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalContent}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={styles.iconContainer}>
                                    <MaterialIcons name="feedback" size={24} color="#E68A50" />
                                </View>
                                <View>
                                    <Text style={styles.title}>Share Your Feedback</Text>
                                    <Text style={styles.subtitle}>Help us improve</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Feather name="x" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Your Feedback</Text>
                            
                            <TextInput
                                style={styles.textInput}
                                multiline={true}
                                numberOfLines={6}
                                placeholder="Share your thoughts, suggestions, or report any issues. Your feedback helps us improve!"
                                placeholderTextColor="#999"
                                value={feedback}
                                onChangeText={handleTextChange}
                                maxLength={1000}
                                textAlignVertical="top"
                                autoCorrect={true}
                                autoCapitalize="sentences"
                            />
                            
                            <Text style={styles.charCount}>
                                {feedback.length}/1000 characters
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!feedback.trim() || isSubmitting) && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmitFeedback}
                            disabled={!feedback.trim() || isSubmitting}
                        >
                            <View style={styles.buttonContent}>
                                {isSubmitting ? (
                                    <>
                                        <MaterialIcons name="hourglass-empty" size={20} color="white" />
                                        <Text style={styles.buttonText}>Submitting...</Text>
                                    </>
                                ) : (
                                    <>
                                        <MaterialIcons name="send" size={20} color="white" />
                                        <Text style={styles.buttonText}>Submit Feedback</Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Feather name="shield" size={16} color="#999" />
                            <Text style={styles.footerText}>Your feedback is secure</Text>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );

    // Don't render anything if not visible
    if (!visible) {
        console.log('Modal not visible, returning null');
        return null;
    }

    console.log('Rendering modal, showSuccess:', showSuccess);

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
            hardwareAccelerated={true}
        >
            {showSuccess ? renderSuccessScreen() : renderFeedbackForm()}
        </Modal>
    );
};

FeedbackModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 15,
        maxHeight: SCREEN_HEIGHT * 0.8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FDF2E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
    },
    inputSection: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fafafa',
        minHeight: 120,
        maxHeight: 200,
    },
    charCount: {
        textAlign: 'right',
        color: '#999',
        fontSize: 12,
        marginTop: 5,
    },
    submitButton: {
        backgroundColor: '#E68A50',
        marginHorizontal: 20,
        marginBottom: 15,
        paddingVertical: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 5,
    },
    // Success Screen Styles
    successContainer: {
        alignItems: 'center',
        padding: 40,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#27AE60',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default FeedbackModal;