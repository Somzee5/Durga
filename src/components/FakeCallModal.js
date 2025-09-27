import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Vibration, StatusBar } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/theme';

const FakeCallModal = ({ visible, onDismiss }) => {
  const [ringing, setRinging] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const timerRef = useRef(null);
  const ringtoneRef = useRef(null);
  const vibrationRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);

  // Random caller data
  const callerData = [
    { name: 'Aai', number: '+91 98765 43210', avatar: '👩' },
    { name: 'Papa', number: '+91 98765 43211', avatar: '👨' },
    { name: 'Didi', number: '+91 98765 43212', avatar: '👧' },
    { name: 'Dada', number: '+91 98765 43213', avatar: '👦' },
    { name: 'Durga', number: '+91 98765 43214', avatar: '👭' },
    { name: 'Emergency', number: '+91 98765 43215', avatar: '🚨' },
  ];

  useEffect(() => {
    if (visible) {
      // Select random caller
      const randomCaller = callerData[Math.floor(Math.random() * callerData.length)];
      setCallerInfo(randomCaller);
      setRinging(true);
      setCallActive(false);
      
      // Start ringtone and vibration
      startRingtone();
      startVibration();
      
      // Hide status bar for full-screen effect
      StatusBar.setHidden(true, 'fade');
    } else {
      // Clean up
      stopRingtone();
      stopVibration();
      StatusBar.setHidden(false, 'fade');
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopRingtone();
      stopVibration();
      StatusBar.setHidden(false, 'fade');
    };
  }, [visible]);

  const startRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, isLooping: true, volume: 0.8 }
      );
      ringtoneRef.current = sound;
    } catch (error) {
      console.log('Ringtone error:', error);
    }
  };

  const stopRingtone = async () => {
    if (ringtoneRef.current) {
      await ringtoneRef.current.unloadAsync();
      ringtoneRef.current = null;
    }
  };

  const startVibration = () => {
    const vibratePattern = [0, 1000, 500, 1000];
    Vibration.vibrate(vibratePattern, true);
  };

  const stopVibration = () => {
    Vibration.cancel();
  };

  const handleAnswer = () => {
    setRinging(false);
    setCallActive(true);
    stopRingtone();
    stopVibration();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timerRef.current = setTimeout(() => {
      setCallActive(false);
      onDismiss?.();
    }, 15000);
  };

  const handleReject = () => {
    stopRingtone();
    stopVibration();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Surface style={styles.callCard} elevation={8}>
          <LinearGradient colors={['#1a1a1a', '#000']} style={styles.header}>
            <View style={styles.callerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{callerInfo?.avatar || '📞'}</Text>
              </View>
              <View style={styles.callerInfo}>
                <Text style={styles.callerName}>{callerInfo?.name || 'Unknown Caller'}</Text>
                <Text style={styles.callerNumber}>{callerInfo?.number || '+91 98765 43210'}</Text>
                <Text style={styles.callerSub}>{ringing ? 'Incoming call...' : 'Call in progress...'}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {ringing && (
              <View style={styles.ringingContainer}>
                <Text style={styles.ringingText}>📞</Text>
                <Text style={styles.statusText}>Incoming call</Text>
              </View>
            )}
            {callActive && (
              <View style={styles.callContainer}>
                <Text style={styles.callText}>📞</Text>
                <Text style={styles.statusText}>Call in progress…</Text>
                <Text style={styles.timerText}>00:15</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {!callActive ? (
              <>
                <TouchableOpacity onPress={handleReject} style={[styles.circleBtn, styles.reject]}>
                  <IconButton icon="phone-hangup" size={28} iconColor="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAnswer} style={[styles.circleBtn, styles.answer]}>
                  <IconButton icon="phone" size={28} iconColor="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleReject} style={[styles.endCallBtn]}>
                <IconButton icon="phone-hangup" size={28} iconColor="#fff" />
                <Text style={styles.endText}>End</Text>
              </TouchableOpacity>
            )}
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callCard: {
    width: '85%',
    borderRadius: theme.durga.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  callerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  callerInfo: {
    flex: 1,
  },
  callerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  callerNumber: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 2,
  },
  callerSub: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  body: {
    padding: 24,
    alignItems: 'center',
  },
  ringingContainer: {
    alignItems: 'center',
  },
  ringingText: {
    fontSize: 48,
    marginBottom: 16,
  },
  callContainer: {
    alignItems: 'center',
  },
  callText: {
    fontSize: 32,
    marginBottom: 12,
  },
  timerText: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reject: {
    backgroundColor: theme.colors.emergency,
  },
  answer: {
    backgroundColor: '#22c55e',
  },
  endCallBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.emergency,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  endText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default FakeCallModal;
