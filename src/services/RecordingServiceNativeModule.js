// RecordingServiceNativeModule.js
import { NativeModules, Platform, Linking } from 'react-native';

const { RecordingServiceModule } = NativeModules || {};

/**
 * Wrapper that safely calls native module methods if available.
 * If native module is missing (e.g., iOS or not implemented yet),
 * JS fallback functions will be used by the hook.
 */
export default {
  isAvailable: !!RecordingServiceModule,
  
  startService: async (...args) => {
    if (RecordingServiceModule && RecordingServiceModule.startService) {
      return RecordingServiceModule.startService(...args);
    }
    console.warn('RecordingServiceModule.startService not available on this platform.');
    return null;
  },
  
  stopService: async (...args) => {
    if (RecordingServiceModule && RecordingServiceModule.stopService) {
      return RecordingServiceModule.stopService(...args);
    }
    console.warn('RecordingServiceModule.stopService not available on this platform.');
    return null;
  },
  
  openAccessibilitySettings: () => {
    if (RecordingServiceModule && RecordingServiceModule.openAccessibilitySettings) {
      return RecordingServiceModule.openAccessibilitySettings();
    }
    // fallback for Android: open settings via Linking (native module recommended)
    if (Platform.OS === 'android') {
      try {
        Linking.openSettings();
      } catch (e) {
        console.warn('Unable to open accessibility settings:', e);
      }
    }
  }
};
