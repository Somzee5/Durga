import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthDebug = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  const clearAuth = async () => {
    await AsyncStorage.removeItem('authToken');
    console.log('Auth token cleared');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Auth Status:</Text>
      <Text style={styles.text}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>User: {user ? user.name : 'None'}</Text>
      <Button mode="outlined" onPress={clearAuth} style={styles.button}>
        Clear Auth
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
  button: {
    marginTop: 5,
  },
});

export default AuthDebug;
