import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateSummary, promptTemplates } from "./services/ai";
import { sendSummaryEmail } from "./services/email";
import { insertSummarySchema, insertEmailShareSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.txt') || file.originalname.endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .docx files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get prompt templates
  app.get("/api/templates", (req, res) => {
    res.json(promptTemplates);
  });

  // Upload and process transcript
  app.post("/api/upload", upload.single('transcript'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let transcriptText = "";
      
      if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
        transcriptText = req.file.buffer.toString('utf-8');
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
        // For simplicity, we'll treat .docx as text for now
        // In a real implementation, you'd use a library like mammoth to extract text from .docx
        transcriptText = req.file.buffer.toString('utf-8');
      }

      if (!transcriptText.trim()) {
        return res.status(400).json({ message: "File appears to be empty or unreadable" });
      }

      res.json({
        filename: req.file.originalname,
        size: req.file.size,
        content: transcriptText
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to process uploaded file" });
    }
  });

  // Generate AI summary
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { transcript, prompt } = req.body;

      if (!transcript || !prompt) {
        return res.status(400).json({ message: "Transcript and prompt are required" });
      }

      const summary = await generateSummary(transcript, prompt);
      
      // Save to storage
      const savedSummary = await storage.createSummary({
        originalTranscript: transcript,
        customPrompt: prompt,
        generatedSummary: summary,
        editedSummary: null
      });

      res.json({
        summaryId: savedSummary.id,
        summary: summary
      });
    } catch (error) {
      console.error("Summary generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate summary" 
      });
    }
  });

  // Update summary (for edits)
  app.patch("/api/summaries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { editedSummary } = req.body;

      if (!editedSummary) {
        return res.status(400).json({ message: "Edited summary is required" });
      }

      const updated = await storage.updateSummary(id, { editedSummary });
      
      if (!updated) {
        return res.status(404).json({ message: "Summary not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Summary update error:", error);
      res.status(500).json({ message: "Failed to update summary" });
    }
  });

  // Get summary
  app.get("/api/summaries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const summary = await storage.getSummary(id);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      res.json(summary);
    } catch (error) {
      console.error("Get summary error:", error);
      res.status(500).json({ message: "Failed to retrieve summary" });
    }
  });

  // Send email
  app.post("/api/send-email", async (req, res) => {
    try {
      const validatedData = insertEmailShareSchema.parse(req.body);
      
      const summary = await storage.getSummary(validatedData.summaryId);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      const summaryContent = summary.editedSummary || summary.generatedSummary;
      
      await sendSummaryEmail({
        recipients: validatedData.recipients,
        subject: validatedData.subject,
        message: validatedData.message || undefined,
        summaryHtml: summaryContent
      });

      // Save email share record
      await storage.createEmailShare(validatedData);

      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to send email" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
