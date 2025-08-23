import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    StyleSheet,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import {
    Feather,
    MaterialIcons,
    Ionicons
} from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { supabase } from '../lib/supabase';
import PropTypes from 'prop-types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FeedbackModal = ({ visible, onClose }) => {
    const [scaleAnim] = useState(new Animated.Value(0));
    const [overlayOpacity] = useState(new Animated.Value(0));
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, []);

    // Animation effects
    React.useEffect(() => {
        if (visible) {
            // Open animations
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
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
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Reset states when modal closes
            setTimeout(() => {
                setFeedback('');
                setShowSuccess(false);
                setIsSubmitting(false);
            }, 200);
        }
    }, [visible, scaleAnim, overlayOpacity]);

    const handleSubmitFeedback = useCallback(async () => {
        if (!feedback.trim()) {
            Alert.alert(
                'Error',
                'Please enter your feedback before submitting.',
                [{ text: 'OK', style: 'default' }],
                { cancelable: true }
            );
            return;
        }

        if (!currentUser?.id) {
            Alert.alert(
                'Authentication Required',
                'You must be logged in to submit feedback.',
                [{ text: 'OK', style: 'default' }],
                { cancelable: true }
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('platform_feedback')
                .insert([
                    {
                        user_id: currentUser.id,
                        feedback_text: feedback.trim(),
                        is_reviewed: false
                    }
                ]);

            if (error) throw error;

            // Clear feedback input
            setFeedback('');
            
            // Console success message
            console.log('SUCCESS: Feedback submitted successfully!', {
                user_id: currentUser.id,
                feedback_text: feedback.trim(),
                timestamp: new Date().toISOString()
            });

            // Show success animation
            setShowSuccess(true);

            // Auto close after showing success message
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            Alert.alert(
                'Submission Failed',
                'Failed to submit feedback. Please check your connection and try again.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Retry', style: 'default', onPress: handleSubmitFeedback }
                ],
                { cancelable: true }
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [feedback, currentUser?.id, onClose]);

    // Memoize components to prevent re-renders
    const SuccessMessage = useMemo(() => (
        <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={60} color="#27AE60" />
            </View>
            <Text style={styles.successTitle}>Feedback Submitted!</Text>
            <Text style={styles.successMessage}>
                Thank you for your feedback. We appreciate your input and will review it soon.
            </Text>
        </View>
    ), []);

    const handleTextChange = useCallback((text) => {
        setFeedback(text);
    }, []);

    const handleClosePress = useCallback(() => {
        onClose();
    }, [onClose]);

    // Memoize submit button content
    const submitButtonContent = useMemo(() => {
        if (isSubmitting) {
            return (
                <View style={styles.submitButtonContent}>
                    <MaterialIcons name="hourglass-empty" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
            );
        }
        return (
            <View style={styles.submitButtonContent}>
                <MaterialIcons name="send" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </View>
        );
    }, [isSubmitting]);

    const FeedbackForm = useMemo(() => (
        <>
            {/* Header */}
            <View style={styles.modalHeader}>
                <View style={styles.headerContent}>
                    <View style={styles.headerIconContainer}>
                        <MaterialIcons name="feedback" size={28} color="#E68A50" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.modalTitle}>Share Your Feedback</Text>
                        <Text style={styles.modalSubtitle}>Help us improve our platform</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClosePress}
                    activeOpacity={0.7}
                >
                    <Feather name="x" size={24} color="#7F8C8D" />
                </TouchableOpacity>
            </View>

            {/* Feedback Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Feedback</Text>
                <TextInput
                    style={styles.textInput}
                    multiline={true}
                    numberOfLines={6}
                    placeholder="Share your thoughts, suggestions, or report any issues you've encountered. Your feedback helps us make the platform better for everyone!"
                    placeholderTextColor="#BDC3C7"
                    value={feedback}
                    onChangeText={handleTextChange}
                    maxLength={1000}
                    textAlignVertical="top"
                    blurOnSubmit={false}
                    returnKeyType="default"
                    autoCorrect={false}
                    autoCapitalize="sentences"
                    keyboardType="default"
                />
                <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                        {feedback.length}/1000 characters
                    </Text>
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    (!feedback.trim() || isSubmitting) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitFeedback}
                disabled={!feedback.trim() || isSubmitting}
                activeOpacity={0.8}
            >
                {submitButtonContent}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.modalFooter}>
                <Feather name="shield" size={16} color="#95A5A6" />
                <Text style={styles.footerText}>
                    Your feedback is anonymous and secure
                </Text>
            </View>
        </>
    ), [feedback, isSubmitting, handleTextChange, handleClosePress, handleSubmitFeedback, submitButtonContent]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClosePress}
            statusBarTranslucent={true}
        >
            <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

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
                    onPressOut={handleClosePress}
                />
            </Animated.View>

            {/* Modal Content */}
            <KeyboardAvoidingView
                style={styles.centerContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        {showSuccess ? SuccessMessage : FeedbackForm}
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

FeedbackModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayTouchable: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        maxHeight: SCREEN_HEIGHT * 0.8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalContent: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FDF2E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 2,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    inputContainer: {
        padding: 25,
        paddingTop: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E1E8ED',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        color: '#2C3E50',
        backgroundColor: '#FAFBFC',
        minHeight: 120,
        maxHeight: 180,
    },
    characterCount: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    characterCountText: {
        fontSize: 12,
        color: '#95A5A6',
    },
    submitButton: {
        backgroundColor: '#E68A50',
        marginHorizontal: 25,
        marginBottom: 20,
        paddingVertical: 15,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    submitButtonDisabled: {
        backgroundColor: '#BDC3C7',
        elevation: 0,
        shadowOpacity: 0,
    },
    submitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 25,
        paddingHorizontal: 25,
    },
    footerText: {
        fontSize: 12,
        color: '#95A5A6',
        marginLeft: 6,
    },
    // Success Message Styles
    successContainer: {
        alignItems: 'center',
        padding: 40,
        paddingTop: 60,
        paddingBottom: 60,
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#27AE60',
        marginBottom: 10,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default FeedbackModal;