import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { wineQuizStorage } from './wine-quiz-storage';

export interface WineQuizClient {
  ws: WebSocket;
  userId: number;
  sessionId?: number;
  teamId?: number;
  isAdmin?: boolean;
}

export class WineQuizWebSocketManager {
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, WineQuizClient>();
  private sessionClients = new Map<number, Set<WebSocket>>();
  private adminClients = new Set<WebSocket>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/wine-quiz',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private verifyClient(info: any): boolean {
    const token = info.req.url?.split('token=')[1];
    if (!token) return false;
    
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      return true;
    } catch {
      return false;
    }
  }

  private async handleConnection(ws: WebSocket, request: any) {
    const token = request.url?.split('token=')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const userId = decoded.userId;
      
      const client: WineQuizClient = {
        ws,
        userId,
        isAdmin: decoded.role === 'admin'
      };

      this.clients.set(ws, client);
      
      if (client.isAdmin) {
        this.adminClients.add(ws);
      }

      ws.on('message', (data) => this.handleMessage(ws, data));
      ws.on('close', () => this.handleDisconnect(ws));
      ws.on('error', (error) => console.error('WebSocket error:', error));

      this.sendMessage(ws, {
        type: 'connected',
        data: { userId, isAdmin: client.isAdmin }
      });

    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  }

  private async handleMessage(ws: WebSocket, data: Buffer) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(ws);
      
      if (!client) return;

      switch (message.type) {
        case 'join_session':
          await this.handleJoinSession(client, message.sessionId);
          break;
          
        case 'leave_session':
          await this.handleLeaveSession(client);
          break;
          
        case 'submit_answer':
          await this.handleSubmitAnswer(client, message.data);
          break;
          
        case 'start_session':
          if (client.isAdmin) {
            await this.handleStartSession(message.sessionId);
          }
          break;
          
        case 'next_question':
          if (client.isAdmin) {
            await this.handleNextQuestion(message.sessionId);
          }
          break;
          
        case 'end_session':
          if (client.isAdmin) {
            await this.handleEndSession(message.sessionId);
          }
          break;
          
        case 'get_live_scores':
          await this.handleGetLiveScores(client, message.sessionId);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private async handleJoinSession(client: WineQuizClient, sessionId: number) {
    try {
      const session = await wineQuizStorage.getGameSession(sessionId);
      if (!session) return;

      const user = await wineQuizStorage.getUserById(client.userId);
      if (!user) return;

      client.sessionId = sessionId;
      client.teamId = user.teamId || undefined;

      if (!this.sessionClients.has(sessionId)) {
        this.sessionClients.set(sessionId, new Set());
      }
      this.sessionClients.get(sessionId)!.add(client.ws);

      this.sendMessage(client.ws, {
        type: 'session_joined',
        data: { sessionId, teamId: client.teamId }
      });

      this.broadcastToSession(sessionId, {
        type: 'user_joined',
        data: { userId: client.userId, teamId: client.teamId }
      });

      const currentState = await wineQuizStorage.getUserSessionState(client.userId, sessionId);
      if (currentState) {
        this.sendMessage(client.ws, {
          type: 'session_state',
          data: currentState
        });
      }

    } catch (error) {
      console.error('Error joining session:', error);
    }
  }

  private async handleLeaveSession(client: WineQuizClient) {
    if (!client.sessionId) return;

    const sessionClients = this.sessionClients.get(client.sessionId);
    if (sessionClients) {
      sessionClients.delete(client.ws);
      if (sessionClients.size === 0) {
        this.sessionClients.delete(client.sessionId);
      }
    }

    this.broadcastToSession(client.sessionId, {
      type: 'user_left',
      data: { userId: client.userId }
    });

    client.sessionId = undefined;
    client.teamId = undefined;
  }

  private async handleSubmitAnswer(client: WineQuizClient, answerData: any) {
    if (!client.sessionId) return;

    try {
      const answer = await wineQuizStorage.submitAnswer({
        sessionId: client.sessionId,
        questionId: answerData.questionId,
        userId: client.userId,
        roundId: answerData.roundId,
        selectedOption: answerData.selectedOption,
        textAnswer: answerData.textAnswer,
        isCorrect: answerData.isCorrect,
        pointsAwarded: answerData.pointsAwarded
      });

      this.sendMessage(client.ws, {
        type: 'answer_submitted',
        data: { answerId: answer.id, isCorrect: answer.isCorrect }
      });

      await wineQuizStorage.updateUserSessionState(client.userId, client.sessionId, {
        hasAnsweredCurrent: true,
        selectedOption: answerData.selectedOption,
        textAnswerDraft: answerData.textAnswer
      });

      this.broadcastToAdmins({
        type: 'answer_received',
        data: {
          sessionId: client.sessionId,
          userId: client.userId,
          questionId: answerData.questionId,
          teamId: client.teamId
        }
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }

  private async handleStartSession(sessionId: number) {
    try {
      await wineQuizStorage.updateGameSession(sessionId, { 
        status: 'active',
        startTime: new Date()
      });

      const rounds = await wineQuizStorage.getRoundsBySessionId(sessionId);
      if (rounds.length > 0) {
        await wineQuizStorage.updateRound(rounds[0].id, { 
          status: 'active',
          startTime: new Date()
        });
        
        await wineQuizStorage.updateGameSession(sessionId, {
          currentRoundId: rounds[0].id
        });
      }

      this.broadcastToSession(sessionId, {
        type: 'session_started',
        data: { sessionId, startTime: new Date() }
      });

      this.broadcastToAdmins({
        type: 'session_started',
        data: { sessionId }
      });

    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  private async handleNextQuestion(sessionId: number) {
    try {
      const session = await wineQuizStorage.getGameSession(sessionId);
      if (!session?.currentRoundId) return;

      const questions = await wineQuizStorage.getQuestionsByRoundId(session.currentRoundId);
      const currentQuestionIndex = questions.findIndex(q => q.id === session.currentQuestionId);
      
      if (currentQuestionIndex < questions.length - 1) {
        const nextQuestion = questions[currentQuestionIndex + 1];
        await wineQuizStorage.updateGameSession(sessionId, {
          currentQuestionId: nextQuestion.id
        });

        this.broadcastToSession(sessionId, {
          type: 'question_changed',
          data: { 
            sessionId,
            questionId: nextQuestion.id,
            question: nextQuestion
          }
        });
      } else {
        const rounds = await wineQuizStorage.getRoundsBySessionId(sessionId);
        const currentRoundIndex = rounds.findIndex(r => r.id === session.currentRoundId);
        
        if (currentRoundIndex < rounds.length - 1) {
          const nextRound = rounds[currentRoundIndex + 1];
          await wineQuizStorage.updateRound(session.currentRoundId, { 
            status: 'finished',
            endTime: new Date()
          });
          
          await wineQuizStorage.updateRound(nextRound.id, { 
            status: 'active',
            startTime: new Date()
          });
          
          await wineQuizStorage.updateGameSession(sessionId, {
            currentRoundId: nextRound.id,
            currentQuestionId: null
          });

          await this.calculateRoundResults(sessionId, session.currentRoundId);

          this.broadcastToSession(sessionId, {
            type: 'round_changed',
            data: { 
              sessionId,
              roundId: nextRound.id,
              round: nextRound
            }
          });
        }
      }

    } catch (error) {
      console.error('Error moving to next question:', error);
    }
  }

  private async handleEndSession(sessionId: number) {
    try {
      await wineQuizStorage.updateGameSession(sessionId, { 
        status: 'finished',
        endTime: new Date()
      });

      const session = await wineQuizStorage.getGameSession(sessionId);
      if (session?.currentRoundId) {
        await wineQuizStorage.updateRound(session.currentRoundId, { 
          status: 'finished',
          endTime: new Date()
        });
        await this.calculateRoundResults(sessionId, session.currentRoundId);
      }

      const finalResults = await this.calculateFinalResults(sessionId);

      this.broadcastToSession(sessionId, {
        type: 'session_ended',
        data: { sessionId, results: finalResults }
      });

      this.broadcastToAdmins({
        type: 'session_ended',
        data: { sessionId, results: finalResults }
      });

      this.sessionClients.delete(sessionId);

    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  private async handleGetLiveScores(client: WineQuizClient, sessionId: number) {
    try {
      const scores = await this.calculateLiveScores(sessionId);
      
      this.sendMessage(client.ws, {
        type: 'live_scores',
        data: { sessionId, scores }
      });

    } catch (error) {
      console.error('Error getting live scores:', error);
    }
  }

  private async calculateRoundResults(sessionId: number, roundId: number) {
    const teams = await wineQuizStorage.getAllTeams();
    const results = [];

    for (const team of teams) {
      const teamScore = await wineQuizStorage.calculateTeamScore(sessionId, roundId, team.id);
      const totalScore = await wineQuizStorage.calculateTeamTotalScore(sessionId, team.id);

      results.push({
        teamId: team.id,
        teamName: team.name,
        roundScore: teamScore,
        totalScore: totalScore
      });
    }

    results.sort((a, b) => b.totalScore - a.totalScore);

    for (let i = 0; i < results.length; i++) {
      await wineQuizStorage.createRoundResult({
        sessionId,
        roundId,
        teamId: results[i].teamId,
        teamName: results[i].teamName,
        totalScore: results[i].totalScore,
        roundScore: results[i].roundScore,
        position: i + 1
      });
    }

    return results;
  }

  private async calculateFinalResults(sessionId: number) {
    const roundResults = await wineQuizStorage.getRoundResultsBySessionId(sessionId);
    const teamScores = new Map<number, { teamName: string, totalScore: number }>();

    for (const result of roundResults) {
      if (!teamScores.has(result.teamId)) {
        teamScores.set(result.teamId, {
          teamName: result.teamName,
          totalScore: 0
        });
      }
      teamScores.get(result.teamId)!.totalScore = Math.max(
        teamScores.get(result.teamId)!.totalScore,
        result.totalScore
      );
    }

    const finalResults = Array.from(teamScores.entries()).map(([teamId, data]) => ({
      teamId,
      teamName: data.teamName,
      totalScore: data.totalScore
    }));

    return finalResults.sort((a, b) => b.totalScore - a.totalScore);
  }

  private async calculateLiveScores(sessionId: number) {
    const teams = await wineQuizStorage.getAllTeams();
    const session = await wineQuizStorage.getGameSession(sessionId);
    
    const scores = [];

    for (const team of teams) {
      const totalScore = await wineQuizStorage.calculateTeamTotalScore(sessionId, team.id);
      const currentRoundScore = session?.currentRoundId 
        ? await wineQuizStorage.calculateTeamScore(sessionId, session.currentRoundId, team.id)
        : 0;

      scores.push({
        teamId: team.id,
        teamName: team.name,
        totalScore,
        currentRoundScore
      });
    }

    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }

  private handleDisconnect(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return;

    if (client.sessionId) {
      this.handleLeaveSession(client);
    }

    this.clients.delete(ws);
    this.adminClients.delete(ws);
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToSession(sessionId: number, message: any) {
    const sessionClients = this.sessionClients.get(sessionId);
    if (!sessionClients) return;

    sessionClients.forEach(ws => {
      this.sendMessage(ws, message);
    });
  }

  private broadcastToAdmins(message: any) {
    this.adminClients.forEach(ws => {
      this.sendMessage(ws, message);
    });
  }

  public getSessionStats(sessionId: number) {
    const sessionClients = this.sessionClients.get(sessionId);
    return {
      connectedUsers: sessionClients ? sessionClients.size : 0
    };
  }

  public getAllSessionsStats() {
    const stats = new Map();
    this.sessionClients.forEach((clients, sessionId) => {
      stats.set(sessionId, {
        connectedUsers: clients.size
      });
    });
    return stats;
  }
}