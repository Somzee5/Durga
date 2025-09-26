import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { theme } from '../theme/theme';

const SafetyDisclaimer = () => {
  return (
    <Card style={styles.disclaimerCard} elevation={4}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <IconButton
              icon="shield-check"
              size={20}
              iconColor={theme.colors.durgaGold}
              style={styles.icon}
            />
          </View>
          <Text style={styles.title}>🛡️ Durga Protection</Text>
        </View>
        
        <Text style={styles.disclaimerText}>
          Divine companion for emotional support and safety guidance.
        </Text>
        
        <View style={styles.importantNote}>
          <Text style={styles.noteText}>
            <Text style={styles.bold}>🚨 Emergency:</Text> Call 100/112 if in immediate danger.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  disclaimerCard: {
    margin: theme.durga.spacing.sm,
    marginBottom: theme.durga.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
    borderWidth: 1,
    borderColor: theme.colors.durgaGold,
    ...theme.durga.shadow,
  },
  cardContent: {
    paddingVertical: theme.durga.spacing.sm,
    paddingHorizontal: theme.durga.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.durga.spacing.sm,
  },
  iconContainer: {
    backgroundColor: theme.colors.durgaLight,
    borderRadius: 20,
    marginRight: theme.durga.spacing.sm,
  },
  icon: {
    margin: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.durgaRed,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 14,
    color: theme.colors.durgaBrown,
    lineHeight: 20,
    marginBottom: theme.durga.spacing.sm,
    fontWeight: '500',
  },
  importantNote: {
    backgroundColor: theme.colors.durgaLight,
    padding: theme.durga.spacing.sm,
    borderRadius: theme.durga.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.emergency,
    borderWidth: 1,
    borderColor: theme.colors.emergency,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.emergency,
    lineHeight: 20,
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
  featuresList: {
    backgroundColor: theme.colors.durgaLight,
    padding: theme.durga.spacing.md,
    borderRadius: theme.durga.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.durgaGold,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.durgaRed,
    marginBottom: theme.durga.spacing.sm,
    letterSpacing: 0.5,
  },
  featureItem: {
    fontSize: 14,
    color: theme.colors.durgaBrown,
    lineHeight: 20,
    marginLeft: theme.durga.spacing.xs,
    marginBottom: theme.durga.spacing.xs,
    fontWeight: '500',
  },
});

export default SafetyDisclaimer;
