import { pgTable, serial, varchar, text, integer, boolean, timestamp, real, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for wine quiz system
export const gameModeEnum = pgEnum("game_mode", ["individual", "leader"]);
export const statusEnum = pgEnum("status", ["pending", "active", "finished"]);
export const optionEnum = pgEnum("option", ["a", "b", "c", "d"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "dropdown", "autocomplete"]);

// Teams table - represents physical tables/teams in the wine tasting
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  qr_code: text("qr_code"),
  max_members: integer("max_members").default(4),
  icon: varchar("icon", { length: 100 })
});

// Users table - individual participants
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  team_id: integer("team_id").references(() => teams.id),
  is_leader: boolean("is_leader").default(false),
  session_token: varchar("session_token", { length: 255 }),
  device_fingerprint: varchar("device_fingerprint", { length: 255 }),
  created_at: timestamp("created_at").defaultNow()
});

// Game sessions - individual quiz instances
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time"),
  duration_seconds: integer("duration_seconds"),
  game_mode: gameModeEnum("game_mode").notNull(),
  status: statusEnum("status").default('pending'),
  current_question_id: integer("current_question_id"),
  current_round_id: integer("current_round_id")
});

// Rounds - wine tasting rounds (e.g., "Vinhos Brancos", "Vinhos Tintos")
export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  session_id: integer("session_id").references(() => gameSessions.id),
  round_number: integer("round_number").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  wine_type: varchar("wine_type", { length: 255 }),
  description: text("description"),
  status: statusEnum("status").default('pending'),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  question_ids: integer("question_ids").array()
});

// Questions - wine knowledge questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question_text: text("question_text").notNull(),
  question_type: questionTypeEnum("question_type").default('multiple_choice'),
  option_a: varchar("option_a", { length: 255 }),
  option_b: varchar("option_b", { length: 255 }),
  option_c: varchar("option_c", { length: 255 }),
  option_d: varchar("option_d", { length: 255 }),
  correct_option: optionEnum("correct_option"),
  options: text("options").array(), // For autocomplete questions
  correct_answer: text("correct_answer"),
  weight: real("weight").notNull(),
  round_id: integer("round_id").references(() => rounds.id)
});

// Answers - user responses to questions
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  session_id: integer("session_id").references(() => gameSessions.id),
  question_id: integer("question_id").references(() => questions.id),
  user_id: integer("user_id").references(() => users.id),
  round_id: integer("round_id").references(() => rounds.id),
  selected_option: optionEnum("selected_option"),
  text_answer: text("text_answer"),
  is_correct: boolean("is_correct"),
  points_awarded: real("points_awarded"),
  answered_at: timestamp("answered_at").defaultNow()
});

// Admin users
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull()
});

// Round results - final scores per team per round
export const roundResults = pgTable("round_results", {
  id: serial("id").primaryKey(),
  session_id: integer("session_id").notNull().references(() => gameSessions.id),
  round_id: integer("round_id").notNull().references(() => rounds.id),
  team_id: integer("team_id").notNull().references(() => teams.id),
  team_name: varchar("team_name", { length: 255 }).notNull(),
  total_score: real("total_score").notNull(),
  round_score: real("round_score").notNull(),
  position: integer("position").notNull(),
  finished_at: timestamp("finished_at").defaultNow()
});

// Team registrations - custom team names per session
export const teamRegistrations = pgTable("team_registrations", {
  id: serial("id").primaryKey(),
  team_id: integer("team_id").notNull().references(() => teams.id),
  session_id: integer("session_id").notNull().references(() => gameSessions.id),
  custom_team_name: varchar("custom_team_name", { length: 255 }).notNull(),
  registered_at: timestamp("registered_at").defaultNow()
});

// User session state - comprehensive session persistence (key feature from WineQuizMobile_new)
export const userSessionState = pgTable("user_session_state", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  session_id: integer("session_id").notNull().references(() => gameSessions.id),
  round_id: integer("round_id").references(() => rounds.id),
  current_question_id: integer("current_question_id").references(() => questions.id),
  question_start_time: timestamp("question_start_time"),
  time_remaining: integer("time_remaining"),
  selected_option: optionEnum("selected_option"),
  text_answer_draft: text("text_answer_draft"),
  has_answered_current: boolean("has_answered_current").default(false),
  is_round_completed: boolean("is_round_completed").default(false),
  is_quiz_completed: boolean("is_quiz_completed").default(false),
  last_activity: timestamp("last_activity").defaultNow(),
  last_synced_at: timestamp("last_synced_at").defaultNow(),
  device_fingerprint: varchar("device_fingerprint", { length: 255 }),
  user_agent: varchar("user_agent", { length: 500 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Wine Glossary - wine knowledge base for hints/autocomplete
export const wineGlossary = pgTable("wine_glossary", {
  id: serial("id").primaryKey(),
  term: varchar("term", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // grape_variety, country, wine_type, etc.
  definition: text("definition").notNull(),
  aliases: text("aliases").array(),
  created_at: timestamp("created_at").defaultNow()
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(users),
  teamRegistrations: many(teamRegistrations),
  roundResults: many(roundResults)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, {
    fields: [users.team_id],
    references: [teams.id]
  }),
  answers: many(answers),
  userSessionState: many(userSessionState)
}));

export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  rounds: many(rounds),
  answers: many(answers),
  roundResults: many(roundResults),
  teamRegistrations: many(teamRegistrations),
  userSessionState: many(userSessionState)
}));

export const roundsRelations = relations(rounds, ({ one, many }) => ({
  gameSession: one(gameSessions, {
    fields: [rounds.session_id],
    references: [gameSessions.id]
  }),
  questions: many(questions),
  answers: many(answers),
  roundResults: many(roundResults),
  userSessionState: many(userSessionState)
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  round: one(rounds, {
    fields: [questions.round_id],
    references: [rounds.id]
  }),
  answers: many(answers),
  userSessionState: many(userSessionState)
}));

export const answersRelations = relations(answers, ({ one }) => ({
  gameSession: one(gameSessions, {
    fields: [answers.session_id],
    references: [gameSessions.id]
  }),
  question: one(questions, {
    fields: [answers.question_id],
    references: [questions.id]
  }),
  user: one(users, {
    fields: [answers.user_id],
    references: [users.id]
  }),
  round: one(rounds, {
    fields: [answers.round_id],
    references: [rounds.id]
  })
}));

export const roundResultsRelations = relations(roundResults, ({ one }) => ({
  gameSession: one(gameSessions, {
    fields: [roundResults.session_id],
    references: [gameSessions.id]
  }),
  round: one(rounds, {
    fields: [roundResults.round_id],
    references: [rounds.id]
  }),
  team: one(teams, {
    fields: [roundResults.team_id],
    references: [teams.id]
  })
}));

export const teamRegistrationsRelations = relations(teamRegistrations, ({ one }) => ({
  team: one(teams, {
    fields: [teamRegistrations.team_id],
    references: [teams.id]
  }),
  gameSession: one(gameSessions, {
    fields: [teamRegistrations.session_id],
    references: [gameSessions.id]
  })
}));

export const userSessionStateRelations = relations(userSessionState, ({ one }) => ({
  user: one(users, {
    fields: [userSessionState.user_id],
    references: [users.id]
  }),
  gameSession: one(gameSessions, {
    fields: [userSessionState.session_id],
    references: [gameSessions.id]
  }),
  round: one(rounds, {
    fields: [userSessionState.round_id],
    references: [rounds.id]
  }),
  currentQuestion: one(questions, {
    fields: [userSessionState.current_question_id],
    references: [questions.id]
  })
}));