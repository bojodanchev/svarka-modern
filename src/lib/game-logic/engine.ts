import { GameState, Player, Card } from './types';
import { createDeck, shuffleDeck } from './deck';
import { calculateHandScore } from './scoring';

export const createNewGame = (playerNames: string[]): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    hand: [],
    balance: 1000, // Starting balance
    currentBet: 0,
    isDealer: index === 0,
    hasFolded: false,
  }));

  return {
    players,
    deck: [],
    pot: 0,
    currentPlayerIndex: 1, // Player after dealer starts
    currentPhase: 'pre-deal',
  };
};

export const dealCards = (gameState: GameState): GameState => {
  const deck = shuffleDeck(createDeck());
  const players = gameState.players.map(p => ({ ...p, hand: [] }));

  for (let i = 0; i < 3; i++) {
    for (const player of players) {
      if (!player.hasFolded) {
        player.hand.push(deck.pop() as Card);
      }
    }
  }

  return {
    ...gameState,
    players,
    deck,
    currentPhase: 'betting',
  };
};

export const determineWinner = (gameState: GameState): Player => {
  const activePlayers = gameState.players.filter(p => !p.hasFolded);
  let winner = activePlayers[0];
  let maxScore = 0;

  for (const player of activePlayers) {
    const score = calculateHandScore(player.hand);
    if (score > maxScore) {
      maxScore = score;
      winner = player;
    }
  }

  return winner;
}; 