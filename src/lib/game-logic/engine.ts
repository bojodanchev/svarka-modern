import { GameState, Player, PlayerAction } from './types';
import { Deck } from './deck';
import { calculateHandScore } from './scoring';

export class Game {
  private state: GameState;
  private options: { smallBlind: number; bigBlind: number };

  constructor(
    playerNames: string[],
    humanPlayerId: string,
    options = { smallBlind: 5, bigBlind: 10 }
  ) {
    this.options = options;
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      hand: [],
      balance: 1000,
      currentBet: 0,
      hasFolded: false,
      isAI: `player-${index}` !== humanPlayerId,
      lastAction: null,
      score: 0,
    }));

    this.state = {
      players,
      deck: new Deck(),
      pot: 0,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'pre-deal',
      lastBet: 0,
      roundWinner: null,
    };
  }

  getState(): GameState {
    return this.deepCloneState();
  }

  startNewRound() {
    this.state.pot = 0;
    this.state.lastBet = 0;
    this.state.roundWinner = null;
    this.state.phase = 'betting';

    this.state.deck.reset();
    this.state.deck.shuffle();
    
    this.state.players.forEach(p => {
        p.hand = [];
        p.currentBet = 0;
        p.hasFolded = false;
        p.lastAction = null;
        p.score = 0;
    });

    this.state.dealerIndex = (this.state.dealerIndex + 1) % this.state.players.length;
    
    // Post blinds
    const smallBlindIndex = (this.state.dealerIndex + 1) % this.state.players.length;
    const bigBlindIndex = (this.state.dealerIndex + 2) % this.state.players.length;

    const smallBlindPlayer = this.state.players[smallBlindIndex];
    if (smallBlindPlayer) {
      const blindAmount = this.options.smallBlind;
      smallBlindPlayer.balance -= blindAmount;
      smallBlindPlayer.currentBet = blindAmount;
      this.state.pot += blindAmount;
    }

    const bigBlindPlayer = this.state.players[bigBlindIndex];
    if (bigBlindPlayer) {
      const blindAmount = this.options.bigBlind;
      bigBlindPlayer.balance -= blindAmount;
      bigBlindPlayer.currentBet = blindAmount;
      this.state.pot += blindAmount;
      this.state.lastBet = blindAmount;
    }

    this.state.currentPlayerIndex = (this.state.dealerIndex + 3) % this.state.players.length;

    this.state.players.forEach(player => {
      player.hand = this.state.deck.deal(3);
      player.score = calculateHandScore(player.hand);
    });
    
    return this.getState();
  }

  handlePlayerAction(playerId: string, action: PlayerAction) {
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) {
      throw new Error("It's not this player's turn.");
    }

    let newState = this.cloneState();
    let player = newState.players[newState.currentPlayerIndex];

    switch (action.type) {
      case 'fold':
        player.hasFolded = true;
        break;
      case 'call':
        const callAmount = newState.lastBet - player.currentBet;
        player.balance -= callAmount;
        player.currentBet += callAmount;
        newState.pot += callAmount;
        break;
      case 'raise':
      case 'bet':
        const totalBetAmount = action.amount;
        const amountToBet = totalBetAmount - player.currentBet;
        player.balance -= amountToBet;
        player.currentBet = totalBetAmount;
        newState.pot += amountToBet;
        newState.lastBet = totalBetAmount;
        break;
    }

    player.lastAction = action.type;
    this.state = newState; // Temporarily set state for advanceToNextPlayer to read
    this.advanceToNextPlayer();
    
    return this.getState();
  }

  private advanceToNextPlayer() {
    const activePlayers = this.state.players.filter(p => !p.hasFolded);
    if (activePlayers.length <= 1) {
      this.endRound();
      return;
    }
    
    do {
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    } while (this.state.players[this.state.currentPlayerIndex].hasFolded);
    
    const allCalled = activePlayers.every(p => p.currentBet === this.state.lastBet || p.balance === 0);
    
    if (allCalled) {
      this.endRound();
    }
  }

  private endRound() {
    this.state.phase = 'showdown';
    const activePlayers = this.state.players.filter(p => !p.hasFolded);

    if (activePlayers.length === 1) {
      this.state.roundWinner = activePlayers[0];
    } else {
      this.state.roundWinner = activePlayers.reduce((best, current) => {
        return current.score > best.score ? current : best;
      });
    }

    if(this.state.roundWinner){
        // Ensure we are modifying the latest player object
        const winnerPlayer = this.state.players.find(p => p.id === this.state.roundWinner!.id);
        if(winnerPlayer) {
            winnerPlayer.balance += this.state.pot;
        }
    }

    this.state.phase = 'round-over';
  }

  private deepCloneState(): GameState {
    // Basic deep clone for serializable state. More complex state might need a library like lodash.
    return JSON.parse(JSON.stringify(this.state));
  }

  private cloneState(): GameState {
    // Create new objects for state and players array for immutability
    return {
      ...this.state,
      players: this.state.players.map(p => ({...p})),
    };
  }
}
