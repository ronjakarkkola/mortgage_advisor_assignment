// ─── Core domain types ────────────────────────────────────────────────────────

export type Page = 'dashboard' | 'documents' | 'assistant' | 'profile';
export type EmploymentStatus = 'employed' | 'self_employed';
export type DocumentCategory = 'employment' | 'financial' | 'debt' | 'identity';
export type MessageRole = 'user' | 'assistant';

export type DocumentStatus =
  | 'missing'
  | 'analyzing'
  | 'verified'
  | 'outdated'
  | 'duplicate'
  | 'incomplete'
  | 'unreadable'
  | 'needs_review'
  | 'wrong'
  | 'unsupported';

// ─── Document types ────────────────────────────────────────────────────────────

export interface DocumentTypeMeta {
  id: string;
  label: string;
  category: DocumentCategory;
  /** Points this doc contributes toward the readiness score */
  weight: number;
  required: boolean;
  /** If set, only shown for this employment status */
  appliesTo?: EmploymentStatus;
  description: string;
}

export interface DocumentState {
  status: DocumentStatus;
  fileName: string | null;
  fileSize: number;
  extracted: Record<string, string>;
  note: string | null;
  uploadedAt?: Date;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  employmentStatus: EmploymentStatus;
  employer: string;
  jobTitle: string;
  employmentDuration: string;
  targetPropertyValue: string;
  desiredMonthlyPayment: string;
  housingType: string;
  city: string;
  moveInTimeframe: string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  proactive?: boolean;
  suggestAdvisor?: boolean;
}

// ─── Application lifecycle ────────────────────────────────────────────────────

export interface ProgressStep {
  title: string;
  done: boolean;
  current?: boolean;
}

export interface NextStep {
  text: string;
  sub: string;
  action: string;
  actionLabel: string;
}

export interface Insight {
  id: string;
  text: string;
  timestamp: Date;
}

export interface AdvisorContact {
  id: string;
  type: 'message' | 'callback' | 'help';
  text: string;
  status: 'Sent' | 'Received by advisor';
  timestamp: Date;
}

// ─── Knowledge base ───────────────────────────────────────────────────────────

export interface KBEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

// ─── App context state / actions ──────────────────────────────────────────────

export interface AppState {
  page: Page;
  profile: CustomerProfile;
  documents: Record<string, DocumentState>;
  conversation: Message[];
  insights: Insight[];
  advisorContacts: AdvisorContact[];
  advisorReviewRequested: boolean;
  openAIKey: string;
  suggestions: string[];
}

export interface AppActions {
  setPage: (page: Page) => void;
  updateProfile: (profile: CustomerProfile) => void;
  startUpload: (docId: string, fileName: string, fileSize: number) => void;
  finishUpload: (docId: string, status: DocumentStatus, extracted: Record<string, string>, note: string | null) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Message;
  pushInsight: (text: string) => void;
  pushProactive: (text: string) => void;
  contactAdvisor: (type: AdvisorContact['type'], text: string) => void;
  setAdvisorReviewRequested: (v: boolean) => void;
  setOpenAIKey: (key: string) => void;
  setSuggestions: (chips: string[]) => void;
  clearConversation: () => void;
}

export type AppContextType = AppState & AppActions;
