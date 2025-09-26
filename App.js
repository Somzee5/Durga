import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatProvider } from './src/context/ChatContext';
import ChatScreen from './src/screens/ChatScreen';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ChatProvider>
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            <ChatScreen />
          </View>
        </ChatProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
