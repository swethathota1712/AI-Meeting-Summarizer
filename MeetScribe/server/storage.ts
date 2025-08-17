import { type User, type InsertUser, type Summary, type InsertSummary, type EmailShare, type InsertEmailShare } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummary(id: string): Promise<Summary | undefined>;
  updateSummary(id: string, updates: Partial<InsertSummary>): Promise<Summary | undefined>;
  createEmailShare(emailShare: InsertEmailShare): Promise<EmailShare>;
  getEmailSharesBySummaryId(summaryId: string): Promise<EmailShare[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private summaries: Map<string, Summary>;
  private emailShares: Map<string, EmailShare>;

  constructor() {
    this.users = new Map();
    this.summaries = new Map();
    this.emailShares = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = randomUUID();
    const summary: Summary = { 
      ...insertSummary,
      editedSummary: insertSummary.editedSummary ?? null,
      id,
      createdAt: new Date()
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async updateSummary(id: string, updates: Partial<InsertSummary>): Promise<Summary | undefined> {
    const existing = this.summaries.get(id);
    if (!existing) return undefined;
    
    const updated: Summary = { ...existing, ...updates };
    this.summaries.set(id, updated);
    return updated;
  }

  async createEmailShare(insertEmailShare: InsertEmailShare): Promise<EmailShare> {
    const id = randomUUID();
    const emailShare: EmailShare = { 
      ...insertEmailShare,
      message: insertEmailShare.message ?? null,
      recipients: insertEmailShare.recipients as string[],
      id,
      sentAt: new Date()
    };
    this.emailShares.set(id, emailShare);
    return emailShare;
  }

  async getEmailSharesBySummaryId(summaryId: string): Promise<EmailShare[]> {
    return Array.from(this.emailShares.values()).filter(
      (emailShare) => emailShare.summaryId === summaryId
    );
  }
}

export const storage = new MemStorage();
