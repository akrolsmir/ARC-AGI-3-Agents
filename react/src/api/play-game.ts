import { ArcClient } from '../../../ts-client/src/index.js'

export async function getFirstFrame() {
  console.log('api key?', process.env.ARC_API_KEY)

  const client = new ArcClient({
    apiKey: process.env.ARC_API_KEY!,
  })

  const scorecard = await client.openScorecard()

  const games = await client.listGames()

  const newGame = await client.resetGame({
    game_id: games[0]!.game_id,
    card_id: scorecard.card_id,
  })

  return newGame.frame[0]
}
