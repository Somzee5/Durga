import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { IconButton, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

const DurgaHeader = ({ onLogout }) => {
  return (
    <Surface style={styles.headerContainer} elevation={4}>
      <LinearGradient
        colors={theme.durga.gradient}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/police_cap.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>DURGA</Text>
              <Text style={styles.appSubtitle}>Women Safety Companion</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <IconButton
              icon="logout"
              size={22}
              iconColor={theme.colors.surface}
              onPress={onLogout}
              style={styles.logoutIcon}
              accessibilityLabel="Logout"
            />
          </View>
        </View>

      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: theme.durga.spacing.md,
    borderRadius: theme.durga.borderRadius,
    overflow: 'hidden',
  },
  gradientHeader: {
    paddingVertical: theme.durga.spacing.lg,
    paddingHorizontal: theme.durga.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.durga.spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.durga.spacing.md,
    ...theme.durga.shadow,
  },
  logoIcon: {
    margin: 0,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  titleContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.surface,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: theme.colors.durgaLight,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
  },
});

export default DurgaHeader;
