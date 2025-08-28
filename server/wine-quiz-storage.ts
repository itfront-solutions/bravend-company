import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import {
  wineTeams, wineUsers, wineQuestions, wineGameSessions, wineAnswers, wineAdmins, 
  wineRounds, wineRoundResults, wineTeamRegistrations, wineUserSessionState,
  type WineTeam, type InsertWineTeam, type WineUser, type InsertWineUser,
  type WineQuestion, type InsertWineQuestion, type WineGameSession, type InsertWineGameSession,
  type WineAnswer, type InsertWineAnswer, type WineAdmin, type InsertWineAdmin, 
  type WineRound, type InsertWineRound, type WineRoundResult, type InsertWineRoundResult,
  type WineTeamRegistration, type InsertWineTeamRegistration,
  type WineUserSessionState, type InsertWineUserSessionState
} from '@shared/wine-quiz-schema';

export interface IWineQuizStorage {
  // Admin methods
  getAdminByEmail(email: string): Promise<WineAdmin | undefined>;
  createAdmin(admin: InsertWineAdmin): Promise<WineAdmin>;
  verifyAdminPassword(email: string, password: string): Promise<boolean>;

  // Team methods
  getAllTeams(): Promise<WineTeam[]>;
  createTeam(team: InsertWineTeam): Promise<WineTeam>;
  getTeamById(id: number): Promise<WineTeam | undefined>;
  getTeamMemberCount(teamId: number): Promise<number>;

  // User methods
  createUser(user: InsertWineUser): Promise<WineUser>;
  getUsersByTeam(teamId: number): Promise<WineUser[]>;
  getUserBySessionToken(token: string): Promise<WineUser | undefined>;
  setUserAsLeader(userId: number, teamId: number): Promise<void>;
  clearAllUsers(): Promise<void>;
  clearAllAnswers(): Promise<void>;

  // Question methods
  getAllQuestions(): Promise<WineQuestion[]>;
  createQuestion(question: InsertWineQuestion): Promise<WineQuestion>;
  updateQuestion(id: number, question: Partial<WineQuestion>): Promise<WineQuestion>;
  deleteQuestion(id: number): Promise<void>;
  getQuestionById(id: number): Promise<WineQuestion | undefined>;
  searchQuestionOptions(questionId: number, searchTerm: string): Promise<string[]>;

  // Game session methods
  createGameSession(session: InsertWineGameSession): Promise<WineGameSession>;
  getCurrentSession(): Promise<WineGameSession | undefined>;
  getLastSession(): Promise<WineGameSession | undefined>;
  updateSession(id: number, updates: Partial<WineGameSession>): Promise<WineGameSession>;
  getSessionById(id: number): Promise<WineGameSession | undefined>;

  // Answer methods
  createAnswer(answer: InsertWineAnswer): Promise<WineAnswer>;
  getAnswersByQuestion(questionId: number, sessionId: number): Promise<WineAnswer[]>;
  getUserAnswerForQuestion(userId: number, questionId: number, sessionId: number): Promise<WineAnswer | undefined>;

  // Round methods
  createRound(round: InsertWineRound): Promise<WineRound>;
  getRoundsBySession(sessionId: number): Promise<WineRound[]>;
  getRoundById(id: number): Promise<WineRound | undefined>;
  updateRound(id: number, updates: Partial<WineRound>): Promise<WineRound>;
  getCurrentRound(sessionId: number): Promise<WineRound | undefined>;
  finishRound(roundId: number): Promise<void>;
  
  // Scoreboard methods
  getTeamScores(sessionId: number): Promise<Array<{ teamId: number; teamName: string; totalScore: number; }>>;
  getTeamScoresByRound(sessionId: number, roundId: number): Promise<Array<{ teamId: number; teamName: string; totalScore: number; }>>;
  getTopThreeTeams(sessionId: number): Promise<Array<{ teamId: number; teamName: string; totalScore: number; position: number; }>>;
  getTotalQuestionsBySession(sessionId: number): Promise<number>;
  
  // Team registration methods
  createTeamRegistration(registration: InsertWineTeamRegistration): Promise<WineTeamRegistration>;
  getTeamRegistration(teamId: number, sessionId: number): Promise<WineTeamRegistration | undefined>;
  updateTeamRegistration(teamId: number, sessionId: number, customName: string): Promise<WineTeamRegistration>;
  
  // Round results methods
  saveRoundResults(sessionId: number, roundId: number): Promise<WineRoundResult[]>;
  getRoundResults(sessionId: number, roundId?: number): Promise<WineRoundResult[]>;
  
  // Helper methods
  getActiveLeaders(): Promise<Array<{ id: number; name: string; teamId: number; }>>;
  updateUserToken(userId: number, newToken: string): Promise<void>;
  getUsersWhoAnswered(questionId: number, sessionId: number, roundId?: number): Promise<number[]>;
  getNextUnansweredQuestion(answeredQuestionIds: number[]): Promise<WineQuestion | undefined>;
  getUserUnansweredQuestions(userId: number, sessionId: number, roundId?: number): Promise<WineQuestion[]>;
  getUserAnsweredQuestions(userId: number, sessionId: number): Promise<WineAnswer[]>;
  getAllUsers(): Promise<WineUser[]>;
  
  // Session management
  checkAllLeadersAnswered(sessionId: number, questionId: number): Promise<boolean>;
  getNextQuestion(currentQuestionId: number): Promise<WineQuestion | undefined>;
  getAnswersReview(sessionId: number): Promise<any[]>;
  cleanupExpiredSessions(): Promise<void>;
  validateUserSession(sessionToken: string): Promise<boolean>;
  refreshUserSession(userId: number): Promise<string>;
  validateTeamLeadership(teamId: number): Promise<{ isValid: boolean; issues: string[] }>;

  // Session state methods
  getUserSessionState(userId: number, sessionId: number): Promise<WineUserSessionState | undefined>;
  saveUserSessionState(state: InsertWineUserSessionState): Promise<WineUserSessionState>;
  updateUserSessionState(userId: number, sessionId: number, updates: Partial<WineUserSessionState>): Promise<WineUserSessionState>;
  clearUserSessionState(userId: number): Promise<void>;
}

export class WineQuizMemStorage implements IWineQuizStorage {
  private teams: Map<number, WineTeam>;
  private users: Map<number, WineUser>;
  private questions: Map<number, WineQuestion>;
  private gameSessions: Map<number, WineGameSession>;
  private answers: Map<number, WineAnswer>;
  private admins: Map<number, WineAdmin>;
  private rounds: Map<number, WineRound>;
  private roundResults: Map<number, WineRoundResult>;
  private teamRegistrations: Map<number, WineTeamRegistration>;
  private userSessionStates: Map<string, WineUserSessionState>; // key: userId-sessionId

  constructor() {
    this.teams = new Map();
    this.users = new Map();
    this.questions = new Map();
    this.gameSessions = new Map();
    this.answers = new Map();
    this.admins = new Map();
    this.rounds = new Map();
    this.roundResults = new Map();
    this.teamRegistrations = new Map();
    this.userSessionStates = new Map();
    
    this.initializeMockData();
  }

  private async initializeMockData() {
    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin: WineAdmin = {
      id: 1,
      email: 'admin@winequiz.com',
      password: hashedPassword
    };
    this.admins.set(1, admin);

    // Create teams
    const teams: WineTeam[] = [
      { id: 1, name: 'Mesa 1', color: '#8B5CF6', qrCode: 'wine-quiz-team-1', maxMembers: 4, icon: 'wine' },
      { id: 2, name: 'Mesa 2', color: '#06B6D4', qrCode: 'wine-quiz-team-2', maxMembers: 4, icon: 'terroir' },
      { id: 3, name: 'Mesa 3', color: '#10B981', qrCode: 'wine-quiz-team-3', maxMembers: 4, icon: 'grappes' },
      { id: 4, name: 'Mesa 4', color: '#F59E0B', qrCode: 'wine-quiz-team-4', maxMembers: 4, icon: 'champagne' },
      { id: 5, name: 'Mesa 5', color: '#EF4444', qrCode: 'wine-quiz-team-5', maxMembers: 4, icon: 'maturation' }
    ];
    teams.forEach(team => this.teams.set(team.id, team));

    // Create sample questions
    const questions: WineQuestion[] = [
      {
        id: 1,
        questionText: 'Qual região é famosa pelo vinho Champagne?',
        questionType: 'multiple_choice',
        optionA: 'Borgonha',
        optionB: 'Champagne',
        optionC: 'Bordeaux',
        optionD: 'Loire',
        correctOption: 'b',
        options: null,
        correctAnswer: null,
        weight: 10,
        roundId: null
      },
      {
        id: 2,
        questionText: 'Qual uva é usada para fazer Chablis?',
        questionType: 'autocomplete',
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        correctOption: null,
        options: ['Chardonnay', 'Sauvignon Blanc', 'Pinot Noir', 'Merlot', 'Cabernet Sauvignon', 'Riesling', 'Gewürztraminer'],
        correctAnswer: 'Chardonnay',
        weight: 15,
        roundId: null
      },
      {
        id: 3,
        questionText: 'Em que ano foi estabelecida a classificação de 1855 de Bordeaux?',
        questionType: 'multiple_choice',
        optionA: '1854',
        optionB: '1855',
        optionC: '1856',
        optionD: '1860',
        correctOption: 'b',
        options: null,
        correctAnswer: null,
        weight: 20,
        roundId: null
      },
      {
        id: 4,
        questionText: 'Qual prato harmoniza melhor com Pinot Noir?',
        questionType: 'multiple_choice',
        optionA: 'Peixe grelhado',
        optionB: 'Salada verde',
        optionC: 'Cordeiro assado',
        optionD: 'Queijos frescos',
        correctOption: 'c',
        options: null,
        correctAnswer: null,
        weight: 10,
        roundId: null
      },
      {
        id: 5,
        questionText: 'Quantos anos um vinho pode envelhecer em carvalho?',
        questionType: 'autocomplete',
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        correctOption: null,
        options: ['6 meses', '1 ano', '2 anos', '3 anos', '5 anos', '10 anos', '15 anos', '20 anos'],
        correctAnswer: '2 anos',
        weight: 15,
        roundId: null
      }
    ];
    questions.forEach(question => this.questions.set(question.id, question));
  }

  // Admin methods
  async getAdminByEmail(email: string): Promise<WineAdmin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(adminData: InsertWineAdmin): Promise<WineAdmin> {
    const id = Math.max(...Array.from(this.admins.keys()), 0) + 1;
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const admin: WineAdmin = { 
      id, 
      email: adminData.email, 
      password: hashedPassword 
    };
    this.admins.set(id, admin);
    return admin;
  }

  async verifyAdminPassword(email: string, password: string): Promise<boolean> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return false;
    return await bcrypt.compare(password, admin.password);
  }

  // Team methods
  async getAllTeams(): Promise<WineTeam[]> {
    return Array.from(this.teams.values());
  }

  async createTeam(teamData: InsertWineTeam): Promise<WineTeam> {
    const id = Math.max(...Array.from(this.teams.keys()), 0) + 1;
    const team: WineTeam = { id, ...teamData };
    this.teams.set(id, team);
    return team;
  }

  async getTeamById(id: number): Promise<WineTeam | undefined> {
    return this.teams.get(id);
  }

  async getTeamMemberCount(teamId: number): Promise<number> {
    return Array.from(this.users.values()).filter(user => user.teamId === teamId).length;
  }

  // User methods
  async createUser(userData: InsertWineUser): Promise<WineUser> {
    const id = Math.max(...Array.from(this.users.keys()), 0) + 1;
    const user: WineUser = { 
      id, 
      ...userData,
      sessionToken: userData.sessionToken || nanoid(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUsersByTeam(teamId: number): Promise<WineUser[]> {
    return Array.from(this.users.values()).filter(user => user.teamId === teamId);
  }

  async getUserBySessionToken(token: string): Promise<WineUser | undefined> {
    return Array.from(this.users.values()).find(user => user.sessionToken === token);
  }

  async setUserAsLeader(userId: number, teamId: number): Promise<void> {
    // Clear any existing leaders for this team
    Array.from(this.users.values())
      .filter(user => user.teamId === teamId)
      .forEach(user => {
        user.isLeader = false;
        this.users.set(user.id, user);
      });
    
    // Set new leader
    const user = this.users.get(userId);
    if (user) {
      user.isLeader = true;
      this.users.set(userId, user);
    }
  }

  async clearAllUsers(): Promise<void> {
    this.users.clear();
  }

  async clearAllAnswers(): Promise<void> {
    this.answers.clear();
  }

  async getAllUsers(): Promise<WineUser[]> {
    return Array.from(this.users.values());
  }

  // Question methods
  async getAllQuestions(): Promise<WineQuestion[]> {
    return Array.from(this.questions.values());
  }

  async createQuestion(questionData: InsertWineQuestion): Promise<WineQuestion> {
    const id = Math.max(...Array.from(this.questions.keys()), 0) + 1;
    const question: WineQuestion = { id, ...questionData };
    this.questions.set(id, question);
    return question;
  }

  async updateQuestion(id: number, updates: Partial<WineQuestion>): Promise<WineQuestion> {
    const question = this.questions.get(id);
    if (!question) throw new Error('Question not found');
    
    const updatedQuestion = { ...question, ...updates };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<void> {
    this.questions.delete(id);
  }

  async getQuestionById(id: number): Promise<WineQuestion | undefined> {
    return this.questions.get(id);
  }

  async searchQuestionOptions(questionId: number, searchTerm: string): Promise<string[]> {
    const question = this.questions.get(questionId);
    if (!question || !question.options) return [];
    
    return question.options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Game session methods
  async createGameSession(sessionData: InsertWineGameSession): Promise<WineGameSession> {
    const id = Math.max(...Array.from(this.gameSessions.keys()), 0) + 1;
    const session: WineGameSession = { id, ...sessionData };
    this.gameSessions.set(id, session);
    return session;
  }

  async getCurrentSession(): Promise<WineGameSession | undefined> {
    return Array.from(this.gameSessions.values())
      .find(session => session.status === 'active');
  }

  async getLastSession(): Promise<WineGameSession | undefined> {
    const sessions = Array.from(this.gameSessions.values());
    return sessions.sort((a, b) => b.id - a.id)[0];
  }

  async updateSession(id: number, updates: Partial<WineGameSession>): Promise<WineGameSession> {
    const session = this.gameSessions.get(id);
    if (!session) throw new Error('Session not found');
    
    const updatedSession = { ...session, ...updates };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getSessionById(id: number): Promise<WineGameSession | undefined> {
    return this.gameSessions.get(id);
  }

  // Answer methods
  async createAnswer(answerData: InsertWineAnswer): Promise<WineAnswer> {
    const id = Math.max(...Array.from(this.answers.keys()), 0) + 1;
    const answer: WineAnswer = { 
      id, 
      ...answerData, 
      answeredAt: new Date()
    };
    this.answers.set(id, answer);
    return answer;
  }

  async getAnswersByQuestion(questionId: number, sessionId: number): Promise<WineAnswer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.questionId === questionId && answer.sessionId === sessionId);
  }

  async getUserAnswerForQuestion(userId: number, questionId: number, sessionId: number): Promise<WineAnswer | undefined> {
    return Array.from(this.answers.values())
      .find(answer => answer.userId === userId && answer.questionId === questionId && answer.sessionId === sessionId);
  }

  // Scoreboard methods
  async getTeamScores(sessionId: number): Promise<Array<{ teamId: number; teamName: string; totalScore: number; }>> {
    const teamScores = new Map<number, { teamId: number; teamName: string; totalScore: number; }>();
    
    // Get all answers for this session
    const sessionAnswers = Array.from(this.answers.values())
      .filter(answer => answer.sessionId === sessionId);
    
    // Calculate scores for each team
    for (const answer of sessionAnswers) {
      const user = this.users.get(answer.userId!);
      if (!user || !user.teamId) continue;
      
      const team = this.teams.get(user.teamId);
      if (!team) continue;
      
      const teamRegistration = Array.from(this.teamRegistrations.values())
        .find(reg => reg.teamId === user.teamId && reg.sessionId === sessionId);
      
      const teamName = teamRegistration?.customTeamName || team.name;
      
      if (!teamScores.has(user.teamId)) {
        teamScores.set(user.teamId, {
          teamId: user.teamId,
          teamName,
          totalScore: 0
        });
      }
      
      const teamScore = teamScores.get(user.teamId)!;
      teamScore.totalScore += answer.pointsAwarded || 0;
    }
    
    return Array.from(teamScores.values()).sort((a, b) => b.totalScore - a.totalScore);
  }

  async getTeamScoresByRound(sessionId: number, roundId: number): Promise<Array<{ teamId: number; teamName: string; totalScore: number; }>> {
    return this.getTeamScores(sessionId); // For simplicity, return all scores
  }

  async getTopThreeTeams(sessionId: number): Promise<Array<{ teamId: number; teamName: string; totalScore: number; position: number; }>> {
    const scores = await this.getTeamScores(sessionId);
    return scores.slice(0, 3).map((score, index) => ({
      ...score,
      position: index + 1
    }));
  }

  async getTotalQuestionsBySession(sessionId: number): Promise<number> {
    return this.questions.size;
  }

  // Placeholder implementations for other methods
  async createRound(roundData: InsertWineRound): Promise<WineRound> {
    const id = Math.max(...Array.from(this.rounds.keys()), 0) + 1;
    const round: WineRound = { 
      id, 
      ...roundData,
      startTime: roundData.startTime || null,
      endTime: roundData.endTime || null
    };
    this.rounds.set(id, round);
    return round;
  }

  async getRoundsBySession(sessionId: number): Promise<WineRound[]> {
    return Array.from(this.rounds.values()).filter(round => round.sessionId === sessionId);
  }

  async getRoundById(id: number): Promise<WineRound | undefined> {
    return this.rounds.get(id);
  }

  async updateRound(id: number, updates: Partial<WineRound>): Promise<WineRound> {
    const round = this.rounds.get(id);
    if (!round) throw new Error('Round not found');
    
    const updatedRound = { ...round, ...updates };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }

  async getCurrentRound(sessionId: number): Promise<WineRound | undefined> {
    return Array.from(this.rounds.values())
      .find(round => round.sessionId === sessionId && round.status === 'active');
  }

  async finishRound(roundId: number): Promise<void> {
    const round = this.rounds.get(roundId);
    if (round) {
      round.status = 'finished';
      round.endTime = new Date();
      this.rounds.set(roundId, round);
    }
  }

  async createTeamRegistration(regData: InsertWineTeamRegistration): Promise<WineTeamRegistration> {
    const id = Math.max(...Array.from(this.teamRegistrations.keys()), 0) + 1;
    const registration: WineTeamRegistration = { 
      id, 
      ...regData,
      registeredAt: new Date()
    };
    this.teamRegistrations.set(id, registration);
    return registration;
  }

  async getTeamRegistration(teamId: number, sessionId: number): Promise<WineTeamRegistration | undefined> {
    return Array.from(this.teamRegistrations.values())
      .find(reg => reg.teamId === teamId && reg.sessionId === sessionId);
  }

  async updateTeamRegistration(teamId: number, sessionId: number, customName: string): Promise<WineTeamRegistration> {
    let registration = await this.getTeamRegistration(teamId, sessionId);
    
    if (!registration) {
      registration = await this.createTeamRegistration({
        teamId,
        sessionId,
        customTeamName: customName
      });
    } else {
      registration.customTeamName = customName;
      this.teamRegistrations.set(registration.id, registration);
    }
    
    return registration;
  }

  // Simple implementations for remaining methods
  async saveRoundResults(sessionId: number, roundId: number): Promise<WineRoundResult[]> { return []; }
  async getRoundResults(sessionId: number, roundId?: number): Promise<WineRoundResult[]> { return []; }
  async getActiveLeaders(): Promise<Array<{ id: number; name: string; teamId: number; }>> {
    return Array.from(this.users.values())
      .filter(user => user.isLeader)
      .map(user => ({ id: user.id, name: user.name, teamId: user.teamId! }));
  }
  async updateUserToken(userId: number, newToken: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.sessionToken = newToken;
      this.users.set(userId, user);
    }
  }
  async getUsersWhoAnswered(questionId: number, sessionId: number, roundId?: number): Promise<number[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.questionId === questionId && answer.sessionId === sessionId)
      .map(answer => answer.userId!);
  }
  async getNextUnansweredQuestion(answeredQuestionIds: number[]): Promise<WineQuestion | undefined> {
    return Array.from(this.questions.values())
      .find(question => !answeredQuestionIds.includes(question.id));
  }
  async getUserUnansweredQuestions(userId: number, sessionId: number, roundId?: number): Promise<WineQuestion[]> {
    const answeredIds = Array.from(this.answers.values())
      .filter(answer => answer.userId === userId && answer.sessionId === sessionId)
      .map(answer => answer.questionId!);
    
    return Array.from(this.questions.values())
      .filter(question => !answeredIds.includes(question.id));
  }
  async getUserAnsweredQuestions(userId: number, sessionId: number): Promise<WineAnswer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.userId === userId && answer.sessionId === sessionId);
  }
  async checkAllLeadersAnswered(sessionId: number, questionId: number): Promise<boolean> {
    const leaders = await this.getActiveLeaders();
    const answers = await this.getAnswersByQuestion(questionId, sessionId);
    const leaderIds = leaders.map(l => l.id);
    
    return leaderIds.every(leaderId => 
      answers.some(answer => answer.userId === leaderId)
    );
  }
  async getNextQuestion(currentQuestionId: number): Promise<WineQuestion | undefined> {
    const questions = Array.from(this.questions.values()).sort((a, b) => a.id - b.id);
    const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
    return questions[currentIndex + 1];
  }
  async getAnswersReview(sessionId: number): Promise<any[]> { return []; }
  async cleanupExpiredSessions(): Promise<void> {}
  async validateUserSession(sessionToken: string): Promise<boolean> {
    return !!await this.getUserBySessionToken(sessionToken);
  }
  async refreshUserSession(userId: number): Promise<string> {
    const newToken = nanoid();
    await this.updateUserToken(userId, newToken);
    return newToken;
  }
  async validateTeamLeadership(teamId: number): Promise<{ isValid: boolean; issues: string[] }> {
    return { isValid: true, issues: [] };
  }

  // Session state methods
  async getUserSessionState(userId: number, sessionId: number): Promise<WineUserSessionState | undefined> {
    return this.userSessionStates.get(`${userId}-${sessionId}`);
  }

  async saveUserSessionState(stateData: InsertWineUserSessionState): Promise<WineUserSessionState> {
    const id = Math.max(...Array.from(this.userSessionStates.values()).map(s => s.id), 0) + 1;
    const state: WineUserSessionState = {
      id,
      ...stateData,
      lastActivity: new Date(),
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userSessionStates.set(`${stateData.userId}-${stateData.sessionId}`, state);
    return state;
  }

  async updateUserSessionState(userId: number, sessionId: number, updates: Partial<WineUserSessionState>): Promise<WineUserSessionState> {
    const key = `${userId}-${sessionId}`;
    const existing = this.userSessionStates.get(key);
    
    if (!existing) {
      throw new Error('User session state not found');
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.userSessionStates.set(key, updated);
    return updated;
  }

  async clearUserSessionState(userId: number): Promise<void> {
    // Remove all session states for this user
    for (const [key, state] of this.userSessionStates) {
      if (state.userId === userId) {
        this.userSessionStates.delete(key);
      }
    }
  }
}

export const wineQuizStorage = new WineQuizMemStorage();