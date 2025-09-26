import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
  Surface,
  HelperText,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import DurgaHeader from '../components/DurgaHeader';
import { theme } from '../theme/theme';

const RegistrationScreen = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 13 || formData.age > 120) {
      newErrors.age = 'Age must be between 13 and 120 years';
    }

    // Contact number validation
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit Indian mobile number';
    }

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!validatePincode(formData.address.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian pincode';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
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
      
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        age: parseInt(formData.age),
        contactNumber: formData.contactNumber.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim(),
        },
        password: formData.password,
      };

      await register(registrationData);
      
      Alert.alert(
        '🕉️ Welcome to Durga!',
        'Registration successful! You are now protected by divine strength.',
        [{ text: 'OK', onPress: () => navigation.navigate('Chat') }]
      );
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Try to extract detailed error message
      let errorMessage = error.message || 'An error occurred during registration. Please try again.';
      
      if (error.message && error.message.includes('HTTP error! status: 400')) {
        errorMessage = 'Please check your form data. Make sure all fields are filled correctly:\n\n• Name: 2-50 characters\n• Email: Valid email format\n• Age: 13-120 years\n• Contact: 10-digit Indian mobile\n• Address: Complete address with valid pincode\n• Password: At least 6 characters';
      }
      
      Alert.alert(
        'Registration Failed',
        errorMessage,
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
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.registrationCard} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>🕉️ Join Durga's Protection</Text>
            <Text style={styles.subtitle}>
              Register to access divine safety guidance and support
            </Text>
            
            <Divider style={styles.divider} />
            
            {/* Personal Information */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              disabled={isLoading}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}
            
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
              label="Age *"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.age}
              disabled={isLoading}
            />
            {errors.age && <HelperText type="error">{errors.age}</HelperText>}
            
            <TextInput
              label="Contact Number *"
              value={formData.contactNumber}
              onChangeText={(value) => handleInputChange('contactNumber', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.contactNumber}
              disabled={isLoading}
            />
            {errors.contactNumber && <HelperText type="error">{errors.contactNumber}</HelperText>}
            
            <Divider style={styles.divider} />
            
            {/* Address Information */}
            <Text style={styles.sectionTitle}>Address Information</Text>
            
            <TextInput
              label="Street Address *"
              value={formData.address.street}
              onChangeText={(value) => handleInputChange('address.street', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              error={!!errors.street}
              disabled={isLoading}
            />
            {errors.street && <HelperText type="error">{errors.street}</HelperText>}
            
            <View style={styles.row}>
              <TextInput
                label="City *"
                value={formData.address.city}
                onChangeText={(value) => handleInputChange('address.city', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                error={!!errors.city}
                disabled={isLoading}
              />
              <TextInput
                label="State *"
                value={formData.address.state}
                onChangeText={(value) => handleInputChange('address.state', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                error={!!errors.state}
                disabled={isLoading}
              />
            </View>
            {(errors.city || errors.state) && (
              <HelperText type="error">{errors.city || errors.state}</HelperText>
            )}
            
            <TextInput
              label="Pincode *"
              value={formData.address.pincode}
              onChangeText={(value) => handleInputChange('address.pincode', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.pincode}
              disabled={isLoading}
            />
            {errors.pincode && <HelperText type="error">{errors.pincode}</HelperText>}
            
            <Divider style={styles.divider} />
            
            {/* Security */}
            <Text style={styles.sectionTitle}>Security</Text>
            
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
            
            <TextInput
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              error={!!errors.confirmPassword}
              disabled={isLoading}
            />
            {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
            
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
                '🕉️ Register with Durga'
              )}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
              style={styles.loginButton}
            >
              Already have an account? Login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.durga.spacing.md,
    paddingBottom: theme.durga.spacing.xl,
  },
  registrationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
    ...theme.durga.shadow,
  },
  cardContent: {
    padding: theme.durga.spacing.lg,
  },
  title: {
    fontSize: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.durgaRed,
    marginBottom: theme.durga.spacing.md,
    marginTop: theme.durga.spacing.sm,
  },
  input: {
    marginBottom: theme.durga.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
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
  loginButton: {
    marginTop: theme.durga.spacing.sm,
  },
  errorText: {
    textAlign: 'center',
    marginTop: theme.durga.spacing.sm,
  },
});

export default RegistrationScreen;
