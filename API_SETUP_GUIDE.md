# Google Gemini API Setup Instructions

## Step-by-Step Guide to Get Your API Key

### Step 1: Access Google AI Studio
1. Open your web browser
2. Go to: https://aistudio.google.com/apikey
3. You'll see the Google sign-in page

### Step 2: Sign In
1. Click "Use your Google Account"
2. Enter your email or phone number
3. Enter your password
4. Complete any 2-factor authentication if prompted

### Step 3: Create API Key
1. Once signed in, you'll see the Google AI Studio dashboard
2. Look for "Create API Key" button (usually in the top right or center)
3. Click "Create API Key"
4. Choose your Google Cloud project (or create a new one)
5. Click "Create API Key in new project" if you don't have one

### Step 4: Copy Your API Key
1. Your API key will be generated (it looks like: `AIzaSyC...`)
2. **IMPORTANT**: Copy this key immediately - you won't be able to see it again
3. Save it in a secure location

### Step 5: Configure the App
1. Open the file: `src/config/apiConfig.js`
2. Find this line:
   ```javascript
   export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   export const GEMINI_API_KEY = 'AIzaSyC_your_actual_key_here';
   ```
4. Save the file

### Step 6: Test the Integration
1. Start your React Native app: `npm start`
2. Send a test message in the chat
3. You should receive an AI response

## Troubleshooting

### Common Issues:

**"API request failed: 403"**
- Check if your API key is correct
- Ensure you've enabled the Gemini API in Google Cloud Console

**"API request failed: 400"**
- Verify the API key format
- Check if you have proper permissions

**"Invalid API response format"**
- API key might be incorrect
- Check your internet connection

### Security Notes:
- Never share your API key publicly
- Don't commit the API key to version control
- Consider using environment variables for production

### API Limits:
- Free tier has usage limits
- Monitor your usage in Google AI Studio
- Consider upgrading if you need higher limits

## Next Steps After Getting API Key:

1. ✅ Copy your API key
2. ✅ Update `src/config/apiConfig.js`
3. ✅ Test the app
4. ✅ Verify safety features work
5. ✅ Test emergency detection

Once you have your API key and have updated the configuration file, let me know and I can help you test the app or make any additional improvements!
