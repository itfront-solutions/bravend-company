import type { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { nanoid } from "nanoid";
import { 
  calculateNpsFromScores, 
  calculateWeightedIndex,
  calculateAdjustedNps,
  extractNpsScores,
  calculateNpsTrends,
  calculateNpsBySegment,
  validateNpsScores
} from "./nps-calculations";

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
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Validation schemas
const createSurveySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  language: z.string().default('pt'),
  hasWeightedIndex: z.boolean().default(false),
  alphaWeight: z.number().min(0).max(1).default(0.8),
  collectUntil: z.string().datetime().optional(),
  allowAnonymous: z.boolean().default(true),
  requireConsent: z.boolean().default(true),
  brandingConfig: z.record(z.any()).optional()
});

const addQuestionSchema = z.object({
  type: z.enum(['nps', 'likert', 'single', 'multi', 'rating', 'text']),
  title: z.string().min(1),
  description: z.string().optional(),
  required: z.boolean().default(true),
  weight: z.number().min(0).max(1).default(1.0),
  orderIdx: z.number().int().min(0),
  skipLogic: z.record(z.any()).optional()
});

const addOptionSchema = z.object({
  label: z.string().min(1),
  valueNum: z.number().optional(),
  altWeight: z.number().min(-1).max(1).default(0),
  orderIdx: z.number().int().min(0)
});

const createInvitationSchema = z.object({
  contacts: z.array(z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    segments: z.record(z.string()).optional()
  })).min(1),
  channel: z.enum(['email', 'whatsapp', 'link', 'qr']),
  sendReminders: z.boolean().default(true),
  reminderDays: z.array(z.number().int().positive()).default([3, 7])
});

const submitResponseSchema = z.object({
  token: z.string(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    optionId: z.string().uuid().optional(),
    valueText: z.string().optional(),
    valueNum: z.number().optional()
  })),
  isAnonymous: z.boolean().default(false),
  respondentId: z.string().uuid().optional()
});

// Mock storage (substituir por implementação real do banco)
const mockSurveys = new Map();
const mockQuestions = new Map();
const mockOptions = new Map();
const mockInvitations = new Map();
const mockResponses = new Map();
const mockAnswers = new Map();

export function registerNpsRoutes(app: Express) {
  
  // ===== SURVEYS =====

  // POST /api/nps/surveys/create - Criar pesquisa (formato frontend)
  app.post("/api/nps/surveys/create", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;
      
      if (!tenantId || !userId) return res.status(403).json({ message: "Authentication required" });
      
      // Validar dados básicos
      if (!data.name || !data.name.trim()) {
        return res.status(400).json({ message: "Nome da pesquisa é obrigatório" });
      }
      
      if (!data.questions || data.questions.length === 0) {
        return res.status(400).json({ message: "Pelo menos uma pergunta é obrigatória" });
      }
      
      if (!data.distribution || !data.distribution.channels || !data.distribution.channels.some((ch: any) => ch.enabled)) {
        return res.status(400).json({ message: "Pelo menos um canal de distribuição deve estar ativo" });
      }
      
      const surveyId = nanoid();
      const survey = {
        id: surveyId,
        tenantId,
        name: data.name,
        description: data.description || '',
        objective: data.objective || '',
        targetAudience: data.targetAudience || '',
        tags: data.tags || [],
        status: data.status || 'draft',
        settings: data.settings || {
          useWeightedIndex: false,
          anonymousResponses: true,
          requiresAuth: false,
          allowPartialResponses: true,
          showProgressBar: true
        },
        distribution: data.distribution,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Campos de estatística iniciais
        totalResponses: 0,
        nps: 0,
        margin: 0
      };
      
      mockSurveys.set(surveyId, survey);
      
      // Criar perguntas
      data.questions.forEach((question: any, index: number) => {
        const questionId = nanoid();
        const questionRecord = {
          id: questionId,
          surveyId,
          type: question.type,
          title: question.text,
          description: '',
          required: question.required || false,
          weight: question.weight || 1.0,
          orderIdx: index,
          createdAt: new Date().toISOString()
        };
        
        mockQuestions.set(questionId, questionRecord);
        
        // Auto-criar opções para pergunta NPS
        if (question.type === 'nps') {
          for (let i = 0; i <= 10; i++) {
            const optionId = nanoid();
            const option = {
              id: optionId,
              questionId,
              label: i.toString(),
              valueNum: i,
              altWeight: 0,
              orderIdx: i,
              createdAt: new Date().toISOString()
            };
            mockOptions.set(optionId, option);
          }
        }
        
        // Criar opções para múltipla escolha
        if (question.type === 'multiple_choice' && question.options) {
          question.options.forEach((optionText: string, optionIndex: number) => {
            const optionId = nanoid();
            const option = {
              id: optionId,
              questionId,
              label: optionText,
              valueNum: null,
              altWeight: 0,
              orderIdx: optionIndex,
              createdAt: new Date().toISOString()
            };
            mockOptions.set(optionId, option);
          });
        }
      });
      
      res.status(201).json(survey);
    } catch (error) {
      console.error('Error creating survey:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // GET /api/nps/surveys - Listar questionários
  app.get("/api/nps/surveys", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(403).json({ message: "Tenant required" });
      
      const surveys = Array.from(mockSurveys.values())
        .filter((s: any) => s.tenantId === tenantId)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json({
        surveys,
        total: surveys.length
      });
    } catch (error) {
      console.error('Error fetching surveys:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // POST /api/nps/surveys - Criar questionário
  app.post("/api/nps/surveys", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = createSurveySchema.parse(req.body);
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;
      
      if (!tenantId || !userId) return res.status(403).json({ message: "Authentication required" });
      
      const surveyId = nanoid();
      const survey = {
        id: surveyId,
        tenantId,
        ...data,
        status: 'draft',
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockSurveys.set(surveyId, survey);
      
      res.status(201).json(survey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error creating survey:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // GET /api/nps/surveys/:id - Obter questionário específico
  app.get("/api/nps/surveys/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const survey = mockSurveys.get(id);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Verificar acesso
      if (survey.tenantId !== req.user?.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Incluir perguntas e opções
      const questions = Array.from(mockQuestions.values())
        .filter((q: any) => q.surveyId === id)
        .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
        .map((question: any) => ({
          ...question,
          options: Array.from(mockOptions.values())
            .filter((o: any) => o.questionId === question.id)
            .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
        }));
      
      res.json({
        ...survey,
        questions
      });
    } catch (error) {
      console.error('Error fetching survey:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ===== QUESTIONS =====
  
  // POST /api/nps/surveys/:id/questions - Adicionar pergunta
  app.post("/api/nps/surveys/:surveyId/questions", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { surveyId } = req.params;
      const data = addQuestionSchema.parse(req.body);
      
      const survey = mockSurveys.get(surveyId);
      if (!survey || survey.tenantId !== req.user?.tenantId) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      const questionId = nanoid();
      const question = {
        id: questionId,
        surveyId,
        ...data,
        createdAt: new Date().toISOString()
      };
      
      mockQuestions.set(questionId, question);
      
      // Auto-criar opções para pergunta NPS
      if (data.type === 'nps') {
        for (let i = 0; i <= 10; i++) {
          const optionId = nanoid();
          const option = {
            id: optionId,
            questionId,
            label: i.toString(),
            valueNum: i,
            altWeight: 0,
            orderIdx: i,
            createdAt: new Date().toISOString()
          };
          mockOptions.set(optionId, option);
        }
      }
      
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error adding question:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ===== OPTIONS =====
  
  // POST /api/nps/questions/:questionId/options - Adicionar opção
  app.post("/api/nps/questions/:questionId/options", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { questionId } = req.params;
      const data = addOptionSchema.parse(req.body);
      
      const question = mockQuestions.get(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Verificar acesso via survey
      const survey = mockSurveys.get(question.surveyId);
      if (!survey || survey.tenantId !== req.user?.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const optionId = nanoid();
      const option = {
        id: optionId,
        questionId,
        ...data,
        createdAt: new Date().toISOString()
      };
      
      mockOptions.set(optionId, option);
      
      res.status(201).json(option);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error adding option:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ===== INVITATIONS =====
  
  // POST /api/nps/surveys/:id/invitations - Enviar convites
  app.post("/api/nps/surveys/:surveyId/invitations", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { surveyId } = req.params;
      const data = createInvitationSchema.parse(req.body);
      
      const survey = mockSurveys.get(surveyId);
      if (!survey || survey.tenantId !== req.user?.tenantId) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      const invitations = [];
      
      for (const contact of data.contacts) {
        const token = nanoid(32);
        const invitationId = nanoid();
        
        const invitation = {
          id: invitationId,
          surveyId,
          contactId: null, // Mock: poderia referenciar tabela de contatos
          channel: data.channel,
          token,
          email: contact.email,
          phone: contact.phone,
          sentAt: new Date().toISOString(),
          reminderCount: 0,
          createdAt: new Date().toISOString()
        };
        
        mockInvitations.set(invitationId, invitation);
        invitations.push({
          ...invitation,
          surveyLink: `${req.protocol}://${req.get('host')}/survey/${surveyId}?token=${token}`
        });
      }
      
      res.status(201).json({
        message: `${invitations.length} convites criados`,
        invitations
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error creating invitations:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ===== RESPONSES =====
  
  // POST /api/nps/responses - Submeter resposta (público, via token)
  app.post("/api/nps/responses", (req: Request, res: Response) => {
    try {
      const data = submitResponseSchema.parse(req.body);
      
      // Verificar token
      const invitation = Array.from(mockInvitations.values())
        .find((inv: any) => inv.token === data.token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invalid token" });
      }
      
      // Verificar se já respondeu
      const existingResponse = Array.from(mockResponses.values())
        .find((resp: any) => resp.invitationId === invitation.id);
      
      if (existingResponse) {
        return res.status(400).json({ message: "Already responded" });
      }
      
      const responseId = nanoid();
      const response = {
        id: responseId,
        surveyId: invitation.surveyId,
        invitationId: invitation.id,
        respondentId: data.respondentId,
        status: 'completed',
        isAnonymous: data.isAnonymous,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      mockResponses.set(responseId, response);
      
      // Salvar respostas individuais
      for (const answer of data.answers) {
        const answerId = nanoid();
        const answerRecord = {
          id: answerId,
          responseId,
          questionId: answer.questionId,
          optionId: answer.optionId,
          valueText: answer.valueText,
          valueNum: answer.valueNum,
          answeredAt: new Date().toISOString()
        };
        mockAnswers.set(answerId, answerRecord);
      }
      
      // Marcar convite como respondido
      invitation.respondedAt = new Date().toISOString();
      mockInvitations.set(invitation.id, invitation);
      
      res.status(201).json({
        message: "Resposta enviada com sucesso",
        responseId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error submitting response:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ===== RESULTS =====
  
  // GET /api/nps/surveys/:id/results/nps - Resultados NPS clássico
  app.get("/api/nps/surveys/:surveyId/results/nps", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { surveyId } = req.params;
      const { segment, period = 'all' } = req.query;
      
      const survey = mockSurveys.get(surveyId);
      if (!survey || survey.tenantId !== req.user?.tenantId) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Encontrar pergunta NPS
      const npsQuestion = Array.from(mockQuestions.values())
        .find((q: any) => q.surveyId === surveyId && q.type === 'nps');
      
      if (!npsQuestion) {
        return res.status(400).json({ message: "No NPS question found in survey" });
      }
      
      // Obter respostas
      const responses = Array.from(mockResponses.values())
        .filter((r: any) => r.surveyId === surveyId && r.status === 'completed')
        .map((r: any) => ({
          ...r,
          answers: Array.from(mockAnswers.values())
            .filter((a: any) => a.responseId === r.id)
        }));
      
      // Extrair scores NPS
      const scores = extractNpsScores(responses, npsQuestion.id);
      
      if (scores.length === 0) {
        return res.json({
          nps: 0,
          margin95: 0,
          totalResponses: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          promotersPct: 0,
          passivesPct: 0,
          detractorsPct: 0,
          message: "Nenhuma resposta encontrada"
        });
      }
      
      // Validar scores
      const validation = validateNpsScores(scores);
      if (!validation.valid) {
        return res.status(400).json({
          message: "Invalid NPS scores",
          errors: validation.errors
        });
      }
      
      // Calcular NPS
      const npsStats = calculateNpsFromScores(scores);
      
      // Calcular tendência se solicitado
      let trends;
      if (req.query.includeTrends === 'true') {
        trends = calculateNpsTrends(responses, npsQuestion.id, 'weekly');
      }
      
      // Calcular por segmento se especificado
      let segments;
      if (segment) {
        segments = calculateNpsBySegment(
          responses,
          npsQuestion.id,
          segment as string,
          (response) => {
            // Mock: extrair segmento do response (implementar lógica real)
            return 'segmento-exemplo';
          }
        );
      }
      
      res.json({
        ...npsStats,
        trends,
        segments
      });
    } catch (error) {
      console.error('Error calculating NPS results:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // GET /api/nps/surveys/:id/results/weighted - Índice ponderado
  app.get("/api/nps/surveys/:surveyId/results/weighted", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { surveyId } = req.params;
      
      const survey = mockSurveys.get(surveyId);
      if (!survey || survey.tenantId !== req.user?.tenantId) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      if (!survey.hasWeightedIndex) {
        return res.status(400).json({ message: "Weighted index not enabled for this survey" });
      }
      
      // Obter perguntas com opções
      const questions = Array.from(mockQuestions.values())
        .filter((q: any) => q.surveyId === surveyId)
        .map((question: any) => ({
          ...question,
          options: Array.from(mockOptions.values())
            .filter((o: any) => o.questionId === question.id)
        }));
      
      // Obter respostas
      const responses = Array.from(mockResponses.values())
        .filter((r: any) => r.surveyId === surveyId && r.status === 'completed');
      
      if (responses.length === 0) {
        return res.json({
          index: 50,
          adjustedNps: null,
          message: "Nenhuma resposta encontrada"
        });
      }
      
      // Calcular índice para cada resposta e fazer média
      let totalIndex = 0;
      let validResponses = 0;
      
      for (const response of responses) {
        const answers = Array.from(mockAnswers.values())
          .filter((a: any) => a.responseId === response.id);
        
        const weightedResult = calculateWeightedIndex(questions, answers);
        totalIndex += weightedResult.index;
        validResponses++;
      }
      
      const averageIndex = validResponses > 0 ? totalIndex / validResponses : 50;
      
      // Calcular NPS ajustado se disponível
      let adjustedNps = null;
      const npsQuestion = questions.find((q: any) => q.type === 'nps');
      if (npsQuestion) {
        const allAnswers = Array.from(mockAnswers.values());
        const responsesWithAnswers = responses.map((r: any) => ({
          ...r,
          answers: allAnswers.filter((a: any) => a.responseId === r.id)
        }));
        
        const scores = extractNpsScores(responsesWithAnswers, npsQuestion.id);
        if (scores.length > 0) {
          const npsStats = calculateNpsFromScores(scores);
          adjustedNps = calculateAdjustedNps(
            npsStats.nps / 100,
            averageIndex,
            survey.alphaWeight || 0.8
          );
        }
      }
      
      res.json({
        index: Math.round(averageIndex * 10) / 10,
        adjustedNps,
        totalResponses: validResponses
      });
    } catch (error) {
      console.error('Error calculating weighted index:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // GET /api/nps/surveys/:id/responses - Listar respostas
  app.get("/api/nps/surveys/:surveyId/responses", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { surveyId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const survey = mockSurveys.get(surveyId);
      if (!survey || survey.tenantId !== req.user?.tenantId) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      const allResponses = Array.from(mockResponses.values())
        .filter((r: any) => r.surveyId === surveyId)
        .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      const offset = (Number(page) - 1) * Number(limit);
      const paginatedResponses = allResponses.slice(offset, offset + Number(limit));
      
      const responsesWithAnswers = paginatedResponses.map((response: any) => ({
        ...response,
        answers: Array.from(mockAnswers.values())
          .filter((a: any) => a.responseId === response.id)
      }));
      
      res.json({
        responses: responsesWithAnswers,
        total: allResponses.length,
        page: Number(page),
        pages: Math.ceil(allResponses.length / Number(limit))
      });
    } catch (error) {
      console.error('Error fetching responses:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // GET /api/nps/calculate - Calculadora NPS rápida (como npscalculator.com)
  app.post("/api/nps/calculate", (req: Request, res: Response) => {
    try {
      const { scores } = req.body;
      
      if (!Array.isArray(scores) || scores.some(s => typeof s !== 'number' || s < 0 || s > 10)) {
        return res.status(400).json({ message: "Scores deve ser um array de números entre 0 e 10" });
      }
      
      const validation = validateNpsScores(scores);
      if (!validation.valid) {
        return res.status(400).json({
          message: "Invalid NPS scores",
          errors: validation.errors
        });
      }
      
      const npsStats = calculateNpsFromScores(scores);
      
      res.json(npsStats);
    } catch (error) {
      console.error('Error calculating NPS:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}