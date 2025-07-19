# ARC-AGI-3 TypeScript Client

A TypeScript client library for the ARC-AGI-3 API, built with Bun and minimal dependencies.

## Installation

```bash
bun install arc-agi-3-client
```

## Quick Start

```typescript
import { ArcClient } from 'arc-agi-3-client';

const client = new ArcClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://three.arcprize.org' // optional, defaults to this URL
});

// List available games
const games = await client.listGames();

// Open a scorecard for tracking
const scorecard = await client.openScorecard({
  source_url: 'https://github.com/your-agent',
  tags: ['experiment', 'v1.0'],
  opaque: { model: 'your-model', temperature: 0.7 }
});

// Start a new game
const frame = await client.resetGame({
  game_id: games[0].game_id,
  card_id: scorecard.card_id
});

// Execute actions
await client.action1({
  game_id: games[0].game_id,
  guid: frame.guid,
  reasoning: { action: 'move_up' }
});

// Execute coordinate-based action
await client.action6({
  game_id: games[0].game_id,
  guid: frame.guid,
  x: 10,
  y: 15,
  reasoning: { action: 'click_at_position' }
});

// Close scorecard and get results
const summary = await client.closeScorecard({
  card_id: scorecard.card_id
});
```

## API Reference

### ArcClient

The main client class for interacting with the ARC-AGI-3 API.

#### Constructor

```typescript
new ArcClient(config: ArcClientConfig)
```

- `config.apiKey`: Your API key from the ARC-AGI-3 console
- `config.baseUrl`: Optional base URL (defaults to `https://three.arcprize.org`)

#### Methods

##### Game Management

- `listGames()`: Get all available games
- `resetGame(command)`: Start or reset a game session

##### Scorecard Management

- `openScorecard(request?)`: Open a new scorecard for tracking
- `closeScorecard(request)`: Close a scorecard and get final results
- `getScorecard(cardId)`: Get current scorecard status
- `getScorecardForGame(cardId, gameId)`: Get scorecard filtered to one game

##### Actions

- `action1(command)` through `action5(command)`: Execute simple actions
- `action6(command)`: Execute coordinate-based action (requires x,y)
- `executeSimpleAction(actionType, command)`: Generic simple action method
- `executeComplexAction(command)`: Generic complex action method

## Types

The library exports comprehensive TypeScript types:

```typescript
import type {
  Game,
  GameState,
  FrameResponse,
  ScorecardSummary,
  OpenScorecardRequest,
  // ... and more
} from 'arc-agi-3-client';
```

### Key Types

- `Game`: Game metadata with ID and title
- `GameState`: 'NOT_FINISHED' | 'NOT_STARTED' | 'WIN' | 'GAME_OVER'
- `FrameResponse`: Game frame with visual data, score, and state
- `ScorecardSummary`: Aggregate results across game sessions

## Error Handling

The client throws `ArcApiError` for API failures:

```typescript
import { ArcApiError } from 'arc-agi-3-client';

try {
  await client.listGames();
} catch (error) {
  if (error instanceof ArcApiError) {
    console.log('API Error:', error.status, error.message);
  }
}
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the library
bun run build

# Run example (requires API key)
bun run src/example.ts
```

## Authentication

Get your API key from the [ARC-AGI-3 web console](https://three.arcprize.org). All requests require the `X-API-Key` header, which the client handles automatically.

## Game Flow

1. **List Games**: Get available game IDs
2. **Open Scorecard**: Create a tracking session
3. **Reset Game**: Start a new game instance
4. **Execute Actions**: Send commands to the game
5. **Monitor State**: Check game state and score
6. **Close Scorecard**: Get final results

## Requirements

- Bun runtime
- TypeScript 5+
- Valid ARC-AGI-3 API key

## License

MIT