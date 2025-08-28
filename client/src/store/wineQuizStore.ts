import { create } from 'zustand';

export interface WineTeam {
  id: number;
  name: string;
  color: string;
  qrCode?: string;
  maxMembers?: number;
  icon?: string;
}

export interface WineUser {
  id: number;
  name: string;
  teamId?: number;
  isLeader?: boolean;
  sessionToken?: string;
  deviceFingerprint?: string;
  createdAt?: string;
}

export interface WineGameSession {
  id: number;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  gameMode: 'individual' | 'leader';
  status: 'pending' | 'active' | 'finished';
  currentQuestionId?: number;
  currentRoundId?: number;
}

export interface WineRound {
  id: number;
  sessionId: number;
  roundNumber: number;
  name: string;
  wineType?: string;
  description?: string;
  status: 'pending' | 'active' | 'finished';
  startTime?: string;
  endTime?: string;
  questionIds?: number[];
}

export interface WineQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'dropdown' | 'autocomplete';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: 'a' | 'b' | 'c' | 'd';
  options?: string[];
  correctAnswer?: string;
  weight: number;
  roundId: number;
}

export interface WineAnswer {
  id: number;
  sessionId: number;
  questionId: number;
  userId: number;
  roundId: number;
  selectedOption?: 'a' | 'b' | 'c' | 'd';
  textAnswer?: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
  answeredAt: string;
}

export interface WineUserSessionState {
  id: number;
  userId: number;
  sessionId: number;
  roundId?: number;
  currentQuestionId?: number;
  questionStartTime?: string;
  timeRemaining?: number;
  selectedOption?: 'a' | 'b' | 'c' | 'd';
  textAnswerDraft?: string;
  hasAnsweredCurrent: boolean;
  isRoundCompleted: boolean;
  isQuizCompleted: boolean;
  lastActivity: string;
  lastSyncedAt: string;
  deviceFingerprint?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  teamId: number;
  teamName: string;
  color: string;
  icon?: string;
  totalScore: number;
  position?: number;
}

export interface WineQuizState {
  // Auth state
  user: WineUser | null;
  token: string | null;
  isAdmin: boolean;
  
  // Game state
  currentSession: WineGameSession | null;
  currentRound: WineRound | null;
  currentQuestion: WineQuestion | null;
  userSessionState: WineUserSessionState | null;
  
  // Data
  teams: WineTeam[];
  sessions: WineGameSession[];
  rounds: WineRound[];
  questions: WineQuestion[];
  answers: WineAnswer[];
  leaderboard: LeaderboardEntry[];
  
  // WebSocket state
  isConnected: boolean;
  connectedUsers: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: WineUser | null) => void;
  setToken: (token: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setCurrentSession: (session: WineGameSession | null) => void;
  setCurrentRound: (round: WineRound | null) => void;
  setCurrentQuestion: (question: WineQuestion | null) => void;
  setUserSessionState: (state: WineUserSessionState | null) => void;
  setTeams: (teams: WineTeam[]) => void;
  setSessions: (sessions: WineGameSession[]) => void;
  setRounds: (rounds: WineRound[]) => void;
  setQuestions: (questions: WineQuestion[]) => void;
  setAnswers: (answers: WineAnswer[]) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setIsConnected: (isConnected: boolean) => void;
  setConnectedUsers: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Complex actions
  addAnswer: (answer: WineAnswer) => void;
  updateSessionState: (updates: Partial<WineUserSessionState>) => void;
  updateLeaderboard: (entry: LeaderboardEntry) => void;
  resetGameState: () => void;
  logout: () => void;
}

export const useWineQuizStore = create<WineQuizState>((set, get) => ({
  // Initial state
  user: null,
  token: localStorage.getItem('wine_quiz_token'),
  isAdmin: false,
  currentSession: null,
  currentRound: null,
  currentQuestion: null,
  userSessionState: null,
  teams: [],
  sessions: [],
  rounds: [],
  questions: [],
  answers: [],
  leaderboard: [],
  isConnected: false,
  connectedUsers: 0,
  loading: false,
  error: null,

  // Simple setters
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('wine_quiz_token', token);
    } else {
      localStorage.removeItem('wine_quiz_token');
    }
    set({ token });
  },
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setCurrentRound: (round) => set({ currentRound: round }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setUserSessionState: (state) => set({ userSessionState: state }),
  setTeams: (teams) => set({ teams }),
  setSessions: (sessions) => set({ sessions }),
  setRounds: (rounds) => set({ rounds }),
  setQuestions: (questions) => set({ questions }),
  setAnswers: (answers) => set({ answers }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setConnectedUsers: (count) => set({ connectedUsers: count }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Complex actions
  addAnswer: (answer) => set((state) => ({
    answers: [...state.answers, answer]
  })),

  updateSessionState: (updates) => set((state) => ({
    userSessionState: state.userSessionState 
      ? { ...state.userSessionState, ...updates }
      : null
  })),

  updateLeaderboard: (entry) => set((state) => {
    const existingIndex = state.leaderboard.findIndex(item => item.teamId === entry.teamId);
    if (existingIndex >= 0) {
      const newLeaderboard = [...state.leaderboard];
      newLeaderboard[existingIndex] = entry;
      return { leaderboard: newLeaderboard.sort((a, b) => b.totalScore - a.totalScore) };
    } else {
      return { 
        leaderboard: [...state.leaderboard, entry]
          .sort((a, b) => b.totalScore - a.totalScore) 
      };
    }
  }),

  resetGameState: () => set({
    currentSession: null,
    currentRound: null,
    currentQuestion: null,
    userSessionState: null,
    answers: [],
    leaderboard: [],
    isConnected: false,
    connectedUsers: 0,
    error: null
  }),

  logout: () => {
    localStorage.removeItem('wine_quiz_token');
    set({
      user: null,
      token: null,
      isAdmin: false,
      currentSession: null,
      currentRound: null,
      currentQuestion: null,
      userSessionState: null,
      sessions: [],
      rounds: [],
      questions: [],
      answers: [],
      leaderboard: [],
      isConnected: false,
      connectedUsers: 0,
      error: null
    });
  }
}));