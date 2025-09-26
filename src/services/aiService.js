// AI Service with Local Intelligence and Gemini API fallback
import { GEMINI_API_KEY } from '../config/apiConfig';

// Alternative Gemini API URLs to try (updated for 2024)
const GEMINI_API_URLS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent'
];

const GEMINI_API_URL = GEMINI_API_URLS[0]; // Use the first URL as primary

// Validate API key format
const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // Google API keys typically start with 'AIza' and are 39 characters long
  return apiKey.startsWith('AIza') && apiKey.length >= 35;
};

// Response variety templates for different scenarios
const RESPONSE_TEMPLATES = {
  greeting: [
    "Hello! I'm Durga, your safety companion. How can I help you today?",
    "Namaste! I'm here to support and protect you. What's on your mind?",
    "Hi there! I'm Durga, ready to listen and help. How are you feeling?",
    "Welcome! I'm your safety companion. Is there anything you'd like to talk about?",
    "Hello! I'm here to provide guidance and support. What brings you here today?"
  ],
  safety_tips: [
    "Here are some practical safety measures you can take:",
    "Let me share some important safety strategies with you:",
    "I'd like to offer you some protective guidance:",
    "Here are some ways to stay safe and empowered:",
    "Let me give you some practical safety advice:"
  ],
  emotional_support: [
    "I understand how you're feeling. You're not alone in this.",
    "Your feelings are completely valid. I'm here to support you.",
    "It takes courage to share what you're going through. I'm proud of you.",
    "I can sense your concern, and I want you to know I'm here for you.",
    "Thank you for trusting me with this. You're being very brave."
  ]
};

// Enhanced base system prompt for more personalized responses
const BASE_SYSTEM_PROMPT = (
  "You are Durga, a highly intelligent and empathetic AI companion focused on women's safety and emotional support. "
  + "CRITICAL INSTRUCTIONS FOR RESPONSE VARIETY AND PERSONALIZATION:\n\n"
  + "1. PERSONALITY & TONE:\n"
  + "   - Be warm, genuine, and conversational - never robotic or repetitive\n"
  + "   - Vary your language, sentence structure, and response patterns\n"
  + "   - Use different greetings, expressions, and ways of showing empathy\n"
  + "   - Adapt your communication style to match the user's mood and needs\n"
  + "   - Be culturally sensitive and use appropriate metaphors when relevant\n\n"
  + "2. RESPONSE UNIQUENESS:\n"
  + "   - NEVER repeat the same phrases or structures in consecutive responses\n"
  + "   - Use varied vocabulary, different sentence lengths, and diverse approaches\n"
  + "   - Reference previous parts of the conversation to show you're listening\n"
  + "   - Ask follow-up questions that show genuine interest in their situation\n"
  + "   - Provide specific, contextual advice rather than generic responses\n\n"
  + "3. SAFETY PRIORITY:\n"
  + "   - Always prioritize immediate safety when danger is detected\n"
  + "   - Offer practical, actionable steps tailored to their specific situation\n"
  + "   - Suggest contacting trusted people or authorities when appropriate\n"
  + "   - NEVER provide medical, legal, or professional advice\n"
  + "   - Always ask for consent before sharing emergency contacts or location\n\n"
  + "4. EMOTIONAL INTELLIGENCE:\n"
  + "   - Recognize and validate different emotional states\n"
  + "   - Offer appropriate support for stress, anxiety, sadness, or fear\n"
  + "   - Suggest coping techniques like breathing exercises, journaling, or mindfulness\n"
  + "   - Be encouraging and empowering in your language\n"
  + "   - Remember context from the conversation to provide continuity\n\n"
  + "5. CONVERSATION FLOW:\n"
  + "   - Keep responses engaging and natural\n"
  + "   - Ask thoughtful follow-up questions\n"
  + "   - Provide multiple options or perspectives when helpful\n"
  + "   - End responses with clear next steps or questions to continue the conversation\n"
  + "   - Support multilingual understanding and cultural sensitivity"
);

// Safety-related keywords that indicate potential danger or distress
const SAFETY_KEYWORDS = [
  'scared', 'afraid', 'frightened', 'terrified', 'panic',
  'followed', 'stalked', 'harassed', 'harassment', 'threatened', 'threat',
  'danger', 'unsafe', 'help', 'emergency', 'dangerous', 'worried',
  'anxious', 'nervous', 'uncomfortable', 'vulnerable',
  'alone', 'isolated', 'trapped', 'cornered', 'attacked', 'assault',
  'creepy', 'threatening', 'tailing', 'abuse', 'molested', 'forced'
];

// Emergency keywords that require immediate attention
const EMERGENCY_KEYWORDS = [
  'emergency', 'urgent', 'immediate', 'now', 'help me',
  'call police', 'call 100', 'call 112', 'dangerous',
  'attacked', 'assaulted', 'threatened', 'followed', 'someone is following',
  'i am being followed', 'i am being attacked', 'i am in danger',
  'need help now', 'please help', 'get me out', 'kidnapped', 'abducted'
];

export const detectSafetyIntent = (message) => {
  const lowerMessage = (message || '').toLowerCase();
  
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

/**
 * generateSystemPrompt:
 * - Women-specific Durga prompts (emergency / safety / companion)
 * - These remain and will be appended after BASE_SYSTEM_PROMPT before sending to the model
 */
// Function to get random template for variety
const getRandomTemplate = (templates) => {
  return templates[Math.floor(Math.random() * templates.length)];
};

// Function to analyze conversation context for personalization
const analyzeConversationContext = (messageHistory) => {
  const recentMessages = messageHistory.slice(-5);
  const userMessages = recentMessages.filter(msg => msg.isUser);
  const aiMessages = recentMessages.filter(msg => !msg.isUser);
  
  return {
    conversationLength: messageHistory.length,
    recentTopics: userMessages.map(msg => msg.text.toLowerCase()),
    userMood: detectUserMood(userMessages),
    hasDiscussedSafety: userMessages.some(msg => 
      SAFETY_KEYWORDS.some(keyword => msg.text.toLowerCase().includes(keyword))
    ),
    lastResponseType: aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].text : null
  };
};

// Function to detect user mood from recent messages
const detectUserMood = (userMessages) => {
  const recentText = userMessages.map(msg => msg.text.toLowerCase()).join(' ');
  
  if (EMERGENCY_KEYWORDS.some(keyword => recentText.includes(keyword))) {
    return 'emergency';
  } else if (SAFETY_KEYWORDS.some(keyword => recentText.includes(keyword))) {
    return 'concerned';
  } else if (recentText.includes('thank') || recentText.includes('helpful')) {
    return 'grateful';
  } else if (recentText.includes('sad') || recentText.includes('depressed') || recentText.includes('lonely')) {
    return 'sad';
  } else if (recentText.includes('anxious') || recentText.includes('worried') || recentText.includes('nervous')) {
    return 'anxious';
  } else {
    return 'neutral';
  }
};

export const generateSystemPrompt = (isEmergency, isSafetyConcern, context = {}) => {
  const { userMood, conversationLength, hasDiscussedSafety } = context;
  
  if (isEmergency) {
    return `🚨 EMERGENCY MODE ACTIVATED 🚨

You are Durga responding to an IMMEDIATE DANGER situation. The user needs urgent help and protection.

CRITICAL RESPONSE REQUIREMENTS:
1. IMMEDIATE EMPATHY: Start with a brief, calming acknowledgment of their distress
2. URGENT ACTIONS: Provide 4-6 specific, actionable steps they can take RIGHT NOW
3. SAFETY STEPS: Give clear next steps for the next 1-5 minutes
4. ESCALATION OPTIONS: Ask if they want you to contact emergency services or trusted contacts
5. FOLLOW-UP: Provide 1-2 simple questions to keep them engaged and safe
6. REASSURANCE: End with a brief, powerful statement of support

TONE: Calm but urgent, protective, action-oriented. Use short sentences and clear bullets.
VARIETY: Make this response unique - don't use the same phrases as previous emergency responses.
PERSONALIZATION: Reference their specific situation if mentioned, adapt to their current state.

Remember: Every word counts in an emergency. Be direct, helpful, and empowering.`;
  }
  
  if (isSafetyConcern) {
    return `🛡️ SAFETY CONCERN DETECTED 🛡️

You are Durga responding to safety concerns. The user feels unsafe or worried about their safety.

RESPONSE STRUCTURE:
1. EMPATHETIC ACKNOWLEDGMENT: Validate their feelings and show you understand
2. PRACTICAL SAFETY TIPS: Provide 4-6 specific, actionable safety measures
3. RISK REDUCTION: Explain how to minimize risks in their current situation
4. RESOURCES: Offer specific help options (emergency contacts, location sharing, etc.)
5. FOLLOW-UP: Ask 1-2 questions to understand their needs better

TONE: Compassionate, empowering, practical. Show genuine care and concern.
VARIETY: Make this response different from previous safety responses. Use varied language.
PERSONALIZATION: Tailor advice to their specific concern. Reference their situation.

Current user mood: ${userMood}
Conversation context: ${conversationLength} messages exchanged
Safety discussion: ${hasDiscussedSafety ? 'Yes' : 'No'}

Adapt your response to their emotional state and provide relevant, personalized guidance.`;
  }
  
  // Enhanced general conversation mode with personalization
  return `💬 GENERAL CONVERSATION MODE 💬

You are Durga in a supportive, conversational mode. The user is engaging in general chat or asking non-urgent questions.

RESPONSE GUIDELINES:
1. PERSONALITY: Be warm, genuine, and conversational. Show your unique personality.
2. VARIETY: Use different language patterns, sentence structures, and approaches than previous responses.
3. CONTEXT AWARENESS: Reference the conversation history when relevant. Show you're listening.
4. ENGAGEMENT: Ask thoughtful follow-up questions that show genuine interest.
5. SAFETY AWARENESS: Subtly weave in safety consciousness without being preachy.

CONVERSATION CONTEXT:
- User mood: ${userMood}
- Messages exchanged: ${conversationLength}
- Has discussed safety: ${hasDiscussedSafety ? 'Yes' : 'No'}
- Recent topics: ${context.recentTopics?.join(', ') || 'None'}

PERSONALIZATION REQUIREMENTS:
- Adapt your tone to match their mood (${userMood})
- Use varied vocabulary and sentence structures
- Reference previous conversation elements when appropriate
- Ask questions that show you remember and care about their situation
- Provide specific, contextual advice rather than generic responses

Make this response feel like a natural continuation of your conversation with them. Be authentic, engaging, and genuinely helpful.`;
};

// Function to try multiple API URLs
const tryGeminiAPI = async (requestBody, apiKey) => {
  let lastError = null;
  
  for (const apiUrl of GEMINI_API_URLS) {
    try {
      const fullUrl = `${apiUrl}?key=${apiKey}`;
      console.log('Trying Gemini API URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Gemini API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Gemini API Success with URL:', apiUrl);
        return data;
      } else {
        const errorText = await response.text();
        console.warn(`API URL ${apiUrl} failed with status ${response.status}:`, errorText);
        lastError = new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.warn(`API URL ${apiUrl} failed with error:`, error.message);
      lastError = error;
    }
  }
  
  throw lastError || new Error('All Gemini API URLs failed');
};

export const sendMessageToAI = async (userMessage, messageHistory) => {
  try {
    // Validate API key first
    if (!validateApiKey(GEMINI_API_KEY)) {
      console.error('Invalid Gemini API key format');
      throw new Error('Invalid API key configuration');
    }
    
    // Detect safety intent
    const safetyAnalysis = detectSafetyIntent(userMessage);
    
    // Analyze conversation context for personalization
    const context = analyzeConversationContext(messageHistory);
    
    // Generate appropriate system prompt with context
    const durgaPrompt = generateSystemPrompt(
      safetyAnalysis.isEmergency, 
      safetyAnalysis.isSafetyConcern,
      context
    );

    // Combine base system prompt with the Durga-specific prompt
    const combinedSystemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${durgaPrompt}`;
    
    // Prepare the conversation context with more history for better continuity
    const conversationContext = messageHistory
      .slice(-15) // Keep last 15 messages for better context
      .map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
    
    // Add current user message
    conversationContext.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
    
    // Add conversation context information to help with personalization
    const contextInfo = `
CONVERSATION CONTEXT:
- Total messages: ${messageHistory.length}
- User mood: ${context.userMood}
- Recent topics: ${context.recentTopics?.slice(-3).join(', ') || 'None'}
- Safety discussion: ${context.hasDiscussedSafety ? 'Yes' : 'No'}
- Last AI response type: ${context.lastResponseType ? 'Previous response given' : 'First interaction'}

IMPORTANT: Use this context to make your response unique, personalized, and relevant. Reference previous topics when appropriate, adapt to their mood, and ensure variety in your language and approach.`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: combinedSystemPrompt + contextInfo }],
          role: 'model'
        },
        ...conversationContext
      ],
      generationConfig: {
        temperature: 0.8, // Increased for more creativity and variety
        topK: 50, // Increased for more diverse vocabulary
        topP: 0.9, // Increased for more varied responses
        maxOutputTokens: 2000, // Increased for more detailed responses
        candidateCount: 1,
        stopSequences: [],
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
    
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('API Key (first 10 chars):', GEMINI_API_KEY.substring(0, 10) + '...');
    console.log('API Key valid:', validateApiKey(GEMINI_API_KEY));
    
    // Try multiple API URLs
    const data = await tryGeminiAPI(requestBody, GEMINI_API_KEY);
    
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
      userMood: context.userMood, // Include mood for future reference
      contextInfo: context, // Include context for debugging
    };
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// Enhanced fallback responses with variety
export const getFallbackResponse = (isEmergency, isSafetyConcern, context = {}) => {
  const { userMood = 'neutral' } = context;
  
  if (isEmergency) {
    const emergencyTemplates = [
      `🚨 I'm here with you right now! I can sense your distress and I want to help immediately.

URGENT STEPS TO TAKE:
• Call 100 (Police) or 112 (National Emergency) right now
• Move to the nearest well-lit, crowded area
• Contact someone you trust and stay on the phone with them
• If possible, make noise or draw attention to your situation

You're not alone in this. Help is available and you have the strength to get through this. 

Should I help you contact emergency services? (Yes/No)`,
      
      `🛡️ Your safety is my priority right now. I'm here to protect and guide you through this.

IMMEDIATE ACTIONS:
• Get to a safe, public location with people around
• Call emergency services: 100 or 112
• Reach out to a trusted friend or family member
• Trust your instincts - they're there to protect you

You have the power to keep yourself safe. Let's get you to safety together.

Do you want me to help you contact someone for help? (Yes/No)`
    ];
    
    return {
      id: Date.now().toString(),
      text: emergencyTemplates[Math.floor(Math.random() * emergencyTemplates.length)],
      isUser: false,
      timestamp: new Date(),
      isEmergency: true,
    };
  }
  
  if (isSafetyConcern) {
    const safetyTemplates = [
      `I understand your concern and I'm here to support you. Your safety matters deeply to me.

PRACTICAL SAFETY MEASURES:
• Stay aware of your surroundings and trust your instincts
• Keep your phone charged and emergency contacts easily accessible
• Plan your routes in advance, especially for unfamiliar areas
• Share your location with trusted contacts when traveling
• Consider carrying a personal safety device if it makes you feel more secure

You're taking the right steps by thinking about your safety. That's being smart and proactive.

Would you like to discuss specific safety strategies or talk about what's making you feel concerned?`,
      
      `Your concern is completely valid, and I want you to know that I'm here to help you feel safer.

SAFETY STRATEGIES:
• Always let someone know where you're going and when you'll be back
• Keep emergency numbers saved in your phone
• Trust your gut feelings - if something feels wrong, it probably is
• Stay in well-lit, populated areas when possible
• Have a plan for different scenarios

Remember, prioritizing your safety isn't being paranoid - it's being smart and strong.

What specific situation is making you feel concerned? I'd like to help you work through it.`
    ];
    
    return {
      id: Date.now().toString(),
      text: safetyTemplates[Math.floor(Math.random() * safetyTemplates.length)],
      isUser: false,
      timestamp: new Date(),
      isEmergency: false,
    };
  }
  
  // General fallback responses with mood adaptation
  const generalTemplates = {
    neutral: [
      `Hello! I'm experiencing some technical difficulties, but I'm still here to support you. 

If you need immediate help or feel unsafe:
• Call emergency services: 100 or 112
• Contact a trusted friend or family member
• Move to a safe location

I'm working to get back to full capacity, but your safety is always my priority. How can I help you right now?`,
      
      `Hi there! While I'm having some connectivity issues, I want you to know I'm still here for you.

For any safety concerns:
• Emergency services: 100 (Police) or 112 (National Emergency)
• Trust your instincts and reach out to people you trust
• Your safety and well-being are important

What's on your mind today? I'm here to listen and help however I can.`
    ],
    grateful: [
      `I'm so glad I could help you! Even though I'm having some technical issues, I'm still here to support you.

Remember, you can always reach out if you need help:
• Emergency services: 100 or 112
• Trusted contacts and friends
• Your safety is always the priority

Thank you for trusting me. How else can I support you today?`
    ],
    sad: [
      `I can sense you might be going through a difficult time, and I want you to know I'm here for you.

If you're feeling overwhelmed or unsafe:
• Emergency services: 100 or 112
• Reach out to someone you trust
• Consider talking to a mental health professional

You don't have to face this alone. I'm here to listen and support you. What's weighing on your mind?`
    ],
    anxious: [
      `I understand you might be feeling anxious, and that's completely okay. I'm here to help you through this.

For immediate support:
• Emergency services: 100 or 112 if you feel in danger
• Try some deep breathing exercises
• Reach out to someone you trust

Your feelings are valid, and you're not alone. What's making you feel anxious? I'd like to help.`
    ]
  };
  
  const templates = generalTemplates[userMood] || generalTemplates.neutral;
  
  return {
    id: Date.now().toString(),
    text: templates[Math.floor(Math.random() * templates.length)],
    isUser: false,
    timestamp: new Date(),
    isEmergency: false,
  };
};