import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import type {
  AppContextType,
  AppState,
  Page,
  CustomerProfile,
  DocumentStatus,
  Message,
  AdvisorContact,
} from '@/types';
import {
  DEMO_PROFILE,
  DEMO_DOCUMENTS,
  INITIAL_INSIGHTS,
  INITIAL_SUGGESTIONS,
} from '@/data/demoData';

// ─── Initial state ─────────────────────────────────────────────────────────────

function getInitialState(): AppState {
  return {
    page: 'dashboard',
    profile: { ...DEMO_PROFILE },
    documents: { ...DEMO_DOCUMENTS },
    conversation: [
      {
        id: 'msg-seed',
        role: 'assistant',
        content:
          "Hello Dylan, I'm Silta — your AI mortgage assistant. I can explain mortgage concepts, walk you through what's required, and reference your profile and uploaded documents to give you personalised guidance. Your mortgage advisor will always validate anything that matters for a final decision. How can I help today?",
        timestamp: new Date(),
      },
    ],
    insights: INITIAL_INSIGHTS,
    advisorContacts: [],
    advisorReviewRequested: false,
    openAIKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
    suggestions: INITIAL_SUGGESTIONS,
  };
}

// ─── Action types ──────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'UPDATE_PROFILE'; profile: CustomerProfile }
  | { type: 'START_UPLOAD'; docId: string; fileName: string; fileSize: number }
  | { type: 'FINISH_UPLOAD'; docId: string; status: DocumentStatus; extracted: Record<string, string>; note: string | null }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'ADD_INSIGHT'; id: string; text: string }
  | { type: 'CONTACT_ADVISOR'; contact: AdvisorContact }
  | { type: 'SET_ADVISOR_REVIEW'; value: boolean }
  | { type: 'SET_OPENAI_KEY'; key: string }
  | { type: 'SET_SUGGESTIONS'; chips: string[] }
  | { type: 'CLEAR_CONVERSATION' };

// ─── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page };

    case 'UPDATE_PROFILE':
      return { ...state, profile: action.profile };

    case 'START_UPLOAD':
      return {
        ...state,
        documents: {
          ...state.documents,
          [action.docId]: {
            status: 'analyzing',
            fileName: action.fileName,
            fileSize: action.fileSize,
            extracted: {},
            note: null,
            uploadedAt: new Date(),
          },
        },
      };

    case 'FINISH_UPLOAD':
      return {
        ...state,
        documents: {
          ...state.documents,
          [action.docId]: {
            ...state.documents[action.docId],
            status: action.status,
            extracted: action.extracted,
            note: action.note,
          },
        },
      };

    case 'ADD_MESSAGE':
      return { ...state, conversation: [...state.conversation, action.message] };

    case 'ADD_INSIGHT':
      return {
        ...state,
        insights: [
          { id: action.id, text: action.text, timestamp: new Date() },
          ...state.insights.slice(0, 7),
        ],
      };

    case 'CONTACT_ADVISOR':
      return {
        ...state,
        advisorContacts: [action.contact, ...state.advisorContacts],
      };

    case 'SET_ADVISOR_REVIEW':
      return { ...state, advisorReviewRequested: action.value };

    case 'SET_OPENAI_KEY':
      return { ...state, openAIKey: action.key };

    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.chips };

    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        conversation: [
          {
            id: 'msg-seed-' + Date.now(),
            role: 'assistant',
            content:
              "Hello! I'm Silta, your AI mortgage assistant. How can I help you today?",
            timestamp: new Date(),
          },
        ],
      };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  const setPage = useCallback((page: Page) => dispatch({ type: 'SET_PAGE', page }), []);

  const updateProfile = useCallback(
    (profile: CustomerProfile) => dispatch({ type: 'UPDATE_PROFILE', profile }),
    []
  );

  const startUpload = useCallback(
    (docId: string, fileName: string, fileSize: number) =>
      dispatch({ type: 'START_UPLOAD', docId, fileName, fileSize }),
    []
  );

  const finishUpload = useCallback(
    (
      docId: string,
      status: DocumentStatus,
      extracted: Record<string, string>,
      note: string | null
    ) => dispatch({ type: 'FINISH_UPLOAD', docId, status, extracted, note }),
    []
  );

  const addMessage = useCallback(
    (msg: Omit<Message, 'id' | 'timestamp'>): Message => {
      const message: Message = {
        ...msg,
        id: 'msg-' + Math.random().toString(36).slice(2) + Date.now().toString(36),
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', message });
      return message;
    },
    []
  );

  const pushInsight = useCallback((text: string) => {
    dispatch({
      type: 'ADD_INSIGHT',
      id: 'ins-' + Math.random().toString(36).slice(2),
      text,
    });
  }, []);

  const pushProactive = useCallback(
    (text: string) => {
      pushInsight(text);
      const message: Message = {
        id: 'pro-' + Math.random().toString(36).slice(2),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        proactive: true,
      };
      dispatch({ type: 'ADD_MESSAGE', message });
    },
    [pushInsight]
  );

  const contactAdvisor = useCallback(
    (type: AdvisorContact['type'], text: string) => {
      const contact: AdvisorContact = {
        id: 'adv-' + Math.random().toString(36).slice(2),
        type,
        text,
        status: 'Sent',
        timestamp: new Date(),
      };
      dispatch({ type: 'CONTACT_ADVISOR', contact });
      // Simulate advisor receiving after 4 seconds
      setTimeout(() => {
        dispatch({
          type: 'CONTACT_ADVISOR',
          contact: { ...contact, status: 'Received by advisor' },
        });
      }, 4000);
    },
    []
  );

  const setAdvisorReviewRequested = useCallback(
    (v: boolean) => dispatch({ type: 'SET_ADVISOR_REVIEW', value: v }),
    []
  );

  const setOpenAIKey = useCallback(
    (key: string) => dispatch({ type: 'SET_OPENAI_KEY', key }),
    []
  );

  const setSuggestions = useCallback(
    (chips: string[]) => dispatch({ type: 'SET_SUGGESTIONS', chips }),
    []
  );

  const clearConversation = useCallback(
    () => dispatch({ type: 'CLEAR_CONVERSATION' }),
    []
  );

  const value = useMemo<AppContextType>(
    () => ({
      ...state,
      setPage,
      updateProfile,
      startUpload,
      finishUpload,
      addMessage,
      pushInsight,
      pushProactive,
      contactAdvisor,
      setAdvisorReviewRequested,
      setOpenAIKey,
      setSuggestions,
      clearConversation,
    }),
    [
      state,
      setPage,
      updateProfile,
      startUpload,
      finishUpload,
      addMessage,
      pushInsight,
      pushProactive,
      contactAdvisor,
      setAdvisorReviewRequested,
      setOpenAIKey,
      setSuggestions,
      clearConversation,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
