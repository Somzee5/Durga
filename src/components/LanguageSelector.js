import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, List } from 'react-native-paper';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../theme/theme';

const LanguageSelector = ({ visible, onClose }) => {
  const { selectedLanguage, changeLanguage, getAllLanguages } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (languageCode) => {
    if (isChanging) return;
    
    setIsChanging(true);
    try {
      await changeLanguage(languageCode);
      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const languages = getAllLanguages();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <Card.Title
            title="🌐 Select Language"
            titleStyle={styles.title}
            right={(props) => (
              <IconButton
                {...props}
                icon="close"
                onPress={onClose}
                iconColor={theme.colors.durgaBrown}
              />
            )}
          />
          <Card.Content style={styles.content}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageChange(language.code)}
                disabled={isChanging}
              >
                <View style={styles.languageRow}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageName,
                      selectedLanguage === language.code && styles.selectedText
                    ]}>
                      {language.name}
                    </Text>
                    <Text style={[
                      styles.nativeName,
                      selectedLanguage === language.code && styles.selectedSubtext
                    ]}>
                      {language.nativeName}
                    </Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor={theme.colors.durgaRed}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.durga.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.durga.borderRadius,
    ...theme.durga.shadow,
  },
  title: {
    color: theme.colors.durgaBrown,
    fontWeight: '700',
    fontSize: 18,
  },
  content: {
    paddingTop: 0,
  },
  languageItem: {
    paddingVertical: theme.durga.spacing.md,
    paddingHorizontal: theme.durga.spacing.sm,
    borderRadius: theme.durga.borderRadius,
    marginBottom: theme.durga.spacing.xs,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.durgaLight,
    borderWidth: 1,
    borderColor: theme.colors.durgaRed,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: theme.durga.spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.durgaBrown,
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  selectedText: {
    color: theme.colors.durgaRed,
    fontWeight: '700',
  },
  selectedSubtext: {
    color: theme.colors.durgaBrown,
  },
});

export default LanguageSelector;
