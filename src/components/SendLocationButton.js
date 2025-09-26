import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../theme/theme';

const GOOGLE_API_KEY = 'AIzaSyBuV0Nzhsjzt5ftVqMq5jpP3pncBG_6kLs';
const CONTACT_NUMBER = '9021530516';

const SendLocationButton = () => {
  const sendLocation = async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to share your location.');
        return;
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const message = `🕉️ Emergency Location Alert 🕉️\n\nMy current location: ${mapsUrl}\n\nLatitude: ${latitude}\nLongitude: ${longitude}\n\nPlease help me!`;

      // Try WhatsApp first
      const whatsappUrl = `whatsapp://send?phone=91${CONTACT_NUMBER}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        Alert.alert(
          '🕉️ Location Sent!',
          'Your location has been shared via WhatsApp. Help is on the way!',
          [{ text: 'OK' }]
        );
      } else {
        // Fallback to SMS
        const smsUrl = Platform.OS === 'ios'
          ? `sms:${CONTACT_NUMBER}&body=${encodeURIComponent(message)}`
          : `sms:${CONTACT_NUMBER}?body=${encodeURIComponent(message)}`;
        
        await Linking.openURL(smsUrl);
        Alert.alert(
          '🕉️ Location Sent!',
          'Your location has been shared via SMS. Help is on the way!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location sharing error:', error);
      Alert.alert(
        'Error',
        'Unable to send location. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={sendLocation}>
        <Text style={styles.buttonIcon}>📍</Text>
        <Text style={styles.buttonText}>Send My Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.durga.spacing.md,
    marginHorizontal: theme.durga.spacing.md,
    paddingBottom: theme.durga.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.durgaRed,
    paddingHorizontal: theme.durga.spacing.lg,
    paddingVertical: theme.durga.spacing.md,
    borderRadius: theme.durga.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.durga.shadow,
    borderWidth: 2,
    borderColor: theme.colors.emergency,
    minHeight: 50,
    width: '100%',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: theme.durga.spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SendLocationButton;
