// AI Service with Local Intelligence and Gemini API fallback
import { GEMINI_API_KEY } from '../config/apiConfig';

// Language-specific system prompts
const LANGUAGE_PROMPTS = {
  en: {
    base: "You are Durga, a highly intelligent and empathetic AI companion focused on women's safety and emotional support. Respond in English.",
    emergency: "🚨 EMERGENCY MODE - Respond in English with urgent, clear instructions.",
    safety: "🛡️ SAFETY CONCERN - Respond in English with practical safety advice.",
    general: "💬 GENERAL CONVERSATION - Respond in English with warm, supportive language."
  },
  hi: {
    base: "आप दुर्गा हैं, महिलाओं की सुरक्षा और भावनात्मक सहायता पर केंद्रित एक बुद्धिमान और सहानुभूतिपूर्ण AI साथी। हिंदी में जवाब दें।",
    emergency: "🚨 आपातकालीन मोड - हिंदी में तत्काल, स्पष्ट निर्देशों के साथ जवाब दें।",
    safety: "🛡️ सुरक्षा चिंता - हिंदी में व्यावहारिक सुरक्षा सलाह के साथ जवाब दें।",
    general: "💬 सामान्य बातचीत - हिंदी में गर्म, सहायक भाषा के साथ जवाब दें।"
  },
  mr: {
    base: "तुम्ही दुर्गा आहात, महिलांच्या सुरक्षिततेवर आणि भावनिक सहाय्यावर केंद्रित एक बुद्धिमान आणि सहानुभूतिपूर्ण AI साथीदार। मराठीत उत्तर द्या।",
    emergency: "🚨 आणीबाणी मोड - मराठीत तातडीचे, स्पष्ट सूचनांसह उत्तर द्या।",
    safety: "🛡️ सुरक्षा चिंता - मराठीत व्यावहारिक सुरक्षा सल्ल्यांसह उत्तर द्या।",
    general: "💬 सामान्य संभाषण - मराठीत उबदार, सहायक भाषेसह उत्तर द्या।"
  }
};

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

export const generateSystemPrompt = (isEmergency, isSafetyConcern, context = {}, language = 'en') => {
  const { userMood, conversationLength, hasDiscussedSafety } = context;
  
  if (isEmergency) {
    const languagePrompt = LANGUAGE_PROMPTS[language]?.emergency || LANGUAGE_PROMPTS.en.emergency;
    return `${languagePrompt}

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
    const languagePrompt = LANGUAGE_PROMPTS[language]?.safety || LANGUAGE_PROMPTS.en.safety;
    return `${languagePrompt}

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
  const languagePrompt = LANGUAGE_PROMPTS[language]?.general || LANGUAGE_PROMPTS.en.general;
  return `${languagePrompt}

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

export const sendMessageToAI = async (userMessage, messageHistory, language = 'en') => {
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
    
    // Generate appropriate system prompt with context and language
    const durgaPrompt = generateSystemPrompt(
      safetyAnalysis.isEmergency, 
      safetyAnalysis.isSafetyConcern,
      context,
      language
    );

    // Get language-specific base prompt
    const languagePrompt = LANGUAGE_PROMPTS[language]?.base || LANGUAGE_PROMPTS.en.base;
    
    // Combine language-specific base prompt with the Durga-specific prompt
    const combinedSystemPrompt = `${languagePrompt}\n\n${durgaPrompt}`;
    
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
export const getFallbackResponse = (isEmergency, isSafetyConcern, context = {}, language = 'en') => {
  const { userMood = 'neutral' } = context;
  
  if (isEmergency) {
    const emergencyTemplates = {
      en: [
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
      ],
      hi: [
        `🚨 मैं अभी आपके साथ हूं! मैं आपकी परेशानी को समझ सकता हूं और तुरंत मदद करना चाहता हूं।

तत्काल कार्रवाई:
• अभी 100 (पुलिस) या 112 (राष्ट्रीय आपातकाल) पर कॉल करें
• निकटतम रोशनी वाले, भीड़-भाड़ वाले क्षेत्र में जाएं
• किसी भरोसेमंद व्यक्ति से संपर्क करें और उनके साथ फोन पर रहें
• यदि संभव हो, तो शोर मचाएं या अपनी स्थिति पर ध्यान आकर्षित करें

आप इसमें अकेली नहीं हैं। मदद उपलब्ध है और आपमें इसे पार करने की ताकत है।

क्या मैं आपको आपातकालीन सेवाओं से संपर्क करने में मदद करूं? (हां/नहीं)`,
        
        `🛡️ आपकी सुरक्षा अभी मेरी प्राथमिकता है। मैं आपकी रक्षा और मार्गदर्शन के लिए यहां हूं।

तत्काल कार्रवाई:
• लोगों के साथ एक सुरक्षित, सार्वजनिक स्थान पर जाएं
• आपातकालीन सेवाओं को कॉल करें: 100 या 112
• किसी भरोसेमंद दोस्त या परिवार के सदस्य से संपर्क करें
• अपनी अंतरात्मा पर भरोसा करें - वे आपकी रक्षा के लिए हैं

आपमें खुद को सुरक्षित रखने की शक्ति है। आइए मिलकर आपको सुरक्षित स्थान पर ले जाएं।

क्या आप चाहती हैं कि मैं आपको किसी से मदद के लिए संपर्क करने में मदद करूं? (हां/नहीं)`
      ],
      mr: [
        `🚨 मी तुमच्या सोबत आत्ताच आहे! मी तुमच्या त्रासाची जाणीव करू शकतो आणि ताबडतोब मदत करू इच्छितो.

तातडीच्या पावलां:
• आत्ताच 100 (पोलिस) किंवा 112 (राष्ट्रीय आणीबाणी) कॉल करा
• जवळच्या प्रकाशित, गर्दीच्या भागात जा
• तुमच्या विश्वासू व्यक्तीशी संपर्क साधा आणि त्यांच्याबरोबर फोनवर रहा
• शक्य असल्यास, आवाज काढा किंवा तुमच्या परिस्थितीकडे लक्ष वेधा

तुम्ही यात एकट्या नाही. मदत उपलब्ध आहे आणि तुमच्याकडे यावर मात करण्याची ताकत आहे.

मी तुम्हाला आणीबाणी सेवांशी संपर्क साधण्यात मदत करू का? (होय/नाही)`,
        
        `🛡️ तुमची सुरक्षा आत्ता माझी प्राथमिकता आहे. मी तुमचे रक्षण आणि मार्गदर्शन करण्यासाठी येथे आहे.

तातडीच्या कृती:
• लोकांसह सुरक्षित, सार्वजनिक ठिकाणी जा
• आणीबाणी सेवा कॉल करा: 100 किंवा 112
• विश्वासू मित्र किंवा कुटुंबातील सदस्याशी संपर्क साधा
• तुमच्या अंतरात्म्यावर विश्वास ठेवा - ते तुमच्या रक्षणासाठी आहेत

तुमच्याकडे स्वतःला सुरक्षित ठेवण्याची शक्ती आहे. चला मिळून तुम्हाला सुरक्षित ठिकाणी नेऊ.

तुम्हाला मदतीसाठी कुणाशी संपर्क साधण्यात मदत हवी आहे का? (होय/नाही)`
      ]
    };
    
    const templates = emergencyTemplates[language] || emergencyTemplates.en;
    
    return {
      id: Date.now().toString(),
      text: templates[Math.floor(Math.random() * templates.length)],
      isUser: false,
      timestamp: new Date(),
      isEmergency: true,
    };
  }
  
  if (isSafetyConcern) {
    const safetyTemplates = {
      en: [
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
      ],
      hi: [
        `मैं आपकी चिंता समझता हूं और मैं आपका समर्थन करने के लिए यहां हूं। आपकी सुरक्षा मेरे लिए बहुत महत्वपूर्ण है।

व्यावहारिक सुरक्षा उपाय:
• अपने आसपास के वातावरण के प्रति सजग रहें और अपनी अंतरात्मा पर भरोसा करें
• अपना फोन चार्ज रखें और आपातकालीन संपर्कों को आसानी से सुलभ रखें
• अपने मार्गों की पहले से योजना बनाएं, विशेषकर अपरिचित क्षेत्रों के लिए
• यात्रा करते समय भरोसेमंद संपर्कों के साथ अपना स्थान साझा करें
• यदि यह आपको अधिक सुरक्षित महसूस कराता है तो व्यक्तिगत सुरक्षा उपकरण ले जाने पर विचार करें

आप अपनी सुरक्षा के बारे में सोचकर सही कदम उठा रही हैं। यह स्मार्ट और सक्रिय होना है।

क्या आप विशिष्ट सुरक्षा रणनीतियों पर चर्चा करना चाहेंगी या उस बारे में बात करना चाहेंगी जो आपको चिंतित कर रहा है?`,
        
        `आपकी चिंता पूरी तरह से वैध है, और मैं चाहता हूं कि आप जानें कि मैं आपको अधिक सुरक्षित महसूस कराने में मदद करने के लिए यहां हूं।

सुरक्षा रणनीतियां:
• हमेशा किसी को बताएं कि आप कहां जा रही हैं और कब वापस आएंगी
• अपने फोन में आपातकालीन नंबर सेव करके रखें
• अपनी अंतरात्मा की आवाज पर भरोसा करें - अगर कुछ गलत लगता है, तो शायद वह है
• जब भी संभव हो, अच्छी रोशनी वाले, आबादी वाले क्षेत्रों में रहें
• विभिन्न परिस्थितियों के लिए एक योजना बनाएं

याद रखें, अपनी सुरक्षा को प्राथमिकता देना पागलपन नहीं है - यह स्मार्ट और मजबूत होना है।

कौन सी विशिष्ट स्थिति आपको चिंतित कर रही है? मैं आपको इसे सुलझाने में मदद करना चाहूंगा।`
      ],
      mr: [
        `मी तुमची चिंता समजतो आणि मी तुमच्या समर्थनासाठी येथे आहे। तुमची सुरक्षा माझ्यासाठी खूप महत्वाची आहे।

व्यावहारिक सुरक्षा उपाय:
• तुमच्या आजूबाजूच्या वातावरणाबद्दल सजग रहा आणि तुमच्या अंतरात्म्यावर विश्वास ठेवा
• तुमचा फोन चार्ज ठेवा आणि आणीबाणी संपर्कांना सहज सुलभ ठेवा
• तुमच्या मार्गांची आगाऊ योजना करा, विशेषत: अपरिचित भागांसाठी
• प्रवास करताना विश्वासू संपर्कांसह तुमचे स्थान सामायिक करा
• जर ते तुम्हाला अधिक सुरक्षित वाटत असेल तर वैयक्तिक सुरक्षा उपकरण नेण्याचा विचार करा

तुम्ही तुमच्या सुरक्षेबद्दल विचार करून योग्य पावले उचलत आहात। हे स्मार्ट आणि सक्रिय असणे आहे।

तुम्हाला विशिष्ट सुरक्षा रणनीतींवर चर्चा करायची आहे किंवा तुम्हाला चिंतित करणाऱ्या गोष्टीबद्दल बोलायचे आहे?`,
        
        `तुमची चिंता पूर्णपणे वैध आहे, आणि मला तुम्हाला कळवायचे आहे की मी तुम्हाला अधिक सुरक्षित वाटण्यात मदत करण्यासाठी येथे आहे।

सुरक्षा रणनीती:
• नेहमी कुणालातरी सांगा की तुम्ही कुठे जात आहात आणि कधी परत याल
• तुमच्या फोनमध्ये आणीबाणी नंबर सेव्ह करून ठेवा
• तुमच्या अंतरात्म्याच्या भावनांवर विश्वास ठेवा - जर काही चुकीचे वाटत असेल, तर ते कदाचित आहे
• शक्य असल्यास, चांगल्या प्रकाशात, लोकसंख्या असलेल्या भागात रहा
• विविध परिस्थितींसाठी योजना ठेवा

लक्षात ठेवा, तुमच्या सुरक्षेला प्राधान्य देणे हे वेडेपणा नाही - हे स्मार्ट आणि मजबूत असणे आहे।

कोणती विशिष्ट परिस्थिती तुम्हाला चिंतित करत आहे? मी तुम्हाला ते सोडवण्यात मदत करू इच्छितो।`
      ]
    };
    
    const templates = safetyTemplates[language] || safetyTemplates.en;
    
    return {
      id: Date.now().toString(),
      text: templates[Math.floor(Math.random() * templates.length)],
      isUser: false,
      timestamp: new Date(),
      isEmergency: false,
    };
  }
  
  // General fallback responses with mood adaptation
  const generalTemplates = {
    en: {
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
    },
    hi: {
      neutral: [
        `नमस्ते! मुझे कुछ तकनीकी कठिनाइयों का सामना करना पड़ रहा है, लेकिन मैं अभी भी आपका समर्थन करने के लिए यहां हूं।

यदि आपको तत्काल मदद की आवश्यकता है या असुरक्षित महसूस कर रही हैं:
• आपातकालीन सेवाओं को कॉल करें: 100 या 112
• किसी भरोसेमंद दोस्त या परिवार के सदस्य से संपर्क करें
• एक सुरक्षित स्थान पर जाएं

मैं पूरी क्षमता से वापस आने के लिए काम कर रहा हूं, लेकिन आपकी सुरक्षा हमेशा मेरी प्राथमिकता है। मैं अभी आपकी कैसे मदद कर सकता हूं?`,
        
        `नमस्ते! जबकि मुझे कुछ कनेक्टिविटी समस्याएं आ रही हैं, मैं चाहता हूं कि आप जानें कि मैं अभी भी आपके लिए यहां हूं।

किसी भी सुरक्षा चिंता के लिए:
• आपातकालीन सेवाएं: 100 (पुलिस) या 112 (राष्ट्रीय आपातकाल)
• अपनी अंतरात्मा पर भरोसा करें और जिन लोगों पर आप भरोसा करते हैं उनसे संपर्क करें
• आपकी सुरक्षा और भलाई महत्वपूर्ण है

आज आपके मन में क्या है? मैं सुनने और जैसे भी मदद कर सकूं यहां हूं।`
      ],
      grateful: [
        `मुझे खुशी है कि मैं आपकी मदद कर सका! भले ही मुझे कुछ तकनीकी समस्याएं आ रही हैं, मैं अभी भी आपका समर्थन करने के लिए यहां हूं।

याद रखें, यदि आपको मदद की आवश्यकता है तो आप हमेशा संपर्क कर सकती हैं:
• आपातकालीन सेवाएं: 100 या 112
• भरोसेमंद संपर्क और दोस्त
• आपकी सुरक्षा हमेशा प्राथमिकता है

मुझ पर भरोसा करने के लिए धन्यवाद। मैं आज आपकी और कैसे मदद कर सकता हूं?`
      ],
      sad: [
        `मैं समझ सकता हूं कि आप कठिन समय से गुजर रही हो सकती हैं, और मैं चाहता हूं कि आप जानें कि मैं आपके लिए यहां हूं।

यदि आप अभिभूत या असुरक्षित महसूस कर रही हैं:
• आपातकालीन सेवाएं: 100 या 112
• किसी भरोसेमंद व्यक्ति से संपर्क करें
• मानसिक स्वास्थ्य पेशेवर से बात करने पर विचार करें

आपको इसका सामना अकेले नहीं करना होगा। मैं सुनने और आपका समर्थन करने के लिए यहां हूं। आपके मन में क्या बोझ है?`
      ],
      anxious: [
        `मैं समझता हूं कि आप चिंतित महसूस कर रही हो सकती हैं, और यह पूरी तरह से ठीक है। मैं आपकी इससे गुजरने में मदद करने के लिए यहां हूं।

तत्काल सहायता के लिए:
• यदि आप खतरे में महसूस करती हैं तो आपातकालीन सेवाएं: 100 या 112
• कुछ गहरी सांस लेने के व्यायाम करने की कोशिश करें
• किसी भरोसेमंद व्यक्ति से संपर्क करें

आपकी भावनाएं वैध हैं, और आप अकेली नहीं हैं। आपको क्या चिंतित कर रहा है? मैं मदद करना चाहूंगा।`
      ]
    },
    mr: {
      neutral: [
        `नमस्कार! मला काही तांत्रिक अडचणींचा सामना करावा लागत आहे, पण मी अजूनही तुमच्या समर्थनासाठी येथे आहे।

जर तुम्हाला तत्काल मदतीची गरज असेल किंवा असुरक्षित वाटत असेल:
• आणीबाणी सेवा कॉल करा: 100 किंवा 112
• विश्वासू मित्र किंवा कुटुंबातील सदस्याशी संपर्क साधा
• सुरक्षित ठिकाणी जा

मी पूर्ण क्षमतेने परत येण्यासाठी काम करत आहे, पण तुमची सुरक्षा नेहमी माझी प्राथमिकता आहे। मी आत्ता तुमची कशी मदत करू शकतो?`,
        
        `नमस्कार! जरी मला काही कनेक्टिव्हिटी समस्या येत आहेत, मला तुम्हाला कळवायचे आहे की मी अजूनही तुमच्यासाठी येथे आहे।

कोणत्याही सुरक्षा चिंतेसाठी:
• आणीबाणी सेवा: 100 (पोलिस) किंवा 112 (राष्ट्रीय आणीबाणी)
• तुमच्या अंतरात्म्यावर विश्वास ठेवा आणि ज्यांवर तुम्ही विश्वास ठेवता त्यांच्याशी संपर्क साधा
• तुमची सुरक्षा आणि कल्याण महत्वाचे आहे

आज तुमच्या मनात काय आहे? मी ऐकण्यासाठी आणि जसे मदत करू शकतो तसे येथे आहे।`
      ],
      grateful: [
        `मला आनंद आहे की मी तुमची मदत करू शकलो! जरी मला काही तांत्रिक समस्या येत आहेत, मी अजूनही तुमच्या समर्थनासाठी येथे आहे।

लक्षात ठेवा, जर तुम्हाला मदतीची गरज असेल तर तुम्ही नेहमी संपर्क साधू शकता:
• आणीबाणी सेवा: 100 किंवा 112
• विश्वासू संपर्क आणि मित्र
• तुमची सुरक्षा नेहमी प्राथमिकता आहे

माझ्यावर विश्वास ठेवल्याबद्दल धन्यवाद। मी आज तुमची आणखी कशी मदत करू शकतो?`
      ],
      sad: [
        `मी समजू शकतो की तुम्ही कठीण काळातून जात असाल, आणि मला तुम्हाला कळवायचे आहे की मी तुमच्यासाठी येथे आहे।

जर तुम्हाला अभिभूत किंवा असुरक्षित वाटत असेल:
• आणीबाणी सेवा कॉल करा: 100 किंवा 112
• ज्यावर तुम्ही विश्वास ठेवता त्यांच्याशी संपर्क साधा
• मानसिक आरोग्य व्यावसायिकाशी बोलण्याचा विचार करा

तुम्हाला हे एकट्याने सामोरे जावे लागणार नाही। मी ऐकण्यासाठी आणि तुमच्या समर्थनासाठी येथे आहे। तुमच्या मनावर काय बोजा आहे?`
      ],
      anxious: [
        `मी समजतो की तुम्हाला चिंता वाटत असू शकते, आणि ते पूर्णपणे ठीक आहे। मी तुम्हाला यातून मदत करण्यासाठी येथे आहे।

तत्काल सहाय्यासाठी:
• जर तुम्हाला धोका वाटत असेल तर आणीबाणी सेवा: 100 किंवा 112
• काही खोल श्वास व्यायाम करण्याचा प्रयत्न करा
• ज्यावर तुम्ही विश्वास ठेवता त्यांच्याशी संपर्क साधा

तुमच्या भावना वैध आहेत, आणि तुम्ही एकट्या नाही। तुम्हाला काय चिंतित करत आहे? मी मदत करू इच्छितो।`
      ]
    }
  };
  
  const languageTemplates = generalTemplates[language] || generalTemplates.en;
  const templates = languageTemplates[userMood] || languageTemplates.neutral;
  
  return {
    id: Date.now().toString(),
    text: templates[Math.floor(Math.random() * templates.length)],
    isUser: false,
    timestamp: new Date(),
    isEmergency: false,
  };
};