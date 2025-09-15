import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, desc, sql, count } from 'drizzle-orm';
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

export class WineQuizDbStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
    }
    console.log('Connecting to database with URL:', databaseUrl.substring(0, 50) + '...');
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  async initializeDatabase() {
    try {
      console.log('Initializing Wine Quiz database...');
      
      // First create tables manually
      await this.createTables();
      
      // Check if data already exists
      const existingTeams = await this.getAllTeams();
      if (existingTeams.length === 0) {
        // Initialize mock data only if database is empty
        await this.initializeMockData();
        console.log('Wine Quiz mock data initialized');
      } else {
        console.log('Wine Quiz database already has data, skipping initialization');
      }
      
      console.log('Wine Quiz database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Wine Quiz database:', error);
      // Don't throw - continue running even if tables already exist
      console.log('Continuing despite database initialization warnings...');
    }
  }

  private async createTables() {
    try {
      // Create enums
      await this.db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE wine_game_mode AS ENUM ('individual', 'leader');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await this.db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE wine_status AS ENUM ('pending', 'active', 'finished');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await this.db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE wine_option AS ENUM ('a', 'b', 'c', 'd');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await this.db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE wine_question_type AS ENUM ('multiple_choice', 'dropdown', 'autocomplete');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create tables
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_teams (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          color VARCHAR(50) NOT NULL,
          qr_code TEXT,
          max_members INTEGER DEFAULT 4,
          icon VARCHAR(100)
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          team_id INTEGER REFERENCES wine_teams(id),
          is_leader BOOLEAN DEFAULT false,
          session_token VARCHAR(255) UNIQUE,
          device_fingerprint VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_game_sessions (
          id SERIAL PRIMARY KEY,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP,
          duration_seconds INTEGER,
          game_mode wine_game_mode NOT NULL,
          status wine_status DEFAULT 'pending',
          current_question_id INTEGER,
          current_round_id INTEGER
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_rounds (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES wine_game_sessions(id),
          round_number INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          wine_type VARCHAR(255),
          description TEXT,
          status wine_status DEFAULT 'pending',
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          question_ids INTEGER[]
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_questions (
          id SERIAL PRIMARY KEY,
          question_text TEXT NOT NULL,
          question_type wine_question_type DEFAULT 'multiple_choice',
          option_a VARCHAR(255),
          option_b VARCHAR(255),
          option_c VARCHAR(255),
          option_d VARCHAR(255),
          correct_option wine_option,
          options TEXT[],
          correct_answer TEXT,
          weight REAL NOT NULL,
          round_id INTEGER REFERENCES wine_rounds(id)
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_answers (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES wine_game_sessions(id),
          question_id INTEGER REFERENCES wine_questions(id),
          user_id INTEGER REFERENCES wine_users(id),
          round_id INTEGER REFERENCES wine_rounds(id),
          selected_option wine_option,
          text_answer TEXT,
          is_correct BOOLEAN,
          points_awarded REAL,
          answered_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_round_results (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES wine_game_sessions(id),
          round_id INTEGER NOT NULL REFERENCES wine_rounds(id),
          team_id INTEGER NOT NULL REFERENCES wine_teams(id),
          team_name VARCHAR(255) NOT NULL,
          total_score REAL NOT NULL,
          round_score REAL NOT NULL,
          position INTEGER NOT NULL,
          finished_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_team_registrations (
          id SERIAL PRIMARY KEY,
          team_id INTEGER NOT NULL REFERENCES wine_teams(id),
          session_id INTEGER NOT NULL REFERENCES wine_game_sessions(id),
          custom_team_name VARCHAR(255) NOT NULL,
          registered_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS wine_user_session_state (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES wine_users(id),
          session_id INTEGER NOT NULL REFERENCES wine_game_sessions(id),
          round_id INTEGER REFERENCES wine_rounds(id),
          current_question_id INTEGER REFERENCES wine_questions(id),
          question_start_time TIMESTAMP,
          time_remaining INTEGER,
          selected_option wine_option,
          text_answer_draft TEXT,
          has_answered_current BOOLEAN DEFAULT false,
          is_round_completed BOOLEAN DEFAULT false,
          is_quiz_completed BOOLEAN DEFAULT false,
          last_activity TIMESTAMP DEFAULT NOW(),
          last_synced_at TIMESTAMP DEFAULT NOW(),
          device_fingerprint VARCHAR(255),
          user_agent VARCHAR(500),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log('✅ All Wine Quiz tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private async initializeMockData() {
    try {
      // Create admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.db.insert(wineAdmins).values({
        email: 'admin@winequiz.com',
        password: hashedPassword
      }).onConflictDoNothing();

      // Create teams
      const teams: InsertWineTeam[] = [
        { name: 'Mesa 1', color: '#8B5CF6', qrCode: 'wine-quiz-team-1', maxMembers: 4, icon: '🍷' },
        { name: 'Mesa 2', color: '#06B6D4', qrCode: 'wine-quiz-team-2', maxMembers: 4, icon: '🌿' },
        { name: 'Mesa 3', color: '#10B981', qrCode: 'wine-quiz-team-3', maxMembers: 4, icon: '🍇' },
        { name: 'Mesa 4', color: '#F59E0B', qrCode: 'wine-quiz-team-4', maxMembers: 4, icon: '🥂' },
        { name: 'Mesa 5', color: '#EF4444', qrCode: 'wine-quiz-team-5', maxMembers: 4, icon: '🍾' }
      ];

      for (const team of teams) {
        await this.db.insert(wineTeams).values(team).onConflictDoNothing();
      }

      // Create sample questions
      const sampleQuestions: InsertWineQuestion[] = [
        {
          questionText: "Qual país é considerado o berço do vinho?",
          questionType: "multiple_choice",
          optionA: "França",
          optionB: "Itália", 
          optionC: "Geórgia",
          optionD: "Grécia",
          correctOption: "c",
          weight: 1,
          roundId: null
        },
        {
          questionText: "Qual é a variedade de uva mais plantada no mundo?",
          questionType: "multiple_choice",
          optionA: "Cabernet Sauvignon",
          optionB: "Merlot",
          optionC: "Kyoho",
          optionD: "Chardonnay",
          correctOption: "c",
          weight: 1,
          roundId: null
        },
        {
          questionText: "Em que temperatura ideal deve ser servido um vinho tinto encorpado?",
          questionType: "multiple_choice",
          optionA: "8-10°C",
          optionB: "12-14°C",
          optionC: "16-18°C",
          optionD: "20-22°C",
          correctOption: "c",
          weight: 1,
          roundId: null
        },
        {
          questionText: "O que significa 'terroir' na enologia?",
          questionType: "multiple_choice",
          optionA: "Tipo de solo onde cresce a vinha",
          optionB: "Técnica de vinificação",
          optionC: "Conjunto de fatores naturais de uma região",
          optionD: "Período de envelhecimento do vinho",
          correctOption: "c",
          weight: 1,
          roundId: null
        },
        {
          questionText: "Qual processo é responsável pela transformação do mosto em vinho?",
          questionType: "multiple_choice",
          optionA: "Maceração",
          optionB: "Fermentação",
          optionC: "Clarificação",
          optionD: "Estabilização",
          correctOption: "b",
          weight: 1,
          roundId: null
        },
        {
          questionText: "Qual região da França é famosa pelos vinhos Champagne?",
          questionType: "autocomplete",
          options: ["Champagne", "Borgonha", "Bordeaux", "Vale do Loire", "Alsácia", "Rhône", "Languedoc"],
          correctAnswer: "Champagne",
          weight: 1,
          roundId: null
        },
        {
          questionText: "Complete: O Vinho do Porto é um vinho _______ português.",
          questionType: "autocomplete",
          options: ["fortificado", "espumante", "seco", "doce", "licoroso", "generoso"],
          correctAnswer: "fortificado",
          weight: 1,
          roundId: null
        },
        {
          questionText: "Qual uva é tradicionalmente usada para fazer Chianti?",
          questionType: "autocomplete",
          options: ["Sangiovese", "Nebbiolo", "Barbera", "Montepulciano", "Aglianico"],
          correctAnswer: "Sangiovese",
          weight: 1,
          roundId: null
        }
      ];

      for (const question of sampleQuestions) {
        await this.db.insert(wineQuestions).values(question).onConflictDoNothing();
      }

      console.log('Mock data initialized successfully');
    } catch (error) {
      console.error('Error initializing mock data:', error);
      throw error;
    }
  }

  // Admin methods
  async getAdminByEmail(email: string): Promise<WineAdmin | undefined> {
    const result = await this.db.select().from(wineAdmins).where(eq(wineAdmins.email, email)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertWineAdmin): Promise<WineAdmin> {
    const result = await this.db.insert(wineAdmins).values(admin).returning();
    return result[0];
  }

  // Team methods
  async getAllTeams(): Promise<WineTeam[]> {
    return await this.db.select().from(wineTeams);
  }

  async getTeamById(id: number): Promise<WineTeam | undefined> {
    const result = await this.db.select().from(wineTeams).where(eq(wineTeams.id, id)).limit(1);
    return result[0];
  }

  async createTeam(team: InsertWineTeam): Promise<WineTeam> {
    const result = await this.db.insert(wineTeams).values(team).returning();
    return result[0];
  }

  async getUsersByTeamId(teamId: number): Promise<WineUser[]> {
    return await this.db.select().from(wineUsers).where(eq(wineUsers.teamId, teamId));
  }

  // User methods
  async createUser(user: InsertWineUser): Promise<WineUser> {
    const result = await this.db.insert(wineUsers).values(user).returning();
    return result[0];
  }

  async getUserById(id: number): Promise<WineUser | undefined> {
    const result = await this.db.select().from(wineUsers).where(eq(wineUsers.id, id)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<WineUser[]> {
    return await this.db.select().from(wineUsers);
  }

  // Session methods
  async createGameSession(session: InsertWineGameSession): Promise<WineGameSession> {
    const result = await this.db.insert(wineGameSessions).values(session).returning();
    return result[0];
  }

  async getAllGameSessions(): Promise<WineGameSession[]> {
    return await this.db.select().from(wineGameSessions).orderBy(desc(wineGameSessions.startTime));
  }

  async getGameSession(id: number): Promise<WineGameSession | undefined> {
    const result = await this.db.select().from(wineGameSessions).where(eq(wineGameSessions.id, id)).limit(1);
    return result[0];
  }

  async updateGameSession(id: number, updates: Partial<WineGameSession>): Promise<WineGameSession> {
    const result = await this.db.update(wineGameSessions)
      .set(updates)
      .where(eq(wineGameSessions.id, id))
      .returning();
    return result[0];
  }

  // Round methods
  async createRound(round: InsertWineRound): Promise<WineRound> {
    const result = await this.db.insert(wineRounds).values(round).returning();
    return result[0];
  }

  async getRoundsBySessionId(sessionId: number): Promise<WineRound[]> {
    return await this.db.select().from(wineRounds)
      .where(eq(wineRounds.sessionId, sessionId))
      .orderBy(wineRounds.roundNumber);
  }

  async updateRound(id: number, updates: Partial<WineRound>): Promise<WineRound> {
    const result = await this.db.update(wineRounds)
      .set(updates)
      .where(eq(wineRounds.id, id))
      .returning();
    return result[0];
  }

  // Question methods
  async getAllQuestions(): Promise<WineQuestion[]> {
    return await this.db.select().from(wineQuestions);
  }

  async getQuestionsByRoundId(roundId: number): Promise<WineQuestion[]> {
    return await this.db.select().from(wineQuestions).where(eq(wineQuestions.roundId, roundId));
  }

  async createQuestion(question: InsertWineQuestion): Promise<WineQuestion> {
    const result = await this.db.insert(wineQuestions).values(question).returning();
    return result[0];
  }

  // Answer methods
  async submitAnswer(answer: InsertWineAnswer): Promise<WineAnswer> {
    const result = await this.db.insert(wineAnswers).values(answer).returning();
    return result[0];
  }

  async getAnswersBySessionId(sessionId: number): Promise<WineAnswer[]> {
    return await this.db.select().from(wineAnswers).where(eq(wineAnswers.sessionId, sessionId));
  }

  // User session state methods
  async getUserSessionState(userId: number, sessionId: number): Promise<WineUserSessionState | undefined> {
    const result = await this.db.select().from(wineUserSessionState)
      .where(and(
        eq(wineUserSessionState.userId, userId),
        eq(wineUserSessionState.sessionId, sessionId)
      ))
      .limit(1);
    return result[0];
  }

  async updateUserSessionState(userId: number, sessionId: number, updates: Partial<WineUserSessionState>): Promise<WineUserSessionState> {
    const existing = await this.getUserSessionState(userId, sessionId);
    
    if (existing) {
      const result = await this.db.update(wineUserSessionState)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(
          eq(wineUserSessionState.userId, userId),
          eq(wineUserSessionState.sessionId, sessionId)
        ))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(wineUserSessionState)
        .values({
          userId,
          sessionId,
          ...updates,
          hasAnsweredCurrent: false,
          isRoundCompleted: false,
          isQuizCompleted: false,
          lastActivity: new Date(),
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        } as InsertWineUserSessionState)
        .returning();
      return result[0];
    }
  }

  // Team registration methods
  async createTeamRegistration(registration: InsertWineTeamRegistration): Promise<WineTeamRegistration> {
    const result = await this.db.insert(wineTeamRegistrations).values(registration).returning();
    return result[0];
  }

  // Results methods
  async createRoundResult(result: InsertWineRoundResult): Promise<WineRoundResult> {
    const insertResult = await this.db.insert(wineRoundResults).values(result).returning();
    return insertResult[0];
  }

  async getRoundResultsBySessionId(sessionId: number): Promise<WineRoundResult[]> {
    return await this.db.select().from(wineRoundResults)
      .where(eq(wineRoundResults.sessionId, sessionId))
      .orderBy(wineRoundResults.position);
  }

  // Scoring methods
  async calculateTeamScore(sessionId: number, roundId: number, teamId: number): Promise<number> {
    const answers = await this.db.select().from(wineAnswers)
      .where(and(
        eq(wineAnswers.sessionId, sessionId),
        eq(wineAnswers.roundId, roundId)
      ));

    const teamUsers = await this.getUsersByTeamId(teamId);
    const teamUserIds = teamUsers.map(u => u.id);
    
    const teamAnswers = answers.filter(a => teamUserIds.includes(a.userId));
    return teamAnswers.reduce((sum, answer) => sum + (answer.pointsAwarded || 0), 0);
  }

  async calculateTeamTotalScore(sessionId: number, teamId: number): Promise<number> {
    const answers = await this.db.select().from(wineAnswers)
      .where(eq(wineAnswers.sessionId, sessionId));

    const teamUsers = await this.getUsersByTeamId(teamId);
    const teamUserIds = teamUsers.map(u => u.id);
    
    const teamAnswers = answers.filter(a => teamUserIds.includes(a.userId));
    return teamAnswers.reduce((sum, answer) => sum + (answer.pointsAwarded || 0), 0);
  }
}

export const wineQuizStorage = new WineQuizDbStorage();