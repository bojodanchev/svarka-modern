import { GameState, Player, Card, PlayerAction } from './types';
import { createDeck, shuffleDeck } from './deck';
import { calculateHandScore } from './scoring';

export const createNewGame = (playerNames: string[]): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    hand: [],
    balance: 1000,
    currentBet: 0,
    isDealer: index === 0,
    hasFolded: false,
    lastAction: null,
  }));

  return {
    players,
    deck: [],
    pot: 0,
    currentPlayerIndex: 1,
    currentPhase: 'pre-deal',
    bettingRound: 0,
    minRaise: 10,
    lastBet: 0,
  };
};

export const dealCards = (gameState: GameState): GameState => {
  const deck = shuffleDeck(createDeck());
  const players = gameState.players.map(p => ({
    ...p,
    hand: [] as Card[],
    hasFolded: false,
    currentBet: 0,
    lastAction: null,
  }));

  // Blinds
  const smallBlindPlayer = players[1 % players.length];
  const bigBlindPlayer = players[2 % players.length];
  smallBlindPlayer.balance -= 5;
  smallBlindPlayer.currentBet = 5;
  bigBlindPlayer.balance -= 10;
  bigBlindPlayer.currentBet = 10;

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
    pot: 15,
    currentPlayerIndex: 3 % players.length,
    currentPhase: 'betting',
    bettingRound: 1,
    lastBet: 10,
  };
};

const advanceToNextPlayer = (gameState: GameState): GameState => {
  let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  while (gameState.players[nextIndex].hasFolded) {
    nextIndex = (nextIndex + 1) % gameState.players.length;
  }
  return { ...gameState, currentPlayerIndex: nextIndex };
};

export const handlePlayerAction = (
  gameState: GameState,
  action: PlayerAction
): GameState => {
  let newGameState = { ...gameState };
  const player = newGameState.players[newGameState.currentPlayerIndex];

  if (action.type === 'fold') {
    player.hasFolded = true;
    player.lastAction = 'Fold';
  }

  if (action.type === 'call') {
    const callAmount = newGameState.lastBet - player.currentBet;
    if (player.balance >= callAmount) {
        player.balance -= callAmount;
        player.currentBet += callAmount;
        newGameState.pot += callAmount;
        player.lastAction = 'Call';
    } else {
        // All-in
        newGameState.pot += player.balance;
        player.currentBet += player.balance;
        player.balance = 0;
        player.lastAction = 'All-in';
    }
}

if (action.type === 'bet') {
    const betAmount = action.amount;
    if (player.balance >= betAmount) {
        player.balance -= betAmount;
        player.currentBet += betAmount;
        newGameState.pot += betAmount;
        newGameState.lastBet = player.currentBet;
        player.lastAction = `Bet ${betAmount}`;
    }
}

if (action.type === 'raise') {
    const raiseAmount = action.amount;
    const totalBet = newGameState.lastBet + raiseAmount;
    const amountToPutIn = totalBet - player.currentBet;

    if (player.balance >= amountToPutIn) {
        player.balance -= amountToPutIn;
        player.currentBet = totalBet;
        newGameState.pot += amountToPutIn;
        newGameState.lastBet = totalBet;
        newGameState.minRaise = raiseAmount;
        player.lastAction = `Raise to ${totalBet}`;
    }
}

  // Check for end of betting round
  const activePlayers = newGameState.players.filter(p => !p.hasFolded);
  const allBetsEqual =
    activePlayers.every(
      p => p.currentBet === newGameState.lastBet || p.balance === 0
    ) && activePlayers.length > 0;

  if (allBetsEqual) {
    // End of round logic
    return { ...newGameState, currentPhase: 'showdown' };
  }

  newGameState = advanceToNextPlayer(newGameState);

  return newGameState;
};

export const determineWinner = (gameState: GameState): Player => {
  const activePlayers = gameState.players.filter(p => !p.hasFolded);
  if (activePlayers.length === 1) {
    return activePlayers[0];
  }

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