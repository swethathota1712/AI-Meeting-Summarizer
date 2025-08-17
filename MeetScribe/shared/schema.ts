import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const summaries = pgTable("summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalTranscript: text("original_transcript").notNull(),
  customPrompt: text("custom_prompt").notNull(),
  generatedSummary: text("generated_summary").notNull(),
  editedSummary: text("edited_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailShares = pgTable("email_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  summaryId: varchar("summary_id").notNull(),
  recipients: json("recipients").$type<string[]>().notNull(),
  subject: text("subject").notNull(),
  message: text("message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  originalTranscript: true,
  customPrompt: true,
  generatedSummary: true,
  editedSummary: true,
});

export const insertEmailShareSchema = createInsertSchema(emailShares).pick({
  summaryId: true,
  recipients: true,
  subject: true,
  message: true,
}).extend({
  recipients: z.array(z.string()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;
export type InsertEmailShare = z.infer<typeof insertEmailShareSchema>;
export type EmailShare = typeof emailShares.$inferSelect;
