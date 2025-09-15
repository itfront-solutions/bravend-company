import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, desc, sql, inArray, ne } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { 
  teams, users, gameSessions, rounds, questions, answers, admins, 
  roundResults, teamRegistrations, userSessionState, wineGlossary 
} from '../shared/wine-quiz-schema-complete.js';

export interface WineQuizCompleteStorage {
  // Session Management
  createGameSession(data: { game_mode: 'individual' | 'leader', start_time?: Date }): Promise<any>;
  getActiveGameSession(): Promise<any>;
  updateGameSessionStatus(sessionId: number, status: 'pending' | 'active' | 'finished'): Promise<void>;
  
  // Team Management
  getTeams(): Promise<any[]>;
  createTeam(data: { name: string, color: string, qr_code?: string, max_members?: number, icon?: string }): Promise<any>;
  getTeamById(id: number): Promise<any>;
  
  // User Management
  createUser(data: { name: string, team_id?: number, is_leader?: boolean, session_token?: string, device_fingerprint?: string }): Promise<any>;
  getUserBySessionToken(token: string): Promise<any>;
  updateUserLeaderStatus(userId: number, isLeader: boolean): Promise<void>;
  
  // Question Management
  getQuestions(limit?: number): Promise<any[]>;
  getQuestionsByRound(roundId: number): Promise<any[]>;
  createQuestion(data: any): Promise<any>;
  updateQuestion(id: number, data: any): Promise<void>;
  deleteQuestion(id: number): Promise<void>;
  
  // Round Management
  createRound(data: any): Promise<any>;
  getRoundsBySession(sessionId: number): Promise<any[]>;
  updateRoundStatus(roundId: number, status: 'pending' | 'active' | 'finished'): Promise<void>;
  
  // Answer Management
  submitAnswer(data: any): Promise<any>;
  getAnswersBySession(sessionId: number): Promise<any[]>;
  getAnswersByUser(userId: number): Promise<any[]>;
  
  // Session State Management (Key feature from WineQuizMobile_new)
  saveUserSessionState(data: any): Promise<any>;
  getUserSessionState(userId: number, sessionId: number): Promise<any>;
  updateUserProgress(userId: number, sessionId: number, data: any): Promise<void>;
  
  // Scoring and Results
  calculateTeamScores(sessionId: number): Promise<any[]>;
  saveRoundResults(data: any): Promise<any>;
  getLeaderboard(sessionId: number): Promise<any[]>;
  
  // Wine Glossary (Hint system)
  getGlossaryTerms(category?: string): Promise<any[]>;
  searchGlossary(term: string): Promise<any[]>;
  
  // Admin Management
  validateAdmin(email: string, password: string): Promise<boolean>;
  
  // Database Setup
  initializeDatabase(): Promise<void>;
  createTables(): Promise<void>;
}

export class WineQuizCompleteStorageImpl implements WineQuizCompleteStorage {
  private db: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set.');
    }
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  // Session Management
  async createGameSession(data: { game_mode: 'individual' | 'leader', start_time?: Date }) {
    const [session] = await this.db.insert(gameSessions).values({
      game_mode: data.game_mode,
      start_time: data.start_time || new Date(),
      status: 'pending'
    }).returning();
    return session;
  }

  async getActiveGameSession() {
    const [session] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'active'))
      .limit(1);
    return session;
  }

  async updateGameSessionStatus(sessionId: number, status: 'pending' | 'active' | 'finished') {
    await this.db
      .update(gameSessions)
      .set({ status, ...(status === 'finished' && { end_time: new Date() }) })
      .where(eq(gameSessions.id, sessionId));
  }

  // Team Management
  async getTeams() {
    return await this.db.select().from(teams);
  }

  async createTeam(data: { name: string, color: string, qr_code?: string, max_members?: number, icon?: string }) {
    const [team] = await this.db.insert(teams).values(data).returning();
    return team;
  }

  async getTeamById(id: number) {
    const [team] = await this.db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  // User Management
  async createUser(data: { name: string, team_id?: number, is_leader?: boolean, session_token?: string, device_fingerprint?: string }) {
    const [user] = await this.db.insert(users).values({
      ...data,
      created_at: new Date()
    }).returning();
    return user;
  }

  async getUserBySessionToken(token: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.session_token, token));
    return user;
  }

  async updateUserLeaderStatus(userId: number, isLeader: boolean) {
    await this.db
      .update(users)
      .set({ is_leader: isLeader })
      .where(eq(users.id, userId));
  }

  // Question Management
  async getQuestions(limit?: number) {
    let query = this.db.select().from(questions);
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async getQuestionsByRound(roundId: number) {
    return await this.db
      .select()
      .from(questions)
      .where(eq(questions.round_id, roundId));
  }

  async createQuestion(data: any) {
    const [question] = await this.db.insert(questions).values(data).returning();
    return question;
  }

  async updateQuestion(id: number, data: any) {
    await this.db
      .update(questions)
      .set(data)
      .where(eq(questions.id, id));
  }

  async deleteQuestion(id: number) {
    await this.db.delete(questions).where(eq(questions.id, id));
  }

  // Round Management
  async createRound(data: any) {
    const [round] = await this.db.insert(rounds).values(data).returning();
    return round;
  }

  async getRoundsBySession(sessionId: number) {
    return await this.db
      .select()
      .from(rounds)
      .where(eq(rounds.session_id, sessionId));
  }

  async updateRoundStatus(roundId: number, status: 'pending' | 'active' | 'finished') {
    await this.db
      .update(rounds)
      .set({ status })
      .where(eq(rounds.id, roundId));
  }

  // Answer Management
  async submitAnswer(data: any) {
    const [answer] = await this.db.insert(answers).values({
      ...data,
      answered_at: new Date()
    }).returning();
    return answer;
  }

  async getAnswersBySession(sessionId: number) {
    return await this.db
      .select()
      .from(answers)
      .where(eq(answers.session_id, sessionId));
  }

  async getAnswersByUser(userId: number) {
    return await this.db
      .select()
      .from(answers)
      .where(eq(answers.user_id, userId));
  }

  // Session State Management (Key feature from WineQuizMobile_new)
  async saveUserSessionState(data: any) {
    const [sessionState] = await this.db
      .insert(userSessionState)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .onConflictDoUpdate({
        target: [userSessionState.user_id, userSessionState.session_id],
        set: {
          ...data,
          updated_at: new Date()
        }
      })
      .returning();
    return sessionState;
  }

  async getUserSessionState(userId: number, sessionId: number) {
    const [sessionState] = await this.db
      .select()
      .from(userSessionState)
      .where(
        and(
          eq(userSessionState.user_id, userId),
          eq(userSessionState.session_id, sessionId)
        )
      );
    return sessionState;
  }

  async updateUserProgress(userId: number, sessionId: number, data: any) {
    await this.db
      .update(userSessionState)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(
        and(
          eq(userSessionState.user_id, userId),
          eq(userSessionState.session_id, sessionId)
        )
      );
  }

  // Scoring and Results
  async calculateTeamScores(sessionId: number) {
    // Complex query to calculate team scores - join answers, users, teams
    const result = await this.db
      .select({
        team_id: users.team_id,
        team_name: teams.name,
        total_score: sql<number>`COALESCE(SUM(${answers.points_awarded}), 0)`,
        correct_answers: sql<number>`COUNT(CASE WHEN ${answers.is_correct} THEN 1 END)`,
        total_answers: sql<number>`COUNT(${answers.id})`
      })
      .from(answers)
      .leftJoin(users, eq(answers.user_id, users.id))
      .leftJoin(teams, eq(users.team_id, teams.id))
      .where(eq(answers.session_id, sessionId))
      .groupBy(users.team_id, teams.name)
      .orderBy(desc(sql`SUM(${answers.points_awarded})`));

    return result;
  }

  async saveRoundResults(data: any) {
    const [result] = await this.db.insert(roundResults).values({
      ...data,
      finished_at: new Date()
    }).returning();
    return result;
  }

  async getLeaderboard(sessionId: number) {
    return await this.db
      .select()
      .from(roundResults)
      .where(eq(roundResults.session_id, sessionId))
      .orderBy(desc(roundResults.total_score));
  }

  // Wine Glossary (Hint system)
  async getGlossaryTerms(category?: string) {
    if (category) {
      return await this.db
        .select()
        .from(wineGlossary)
        .where(eq(wineGlossary.category, category));
    }
    return await this.db.select().from(wineGlossary);
  }

  async searchGlossary(term: string) {
    return await this.db
      .select()
      .from(wineGlossary)
      .where(
        sql`${wineGlossary.term} ILIKE ${`%${term}%`} OR ${wineGlossary.definition} ILIKE ${`%${term}%`}`
      );
  }

  // Admin Management
  async validateAdmin(email: string, password: string) {
    const [admin] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, email));
      
    if (!admin) return false;
    return await bcrypt.compare(password, admin.password);
  }

  // Database Setup
  async initializeDatabase() {
    await this.createTables();
    await this.seedInitialData();
  }

  async createTables() {
    const sql = this.db.$client;
    
    // Create enums first
    await sql`DO $$ BEGIN
      CREATE TYPE game_mode AS ENUM ('individual', 'leader');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;

    await sql`DO $$ BEGIN
      CREATE TYPE status AS ENUM ('pending', 'active', 'finished');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;

    await sql`DO $$ BEGIN
      CREATE TYPE option AS ENUM ('a', 'b', 'c', 'd');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;

    await sql`DO $$ BEGIN
      CREATE TYPE question_type AS ENUM ('multiple_choice', 'dropdown', 'autocomplete');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;

    // Create tables
    await sql`CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      color VARCHAR(50) NOT NULL,
      qr_code TEXT,
      max_members INTEGER DEFAULT 4,
      icon VARCHAR(100)
    );`;

    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      team_id INTEGER REFERENCES teams(id),
      is_leader BOOLEAN DEFAULT false,
      session_token VARCHAR(255),
      device_fingerprint VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );`;

    await sql`CREATE TABLE IF NOT EXISTS game_sessions (
      id SERIAL PRIMARY KEY,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP,
      duration_seconds INTEGER,
      game_mode game_mode NOT NULL,
      status status DEFAULT 'pending',
      current_question_id INTEGER,
      current_round_id INTEGER
    );`;

    await sql`CREATE TABLE IF NOT EXISTS rounds (
      id SERIAL PRIMARY KEY,
      session_id INTEGER REFERENCES game_sessions(id),
      round_number INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      wine_type VARCHAR(255),
      description TEXT,
      status status DEFAULT 'pending',
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      question_ids INTEGER[]
    );`;

    await sql`CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      question_text TEXT NOT NULL,
      question_type question_type DEFAULT 'multiple_choice',
      option_a VARCHAR(255),
      option_b VARCHAR(255),
      option_c VARCHAR(255),
      option_d VARCHAR(255),
      correct_option option,
      options TEXT[],
      correct_answer TEXT,
      weight REAL NOT NULL,
      round_id INTEGER REFERENCES rounds(id)
    );`;

    await sql`CREATE TABLE IF NOT EXISTS answers (
      id SERIAL PRIMARY KEY,
      session_id INTEGER REFERENCES game_sessions(id),
      question_id INTEGER REFERENCES questions(id),
      user_id INTEGER REFERENCES users(id),
      round_id INTEGER REFERENCES rounds(id),
      selected_option option,
      text_answer TEXT,
      is_correct BOOLEAN,
      points_awarded REAL,
      answered_at TIMESTAMP DEFAULT NOW()
    );`;

    await sql`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );`;

    await sql`CREATE TABLE IF NOT EXISTS round_results (
      id SERIAL PRIMARY KEY,
      session_id INTEGER NOT NULL REFERENCES game_sessions(id),
      round_id INTEGER NOT NULL REFERENCES rounds(id),
      team_id INTEGER NOT NULL REFERENCES teams(id),
      team_name VARCHAR(255) NOT NULL,
      total_score REAL NOT NULL,
      round_score REAL NOT NULL,
      position INTEGER NOT NULL,
      finished_at TIMESTAMP DEFAULT NOW()
    );`;

    await sql`CREATE TABLE IF NOT EXISTS team_registrations (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id),
      session_id INTEGER NOT NULL REFERENCES game_sessions(id),
      custom_team_name VARCHAR(255) NOT NULL,
      registered_at TIMESTAMP DEFAULT NOW()
    );`;

    await sql`CREATE TABLE IF NOT EXISTS user_session_state (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      session_id INTEGER NOT NULL REFERENCES game_sessions(id),
      round_id INTEGER REFERENCES rounds(id),
      current_question_id INTEGER REFERENCES questions(id),
      question_start_time TIMESTAMP,
      time_remaining INTEGER,
      selected_option option,
      text_answer_draft TEXT,
      has_answered_current BOOLEAN DEFAULT false,
      is_round_completed BOOLEAN DEFAULT false,
      is_quiz_completed BOOLEAN DEFAULT false,
      last_activity TIMESTAMP DEFAULT NOW(),
      last_synced_at TIMESTAMP DEFAULT NOW(),
      device_fingerprint VARCHAR(255),
      user_agent VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, session_id)
    );`;

    await sql`CREATE TABLE IF NOT EXISTS wine_glossary (
      id SERIAL PRIMARY KEY,
      term VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      definition TEXT NOT NULL,
      aliases TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );`;
  }

  private async seedInitialData() {
    // Insert teams with wine-themed names and proper icons
    await this.db.insert(teams).values([
      { name: 'Mesa 1', color: '#8B5CF6', qr_code: 'wine-quiz-team-1', max_members: 4, icon: '🍷' },
      { name: 'Mesa 2', color: '#06B6D4', qr_code: 'wine-quiz-team-2', max_members: 4, icon: '🌿' },
      { name: 'Mesa 3', color: '#10B981', qr_code: 'wine-quiz-team-3', max_members: 4, icon: '🍇' },
      { name: 'Mesa 4', color: '#F59E0B', qr_code: 'wine-quiz-team-4', max_members: 4, icon: '🥂' },
      { name: 'Mesa 5', color: '#EF4444', qr_code: 'wine-quiz-team-5', max_members: 4, icon: '🍾' }
    ]).onConflictDoNothing();

    // Insert admin user (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await this.db.insert(admins).values({
      email: 'admin@winequiz.com',
      password: hashedPassword
    }).onConflictDoNothing();

    // Insert comprehensive wine questions
    await this.seedWineQuestions();
    
    // Insert wine glossary for hint system
    await this.seedWineGlossary();
  }

  private async seedWineQuestions() {
    const wineQuestions = [
      // Multiple choice questions
      {
        question_text: 'Qual é a idade do vinho?',
        question_type: 'multiple_choice',
        option_a: '0 a 3 anos',
        option_b: '4 a 7 anos',
        option_c: '8 a 11 anos', 
        option_d: '12 ou +',
        correct_option: 'b',
        weight: 2
      },
      {
        question_text: 'Qual a graduação alcoólica do vinho?',
        question_type: 'multiple_choice',
        option_a: '12 à 12,9%',
        option_b: '13 à 13,9%',
        option_c: '14 à 14,9%',
        option_d: '15% ou +',
        correct_option: 'd',
        weight: 2
      },
      {
        question_text: 'Qual país é considerado o berço do vinho?',
        question_type: 'multiple_choice',
        option_a: 'França',
        option_b: 'Itália',
        option_c: 'Geórgia',
        option_d: 'Grécia',
        correct_option: 'c',
        weight: 1
      },
      {
        question_text: 'Qual é a variedade de uva mais plantada no mundo?',
        question_type: 'multiple_choice',
        option_a: 'Cabernet Sauvignon',
        option_b: 'Merlot',
        option_c: 'Kyoho',
        option_d: 'Chardonnay',
        correct_option: 'c',
        weight: 1
      },
      {
        question_text: 'Em que temperatura ideal deve ser servido um vinho tinto encorpado?',
        question_type: 'multiple_choice',
        option_a: '8-10°C',
        option_b: '12-14°C',
        option_c: '16-18°C',
        option_d: '20-22°C',
        correct_option: 'c',
        weight: 1
      },
      // Autocomplete questions  
      {
        question_text: 'Qual região da França é famosa pelos vinhos Champagne?',
        question_type: 'autocomplete',
        options: ['Champagne', 'Borgonha', 'Bordeaux', 'Vale do Loire', 'Alsácia', 'Rhône', 'Languedoc'],
        correct_answer: 'Champagne',
        weight: 1
      },
      {
        question_text: 'Complete: O Vinho do Porto é um vinho _______ português.',
        question_type: 'autocomplete',
        options: ['fortificado', 'espumante', 'seco', 'doce', 'licoroso', 'generoso'],
        correct_answer: 'fortificado',
        weight: 1
      },
      {
        question_text: 'Qual uva é tradicionalmente usada para fazer Chianti?',
        question_type: 'autocomplete',
        options: ['Sangiovese', 'Nebbiolo', 'Barbera', 'Montepulciano', 'Aglianico'],
        correct_answer: 'Sangiovese',
        weight: 1
      }
    ];

    await this.db.insert(questions).values(wineQuestions).onConflictDoNothing();
  }

  private async seedWineGlossary() {
    const glossaryTerms = [
      {
        term: 'Terroir',
        category: 'conceito',
        definition: 'Conjunto de fatores naturais (solo, clima, topografia) que influenciam o caráter de um vinho',
        aliases: ['teroir', 'terruar']
      },
      {
        term: 'Tanino',
        category: 'componente',
        definition: 'Substância que confere estrutura e adstringência aos vinhos tintos',
        aliases: ['taninos']
      },
      {
        term: 'Cabernet Sauvignon',
        category: 'uva',
        definition: 'Variedade de uva tinta de origem francesa, conhecida por produzir vinhos encorpados',
        aliases: ['cabernet']
      },
      {
        term: 'Chardonnay',
        category: 'uva',
        definition: 'Variedade de uva branca originária da Borgonha, França',
        aliases: ['chardonay']
      },
      {
        term: 'Bordeaux',
        category: 'região',
        definition: 'Famosa região vinícola francesa, conhecida por seus vinhos tintos de qualidade',
        aliases: ['bordô', 'bordo']
      }
    ];

    await this.db.insert(wineGlossary).values(glossaryTerms).onConflictDoNothing();
  }
}