import { WineTeam, WineGameSession, WineRound, WineQuestion, WineAnswer, WineUser, WineUserSessionState, LeaderboardEntry } from '../store/wineQuizStore';

const API_BASE_URL = '/api/wine-quiz';

class WineQuizApi {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('wine_quiz_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async adminLogin(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse(response);
  }

  async userRegister(name: string, teamId: number, deviceFingerprint: string): Promise<{ token: string; user: WineUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, teamId, deviceFingerprint })
    });
    return this.handleResponse(response);
  }

  // Teams endpoints
  async getTeams(): Promise<WineTeam[]> {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getTeam(id: number): Promise<WineTeam> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getTeamMembers(teamId: number): Promise<WineUser[]> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Sessions endpoints
  async getSessions(): Promise<WineGameSession[]> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getSession(id: number): Promise<WineGameSession> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async createSession(data: { gameMode?: string; durationSeconds?: number }): Promise<WineGameSession> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async updateSession(id: number, updates: Partial<WineGameSession>): Promise<WineGameSession> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    return this.handleResponse(response);
  }

  // Rounds endpoints
  async getSessionRounds(sessionId: number): Promise<WineRound[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rounds`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async createRound(sessionId: number, data: { roundNumber: number; name: string; wineType?: string; description?: string }): Promise<WineRound> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rounds`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  // Questions endpoints
  async getRoundQuestions(roundId: number): Promise<WineQuestion[]> {
    const response = await fetch(`${API_BASE_URL}/rounds/${roundId}/questions`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async createQuestion(roundId: number, data: Partial<WineQuestion>): Promise<WineQuestion> {
    const response = await fetch(`${API_BASE_URL}/rounds/${roundId}/questions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  // Answers endpoints
  async submitAnswer(data: {
    sessionId: number;
    questionId: number;
    roundId: number;
    selectedOption?: 'a' | 'b' | 'c' | 'd';
    textAnswer?: string;
    isCorrect?: boolean;
    pointsAwarded?: number;
  }): Promise<WineAnswer> {
    const response = await fetch(`${API_BASE_URL}/answers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async getSessionAnswers(sessionId: number): Promise<WineAnswer[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/answers`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // User session state endpoints
  async getUserSessionState(userId: number, sessionId: number): Promise<WineUserSessionState> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}/state`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async updateUserSessionState(userId: number, sessionId: number, updates: Partial<WineUserSessionState>): Promise<WineUserSessionState> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}/state`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    return this.handleResponse(response);
  }

  // Team registration endpoints
  async registerTeamForSession(teamId: number, sessionId: number, customTeamName: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/register/${sessionId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ customTeamName })
    });
    return this.handleResponse(response);
  }

  // Results endpoints
  async getSessionResults(sessionId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/results`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getSessionLeaderboard(sessionId: number): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/leaderboard`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalTeams: number;
    totalUsers: number;
    recentSessions: WineGameSession[];
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
}

export const wineQuizApi = new WineQuizApi();