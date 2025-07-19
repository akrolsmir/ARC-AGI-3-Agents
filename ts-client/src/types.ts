export interface Game {
  game_id: string;
  title: string;
}

export interface OpenScorecardRequest {
  source_url?: string;
  tags?: string[];
  opaque?: Record<string, any>;
}

export interface OpenScorecardResponse {
  card_id: string;
}

export interface CloseScorecardRequest {
  card_id: string;
}

export type GameState = 'NOT_FINISHED' | 'NOT_STARTED' | 'WIN' | 'GAME_OVER';

export interface PerGameCard {
  game_id: string;
  total_plays: number;
  total_actions: number;
  scores: number[];
  states: GameState[];
  actions: number[];
}

export interface ScorecardSummary {
  api_key: string;
  card_id: string;
  won: number;
  played: number;
  total_actions: number;
  score: number;
  source_url?: string;
  tags?: string[];
  opaque?: Record<string, any>;
  cards: Record<string, PerGameCard>;
}

export interface ResetCommand {
  game_id: string;
  card_id: string;
  guid?: string | null;
}

export interface SimpleActionCommand {
  game_id: string;
  guid: string;
  reasoning?: Record<string, any>;
}

export interface ComplexActionCommand {
  game_id: string;
  guid: string;
  x: number;
  y: number;
  reasoning?: Record<string, any>;
}

export interface ActionInput {
  id: number;
  data?: Record<string, any>;
}

export interface FrameResponse {
  game_id: string;
  guid: string;
  frame: number[][][];
  state: GameState;
  score: number;
  win_score: number;
  action_input: ActionInput;
}

export type ActionType = 'ACTION1' | 'ACTION2' | 'ACTION3' | 'ACTION4' | 'ACTION5' | 'ACTION6';

export interface ArcClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class ArcApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ArcApiError';
  }
}