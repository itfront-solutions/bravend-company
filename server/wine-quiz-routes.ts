import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { wineQuizStorage } from './wine-quiz-storage';

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// AUTH ROUTES
router.post('/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await wineQuizStorage.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: admin.id, email: admin.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: admin.id, email: admin.email, isAdmin: true } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/auth/user/register', async (req, res) => {
  try {
    const { name, teamId, deviceFingerprint } = req.body;
    
    const team = await wineQuizStorage.getTeamById(teamId);
    if (!team) {
      return res.status(400).json({ message: 'Invalid team' });
    }

    const teamMembers = await wineQuizStorage.getUsersByTeamId(teamId);
    if (teamMembers.length >= (team.maxMembers || 4)) {
      return res.status(400).json({ message: 'Team is full' });
    }

    const sessionToken = jwt.sign(
      { name, teamId, deviceFingerprint },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = await wineQuizStorage.createUser({
      name,
      teamId,
      isLeader: teamMembers.length === 0,
      sessionToken,
      deviceFingerprint
    });

    const token = jwt.sign(
      { userId: user.id, teamId, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        teamId: user.teamId, 
        isLeader: user.isLeader 
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TEAMS ROUTES
router.get('/teams', async (req, res) => {
  try {
    const teams = await wineQuizStorage.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/teams/:id', async (req, res) => {
  try {
    const team = await wineQuizStorage.getTeamById(parseInt(req.params.id));
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/teams/:id/members', async (req, res) => {
  try {
    const members = await wineQuizStorage.getUsersByTeamId(parseInt(req.params.id));
    res.json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// SESSIONS ROUTES
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await wineQuizStorage.getAllGameSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await wineQuizStorage.getGameSession(parseInt(req.params.id));
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sessions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gameMode, durationSeconds } = req.body;
    
    const session = await wineQuizStorage.createGameSession({
      startTime: new Date(),
      gameMode: gameMode || 'individual',
      durationSeconds,
      status: 'pending'
    });

    res.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/sessions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const updates = req.body;
    
    const session = await wineQuizStorage.updateGameSession(sessionId, updates);
    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ROUNDS ROUTES
router.get('/sessions/:sessionId/rounds', authenticateToken, async (req, res) => {
  try {
    const rounds = await wineQuizStorage.getRoundsBySessionId(parseInt(req.params.sessionId));
    res.json(rounds);
  } catch (error) {
    console.error('Get rounds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sessions/:sessionId/rounds', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { roundNumber, name, wineType, description } = req.body;
    
    const round = await wineQuizStorage.createRound({
      sessionId,
      roundNumber,
      name,
      wineType,
      description,
      status: 'pending'
    });

    res.json(round);
  } catch (error) {
    console.error('Create round error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// QUESTIONS ROUTES
router.get('/rounds/:roundId/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await wineQuizStorage.getQuestionsByRoundId(parseInt(req.params.roundId));
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/rounds/:roundId/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const roundId = parseInt(req.params.roundId);
    const questionData = { ...req.body, roundId };
    
    const question = await wineQuizStorage.createQuestion(questionData);
    res.json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ANSWERS ROUTES
router.post('/answers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const answerData = { ...req.body, userId };
    
    const answer = await wineQuizStorage.submitAnswer(answerData);
    res.json(answer);
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sessions/:sessionId/answers', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const answers = await wineQuizStorage.getAnswersBySessionId(sessionId);
    res.json(answers);
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// USER SESSION STATE ROUTES
router.get('/users/:userId/sessions/:sessionId/state', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sessionId = parseInt(req.params.sessionId);
    
    if (req.user.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const state = await wineQuizStorage.getUserSessionState(userId, sessionId);
    res.json(state);
  } catch (error) {
    console.error('Get user session state error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:userId/sessions/:sessionId/state', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sessionId = parseInt(req.params.sessionId);
    
    if (req.user.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const state = await wineQuizStorage.updateUserSessionState(userId, sessionId, req.body);
    res.json(state);
  } catch (error) {
    console.error('Update user session state error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TEAM REGISTRATION ROUTES
router.post('/teams/:teamId/register/:sessionId', authenticateToken, async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const sessionId = parseInt(req.params.sessionId);
    const { customTeamName } = req.body;
    
    const registration = await wineQuizStorage.createTeamRegistration({
      teamId,
      sessionId,
      customTeamName
    });

    res.json(registration);
  } catch (error) {
    console.error('Team registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// RESULTS ROUTES
router.get('/sessions/:sessionId/results', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const results = await wineQuizStorage.getRoundResultsBySessionId(sessionId);
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sessions/:sessionId/leaderboard', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const teams = await wineQuizStorage.getAllTeams();
    
    const leaderboard = [];
    for (const team of teams) {
      const totalScore = await wineQuizStorage.calculateTeamTotalScore(sessionId, team.id);
      leaderboard.push({
        teamId: team.id,
        teamName: team.name,
        color: team.color,
        icon: team.icon,
        totalScore
      });
    }

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN SPECIFIC ROUTES
router.get('/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSessions = await wineQuizStorage.getAllGameSessions();
    const totalTeams = await wineQuizStorage.getAllTeams();
    const totalUsers = await wineQuizStorage.getAllUsers();
    
    const activeSessions = totalSessions.filter(s => s.status === 'active');
    const completedSessions = totalSessions.filter(s => s.status === 'finished');

    res.json({
      totalSessions: totalSessions.length,
      activeSessions: activeSessions.length,
      completedSessions: completedSessions.length,
      totalTeams: totalTeams.length,
      totalUsers: totalUsers.length,
      recentSessions: totalSessions.slice(0, 5)
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as wineQuizRoutes };