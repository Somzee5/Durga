import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const LANGUAGE_STORAGE_KEY = 'selected_language';

const languages = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳'
  }
};

const translations = {
  en: {
    welcome: 'Welcome to the Safety Companion',
    welcomeSubtext: 'Start a conversation to receive helpful safety guidance and support',
    placeholder: 'Type your message here...',
    generatingResponse: 'Generating response...',
    emergencyCall: 'Emergency Call',
    emergencyText: 'If you\'re in immediate danger, call emergency services',
    sosActive: 'SOS ACTIVE',
    sosRecording: 'Recording...',
    sosDescription: 'Emergency services notified with location & audio',
    sosRecordingDescription: 'Audio recording in progress',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    ok: 'OK',
    error: 'Error',
    logoutError: 'Failed to logout. Please try again.',
    languageSelector: 'Select Language',
    selectLanguage: 'Choose your preferred language',
    changeLanguage: 'Change Language'
  },
  hi: {
    welcome: 'सुरक्षा साथी में आपका स्वागत है',
    welcomeSubtext: 'सहायक सुरक्षा मार्गदर्शन और सहायता प्राप्त करने के लिए बातचीत शुरू करें',
    placeholder: 'अपना संदेश यहाँ टाइप करें...',
    generatingResponse: 'प्रतिक्रिया तैयार की जा रही है...',
    emergencyCall: 'आपातकालीन कॉल',
    emergencyText: 'यदि आप तत्काल खतरे में हैं, तो आपातकालीन सेवाओं को कॉल करें',
    sosActive: 'SOS सक्रिय',
    sosRecording: 'रिकॉर्डिंग...',
    sosDescription: 'स्थान और ऑडियो के साथ आपातकालीन सेवाओं को सूचित किया गया',
    sosRecordingDescription: 'ऑडियो रिकॉर्डिंग प्रगति में है',
    logout: 'लॉगआउट',
    logoutConfirm: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    cancel: 'रद्द करें',
    ok: 'ठीक है',
    error: 'त्रुटि',
    logoutError: 'लॉगआउट असफल। कृपया पुनः प्रयास करें।',
    languageSelector: 'भाषा चुनें',
    selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
    changeLanguage: 'भाषा बदलें'
  },
  mr: {
    welcome: 'सुरक्षा साथीमध्ये आपले स्वागत आहे',
    welcomeSubtext: 'उपयुक्त सुरक्षा मार्गदर्शन आणि सहाय्य मिळविण्यासाठी संभाषण सुरू करा',
    placeholder: 'आपला संदेश येथे टाइप करा...',
    generatingResponse: 'प्रतिक्रिया तयार केली जात आहे...',
    emergencyCall: 'आणीबाणी कॉल',
    emergencyText: 'जर तुम्ही तातडीने धोक्यात असाल तर, आणीबाणी सेवांना कॉल करा',
    sosActive: 'SOS सक्रिय',
    sosRecording: 'रेकॉर्डिंग...',
    sosDescription: 'स्थान आणि ऑडिओसह आणीबाणी सेवांना सूचित केले',
    sosRecordingDescription: 'ऑडिओ रेकॉर्डिंग प्रगतीत आहे',
    logout: 'लॉगआउट',
    logoutConfirm: 'तुम्ही खरोखर लॉगआउट करू इच्छिता?',
    cancel: 'रद्द करा',
    ok: 'ठीक आहे',
    error: 'त्रुटी',
    logoutError: 'लॉगआउट अयशस्वी। कृपया पुन्हा प्रयत्न करा।',
    languageSelector: 'भाषा निवडा',
    selectLanguage: 'तुमची पसंतीची भाषा निवडा',
    changeLanguage: 'भाषा बदला'
  }
};

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && languages[savedLanguage]) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    if (languages[languageCode]) {
      try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
        setSelectedLanguage(languageCode);
      } catch (error) {
        console.error('Failed to save language:', error);
      }
    }
  };

  const t = (key) => {
    return translations[selectedLanguage]?.[key] || translations.en[key] || key;
  };

  const getCurrentLanguage = () => {
    return languages[selectedLanguage];
  };

  const getAllLanguages = () => {
    return Object.values(languages);
  };

  const value = {
    selectedLanguage,
    changeLanguage,
    t,
    getCurrentLanguage,
    getAllLanguages,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
