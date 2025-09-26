# Women Safety Companion - React Native App

## 🎯 Project Overview

A government-friendly mobile companion app designed to support women in unsafe or stressful situations. The app uses Google Gemini AI to provide empathetic, calming, and practical safety advice in real time.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development) or Xcode (for iOS development)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get Google Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

3. **Configure API Key**
   - Open `src/config/apiConfig.js`
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   export const GEMINI_API_KEY = 'your_actual_api_key_here';
   ```

4. **Start the Development Server**
   ```bash
   npm start
   ```

5. **Run on Device/Emulator**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For Web: `npm run web`

## 📱 Features

### Core Features
- **AI Chatbot**: Empathetic safety companion powered by Google Gemini
- **Safety Intent Detection**: Automatically detects unsafe situations
- **Emergency Fallback**: Offline safety messages when API is unavailable
- **Government-Friendly UI**: Clean, professional design
- **Multilingual Support**: AI can handle multiple languages
- **Emergency Contacts**: Quick access to emergency numbers

### Safety Features
- **Real-time Safety Analysis**: Detects keywords indicating danger or distress
- **Contextual Responses**: Different response styles based on urgency level
- **Emergency Mode**: Special handling for immediate danger situations
- **Fallback Support**: Always provides safety guidance even without internet

## 🛠️ Technical Stack

- **Frontend**: React Native with Expo
- **UI Library**: React Native Paper
- **State Management**: React Context API
- **AI Backend**: Google Gemini API
- **Styling**: StyleSheet with government-friendly theme

## 📁 Project Structure

```
women-safety-companion/
├── App.js                          # Main app component
├── package.json                    # Dependencies and scripts
├── src/
│   ├── components/
│   │   ├── MessageBubble.js        # Chat message component
│   │   └── SafetyDisclaimer.js    # Safety disclaimer card
│   ├── config/
│   │   └── apiConfig.js           # API configuration
│   ├── context/
│   │   └── ChatContext.js         # Chat state management
│   ├── screens/
│   │   └── ChatScreen.js          # Main chat interface
│   ├── services/
│   │   └── aiService.js           # AI integration service
│   └── theme/
│       └── theme.js               # App theme configuration
```

## 🔧 Configuration

### API Configuration (`src/config/apiConfig.js`)

```javascript
export const GEMINI_API_KEY = 'your_api_key_here';
export const EMERGENCY_CONTACTS = {
  POLICE: '100',
  NATIONAL_EMERGENCY: '112',
  WOMEN_HELPLINE: '1091',
  // ... more contacts
};
```

### Theme Customization (`src/theme/theme.js`)

The app uses a government-friendly color scheme:
- Primary: Government blue (#2c5aa0)
- Secondary: Light blue (#4a90e2)
- Emergency: Red (#d32f2f)
- Background: Light gray (#f8f9fa)

## 🚨 Safety Features

### Safety Intent Detection

The app automatically detects safety-related keywords:

**Emergency Keywords**: emergency, urgent, immediate, help me, call police, attacked, etc.

**Safety Keywords**: scared, followed, harassed, unsafe, worried, anxious, etc.

### Response Modes

1. **Emergency Mode**: Immediate danger detected
   - Calm, reassuring tone
   - Actionable safety steps
   - Emergency contact encouragement

2. **Safety Concern Mode**: General safety concerns
   - Empathetic support
   - Preventive advice
   - Emotional reassurance

3. **General Mode**: Regular conversation
   - Supportive chat
   - General advice
   - Safety awareness

### Fallback System

When the API is unavailable, the app provides:
- Context-aware offline responses
- Emergency contact information
- Basic safety guidance
- Reassurance and support

## 📱 UI/UX Design

### Government-Friendly Design Principles
- **Clean Interface**: Minimal distractions, professional appearance
- **Accessible Colors**: High contrast, government-appropriate palette
- **Clear Typography**: Readable fonts, appropriate sizing
- **Intuitive Navigation**: Simple, straightforward user flow
- **Safety-First**: Emergency features prominently displayed

### Key UI Components
- **Safety Disclaimer**: Prominent safety information at app start
- **Message Bubbles**: Clear distinction between user and AI messages
- **Emergency Button**: Quick access to emergency contacts
- **Loading States**: Clear feedback during AI processing
- **Emergency Indicators**: Visual cues for safety-related responses

## 🔒 Privacy & Security

- **No Data Storage**: Messages are not permanently stored
- **Session-Based**: Chat history only exists during app session
- **API Security**: Secure communication with Google Gemini
- **No Personal Data**: App doesn't collect personal information
- **Local Processing**: Safety analysis happens locally

## 🚀 Deployment

### Building for Production

1. **Configure App Settings**
   ```bash
   expo build:android
   expo build:ios
   ```

2. **Update API Configuration**
   - Ensure production API key is configured
   - Test all safety features

3. **Test Safety Features**
   - Verify emergency detection works
   - Test fallback responses
   - Confirm emergency contacts are accessible

## 📞 Emergency Contacts (India)

- **Police**: 100
- **National Emergency**: 112
- **Women Helpline**: 1091
- **Domestic Violence**: 181
- **Child Helpline**: 1098

## 🤝 Contributing

This is a government-approved safety application. When contributing:

1. Maintain professional, government-appropriate tone
2. Prioritize user safety in all features
3. Test safety features thoroughly
4. Follow accessibility guidelines
5. Ensure privacy and security standards

## 📄 License

This project is designed for public safety and government use. Please ensure compliance with local regulations and privacy laws.

## 🆘 Support

For technical support or safety concerns:
- Check the emergency contacts above
- Review the safety disclaimer in the app
- Contact local authorities if in immediate danger

---

**Important**: This app is designed to provide emotional support and safety guidance. It is not a replacement for emergency services. If you're in immediate danger, please call emergency services (100/112) or contact local authorities.
