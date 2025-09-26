import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { useChat } from '../context/ChatContext';
import { sendMessageToAI, getFallbackResponse, detectSafetyIntent } from '../services/aiService';
import MessageBubble from '../components/MessageBubble';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import DurgaHeader from '../components/DurgaHeader';
import { theme } from '../theme/theme';

const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, addMessage, setLoading } = useChat();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

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
      // Use intelligent fallback based on safety intent
      const safetyAnalysis = detectSafetyIntent(inputText.trim());
      const fallbackMessage = getFallbackResponse(
        safetyAnalysis.isEmergency, 
        safetyAnalysis.isSafetyConcern
      );
      addMessage(fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAlert = () => {
    Alert.alert(
      'Emergency Contact',
      'If you\'re in immediate danger, please call emergency services:\n\n• Police: 100\n• Women Helpline: 1091\n• National Emergency: 112',
      [
        { text: 'OK', style: 'default' },
        { text: 'Call Emergency', style: 'destructive', onPress: () => {
          // In a real app, this would open the phone dialer
          console.log('Emergency call initiated');
        }}
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DurgaHeader />
      <SafetyDisclaimer />
      
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
              🕉️ Welcome to Durga's Divine Protection 🕉️
            </Text>
            <Text style={styles.welcomeSubtext}>
              Start a conversation to receive divine guidance and safety support
            </Text>
          </View>
        )}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.durgaRed} />
            <Text style={styles.loadingText}>🕉️ Durga is thinking...</Text>
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
          <Button
            mode="contained"
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={styles.sendButton}
            contentStyle={styles.sendButtonContent}
          >
            Send
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            If you're in immediate danger, call emergency services
          </Text>
          <Button
            mode="outlined"
            onPress={handleEmergencyAlert}
            style={styles.emergencyButton}
            textColor="#d32f2f"
            buttonColor="transparent"
          >
            Emergency Help
          </Button>
        </View>
      </Surface>
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
    borderRadius: theme.durga.borderRadius,
    backgroundColor: theme.colors.durgaRed,
  },
  sendButtonContent: {
    paddingHorizontal: theme.durga.spacing.md,
    paddingVertical: theme.durga.spacing.sm,
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
});

export default ChatScreen;
