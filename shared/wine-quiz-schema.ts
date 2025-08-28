import { pgTable, serial, varchar, text, real, boolean, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const gameModeEnum = pgEnum("wine_game_mode", ["individual", "leader"]);
export const statusEnum = pgEnum("wine_status", ["pending", "active", "finished"]);
export const optionEnum = pgEnum("wine_option", ["a", "b", "c", "d"]);
export const questionTypeEnum = pgEnum("wine_question_type", ["multiple_choice", "dropdown", "autocomplete"]);

// Teams table
export const wineTeams = pgTable("wine_teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  qrCode: text("qr_code"),
  maxMembers: integer("max_members").default(4),
  icon: varchar("icon", { length: 100 }),
});

// Users table
export const wineUsers = pgTable("wine_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamId: integer("team_id").references(() => wineTeams.id),
  isLeader: boolean("is_leader").default(false),
  sessionToken: varchar("session_token", { length: 255 }).unique(),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game sessions table
export const wineGameSessions = pgTable("wine_game_sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationSeconds: integer("duration_seconds"),
  gameMode: gameModeEnum("game_mode").notNull(),
  status: statusEnum("status").default("pending"),
  currentQuestionId: integer("current_question_id"),
  currentRoundId: integer("current_round_id"),
});

// Rounds table
export const wineRounds = pgTable("wine_rounds", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => wineGameSessions.id),
  roundNumber: integer("round_number").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  wineType: varchar("wine_type", { length: 255 }),
  description: text("description"),
  status: statusEnum("status").default("pending"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  questionIds: integer("question_ids").array()
});

// Questions table
export const wineQuestions = pgTable("wine_questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").default("multiple_choice"),
  // Multiple choice fields
  optionA: varchar("option_a", { length: 255 }),
  optionB: varchar("option_b", { length: 255 }),
  optionC: varchar("option_c", { length: 255 }),
  optionD: varchar("option_d", { length: 255 }),
  correctOption: optionEnum("correct_option"),
  // Autocomplete fields
  options: text("options").array(),
  correctAnswer: text("correct_answer"),
  weight: real("weight").notNull(),
  roundId: integer("round_id").references(() => wineRounds.id),
});

// Answers table
export const wineAnswers = pgTable("wine_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => wineGameSessions.id),
  questionId: integer("question_id").references(() => wineQuestions.id),
  userId: integer("user_id").references(() => wineUsers.id),
  roundId: integer("round_id").references(() => wineRounds.id),
  selectedOption: optionEnum("selected_option"),
  textAnswer: text("text_answer"),
  isCorrect: boolean("is_correct"),
  pointsAwarded: real("points_awarded"),
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Admins table
export const wineAdmins = pgTable("wine_admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

// Round results table
export const wineRoundResults = pgTable("wine_round_results", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => wineGameSessions.id).notNull(),
  roundId: integer("round_id").references(() => wineRounds.id).notNull(),
  teamId: integer("team_id").references(() => wineTeams.id).notNull(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  totalScore: real("total_score").notNull(),
  roundScore: real("round_score").notNull(),
  position: integer("position").notNull(),
  finishedAt: timestamp("finished_at").defaultNow(),
});

// Team registrations table
export const wineTeamRegistrations = pgTable("wine_team_registrations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => wineTeams.id).notNull(),
  sessionId: integer("session_id").references(() => wineGameSessions.id).notNull(),
  customTeamName: varchar("custom_team_name", { length: 255 }).notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// User session state table
export const wineUserSessionState = pgTable("wine_user_session_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => wineUsers.id).notNull(),
  sessionId: integer("session_id").references(() => wineGameSessions.id).notNull(),
  roundId: integer("round_id").references(() => wineRounds.id),
  currentQuestionId: integer("current_question_id").references(() => wineQuestions.id),
  questionStartTime: timestamp("question_start_time"),
  timeRemaining: integer("time_remaining"),
  selectedOption: optionEnum("selected_option"),
  textAnswerDraft: text("text_answer_draft"),
  hasAnsweredCurrent: boolean("has_answered_current").default(false),
  isRoundCompleted: boolean("is_round_completed").default(false),
  isQuizCompleted: boolean("is_quiz_completed").default(false),
  lastActivity: timestamp("last_activity").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertWineTeamSchema = createInsertSchema(wineTeams).omit({ id: true });
export const insertWineUserSchema = createInsertSchema(wineUsers).omit({ id: true });
export const insertWineQuestionSchema = createInsertSchema(wineQuestions).omit({ id: true });
export const insertWineGameSessionSchema = createInsertSchema(wineGameSessions).omit({ id: true });
export const insertWineRoundSchema = createInsertSchema(wineRounds).omit({ id: true });
export const insertWineAnswerSchema = createInsertSchema(wineAnswers).omit({ id: true });
export const insertWineAdminSchema = createInsertSchema(wineAdmins).omit({ id: true });
export const insertWineRoundResultSchema = createInsertSchema(wineRoundResults).omit({ id: true });
export const insertWineTeamRegistrationSchema = createInsertSchema(wineTeamRegistrations).omit({ id: true });
export const insertWineUserSessionStateSchema = createInsertSchema(wineUserSessionState).omit({ id: true });

// Types
export type WineTeam = typeof wineTeams.$inferSelect;
export type InsertWineTeam = z.infer<typeof insertWineTeamSchema>;
export type WineUser = typeof wineUsers.$inferSelect;
export type InsertWineUser = z.infer<typeof insertWineUserSchema>;
export type WineQuestion = typeof wineQuestions.$inferSelect;
export type InsertWineQuestion = z.infer<typeof insertWineQuestionSchema>;
export type WineGameSession = typeof wineGameSessions.$inferSelect;
export type InsertWineGameSession = z.infer<typeof insertWineGameSessionSchema>;
export type WineRound = typeof wineRounds.$inferSelect;
export type InsertWineRound = z.infer<typeof insertWineRoundSchema>;
export type WineAnswer = typeof wineAnswers.$inferSelect;
export type InsertWineAnswer = z.infer<typeof insertWineAnswerSchema>;
export type WineAdmin = typeof wineAdmins.$inferSelect;
export type InsertWineAdmin = z.infer<typeof insertWineAdminSchema>;
export type WineRoundResult = typeof wineRoundResults.$inferSelect;
export type InsertWineRoundResult = z.infer<typeof insertWineRoundResultSchema>;
export type WineTeamRegistration = typeof wineTeamRegistrations.$inferSelect;
export type InsertWineTeamRegistration = z.infer<typeof insertWineTeamRegistrationSchema>;
export type WineUserSessionState = typeof wineUserSessionState.$inferSelect;
export type InsertWineUserSessionState = z.infer<typeof insertWineUserSessionStateSchema>;

// Schema object for Drizzle
export const wineQuizSchema = {
  wineTeams,
  wineUsers,
  wineGameSessions,
  wineRounds,
  wineQuestions,
  wineAnswers,
  wineAdmins,
  wineRoundResults,
  wineTeamRegistrations,
  wineUserSessionState,
};