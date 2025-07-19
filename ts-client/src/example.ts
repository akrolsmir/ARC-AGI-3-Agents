import { ArcClient } from './index.js';

async function example() {
  const client = new ArcClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'https://three.arcprize.org'
  });

  try {
    // List available games
    const games = await client.listGames();
    console.log('Available games:', games);

    // Open a scorecard for tracking
    const scorecard = await client.openScorecard({
      source_url: 'https://github.com/example/agent',
      tags: ['example', 'typescript-client'],
      opaque: {
        model: 'example-agent',
        version: '1.0.0'
      }
    });
    console.log('Opened scorecard:', scorecard.card_id);

    // Start a new game session
    const gameId = games[0]?.game_id;
    if (gameId) {
      const frame = await client.resetGame({
        game_id: gameId,
        card_id: scorecard.card_id
      });
      console.log('Game started:', frame.guid);
      console.log('Initial state:', frame.state);
      console.log('Initial score:', frame.score);

      // Execute some actions
      const action1Response = await client.action1({
        game_id: gameId,
        guid: frame.guid,
        reasoning: { action: 'move_up' }
      });
      console.log('After action 1:', action1Response.score, action1Response.state);

      // Execute a coordinate-based action
      const action6Response = await client.action6({
        game_id: gameId,
        guid: frame.guid,
        x: 10,
        y: 15,
        reasoning: { action: 'click_position' }
      });
      console.log('After action 6:', action6Response.score, action6Response.state);

      // Close the scorecard
      const summary = await client.closeScorecard({
        card_id: scorecard.card_id
      });
      console.log('Final summary:', summary);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run the example (requires valid API key)
// example();