import express from 'express';
import { WineQuizCompleteStorageImpl } from './wine-quiz-complete-storage.js';

const router = express.Router();
const storage = new WineQuizCompleteStorageImpl();

// Session Management Routes
router.post('/session/start', async (req, res) => {
  try {
    const { game_mode } = req.body;
    
    if (!['individual', 'leader'].includes(game_mode)) {
      return res.status(400).json({ error: 'Invalid game mode' });
    }
    
    const session = await storage.createGameSession({ game_mode });
    await storage.updateGameSessionStatus(session.id, 'active');
    
    res.json({
      success: true,
      session,
      message: 'Session started successfully'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/session/finish', async (req, res) => {
  try {
    const activeSession = await storage.getActiveGameSession();
    
    if (!activeSession) {
      return res.status(400).json({ error: 'No active session found' });
    }
    
    await storage.updateGameSessionStatus(activeSession.id, 'finished');
    
    res.json({
      success: true,
      message: 'Session finished successfully'
    });
  } catch (error) {
    console.error('Error finishing session:', error);
    res.status(500).json({ error: 'Failed to finish session' });
  }
});

router.get('/session/current', async (req, res) => {
  try {
    const session = await storage.getActiveGameSession();
    res.json(session);
  } catch (error) {
    console.error('Error getting current session:', error);
    res.status(500).json({ error: 'Failed to get current session' });
  }
});

router.post('/session/launch-question', async (req, res) => {
  try {
    const { questionId } = req.body;
    
    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }
    
    const activeSession = await storage.getActiveGameSession();
    if (!activeSession) {
      return res.status(400).json({ error: 'No active session found' });
    }
    
    // In a real implementation, this would broadcast via WebSocket
    // For now, we'll just acknowledge the launch
    res.json({
      success: true,
      message: 'Question launched successfully',
      questionId
    });
  } catch (error) {
    console.error('Error launching question:', error);
    res.status(500).json({ error: 'Failed to launch question' });
  }
});

router.post('/session/end-question', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Question ended successfully'
    });
  } catch (error) {
    console.error('Error ending question:', error);
    res.status(500).json({ error: 'Failed to end question' });
  }
});

// Question Management Routes
router.get('/questions', async (req, res) => {
  try {
    const { limit } = req.query;
    const questions = await storage.getQuestions(limit ? parseInt(limit as string) : undefined);
    res.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const questionData = req.body;
    
    // Validate required fields
    if (!questionData.question_text || !questionData.weight) {
      return res.status(400).json({ error: 'Question text and weight are required' });
    }
    
    // Validate question type specific fields
    if (questionData.question_type === 'multiple_choice') {
      if (!questionData.option_a || !questionData.option_b || !questionData.correct_option) {
        return res.status(400).json({ error: 'Multiple choice questions require at least options A and B and correct option' });
      }
    } else if (questionData.question_type === 'autocomplete') {
      if (!questionData.correct_answer) {
        return res.status(400).json({ error: 'Autocomplete questions require correct answer' });
      }
    }
    
    const question = await storage.createQuestion(questionData);
    
    res.json({
      success: true,
      question,
      message: 'Question created successfully'
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questionData = req.body;
    
    await storage.updateQuestion(parseInt(id), questionData);
    
    res.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.deleteQuestion(parseInt(id));
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Round Management Routes
router.get('/rounds', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (sessionId) {
      const rounds = await storage.getRoundsBySession(parseInt(sessionId as string));
      res.json(rounds);
    } else {
      // For now, return empty array if no session specified
      res.json([]);
    }
  } catch (error) {
    console.error('Error getting rounds:', error);
    res.status(500).json({ error: 'Failed to get rounds' });
  }
});

router.post('/rounds', async (req, res) => {
  try {
    const roundData = req.body;
    
    if (!roundData.name || !roundData.description) {
      return res.status(400).json({ error: 'Round name and description are required' });
    }
    
    // Get active session
    const activeSession = await storage.getActiveGameSession();
    if (!activeSession) {
      return res.status(400).json({ error: 'No active session found' });
    }
    
    const round = await storage.createRound({
      ...roundData,
      session_id: activeSession.id,
      round_number: 1, // Could be calculated based on existing rounds
      status: 'pending'
    });
    
    res.json({
      success: true,
      round,
      message: 'Round created successfully'
    });
  } catch (error) {
    console.error('Error creating round:', error);
    res.status(500).json({ error: 'Failed to create round' });
  }
});

// Team Management Routes
router.get('/teams', async (req, res) => {
  try {
    const teams = await storage.getTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ error: 'Failed to get teams' });
  }
});

router.post('/teams', async (req, res) => {
  try {
    const teamData = req.body;
    
    if (!teamData.name || !teamData.color) {
      return res.status(400).json({ error: 'Team name and color are required' });
    }
    
    const team = await storage.createTeam(teamData);
    
    res.json({
      success: true,
      team,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.get('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const team = await storage.getTeamById(parseInt(id));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({ error: 'Failed to get team' });
  }
});

// User Management Routes
router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.name) {
      return res.status(400).json({ error: 'User name is required' });
    }
    
    // Generate session token
    const sessionToken = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = await storage.createUser({
      ...userData,
      session_token: sessionToken
    });
    
    res.json({
      success: true,
      user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/users/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await storage.getUserBySessionToken(token);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Answer Management Routes
router.post('/answers', async (req, res) => {
  try {
    const answerData = req.body;
    
    if (!answerData.question_id || !answerData.user_id) {
      return res.status(400).json({ error: 'Question ID and User ID are required' });
    }
    
    // Get active session
    const activeSession = await storage.getActiveGameSession();
    if (!activeSession) {
      return res.status(400).json({ error: 'No active session found' });
    }
    
    // Calculate if answer is correct and assign points
    // This would need more sophisticated logic in a real implementation
    const answer = await storage.submitAnswer({
      ...answerData,
      session_id: activeSession.id,
      is_correct: true, // Would be calculated based on question and answer
      points_awarded: 1 // Would be calculated based on question weight and correctness
    });
    
    res.json({
      success: true,
      answer,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

router.get('/answers/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const answers = await storage.getAnswersBySession(parseInt(sessionId));
    res.json(answers);
  } catch (error) {
    console.error('Error getting answers:', error);
    res.status(500).json({ error: 'Failed to get answers' });
  }
});

// Scoring and Results Routes
router.get('/scores/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const scores = await storage.calculateTeamScores(parseInt(sessionId));
    res.json(scores);
  } catch (error) {
    console.error('Error getting scores:', error);
    res.status(500).json({ error: 'Failed to get scores' });
  }
});

router.get('/leaderboard/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const leaderboard = await storage.getLeaderboard(parseInt(sessionId));
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Wine Glossary Routes (for hint system)
router.get('/glossary', async (req, res) => {
  try {
    const { category } = req.query;
    const terms = await storage.getGlossaryTerms(category as string);
    res.json(terms);
  } catch (error) {
    console.error('Error getting glossary:', error);
    res.status(500).json({ error: 'Failed to get glossary terms' });
  }
});

router.get('/glossary/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const results = await storage.searchGlossary(term);
    res.json(results);
  } catch (error) {
    console.error('Error searching glossary:', error);
    res.status(500).json({ error: 'Failed to search glossary' });
  }
});

// Session State Management Routes (Key feature from WineQuizMobile_new)
router.get('/player/session-state/:userId/:sessionId', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const sessionState = await storage.getUserSessionState(
      parseInt(userId), 
      parseInt(sessionId)
    );
    res.json(sessionState);
  } catch (error) {
    console.error('Error getting session state:', error);
    res.status(500).json({ error: 'Failed to get session state' });
  }
});

router.post('/player/save-progress', async (req, res) => {
  try {
    const progressData = req.body;
    
    if (!progressData.user_id || !progressData.session_id) {
      return res.status(400).json({ error: 'User ID and Session ID are required' });
    }
    
    const sessionState = await storage.saveUserSessionState(progressData);
    
    res.json({
      success: true,
      sessionState,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

router.post('/player/restore-session', async (req, res) => {
  try {
    const { user_id, session_id } = req.body;
    
    if (!user_id || !session_id) {
      return res.status(400).json({ error: 'User ID and Session ID are required' });
    }
    
    const sessionState = await storage.getUserSessionState(user_id, session_id);
    
    res.json({
      success: true,
      sessionState,
      message: 'Session restored successfully'
    });
  } catch (error) {
    console.error('Error restoring session:', error);
    res.status(500).json({ error: 'Failed to restore session' });
  }
});

// Admin validation route
router.post('/admin/validate', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const isValid = await storage.validateAdmin(email, password);
    
    if (isValid) {
      res.json({
        success: true,
        message: 'Admin validated successfully'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error validating admin:', error);
    res.status(500).json({ error: 'Failed to validate admin' });
  }
});

export { router as wineQuizApiRouter };