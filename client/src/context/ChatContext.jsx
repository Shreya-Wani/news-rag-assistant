import { createContext, useContext, useReducer, useCallback, useRef } from "react";
import chatService from "../services/chatService.js";
import toast from "react-hot-toast";

// ── Context ────────────────────────────────────────────────────────
const ChatContext = createContext(null);

// ── Action Types ───────────────────────────────────────────────────
const ACTIONS = {
  ADD_USER_MESSAGE: "ADD_USER_MESSAGE",
  ADD_AI_MESSAGE: "ADD_AI_MESSAGE",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_ANALYZING: "SET_ANALYZING",
  SET_ANALYSIS: "SET_ANALYSIS",
  CLEAR_CHAT: "CLEAR_CHAT",
  UPDATE_MESSAGE: "UPDATE_MESSAGE",
};

// ── Reducer ────────────────────────────────────────────────────────
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_USER_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: Date.now(),
            role: "user",
            content: action.payload,
            timestamp: new Date().toISOString(),
          },
        ],
        error: null,
      };

    case ACTIONS.ADD_AI_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: Date.now(),
            role: "ai",
            content: action.payload.answer,
            sources: action.payload.sources || [],
            retrievedChunks: action.payload.retrievedChunks || 0,
            latency: action.payload.latency || {},
            analysis: null,
            timestamp: new Date().toISOString(),
          },
        ],
        loading: false,
      };

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.SET_ANALYZING:
      return { ...state, analyzingId: action.payload };

    case ACTIONS.SET_ANALYSIS: {
      const { messageId, analysis } = action.payload;
      return {
        ...state,
        analyzingId: null,
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, analysis } : msg
        ),
      };
    }

    case ACTIONS.CLEAR_CHAT:
      return { ...initialState };

    case ACTIONS.UPDATE_MESSAGE: {
      const { messageId, updates } = action.payload;
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      };
    }

    default:
      return state;
  }
};

// ── Initial State ──────────────────────────────────────────────────
const initialState = {
  messages: [],
  loading: false,
  error: null,
  analyzingId: null,
};

// ── Provider ───────────────────────────────────────────────────────
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortControllerRef = useRef(null);

  // Send a question to the RAG pipeline
  const sendMessage = useCallback(async (question) => {
    if (!question.trim()) return;

    dispatch({ type: ACTIONS.ADD_USER_MESSAGE, payload: question.trim() });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await chatService.sendMessage(question.trim());
      dispatch({ type: ACTIONS.ADD_AI_MESSAGE, payload: response.data });
    } catch (err) {
      const errorMsg = err.message || "Failed to get response";
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMsg });
      toast.error(errorMsg);
    }
  }, []);

  // Analyze an AI response
  const analyzeMessage = useCallback(async (messageId, responseText) => {
    dispatch({ type: ACTIONS.SET_ANALYZING, payload: messageId });

    try {
      const response = await chatService.analyzeResponse(responseText);
      dispatch({
        type: ACTIONS.SET_ANALYSIS,
        payload: { messageId, analysis: response.data.analysis },
      });
      toast.success("Analysis complete!");
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ANALYZING, payload: null });
      toast.error(err.message || "Analysis failed");
    }
  }, []);

  // Clear all messages
  const clearChat = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CHAT });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    sendMessage,
    analyzeMessage,
    clearChat,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ── Hook ───────────────────────────────────────────────────────────
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
