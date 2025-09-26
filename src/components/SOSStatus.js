import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const SOSStatus = ({ isSOSActive, isRecording }) => {
  if (!isSOSActive && !isRecording) return null;

  return (
    <View style={[styles.container, isSOSActive && styles.sosActive]}>
      <Text style={styles.icon}>🚨</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {isSOSActive ? 'SOS ACTIVE' : 'Recording...'}
        </Text>
        <Text style={styles.subtitle}>
          {isSOSActive 
            ? 'Emergency services notified with location & audio' 
            : 'Audio recording in progress'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.emergency,
    paddingHorizontal: theme.durga.spacing.md,
    paddingVertical: theme.durga.spacing.sm,
    marginHorizontal: theme.durga.spacing.md,
    marginVertical: theme.durga.spacing.sm,
    borderRadius: theme.durga.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
    ...theme.durga.shadow,
  },
  sosActive: {
    backgroundColor: '#ff4444',
    borderColor: '#cc0000',
  },
  icon: {
    fontSize: 24,
    marginRight: theme.durga.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
});

export default SOSStatus;
