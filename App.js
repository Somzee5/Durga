import React from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from './src/context/ChatContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import ChatScreen from './src/screens/ChatScreen';
import OfflineSafetyGuide from './src/screens/OfflineSafetyGuide';
import * as Network from 'expo-network';
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import AuthDebug from './src/components/AuthDebug';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

// Navigation component that handles authentication state
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) setIsOffline(!state.isConnected || !state.isInternetReachable);
      } catch {}
    };
    check();
    const interval = setInterval(check, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // For testing: Add a way to manually toggle offline mode
  // You can temporarily set this to true to test offline functionality
  // const [isOffline, setIsOffline] = React.useState(true); // Uncomment this line to test offline mode

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.durgaRed} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        {/* <AuthDebug /> */}
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background },
          }}
        >
          {isAuthenticated ? (
            isOffline ? (
              <Stack.Screen name="OfflineGuide" component={OfflineSafetyGuide} />
            ) : (
              <Stack.Screen name="Chat" component={ChatScreen} />
            )
          ) : (
            // User is not authenticated, show auth screens
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Registration" component={RegistrationScreen} />
            </>
          )}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <LanguageProvider>
          <AuthProvider>
            <ChatProvider>
              <AppNavigator />
            </ChatProvider>
          </AuthProvider>
        </LanguageProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
