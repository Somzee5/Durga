// useTriplePressRecorder.js
import { useEffect, useRef, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform, Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import RecordingServiceNative from '../services/RecordingServiceNativeModule';
import { sendSosAlert, uploadSosAudio } from '../services/apiService';
let expoRecordingRef = null;

/**
 * useTriplePressRecorder
 * - Listens for 'VolumeTriplePress' native event (emitted by your AccessibilityService).
 * - Toggles recording: prefers native foreground service (if available), otherwise uses JS recorder (foreground only).
 * - Offers methods to manually start/stop and to open accessibility settings.
 * - Automatically sends emergency alert with location and audio
 */
export default function useTriplePressRecorder({ chunkPathPrefix = null } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordPath, setRecordPath] = useState(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const nativeEmitterRef = useRef(null);

  // Emergency contact number
  const EMERGENCY_CONTACT = '9021530516';

  useEffect(() => {
    // Listen for native event if native module exists
    const nativeModule = NativeModules.RecordingServiceModule;
    if (nativeModule) {
      const emitter = new NativeEventEmitter(nativeModule);
      nativeEmitterRef.current = emitter.addListener('VolumeTriplePress', async () => {
        // native AccessibilityService detected triple-press
        console.log('🚨 TRIPLE PRESS DETECTED - SOS ACTIVATED!');
        try {
          await activateSOS();
        } catch (e) {
          console.warn('Error activating SOS from native event', e);
        }
      });
    }
    return () => {
      if (nativeEmitterRef.current) {
        nativeEmitterRef.current.remove();
        nativeEmitterRef.current = null;
      }
    };
  }, []);

  async function ensureMicPermission() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Audio permission request failed', e);
      return false;
    }
  }

  async function ensureLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Location permission check failed', e);
      return false;
    }
  }

  // Activate SOS - the main emergency function
  async function activateSOS() {
    if (isSOSActive) {
      console.log('SOS already active, ignoring triple press');
      return;
    }

    setIsSOSActive(true);
    console.log('🚨 SOS ACTIVATED - Starting emergency procedures...');

    try {
      // Start recording immediately
      await startRecording();
      
      // Get location and send emergency alert via backend (auto-send)
      await sendEmergencyAlert(true);
      
      // Show SOS confirmation
      Alert.alert(
        '🚨 SOS ACTIVATED',
        'Emergency services have been notified with your location and audio recording. Help is on the way!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('SOS activation error:', error);
      Alert.alert(
        'SOS Error',
        'Emergency activation failed. Please try again or call emergency services directly.',
        [{ text: 'OK' }]
      );
    } finally {
      // Reset SOS state after 30 seconds
      setTimeout(() => {
        setIsSOSActive(false);
        stopRecording();
      }, 30000);
    }
  }

  // Send emergency alert with location
  async function sendEmergencyAlert(useBackend = false) {
    try {
      const hasLocationPermission = await ensureLocationPermission();
      let locationData = '';
      let lat = null, lng = null;
      
      if (hasLocationPermission) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = location.coords;
          lat = latitude; lng = longitude;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          locationData = `\n\n📍 EMERGENCY LOCATION:\n${mapsUrl}\nLatitude: ${latitude}\nLongitude: ${longitude}`;
        } catch (locationError) {
          console.warn('Location fetch failed:', locationError);
          locationData = '\n\n📍 Location: Unable to get current location';
        }
      }

      const emergencyMessage = `🚨 SOS EMERGENCY ALERT 🚨\n\nA woman is in immediate danger and needs urgent help!\n\nThis is an automated emergency alert from Durga Safety App.\n\nTime: ${new Date().toLocaleString()}${locationData}\n\nAudio recording is being captured for evidence.\n\nPlease respond immediately!`;

      if (useBackend) {
        try {
          // If we have a recording in progress, stop and upload to include audio
          let audioUrl = null;
          if (expoRecordingRef) {
            await expoRecordingRef.stopAndUnloadAsync();
            const uri = expoRecordingRef.getURI();
            expoRecordingRef = null;
            if (uri) {
              try {
                const up = await uploadSosAudio(uri);
                audioUrl = up.audioUrl || null;
              } catch (e) {
                console.warn('Audio upload failed:', e);
              }
            }
          }

          await sendSosAlert({
            phone: '919021530516',
            message: emergencyMessage.replace(/📍/g, 'Location:'),
            lat,
            lng,
            audioUrl,
          });
          console.log('SOS dispatched via backend');
          return;
        } catch (e) {
          console.warn('Backend SOS dispatch failed, falling back to client share', e);
        }
      }

      // Try WhatsApp first
      const whatsappUrl = `whatsapp://send?phone=91${EMERGENCY_CONTACT}&text=${encodeURIComponent(emergencyMessage)}`;
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
        console.log('Emergency alert sent via WhatsApp');
      } else {
        // Fallback to SMS
        const smsUrl = Platform.OS === 'ios'
          ? `sms:${EMERGENCY_CONTACT}&body=${encodeURIComponent(emergencyMessage)}`
          : `sms:${EMERGENCY_CONTACT}?body=${encodeURIComponent(emergencyMessage)}`;
        
        await Linking.openURL(smsUrl);
        console.log('Emergency alert sent via SMS');
      }
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      throw error;
    }
  }

  // Start recording (prefers native service)
  async function startRecording() {
    const ok = await ensureMicPermission();
    if (!ok) {
      Alert.alert('Permission required', 'Microphone permission is required for SOS recording.');
      return false;
    }

    if (RecordingServiceNative.isAvailable && Platform.OS === 'android') {
      // Start native foreground service (recommended for background recording)
      try {
        await RecordingServiceNative.startService(); // native handles chunking & upload
        setIsRecording(true);
        return true;
      } catch (e) {
        console.warn('Failed to start native recording service', e);
        // fallback to JS recorder below
      }
    }

    // JS fallback: use expo-av (works only when app is foreground)
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      expoRecordingRef = recording;
      setRecordPath(null);
      setIsRecording(true);
      return true;
    } catch (e) {
      console.error('Expo startRecording failed', e);
      return false;
    }
  }

  // Stop recording
  async function stopRecording() {
    if (RecordingServiceNative.isAvailable && Platform.OS === 'android') {
      try {
        await RecordingServiceNative.stopService();
      } catch (e) {
        console.warn('Failed to stop native recording service', e);
      }
    }

    // JS fallback stop (expo-av)
    try {
      if (expoRecordingRef) {
        await expoRecordingRef.stopAndUnloadAsync();
        const uri = expoRecordingRef.getURI();
        setRecordPath(uri || null);
        expoRecordingRef = null;
      }
    } catch (e) {
      // ignore non-fatal
      console.warn('Expo stopRecording failed', e);
    } finally {
      setIsRecording(false);
    }
  }

  async function toggleRecording() {
    if (isRecording) return stopRecording();
    return startRecording();
  }

  function openAccessibilitySettings() {
    RecordingServiceNative.openAccessibilitySettings();
  }

  return {
    isRecording,
    isSOSActive,
    startRecording,
    stopRecording,
    toggleRecording,
    activateSOS,
    openAccessibilitySettings,
    recordPath,
  };
}
