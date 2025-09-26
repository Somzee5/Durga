import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import DurgaHeader from '../components/DurgaHeader';
import { testConnection } from '../services/apiService';
import { theme } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      
      const credentials = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      await login(credentials);
      
      Alert.alert(
        '  Welcome Back!',
        'You are now protected by Durga\'s divine strength.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTestConnection = async () => {
    try {
      const response = await testConnection();
      Alert.alert(
        '✅ Connection Test',
        `Backend is working!\n\nMessage: ${response.message}\nIP: ${response.clientIP}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Connection Test Failed',
        `Error: ${error.message}\n\nMake sure backend is running on port 5000`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DurgaHeader />
      
      <View style={styles.content}>
        <Card style={styles.loginCard} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>  Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access Durga's divine protection
            </Text>
            
            <Divider style={styles.divider} />
            
            <TextInput
              label="Email Address *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
              disabled={isLoading}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}
            
            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              error={!!errors.password}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}
            
            {error && (
              <HelperText type="error" style={styles.errorText}>
                {error}
              </HelperText>
            )}
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.surface} />
              ) : (
                '  Sign In with Durga'
              )}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Registration')}
              disabled={isLoading}
              style={styles.registerButton}
            >
              Don't have an account? Register
            </Button>
            
            <Button
              mode="text"
              onPress={handleTestConnection}
              disabled={isLoading}
              style={styles.testButton}
            >
              🔧 Test Backend Connection
            </Button>
            
            <Button
              mode="text"
              onPress={() => {
                // TODO: Implement forgot password
                Alert.alert('Forgot Password', 'This feature will be available soon.');
              }}
              disabled={isLoading}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.durga.spacing.lg,
  },
  loginCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
    ...theme.durga.shadow,
  },
  cardContent: {
    padding: theme.durga.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.durgaRed,
    textAlign: 'center',
    marginBottom: theme.durga.spacing.sm,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.durgaBrown,
    textAlign: 'center',
    marginBottom: theme.durga.spacing.lg,
    lineHeight: 22,
  },
  divider: {
    marginVertical: theme.durga.spacing.lg,
    backgroundColor: theme.colors.durgaLight,
  },
  input: {
    marginBottom: theme.durga.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  submitButton: {
    marginTop: theme.durga.spacing.lg,
    marginBottom: theme.durga.spacing.md,
    backgroundColor: theme.colors.durgaRed,
    borderRadius: theme.durga.borderRadius,
  },
  submitButtonContent: {
    paddingVertical: theme.durga.spacing.sm,
  },
  registerButton: {
    marginBottom: theme.durga.spacing.sm,
  },
  testButton: {
    marginTop: theme.durga.spacing.sm,
  },
  forgotButton: {
    marginTop: theme.durga.spacing.sm,
  },
  errorText: {
    textAlign: 'center',
    marginTop: theme.durga.spacing.sm,
  },
});

export default LoginScreen;
