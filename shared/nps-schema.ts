import { pgTable, serial, varchar, text, integer, boolean, timestamp, real, pgEnum, uuid, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for NPS system
export const surveyStatusEnum = pgEnum("survey_status", ["draft", "published", "closed", "archived"]);
export const questionTypeEnum = pgEnum("question_type", ["nps", "likert", "single", "multi", "rating", "text"]);
export const channelEnum = pgEnum("channel_type", ["email", "whatsapp", "link", "qr"]);
export const responseStatusEnum = pgEnum("response_status", ["pending", "partial", "completed"]);

// NPS Surveys table
export const npsSurveys = pgTable("nps_surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: surveyStatusEnum("status").default('draft'),
  language: varchar("language", { length: 10 }).default('pt'),
  hasWeightedIndex: boolean("has_weighted_index").default(false),
  alphaWeight: real("alpha_weight").default(0.8), // para NPS ajustado
  collectUntil: timestamp("collect_until"),
  allowAnonymous: boolean("allow_anonymous").default(true),
  requireConsent: boolean("require_consent").default(true),
  brandingConfig: jsonb("branding_config"), // logo, cores, etc
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Questions table
export const npsQuestions = pgTable("nps_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => npsSurveys.id, { onDelete: 'cascade' }).notNull(),
  type: questionTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  required: boolean("required").default(true),
  weight: real("weight").default(1.0), // peso da pergunta (0-1)
  orderIdx: integer("order_idx").notNull(),
  skipLogic: jsonb("skip_logic"), // lógica de pular perguntas
  createdAt: timestamp("created_at").defaultNow()
});

// Options table (para perguntas de múltipla escolha, likert, etc)
export const npsOptions = pgTable("nps_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").references(() => npsQuestions.id, { onDelete: 'cascade' }).notNull(),
  label: text("label").notNull(),
  valueNum: real("value_num"), // valor numérico (0-10 para NPS, 1-5 para likert)
  altWeight: real("alt_weight").default(0), // peso da alternativa (-1 a +1)
  orderIdx: integer("order_idx").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Contacts table for survey distribution
export const npsContacts = pgTable("nps_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  name: varchar("name", { length: 255 }),
  segments: jsonb("segments"), // {region: 'SP', product: 'Premium', etc}
  optedIn: boolean("opted_in").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Invitations sent
export const npsInvitations = pgTable("nps_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => npsSurveys.id, { onDelete: 'cascade' }).notNull(),
  contactId: uuid("contact_id").references(() => npsContacts.id),
  channel: channelEnum("channel").notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }), // pode ser diferente do contact
  phone: varchar("phone", { length: 50 }),
  sentAt: timestamp("sent_at"),
  reminderCount: integer("reminder_count").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Responses
export const npsResponses = pgTable("nps_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => npsSurveys.id, { onDelete: 'cascade' }).notNull(),
  invitationId: uuid("invitation_id").references(() => npsInvitations.id),
  respondentId: uuid("respondent_id"), // opcional para anônimos
  status: responseStatusEnum("status").default('pending'),
  isAnonymous: boolean("is_anonymous").default(false),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  completedAt: timestamp("completed_at")
});

// Individual answers
export const npsAnswers = pgTable("nps_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id").references(() => npsResponses.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid("question_id").references(() => npsQuestions.id, { onDelete: 'cascade' }).notNull(),
  optionId: uuid("option_id").references(() => npsOptions.id), // null para texto aberto
  valueText: text("value_text"),
  valueNum: real("value_num"),
  answeredAt: timestamp("answered_at").defaultNow()
});

// NPS Results Cache (para performance)
export const npsResults = pgTable("nps_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => npsSurveys.id, { onDelete: 'cascade' }).notNull(),
  segmentFilter: jsonb("segment_filter"), // null = overall
  period: varchar("period", { length: 50 }), // 'all', '30d', '7d', etc
  totalResponses: integer("total_responses").default(0),
  promoters: integer("promoters").default(0),
  passives: integer("passives").default(0),
  detractors: integer("detractors").default(0),
  npsScore: real("nps_score").default(0),
  marginError: real("margin_error").default(0),
  weightedIndex: real("weighted_index"), // opcional
  adjustedNps: real("adjusted_nps"), // opcional
  calculatedAt: timestamp("calculated_at").defaultNow(),
  validUntil: timestamp("valid_until") // cache expiration
});

// Relations
export const npsSurveysRelations = relations(npsSurveys, ({ many }) => ({
  questions: many(npsQuestions),
  invitations: many(npsInvitations),
  responses: many(npsResponses),
  results: many(npsResults)
}));

export const npsQuestionsRelations = relations(npsQuestions, ({ one, many }) => ({
  survey: one(npsSurveys, {
    fields: [npsQuestions.surveyId],
    references: [npsSurveys.id]
  }),
  options: many(npsOptions),
  answers: many(npsAnswers)
}));

export const npsOptionsRelations = relations(npsOptions, ({ one, many }) => ({
  question: one(npsQuestions, {
    fields: [npsOptions.questionId],
    references: [npsQuestions.id]
  }),
  answers: many(npsAnswers)
}));

export const npsInvitationsRelations = relations(npsInvitations, ({ one, many }) => ({
  survey: one(npsSurveys, {
    fields: [npsInvitations.surveyId],
    references: [npsSurveys.id]
  }),
  contact: one(npsContacts, {
    fields: [npsInvitations.contactId],
    references: [npsContacts.id]
  }),
  responses: many(npsResponses)
}));

export const npsResponsesRelations = relations(npsResponses, ({ one, many }) => ({
  survey: one(npsSurveys, {
    fields: [npsResponses.surveyId],
    references: [npsSurveys.id]
  }),
  invitation: one(npsInvitations, {
    fields: [npsResponses.invitationId],
    references: [npsInvitations.id]
  }),
  answers: many(npsAnswers)
}));

export const npsAnswersRelations = relations(npsAnswers, ({ one }) => ({
  response: one(npsResponses, {
    fields: [npsAnswers.responseId],
    references: [npsResponses.id]
  }),
  question: one(npsQuestions, {
    fields: [npsAnswers.questionId],
    references: [npsQuestions.id]
  }),
  option: one(npsOptions, {
    fields: [npsAnswers.optionId],
    references: [npsOptions.id]
  })
}));

// Types
export type NpsSurvey = typeof npsSurveys.$inferSelect;
export type InsertNpsSurvey = typeof npsSurveys.$inferInsert;

export type NpsQuestion = typeof npsQuestions.$inferSelect;
export type InsertNpsQuestion = typeof npsQuestions.$inferInsert;

export type NpsOption = typeof npsOptions.$inferSelect;
export type InsertNpsOption = typeof npsOptions.$inferInsert;

export type NpsContact = typeof npsContacts.$inferSelect;
export type InsertNpsContact = typeof npsContacts.$inferInsert;

export type NpsInvitation = typeof npsInvitations.$inferSelect;
export type InsertNpsInvitation = typeof npsInvitations.$inferInsert;

export type NpsResponse = typeof npsResponses.$inferSelect;
export type InsertNpsResponse = typeof npsResponses.$inferInsert;

export type NpsAnswer = typeof npsAnswers.$inferSelect;
export type InsertNpsAnswer = typeof npsAnswers.$inferInsert;

export type NpsResult = typeof npsResults.$inferSelect;
export type InsertNpsResult = typeof npsResults.$inferInsert;

// NPS Calculation Types
export interface NpsStats {
  nps: number;
  margin95: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
}

export interface WeightedIndexResult {
  index: number; // 0-100
  adjustedNps?: number; // opcional
}

export interface NpsResultsData extends NpsStats {
  weightedIndex?: WeightedIndexResult;
  segments?: Record<string, NpsStats>;
  trends?: Array<{
    period: string;
    nps: number;
    responses: number;
  }>;
  comments?: Array<{
    text: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    themes?: string[];
    createdAt: Date;
  }>;
}