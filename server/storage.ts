import { 
  type User, 
  type InsertUser, 
  type Tenant, 
  type InsertTenant,
  type Trail,
  type InsertTrail,
  type Module,
  type InsertModule,
  type UserTrailProgress,
  type UserModuleProgress,
  type Badge,
  type UserBadge,
  type PointsHistory,
  type Community,
  type Event,
  type LoginRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Auth methods
  authenticateUser(credentials: LoginRequest): Promise<User | null>;
  
  // Tenant methods
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  getTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string, tenantId: string): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Trail methods
  getTrails(tenantId: string): Promise<Trail[]>;
  getTrail(id: string): Promise<Trail | undefined>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  updateTrail(id: string, updates: Partial<Trail>): Promise<Trail | undefined>;
  
  // Module methods
  getModulesByTrail(trailId: string): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  
  // Progress methods
  getUserTrailProgress(userId: string, tenantId: string): Promise<UserTrailProgress[]>;
  getUserTrailProgressById(userId: string, trailId: string): Promise<UserTrailProgress | undefined>;
  updateUserTrailProgress(userId: string, trailId: string, updates: Partial<UserTrailProgress>): Promise<UserTrailProgress>;
  
  getUserModuleProgress(userId: string, moduleId: string): Promise<UserModuleProgress | undefined>;
  updateUserModuleProgress(userId: string, moduleId: string, updates: Partial<UserModuleProgress>): Promise<UserModuleProgress>;
  
  // Gamification methods
  getBadges(tenantId: string): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  
  getPointsHistory(userId: string): Promise<PointsHistory[]>;
  addPoints(userId: string, points: number, reason: string, referenceId?: string, referenceType?: string): Promise<PointsHistory>;
  
  // Leaderboard methods
  getLeaderboard(tenantId: string, limit?: number): Promise<User[]>;
  
  // Community methods
  getCommunities(tenantId: string): Promise<Community[]>;
  
  // Events methods
  getEvents(tenantId: string): Promise<Event[]>;
  getUpcomingEvents(tenantId: string, limit?: number): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private tenants: Map<string, Tenant>;
  private users: Map<string, User>;
  private trails: Map<string, Trail>;
  private modules: Map<string, Module>;
  private userTrailProgress: Map<string, UserTrailProgress>;
  private userModuleProgress: Map<string, UserModuleProgress>;
  private badges: Map<string, Badge>;
  private userBadges: Map<string, UserBadge>;
  private pointsHistory: Map<string, PointsHistory>;
  private communities: Map<string, Community>;
  private events: Map<string, Event>;

  constructor() {
    this.tenants = new Map();
    this.users = new Map();
    this.trails = new Map();
    this.modules = new Map();
    this.userTrailProgress = new Map();
    this.userModuleProgress = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.pointsHistory = new Map();
    this.communities = new Map();
    this.events = new Map();
    
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create tenants
    const cvoTenant: Tenant = {
      id: "cvo-tenant-1",
      name: "CVO Company",
      brandName: "CVO Company Platform",
      domain: "cvo.orquestra.app",
      theme: {
        primaryColor: "hsl(147, 51%, 47%)",
        secondaryColor: "hsl(197, 71%, 52%)",
        accentColor: "hsl(45, 93%, 58%)"
      },
      settings: {
        welcomeMessage: "Continue sua jornada de aprendizado na CVO Company",
        features: ["trails", "communities", "reports", "gamification"]
      },
      isActive: true,
      createdAt: new Date()
    };

    const carvionTenant: Tenant = {
      id: "carvion-tenant-1",
      name: "Carvion Internal",
      brandName: "Carvion Learning Hub",
      domain: "carvion.orquestra.app",
      theme: {
        primaryColor: "hsl(262, 83%, 58%)",
        secondaryColor: "hsl(348, 83%, 58%)",
        accentColor: "hsl(31, 81%, 56%)"
      },
      settings: {
        welcomeMessage: "Bem-vindo ao hub de aprendizado da Carvion Tech",
        features: ["trails", "communities", "reports", "gamification", "admin"]
      },
      isActive: true,
      createdAt: new Date()
    };

    this.tenants.set(cvoTenant.id, cvoTenant);
    this.tenants.set(carvionTenant.id, carvionTenant);

    // Create users
    const users: User[] = [
      {
        id: "user-1",
        tenantId: cvoTenant.id,
        username: "carlos.jose",
        email: "carlos@cvocompany.com",
        password: "password123",
        firstName: "Carlos",
        lastName: "José",
        role: "student",
        department: "Gestão",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        totalPoints: 2340,
        level: "Avançado",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-2",
        tenantId: cvoTenant.id,
        username: "maria.silva",
        email: "maria.silva@cvocompany.com",
        password: "password123",
        firstName: "Maria",
        lastName: "Silva",
        role: "admin",
        department: "Marketing",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        totalPoints: 3240,
        level: "Expert",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-3",
        tenantId: cvoTenant.id,
        username: "joao.santos",
        email: "joao.santos@cvocompany.com",
        password: "password123",
        firstName: "João",
        lastName: "Santos",
        role: "educator",
        department: "Vendas",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        totalPoints: 2890,
        level: "Avançado",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-4",
        tenantId: carvionTenant.id,
        username: "admin.carvion",
        email: "admin@carvion.com",
        password: "password123",
        firstName: "Admin",
        lastName: "Carvion",
        role: "super_admin",
        department: "TI",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
        totalPoints: 5000,
        level: "Master",
        isActive: true,
        createdAt: new Date()
      }
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Create trails
    const trails: Trail[] = [
      {
        id: "trail-1",
        tenantId: cvoTenant.id,
        title: "Marketing Digital Estratégico",
        description: "Aprenda as principais estratégias de marketing digital para impulsionar seus negócios",
        category: "Marketing",
        difficulty: "intermediate",
        estimatedHours: 20,
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300",
        totalModules: 8,
        pointsReward: 500,
        isActive: true,
        createdBy: "user-2",
        createdAt: new Date()
      },
      {
        id: "trail-2",
        tenantId: cvoTenant.id,
        title: "Liderança e Gestão de Equipes",
        description: "Desenvolva suas habilidades de liderança e aprenda a gerir equipes de alta performance",
        category: "Liderança",
        difficulty: "advanced",
        estimatedHours: 15,
        thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300",
        totalModules: 6,
        pointsReward: 400,
        isActive: true,
        createdBy: "user-3",
        createdAt: new Date()
      },
      {
        id: "trail-3",
        tenantId: cvoTenant.id,
        title: "Análise de Dados para Negócios",
        description: "Domine as ferramentas e técnicas de análise de dados para tomada de decisão",
        category: "Analytics",
        difficulty: "intermediate",
        estimatedHours: 25,
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300",
        totalModules: 10,
        pointsReward: 600,
        isActive: true,
        createdBy: "user-2",
        createdAt: new Date()
      }
    ];

    trails.forEach(trail => this.trails.set(trail.id, trail));

    // Create modules
    const modules: Module[] = [
      {
        id: "module-1",
        trailId: "trail-1",
        title: "Fundamentos do Marketing Digital",
        description: "Introdução aos conceitos básicos do marketing digital",
        content: "Conteúdo do módulo sobre fundamentos...",
        contentType: "video",
        contentUrl: "https://example.com/video1",
        duration: 45,
        order: 1,
        pointsReward: 50,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "module-2",
        trailId: "trail-1",
        title: "SEO e Analytics",
        description: "Otimização para mecanismos de busca e análise de dados",
        content: "Conteúdo do módulo sobre SEO...",
        contentType: "interactive",
        contentUrl: "https://example.com/interactive1",
        duration: 60,
        order: 2,
        pointsReward: 60,
        isActive: true,
        createdAt: new Date()
      }
    ];

    modules.forEach(module => this.modules.set(module.id, module));

    // Create user progress
    const userProgress: UserTrailProgress[] = [
      {
        id: "progress-1",
        userId: "user-1",
        trailId: "trail-1",
        currentModuleId: "module-2",
        completedModules: 2,
        progressPercentage: 37,
        totalTimeSpent: 120,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: null,
        lastAccessedAt: new Date()
      },
      {
        id: "progress-2",
        userId: "user-1",
        trailId: "trail-2",
        currentModuleId: null,
        completedModules: 4,
        progressPercentage: 66,
        totalTimeSpent: 180,
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        completedAt: null,
        lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    userProgress.forEach(progress => 
      this.userTrailProgress.set(`${progress.userId}-${progress.trailId}`, progress)
    );

    // Create badges
    const badges: Badge[] = [
      {
        id: "badge-1",
        tenantId: cvoTenant.id,
        name: "Expert em Marketing",
        description: "Completou 5 trilhas de marketing digital",
        iconUrl: "fa-trophy",
        category: "marketing",
        pointsRequired: 1000,
        criteria: { type: "trails_completed", value: 5, description: "Complete 5 trilhas de marketing" },
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "badge-2",
        tenantId: cvoTenant.id,
        name: "Participação Ativa",
        description: "7 dias consecutivos de atividade",
        iconUrl: "fa-medal",
        category: "engagement",
        pointsRequired: 500,
        criteria: { type: "consecutive_days", value: 7, description: "Acesse a plataforma por 7 dias consecutivos" },
        isActive: true,
        createdAt: new Date()
      }
    ];

    badges.forEach(badge => this.badges.set(badge.id, badge));

    // Create events
    const events: Event[] = [
      {
        id: "event-1",
        tenantId: cvoTenant.id,
        title: "Webinar: Tendências 2024",
        description: "Discussão sobre as principais tendências de mercado para 2024",
        eventType: "webinar",
        instructorName: "Dr. Ricardo Lopes",
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        maxParticipants: 100,
        currentParticipants: 67,
        isActive: true,
        createdBy: "user-2",
        createdAt: new Date()
      },
      {
        id: "event-2",
        tenantId: cvoTenant.id,
        title: "Workshop: Liderança 4.0",
        description: "Workshop prático sobre liderança na era digital",
        eventType: "workshop",
        instructorName: "Prof. Maria Fernanda",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        maxParticipants: 50,
        currentParticipants: 23,
        isActive: true,
        createdBy: "user-3",
        createdAt: new Date()
      }
    ];

    events.forEach(event => this.events.set(event.id, event));
  }

  async authenticateUser(credentials: LoginRequest): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      u => u.email === credentials.email && 
           u.password === credentials.password && 
           u.tenantId === credentials.tenantId
    );
    return user || null;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(t => t.domain === domain);
  }

  async getTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(t => t.isActive);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const tenant: Tenant = { 
      ...insertTenant, 
      id: randomUUID(),
      createdAt: new Date()
    };
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string, tenantId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      u => u.email === email && u.tenantId === tenantId
    );
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.tenantId === tenantId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: randomUUID(),
      totalPoints: 0,
      level: "Iniciante",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getTrails(tenantId: string): Promise<Trail[]> {
    return Array.from(this.trails.values()).filter(t => t.tenantId === tenantId && t.isActive);
  }

  async getTrail(id: string): Promise<Trail | undefined> {
    return this.trails.get(id);
  }

  async createTrail(insertTrail: InsertTrail): Promise<Trail> {
    const trail: Trail = { 
      ...insertTrail, 
      id: randomUUID(),
      createdAt: new Date()
    };
    this.trails.set(trail.id, trail);
    return trail;
  }

  async updateTrail(id: string, updates: Partial<Trail>): Promise<Trail | undefined> {
    const trail = this.trails.get(id);
    if (trail) {
      const updatedTrail = { ...trail, ...updates };
      this.trails.set(id, updatedTrail);
      return updatedTrail;
    }
    return undefined;
  }

  async getModulesByTrail(trailId: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(m => m.trailId === trailId && m.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async getModule(id: string): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const module: Module = { 
      ...insertModule, 
      id: randomUUID(),
      createdAt: new Date()
    };
    this.modules.set(module.id, module);
    return module;
  }

  async getUserTrailProgress(userId: string, tenantId: string): Promise<UserTrailProgress[]> {
    return Array.from(this.userTrailProgress.values()).filter(p => p.userId === userId);
  }

  async getUserTrailProgressById(userId: string, trailId: string): Promise<UserTrailProgress | undefined> {
    return this.userTrailProgress.get(`${userId}-${trailId}`);
  }

  async updateUserTrailProgress(userId: string, trailId: string, updates: Partial<UserTrailProgress>): Promise<UserTrailProgress> {
    const key = `${userId}-${trailId}`;
    const existing = this.userTrailProgress.get(key);
    
    const progress: UserTrailProgress = existing ? 
      { ...existing, ...updates } : 
      {
        id: randomUUID(),
        userId,
        trailId,
        currentModuleId: null,
        completedModules: 0,
        progressPercentage: 0,
        totalTimeSpent: 0,
        startedAt: new Date(),
        completedAt: null,
        lastAccessedAt: new Date(),
        ...updates
      };
    
    this.userTrailProgress.set(key, progress);
    return progress;
  }

  async getUserModuleProgress(userId: string, moduleId: string): Promise<UserModuleProgress | undefined> {
    return this.userModuleProgress.get(`${userId}-${moduleId}`);
  }

  async updateUserModuleProgress(userId: string, moduleId: string, updates: Partial<UserModuleProgress>): Promise<UserModuleProgress> {
    const key = `${userId}-${moduleId}`;
    const existing = this.userModuleProgress.get(key);
    
    const progress: UserModuleProgress = existing ? 
      { ...existing, ...updates } : 
      {
        id: randomUUID(),
        userId,
        moduleId,
        isCompleted: false,
        timeSpent: 0,
        completedAt: null,
        ...updates
      };
    
    this.userModuleProgress.set(key, progress);
    return progress;
  }

  async getBadges(tenantId: string): Promise<Badge[]> {
    return Array.from(this.badges.values()).filter(b => b.tenantId === tenantId && b.isActive);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(ub => ub.userId === userId);
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const userBadge: UserBadge = {
      id: randomUUID(),
      userId,
      badgeId,
      earnedAt: new Date()
    };
    this.userBadges.set(userBadge.id, userBadge);
    return userBadge;
  }

  async getPointsHistory(userId: string): Promise<PointsHistory[]> {
    return Array.from(this.pointsHistory.values())
      .filter(ph => ph.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async addPoints(userId: string, points: number, reason: string, referenceId?: string, referenceType?: string): Promise<PointsHistory> {
    const pointsRecord: PointsHistory = {
      id: randomUUID(),
      userId,
      points,
      reason,
      referenceId,
      referenceType: referenceType as any,
      createdAt: new Date()
    };
    
    this.pointsHistory.set(pointsRecord.id, pointsRecord);
    
    // Update user total points
    const user = this.users.get(userId);
    if (user) {
      user.totalPoints += points;
      this.users.set(userId, user);
    }
    
    return pointsRecord;
  }

  async getLeaderboard(tenantId: string, limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(u => u.tenantId === tenantId && u.isActive)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }

  async getCommunities(tenantId: string): Promise<Community[]> {
    return Array.from(this.communities.values()).filter(c => c.tenantId === tenantId);
  }

  async getEvents(tenantId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(e => e.tenantId === tenantId && e.isActive);
  }

  async getUpcomingEvents(tenantId: string, limit: number = 5): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(e => e.tenantId === tenantId && e.isActive && e.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
