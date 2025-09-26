import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
  Surface,
  IconButton,
} from 'react-native-paper';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { sendMessageToAI, getFallbackResponse, detectSafetyIntent } from '../services/aiService';
import MessageBubble from '../components/MessageBubble';
import DurgaHeader from '../components/DurgaHeader';
import SendLocationButton from '../components/SendLocationButton';
import SOSStatus from '../components/SOSStatus';
import useTriplePressRecorder from '../hooks/useTriplePressRecorder';
import { theme } from '../theme/theme';
// Shake trigger temporarily disabled to avoid runtime import issues
// import * as ExpoShake from 'expo-shake';

const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, addMessage, setLoading } = useChat();
  const { logout, user } = useAuth();
  const scrollViewRef = useRef(null);
  
  // SOS functionality
  const { isRecording, isSOSActive, activateSOS, openAccessibilitySettings } = useTriplePressRecorder();
  const tapMetaRef = useRef({ count: 0, lastTs: 0 });
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Pulsing animation for emergency button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Shake-to-activate SOS (Expo-friendly trigger)
  // useEffect(() => {
  //   let subscription = null;
  //   try {
  //     if (ExpoShake && typeof ExpoShake.addListener === 'function') {
  //       subscription = ExpoShake.addListener(() => {
  //         activateSOS();
  //       });
  //     }
  //   } catch (e) {
  //     console.warn('Shake listener failed to attach', e);
  //   }
  //   return () => {
  //     try {
  //       subscription && typeof subscription.remove === 'function' && subscription.remove();
  //     } catch {}
  //   };
  // }, [activateSOS]);

  const handleHeaderTripleTap = () => {
    const now = Date.now();
    const delta = now - tapMetaRef.current.lastTs;
    if (delta > 800) {
      tapMetaRef.current.count = 0;
    }
    tapMetaRef.current.count += 1;
    tapMetaRef.current.lastTs = now;
    if (tapMetaRef.current.count >= 3) {
      tapMetaRef.current.count = 0;
      activateSOS();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      isEmergency: false,
    };

    addMessage(userMessage);
    setInputText('');
    setLoading(true);

    try {
      const aiResponse = await sendMessageToAI(inputText.trim(), messages);
      addMessage(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      // Use intelligent fallback based on safety intent with context
      const safetyAnalysis = detectSafetyIntent(inputText.trim());
      const fallbackMessage = getFallbackResponse(
        safetyAnalysis.isEmergency, 
        safetyAnalysis.isSafetyConcern,
        { userMood: 'neutral' } // Basic context for fallback
      );
      addMessage(fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAlert = () => {
    // Direct emergency call without any confirmation
    const emergencyNumber = '9021530316';
    console.log('Emergency call initiated to:', emergencyNumber);
    
    // Open phone dialer directly
    Linking.openURL(`tel:${emergencyNumber}`).catch(err => {
      console.error('Failed to open phone dialer:', err);
      // Fallback: show alert if phone dialer fails
      Alert.alert(
        'Emergency Call',
        `Emergency number: ${emergencyNumber}\n\nPlease call this number immediately if you're in danger.`,
        [{ text: 'OK' }]
      );
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View onTouchEnd={handleHeaderTripleTap}>
        <DurgaHeader onLogout={handleLogout} />
      </View>
      
      {/* User info (no emojis) */}
      <Surface style={styles.userInfoContainer} elevation={1}>
        <View style={styles.userInfoRow}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeUser}>
              Welcome, {user?.name || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || ''}
            </Text>
          </View>
        </View>
      </Surface>
      
      {/* SOS Status */}
      <SOSStatus isSOSActive={isSOSActive} isRecording={isRecording} />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        ) : (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome to the Safety Companion
            </Text>
            <Text style={styles.welcomeSubtext}>
              Start a conversation to receive helpful safety guidance and support
            </Text>
          </View>
        )}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.durgaRed} />
            <Text style={styles.loadingText}>Generating response...</Text>
          </View>
        )}
      </ScrollView>

      <Surface style={styles.inputContainer} elevation={2}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message here..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            disabled={isLoading}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#2c5aa0"
          />
          <IconButton
            icon="arrow-up"
            size={24}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            iconColor="#fff"
            containerColor={inputText.trim() ? theme.colors.durgaRed : "#ccc"}
            style={styles.sendButton}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            If you're in immediate danger, call emergency services
          </Text>
        </View>
      </Surface>
      
      {/* Location Button - Outside Surface for better visibility */}
      <SendLocationButton />
      
      {/* Floating Emergency Call Button */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <IconButton
            icon="phone-alert"
            size={32}
            onPress={handleEmergencyAlert}
            iconColor="#fff"
            style={styles.fab}
            accessibilityLabel="Emergency Call"
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: theme.durga.spacing.md,
  },
  messagesContent: {
    paddingVertical: theme.durga.spacing.md,
    paddingBottom: theme.durga.spacing.lg,
    flexGrow: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.durga.spacing.xl,
    paddingHorizontal: theme.durga.spacing.lg,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.durgaRed,
    textAlign: 'center',
    marginBottom: theme.durga.spacing.md,
    letterSpacing: 1,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: theme.colors.durgaBrown,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.durga.spacing.md,
    backgroundColor: theme.colors.durgaLight,
    borderRadius: theme.durga.borderRadius,
    marginHorizontal: theme.durga.spacing.md,
  },
  loadingText: {
    marginLeft: theme.durga.spacing.sm,
    color: theme.colors.durgaBrown,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.durga.spacing.md,
    paddingVertical: theme.durga.spacing.md,
    ...theme.durga.shadow,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: theme.durga.spacing.sm,
  },
  textInput: {
    flex: 1,
    marginRight: theme.durga.spacing.md,
    backgroundColor: theme.colors.surface,
    maxHeight: 100,
    borderRadius: theme.durga.borderRadius,
  },
  sendButton: {
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  divider: {
    marginVertical: theme.durga.spacing.sm,
    backgroundColor: theme.colors.durgaLight,
    height: 1,
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: theme.durga.spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: theme.durga.spacing.sm,
    fontWeight: '500',
  },
  emergencyButton: {
    borderColor: theme.colors.emergency,
    borderRadius: theme.durga.borderRadius,
    borderWidth: 2,
  },
  emergencyCallButton: {
    borderRadius: theme.durga.borderRadius,
    paddingVertical: 0,
    minWidth: 100,
    alignSelf: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: theme.durga.spacing.md,
    top: theme.durga.spacing.xl,
    zIndex: 1000,
  },
  fab: {
    backgroundColor: theme.colors.emergency,
    borderRadius: 28,
    width: 56,
    height: 56,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userInfoContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.durga.spacing.md,
    marginVertical: theme.durga.spacing.sm,
    borderRadius: theme.durga.borderRadius,
    ...theme.durga.shadow,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.durga.spacing.md,
    paddingVertical: theme.durga.spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  welcomeUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.durgaRed,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.durgaBrown,
    opacity: 0.8,
  },
  logoutButton: {
    borderColor: theme.colors.durgaRed,
    borderRadius: theme.durga.borderRadius,
    borderWidth: 1,
    marginLeft: theme.durga.spacing.md,
  },
  sosTestContainer: {
    alignItems: 'center',
    marginVertical: theme.durga.spacing.sm,
    marginHorizontal: theme.durga.spacing.md,
  },
  sosTestButton: {
    borderRadius: theme.durga.borderRadius,
    marginBottom: theme.durga.spacing.sm,
    borderWidth: 2,
    borderColor: '#cc0000',
  },
  sosTestText: {
    fontSize: 12,
    color: theme.colors.durgaBrown,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatScreen;
