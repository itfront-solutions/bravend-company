import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants table
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brandName: text("brand_name").notNull(),
  domain: text("domain").unique(),
  theme: jsonb("theme").$type<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
  }>(),
  settings: jsonb("settings").$type<{
    welcomeMessage?: string;
    features?: string[];
  }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").$type<"super_admin" | "admin" | "educator" | "student">().default("student"),
  department: text("department"),
  avatar: text("avatar"),
  totalPoints: integer("total_points").default(0),
  level: text("level").default("Iniciante"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning Trails table
export const trails = pgTable("trails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").$type<"beginner" | "intermediate" | "advanced">().default("beginner"),
  estimatedHours: integer("estimated_hours").default(0),
  thumbnailUrl: text("thumbnail_url"),
  totalModules: integer("total_modules").default(0),
  pointsReward: integer("points_reward").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Modules table
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trailId: varchar("trail_id").references(() => trails.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  contentType: text("content_type").$type<"video" | "text" | "quiz" | "interactive">().default("text"),
  contentUrl: text("content_url"),
  duration: integer("duration").default(0), // in minutes
  order: integer("order").notNull(),
  pointsReward: integer("points_reward").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Trail Progress table
export const userTrailProgress = pgTable("user_trail_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trailId: varchar("trail_id").references(() => trails.id).notNull(),
  currentModuleId: varchar("current_module_id").references(() => modules.id),
  completedModules: integer("completed_modules").default(0),
  progressPercentage: integer("progress_percentage").default(0),
  totalTimeSpent: integer("total_time_spent").default(0), // in minutes
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

// User Module Progress table
export const userModuleProgress = pgTable("user_module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").references(() => modules.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  timeSpent: integer("time_spent").default(0), // in minutes
  completedAt: timestamp("completed_at"),
});

// Badges table
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  category: text("category").notNull(),
  pointsRequired: integer("points_required").default(0),
  criteria: jsonb("criteria").$type<{
    type: string;
    value: number;
    description: string;
  }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Badges table
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: varchar("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Points History table
export const pointsHistory = pgTable("points_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  referenceId: varchar("reference_id"), // can reference trail, module, etc.
  referenceType: text("reference_type").$type<"trail" | "module" | "badge" | "daily_login" | "manual">(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communities table
export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  trailId: varchar("trail_id").references(() => trails.id),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Posts table
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").references(() => communities.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  title: text("title"),
  content: text("content").notNull(),
  parentPostId: varchar("parent_post_id").references(() => communityPosts.id),
  likesCount: integer("likes_count").default(0),
  repliesCount: integer("replies_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").$type<"webinar" | "workshop" | "business_game" | "meeting">().default("webinar"),
  instructorName: text("instructor_name"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  totalPoints: true,
}).extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertTrailSchema = createInsertSchema(trails).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  currentParticipants: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantId: z.string().min(1, "Please select a tenant"),
});

// Type exports
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrail = z.infer<typeof insertTrailSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Trail = typeof trails.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type UserTrailProgress = typeof userTrailProgress.$inferSelect;
export type UserModuleProgress = typeof userModuleProgress.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type PointsHistory = typeof pointsHistory.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type Event = typeof events.$inferSelect;
