import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { loginSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { wineQuizRoutes } from "./wine-quiz-routes";

// Extend Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware to check tenant access
function checkTenantAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const tenantId = req.params.tenantId || req.query.tenantId || req.body.tenantId;
  
  if (!tenantId || !req.user || req.user.tenantId !== tenantId) {
    return res.status(403).json({ message: "Access denied to this tenant" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenantId,
          role: user.role,
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
          totalPoints: user.totalPoints,
          level: user.level
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email, userData.tenantId);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenantId,
          role: user.role,
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          totalPoints: user.totalPoints,
          level: user.level
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        level: user.level
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Tenant routes
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const tenant = await storage.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Trail routes
  app.get("/api/tenants/:tenantId/trails", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const trails = await storage.getTrails(req.params.tenantId);
      res.json(trails);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/trails/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const trail = await storage.getTrail(req.params.id);
      if (!trail) {
        return res.status(404).json({ message: "Trail not found" });
      }
      
      // Check tenant access
      if (trail.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(trail);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/trails/:trailId/modules", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const trail = await storage.getTrail(req.params.trailId);
      if (!trail || trail.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const modules = await storage.getModulesByTrail(req.params.trailId);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Users can only access their own progress, admins can access any
      if (userId !== req.user!.userId && !['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const progress = await storage.getUserTrailProgress(userId, req.user!.tenantId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/trails/:trailId/progress", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId, trailId } = req.params;
      
      if (userId !== req.user!.userId && !['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const progress = await storage.getUserTrailProgressById(userId, trailId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:userId/trails/:trailId/progress", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId, trailId } = req.params;
      
      if (userId !== req.user!.userId && !['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const progress = await storage.updateUserTrailProgress(userId, trailId, req.body);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Gamification routes
  app.get("/api/tenants/:tenantId/badges", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const badges = await storage.getBadges(req.params.tenantId);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/badges", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      
      if (userId !== req.user!.userId && !['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/points", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      
      if (userId !== req.user!.userId && !['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const pointsHistory = await storage.getPointsHistory(userId);
      res.json(pointsHistory);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/points", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const { points, reason, referenceId, referenceType } = req.body;
      
      // Only admins can manually add points
      if (!['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const pointsRecord = await storage.addPoints(userId, points, reason, referenceId, referenceType);
      res.json(pointsRecord);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leaderboard routes
  app.get("/api/tenants/:tenantId/leaderboard", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(req.params.tenantId, limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Events routes
  app.get("/api/tenants/:tenantId/events", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await storage.getEvents(req.params.tenantId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tenants/:tenantId/events/upcoming", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const events = await storage.getUpcomingEvents(req.params.tenantId, limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/tenants/:tenantId/users", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getUsersByTenant(req.params.tenantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tenants/:tenantId/stats", authenticateToken, checkTenantAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!['admin', 'super_admin'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getUsersByTenant(req.params.tenantId);
      const trails = await storage.getTrails(req.params.tenantId);
      const activeUsers = users.filter(u => u.isActive).length;
      
      // Calculate engagement (mock calculation)
      const engagementRate = Math.floor(Math.random() * 30) + 60; // 60-90%
      const npsScore = Math.floor(Math.random() * 20) + 75; // 75-95
      
      res.json({
        activeUsers,
        totalTrails: trails.length,
        engagement: engagementRate,
        nps: npsScore
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chat routes
  app.post("/api/ai/chat", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, topic = 'board', provider = 'openai' } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const context = aiService.getGovernanceContext(topic);
      const messages = [
        { role: 'user' as const, content: message }
      ];

      const response = await aiService.generateResponse(messages, context, provider);
      res.json(response);
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/ai/conversation", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { messages, topic = 'board', provider = 'openai' } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
      }

      const context = aiService.getGovernanceContext(topic);
      const response = await aiService.generateResponse(messages, context, provider);
      res.json(response);
    } catch (error) {
      console.error('AI conversation error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wine Quiz routes
  app.use("/api/wine-quiz", wineQuizRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
