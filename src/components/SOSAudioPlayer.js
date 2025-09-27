import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, IconButton, List, Divider } from 'react-native-paper';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

const SOSAudioPlayer = ({ visible, onClose }) => {
  const [sosRecordings, setSosRecordings] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSOSRecordings();
    }
  }, [visible]);

  const loadSOSRecordings = async () => {
    try {
      const recordings = await AsyncStorage.getItem('sos_recordings');
      if (recordings) {
        setSosRecordings(JSON.parse(recordings));
      }
    } catch (error) {
      console.error('Failed to load SOS recordings:', error);
    }
  };

  const playAudio = async (recording, index) => {
    try {
      // Stop current sound if playing
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      setIsLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.filePath },
        { shouldPlay: true }
      );
      
      setCurrentSound(sound);
      setPlayingIndex(index);

      // Handle playback completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingIndex(null);
          setCurrentSound(null);
        }
      });

    } catch (error) {
      console.error('Failed to play audio:', error);
      Alert.alert('Playback Error', 'Could not play the audio recording.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = async () => {
    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setPlayingIndex(null);
    }
  };

  const deleteRecording = async (index) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this SOS recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRecordings = sosRecordings.filter((_, i) => i !== index);
              await AsyncStorage.setItem('sos_recordings', JSON.stringify(updatedRecordings));
              setSosRecordings(updatedRecordings);
              
              // Stop audio if this recording was playing
              if (playingIndex === index) {
                await stopAudio();
              }
            } catch (error) {
              console.error('Failed to delete recording:', error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>🎵 SOS Audio Recordings</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
              iconColor={theme.colors.durgaRed}
            />
          </View>
          
          <Text style={styles.subtitle}>
            Listen to recorded SOS emergency audio for evidence
          </Text>

          <Divider style={styles.divider} />

          {sosRecordings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No SOS recordings found</Text>
              <Text style={styles.emptySubtext}>
                SOS recordings will appear here after emergency activation
              </Text>
            </View>
          ) : (
            <List.Section>
              {sosRecordings.map((recording, index) => (
                <List.Item
                  key={index}
                  title={`SOS Emergency - ${formatDate(recording.timestamp)}`}
                  description={`Duration: ${formatDuration(recording.duration || 0)} | Location: ${recording.location || 'Unknown'}`}
                  left={() => (
                    <IconButton
                      icon={playingIndex === index ? "stop" : "play"}
                      size={24}
                      iconColor={theme.colors.durgaRed}
                      onPress={() => {
                        if (playingIndex === index) {
                          stopAudio();
                        } else {
                          playAudio(recording, index);
                        }
                      }}
                    />
                  )}
                  right={() => (
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.durgaBrown}
                      onPress={() => deleteRecording(index)}
                    />
                  )}
                  style={styles.listItem}
                />
              ))}
            </List.Section>
          )}

          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.closeButton}
            icon="close"
          >
            Close
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.durgaRed,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.durgaBrown,
    marginBottom: 15,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: theme.colors.durgaLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.durgaBrown,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.durgaLight,
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: theme.colors.background,
    marginVertical: 2,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 20,
    borderColor: theme.colors.durgaRed,
  },
});

export default SOSAudioPlayer;
