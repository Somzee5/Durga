import React, { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext();

const initialState = {
  messages: [
    {
      id: '1',
      text: ' Namaste! I am Durga, your divine safety companion. I am here to protect, guide, and support you with divine strength and wisdom. How may I assist you today?',
      isUser: false,
      timestamp: new Date(),
      isEmergency: false,
    }
  ],
  isLoading: false,
  isEmergencyMode: false,
  sessionId: Date.now().toString(),
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_EMERGENCY_MODE':
      return {
        ...state,
        isEmergencyMode: action.payload,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [initialState.messages[0]],
        isEmergencyMode: false,
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = (message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setEmergencyMode = (emergency) => {
    dispatch({ type: 'SET_EMERGENCY_MODE', payload: emergency });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const value = {
    ...state,
    addMessage,
    setLoading,
    setEmergencyMode,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
