import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

const MessageBubble = ({ message }) => {
  const isUser = message.isUser;
  const isEmergency = message.isEmergency;

  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.aiMessage
    ]}>
      {isUser ? (
        <LinearGradient
          colors={[theme.colors.durgaRed, theme.colors.durgaOrange]}
          style={styles.userGradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.userMessageContent}>
            <Text style={styles.userMessageText}>
              {message.text}
            </Text>
            <Text style={styles.userTimestamp}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </LinearGradient>
      ) : (
        <Surface style={[
          styles.aiCard,
          isEmergency && styles.emergencyCard
        ]} elevation={isEmergency ? 6 : 2}>
          <View style={styles.aiMessageContent}>
            {isEmergency && (
              <LinearGradient
                colors={['rgba(220, 38, 38, 0.1)', 'rgba(220, 38, 38, 0.05)']}
                style={styles.emergencyGradient}
              >
                <View style={styles.emergencyHeader}>
                  <IconButton
                    icon="shield-alert"
                    size={20}
                    iconColor={theme.colors.emergency}
                    style={styles.emergencyIcon}
                  />
                  <Text style={styles.emergencyLabel}>🛡️ Durga Protection Mode</Text>
                </View>
              </LinearGradient>
            )}
            
            <Text style={[
              styles.aiMessageText,
              isEmergency && styles.emergencyText
            ]}>
              {message.text}
            </Text>
            
            <View style={styles.aiFooter}>
              <Text style={styles.aiTimestamp}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <View style={styles.durgaIndicator}>
                <Text style={styles.durgaSymbol}>🕉️</Text>
              </View>
            </View>
          </View>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: theme.durga.spacing.sm,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  // User message styles
  userGradientCard: {
    borderRadius: theme.durga.borderRadius,
    borderBottomRightRadius: 4,
    ...theme.durga.shadow,
  },
  userMessageContent: {
    paddingVertical: theme.durga.spacing.md,
    paddingHorizontal: theme.durga.spacing.md,
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.surface,
    fontWeight: '500',
  },
  userTimestamp: {
    fontSize: 11,
    color: theme.colors.durgaLight,
    textAlign: 'right',
    marginTop: theme.durga.spacing.xs,
    opacity: 0.8,
  },
  // AI message styles
  aiCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.durgaLight,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.emergency,
    backgroundColor: theme.colors.durgaLight,
    ...theme.durga.shadow,
  },
  aiMessageContent: {
    paddingVertical: theme.durga.spacing.md,
    paddingHorizontal: theme.durga.spacing.md,
  },
  aiMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.durgaBrown,
    fontWeight: '400',
  },
  emergencyText: {
    color: theme.colors.emergency,
    fontWeight: '600',
  },
  // Emergency styling
  emergencyGradient: {
    borderRadius: theme.durga.spacing.sm,
    marginBottom: theme.durga.spacing.sm,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.durga.spacing.sm,
    paddingHorizontal: theme.durga.spacing.sm,
  },
  emergencyIcon: {
    margin: 0,
    marginRight: theme.durga.spacing.xs,
  },
  emergencyLabel: {
    fontSize: 14,
    color: theme.colors.emergency,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Footer styling
  aiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.durga.spacing.sm,
    paddingTop: theme.durga.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.durgaLight,
  },
  aiTimestamp: {
    fontSize: 11,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
  durgaIndicator: {
    backgroundColor: theme.colors.durgaGold,
    borderRadius: 12,
    paddingHorizontal: theme.durga.spacing.sm,
    paddingVertical: 2,
  },
  durgaSymbol: {
    fontSize: 12,
    color: theme.colors.durgaBrown,
  },
});

export default MessageBubble;
