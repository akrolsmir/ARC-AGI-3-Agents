import type {
  Game,
  OpenScorecardRequest,
  OpenScorecardResponse,
  CloseScorecardRequest,
  ScorecardSummary,
  ResetCommand,
  SimpleActionCommand,
  ComplexActionCommand,
  FrameResponse,
  ActionType,
  ArcClientConfig
} from './types.js';
import { ArcApiError } from './types.js';

export class ArcClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ArcClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://three.arcprize.org';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new ArcApiError(
        `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
        response.status,
        errorText
      );
    }

    return response.json() as Promise<T>;
  }

  async listGames(): Promise<Game[]> {
    return this.request<Game[]>('/api/games');
  }

  async openScorecard(request: OpenScorecardRequest = {}): Promise<OpenScorecardResponse> {
    return this.request<OpenScorecardResponse>('/api/scorecard/open', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async closeScorecard(request: CloseScorecardRequest): Promise<ScorecardSummary> {
    return this.request<ScorecardSummary>('/api/scorecard/close', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getScorecard(cardId: string): Promise<ScorecardSummary> {
    return this.request<ScorecardSummary>(`/api/scorecard/${cardId}`);
  }

  async getScorecardForGame(cardId: string, gameId: string): Promise<ScorecardSummary> {
    return this.request<ScorecardSummary>(`/api/scorecard/${cardId}/${gameId}`);
  }

  async resetGame(command: ResetCommand): Promise<FrameResponse> {
    return this.request<FrameResponse>('/api/cmd/RESET', {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  async executeSimpleAction(
    actionType: Exclude<ActionType, 'ACTION6'>,
    command: SimpleActionCommand
  ): Promise<FrameResponse> {
    const endpoint = `/api/cmd/${actionType}`;
    return this.request<FrameResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  async executeComplexAction(command: ComplexActionCommand): Promise<FrameResponse> {
    return this.request<FrameResponse>('/api/cmd/ACTION6', {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  async action1(command: SimpleActionCommand): Promise<FrameResponse> {
    return this.executeSimpleAction('ACTION1', command);
  }

  async action2(command: SimpleActionCommand): Promise<FrameResponse> {
    return this.executeSimpleAction('ACTION2', command);
  }

  async action3(command: SimpleActionCommand): Promise<FrameResponse> {
    return this.executeSimpleAction('ACTION3', command);
  }

  async action4(command: SimpleActionCommand): Promise<FrameResponse> {
    return this.executeSimpleAction('ACTION4', command);
  }

  async action5(command: SimpleActionCommand): Promise<FrameResponse> {
    return this.executeSimpleAction('ACTION5', command);
  }

  async action6(command: ComplexActionCommand): Promise<FrameResponse> {
    return this.executeComplexAction(command);
  }
}