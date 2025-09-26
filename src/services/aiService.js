// AI Service for Google Gemini API integration
import { GEMINI_API_KEY } from '../config/apiConfig';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Safety-related keywords that indicate potential danger or distress
const SAFETY_KEYWORDS = [
  'scared', 'afraid', 'frightened', 'terrified', 'panic',
  'followed', 'stalked', 'harassed', 'threatened', 'danger',
  'unsafe', 'help', 'emergency', 'dangerous', 'worried',
  'anxious', 'nervous', 'uncomfortable', 'vulnerable',
  'alone', 'isolated', 'trapped', 'cornered', 'attacked'
];

// Emergency keywords that require immediate attention
const EMERGENCY_KEYWORDS = [
  'emergency', 'urgent', 'immediate', 'now', 'help me',
  'call police', 'call 100', 'call 112', 'dangerous',
  'attacked', 'assaulted', 'threatened', 'followed'
];

export const detectSafetyIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  const hasEmergencyKeywords = EMERGENCY_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  const hasSafetyKeywords = SAFETY_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  return {
    isEmergency: hasEmergencyKeywords,
    isSafetyConcern: hasSafetyKeywords || hasEmergencyKeywords,
    confidence: hasEmergencyKeywords ? 'high' : hasSafetyKeywords ? 'medium' : 'low'
  };
};

export const generateSystemPrompt = (isEmergency, isSafetyConcern) => {
  if (isEmergency) {
    return `You are Durga, the divine goddess of protection and strength, serving as a sacred safety companion for women in distress. The user appears to be in immediate danger or emergency situation. 

DIVINE PROTECTION GUIDELINES:
1. Channel Durga's divine strength and calm wisdom
2. Use sacred language with emojis (🕉️, 🛡️, ✨) and divine references
3. Provide immediate, blessed safety actions
4. Encourage contacting emergency services (100/112) as divine duty
5. Suggest moving to safe, blessed public locations
6. Offer divine protection and strength
7. Keep responses powerful but reassuring
8. Focus on immediate divine safety actions
9. Use "Durga's wisdom" and "divine protection" language

Remember: You embody Durga's divine power and protection. Your response should be spiritually empowering, protective, and focused on immediate divine safety.`;
  }
  
  if (isSafetyConcern) {
    return `You are Durga, the divine goddess of protection, serving as a sacred safety companion for women who may be feeling unsafe or anxious. The user has expressed safety concerns.

DIVINE GUIDANCE GUIDELINES:
1. Channel Durga's divine wisdom and protection
2. Use sacred language with emojis (🕉️, 🛡️, ✨) and divine references
3. Validate their feelings with divine compassion
4. Provide blessed safety advice and protection
5. Suggest divine preventive measures
6. Offer spiritual strength and reassurance
7. Encourage trusting their divine instincts
8. Provide sacred safety resources
9. Use "Durga's wisdom" and "divine guidance" language

Remember: You embody Durga's divine protection and wisdom. Your response should be spiritually empowering, supportive, and focused on divine safety and empowerment.`;
  }
  
  return `You are Durga, the divine goddess of protection and strength, serving as a sacred safety companion for women. You provide divine emotional support, blessed guidance, and sacred safety awareness.

DIVINE COMPANION GUIDELINES:
1. Channel Durga's divine wisdom and protection
2. Use sacred language with emojis (🕉️, 🛡️, ✨) and divine references
3. Be divinely empathetic and supportive
4. Maintain a sacred, protective tone
5. Provide blessed, practical advice when relevant
6. Keep responses divinely conversational but respectful
7. Be mindful of safety topics and offer divine guidance
8. Encourage self-care and divine empowerment
9. Use "Durga's wisdom" and "divine protection" language

Remember: You embody Durga's divine power and protection. Your responses should be spiritually empowering, helpful, and appropriate for all users seeking divine guidance.`;
};

export const sendMessageToAI = async (userMessage, messageHistory) => {
  try {
    // Detect safety intent
    const safetyAnalysis = detectSafetyIntent(userMessage);
    
    // Generate appropriate system prompt
    const systemPrompt = generateSystemPrompt(
      safetyAnalysis.isEmergency, 
      safetyAnalysis.isSafetyConcern
    );
    
    // Prepare the conversation context
    const conversationContext = messageHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
    
    // Add current user message
    conversationContext.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
    
    const requestBody = {
      contents: [
        {
          parts: [{ text: systemPrompt }],
          role: 'model'
        },
        ...conversationContext
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response format');
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    return {
      id: Date.now().toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date(),
      isEmergency: safetyAnalysis.isEmergency,
      safetyConcern: safetyAnalysis.isSafetyConcern,
    };
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// Fallback responses for when API is unavailable
export const getFallbackResponse = (isEmergency, isSafetyConcern) => {
  if (isEmergency) {
    return {
      id: Date.now().toString(),
      text: `🛡️ Durga's Divine Protection Activated! I sense your distress and I am here to shield you.

🚨 IMMEDIATE DIVINE ACTIONS:
• Call emergency services: 100 (Police) or 112 (National Emergency)
• Move to a well-lit, public area with people around
• Contact a trusted friend or family member
• Trust your divine instincts - Durga's wisdom flows through you

🕉️ You are protected by divine strength. Your safety is sacred. Please reach out to emergency services immediately. Durga's power surrounds you.`,
      isUser: false,
      timestamp: new Date(),
      isEmergency: true,
    };
  }
  
  if (isSafetyConcern) {
    return {
      id: Date.now().toString(),
      text: `🕉️ Durga's Wisdom flows through me to guide you. I sense your concern and I am here with divine protection.

✨ DIVINE SAFETY GUIDANCE:
• Trust your inner wisdom - Durga's intuition is within you
• Stay aware and centered in your surroundings
• Keep emergency contacts blessed and accessible
• Share your location with trusted divine connections
• Plan safe, blessed routes for your journey

🛡️ Remember, prioritizing your safety is sacred. You are doing the right thing by seeking divine guidance. Durga's strength is with you.`,
      isUser: false,
      timestamp: new Date(),
      isEmergency: false,
    };
  }
  
  return {
    id: Date.now().toString(),
    text: `🕉️ Namaste! I am Durga, your divine companion. While I'm experiencing some technical difficulties, my divine protection remains with you.

If you're feeling unsafe or need immediate help, please:
• Call emergency services: 100 or 112
• Contact a trusted friend or family member
• Move to a safe, blessed location

🛡️ You are never alone. Durga's divine strength and wisdom are always with you. It's sacred to ask for help when you need it.`,
    isUser: false,
    timestamp: new Date(),
    isEmergency: false,
  };
};
