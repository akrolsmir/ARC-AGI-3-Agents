/**
 * Human-readable name/identifier pair for an ARC-AGI-3 game.
 * Used when listing available titles or embedding game metadata in other payloads.
 */
export interface Game {
  /** Stable, globally unique ID combining slug and version/hash (e.g. "ls20-016295f7601e") */
  game_id: string;
  /** Display title shown in UIs and scorecards (e.g. "LS20") */
  title: string;
}

/**
 * Optional metadata sent when opening a scorecard.
 * Every field is optional; omit any you don't need.
 * Use this to attach provenance links, free-form tags, or an
 * "opaque" JSON blob describing the run (e.g. model settings,
 * hyper-parameters, experiment notes). The opaque payload must not
 * exceed 16 KB once serialized.
 */
export interface OpenScorecardRequest {
  /** Link to code, notebook, or write-up associated with the run */
  source_url?: string;
  /** Arbitrary labels for later filtering and aggregation */
  tags?: string[];
  /**
   * Free-form JSON data (≤ 16 KB). Stored verbatim; the service
   * does not inspect or validate its structure.
   */
  opaque?: Record<string, any>;
}

/**
 * Response returned after a successful "open scorecard" request.
 * Contains the server-generated identifier for this tracked run.
 */
export interface OpenScorecardResponse {
  /** Globally unique ID for the newly opened scorecard */
  card_id: string;
}

/**
 * Payload for closing a previously opened scorecard and finalising
 * its aggregated results.
 */
export interface CloseScorecardRequest {
  /**
   * Identifier of the scorecard to close—use the card_id
   * returned by OpenScorecardResponse.
   */
  card_id: string;
}

/**
 * Current state of a game session:
 *
 * • **NOT_FINISHED** - game in progress, not yet WIN or GAME_OVER
 * • **NOT_STARTED** - session has ended (WIN or GAME_OVER) and requires RESET
 * • **WIN** - session ended in victory
 * • **GAME_OVER** - session ended in defeat
 */
export type GameState = "NOT_FINISHED" | "NOT_STARTED" | "WIN" | "GAME_OVER";

/**
 * Statistics for one game inside a scorecard.
 *
 * All arrays align positionally: index n of `scores`, `states`, and `actions`
 * describes the same play.
 */
export interface PerGameCard {
  /** Identifier of the game these stats refer to */
  game_id: string;
  /** Number of times this game was reset/played */
  total_plays: number;
  /** Total actions taken across all plays of this game */
  total_actions: number;
  /** Score achieved in each play (0-254) */
  scores: number[];
  /**
   * Final state of each play:
   *
   * • **NOT_FINISHED** - the play is active and hasn't reached an end state
   * • **NOT_STARTED** - the play has already ended (WIN or GAME_OVER) and must be RESET to continue
   * • **WIN** - the play ended in victory
   * • **GAME_OVER** - the play ended in defeat
   */
  states: GameState[];
  /** Number of actions taken in each corresponding play */
  actions: number[];
}

/**
 * Aggregate results for an entire scorecard run.
 * Includes cumulative counters, optional metadata echoed back from
 * the open request, the API key that authenticated the run, and a
 * per-game breakdown in `cards`.
 */
export interface ScorecardSummary {
  /** The API key that initiated and authenticated this run */
  api_key: string;
  /** The Scorecard ID that was returned by OpenScorecardResponse */
  card_id: string;
  /** Total number of games won in this scorecard */
  won: number;
  /** Total number of games played (wins + losses + unfinished) */
  played: number;
  /** Cumulative number of actions taken across all plays */
  total_actions: number;
  /** Sum of per-game scores (each 0-254) for this scorecard */
  score: number;
  /** Link originally supplied in the OpenScorecardRequest */
  source_url?: string;
  /** Arbitrary labels echoed back from the open request */
  tags?: string[];
  /**
   * Free-form JSON blob (≤ 16 KB) exactly as provided when the
   * scorecard was opened. Absent if none was supplied.
   */
  opaque?: Record<string, any>;
  /** Map keyed by game_id, each entry summarising a single game */
  cards: Record<string, PerGameCard>;
}

/**
 * Starts a new game session **or** resets an existing one, depending on
 * whether a `guid` is supplied.
 *
 * • **No guid (null/empty)** → A brand-new game instance is created and
 *   the response will include its freshly minted guid.
 *
 * • **With guid** → The server issues a reset to that specific instance:
 *   - If at least one ACTION command has been executed in the **current level**,
 *     only that level is reset (typical "try again" behaviour).
 *   - If no ACTION commands have been executed since the last level transition,
 *     the entire game is reset to its initial state.
 *
 * Sending two RESET commands back-to-back therefore always yields a
 * completely fresh game.
 *
 * All plays should be associated with an open scorecard via `card_id`
 * so aggregated results can be tracked.
 */
export interface ResetCommand {
  /** Identifier of the game to start or reset (e.g. "ls20") */
  game_id: string;
  /**
   * Scorecard identifier returned by OpenScorecardResponse. Required
   * to attribute this play to the correct scorecard.
   */
  card_id: string;
  /**
   * Server-generated game session ID.
   * • Omit or set to null to create a new game
   * • Provide an existing value to reset that game as described above
   */
  guid?: string | null;
}

/**
 * Issues a one-parameter action (ACTION1 - ACTION5) to a running
 * game instance identified by `guid`.
 */
export interface SimpleActionCommand {
  /** Game identifier this action targets */
  game_id: string;
  /** Server-generated session ID obtained from a RESET response */
  guid: string;
  /**
   * Optional, caller-defined JSON blob (≤ 16 KB) capturing the
   * agent's internal reasoning, model parameters, or any other
   * metadata you'd like to store alongside the action.
   */
  reasoning?: Record<string, any>;
}

/**
 * Payload for coordinate-based actions (e.g. ACTION6).
 * Supplies an (x, y) location on the 64 × 64 game grid along with
 * the game/session identifiers so the engine can apply the action
 * to the correct running instance.
 */
export interface ComplexActionCommand {
  /** Identifier of the game receiving this action */
  game_id: string;
  /** Server-generated session ID obtained from the RESET call */
  guid: string;
  /** Horizontal coordinate on the game grid (0 = left, 63 = right) */
  x: number;
  /** Vertical coordinate on the game grid (0 = top, 63 = bottom) */
  y: number;
  /**
   * Optional, caller-defined JSON blob (≤ 16 KB) capturing the
   * agent's internal reasoning, model parameters, or any other
   * metadata you'd like to store alongside the action.
   */
  reasoning?: Record<string, any>;
}

/**
 * Echo of the command that produced a frame response.
 */
export interface ActionInput {
  /** Client-assigned or sequential action index */
  id: number;
  /** Additional parameters originally sent with the action */
  data?: Record<string, any>;
}

/**
 * Snapshot returned after every RESET or ACTION command.
 * Includes the latest visual frame(s), cumulative score details, the
 * current game state, and an echo of the triggering action.
 */
export interface FrameResponse {
  /** Game identifier for the running session */
  game_id: string;
  /** Server-generated session ID; use this for all subsequent commands */
  guid: string;
  /**
   * One or more consecutive visual frames. Each frame is a 64 × 64
   * grid of 4-bit colour indices (integers 0-15). Multiple frames
   * may be returned if the environment advances internally (e.g.,
   * animations) before settling.
   */
  frame: number[][][];
  /** Current state of the session */
  state: GameState;
  /** Current cumulative score for this run (0-254) */
  score: number;
  /**
   * Score threshold required to reach the WIN state. Mirrors
   * the game's configured win condition so agents can adapt
   * dynamically without hard-coding values.
   */
  win_score: number;
  /** Echo of the command that produced this frame */
  action_input: ActionInput;
}

/**
 * Available action types for the ARC-AGI-3 API.
 * ACTION1-ACTION5 are simple actions, ACTION6 requires coordinates.
 */
export type ActionType =
  | "ACTION1"
  | "ACTION2"
  | "ACTION3"
  | "ACTION4"
  | "ACTION5"
  | "ACTION6";

/**
 * Configuration options for the ARC client.
 */
export interface ArcClientConfig {
  /** Your API key from the ARC-AGI-3 console */
  apiKey: string;
  /** Optional base URL (defaults to https://three.arcprize.org) */
  baseUrl?: string;
}

/**
 * Custom error class for ARC API failures.
 */
export class ArcApiError extends Error {
  constructor(
    message: string,
    /** HTTP status code from the API response */
    public status: number,
    /** Raw response data from the API */
    public response?: any
  ) {
    super(message);
    this.name = "ArcApiError";
  }
}
