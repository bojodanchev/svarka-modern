import { Deck } from './deck.js';
import { Player } from './player.js';
import { GAME_PHASES, PLAYER_ACTIONS } from './constants.js';
import { calculateHandScore } from './scoring.js';

/**
 * Manages the state and logic for a game of Svarka.
 */
export class Game {
  /**
   * @param {string[]} playerNames - An array of names for the players.
   * @param {string} humanPlayerId - The ID of the human player.
   */
  constructor(playerNames, humanPlayerId) {
    this.players = playerNames.map((name, index) => {
      const id = `player-${index}`;
      return new Player(id, name, id !== humanPlayerId);
    });
    this.deck = new Deck();
    this.pot = 0;
    this.dealerIndex = 0;
    this.currentPlayerIndex = 0;
    this.phase = GAME_PHASES.PRE_DEAL;
    this.lastBet = 0;
    this.roundWinner = null;
  }

  /**
   * Starts a new round of the game.
   * Resets players and the deck, deals new cards, and enters the betting phase.
   */
  startNewRound() {
    this.pot = 0;
    this.lastBet = 0;
    this.roundWinner = null;
    this.phase = GAME_PHASES.BETTING;

    // Reset deck and players
    this.deck.reset();
    this.deck.shuffle();
    this.players.forEach(player => player.resetForNewRound());

    // Set dealer and current player for the new round
    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;

    // Deal 3 cards to each player
    this.players.forEach(player => {
      player.hand = this.deck.deal(3);
      player.score = calculateHandScore(player.hand);
    });

    return this.getState();
  }

  /**
   * Handles a player's action (fold, call, raise).
   * @param {string} playerId - The ID of the player taking the action.
   * @param {PLAYER_ACTIONS} actionType - The type of action.
   * @param {number} [amount=0] - The amount to bet or raise.
   * @returns {object} The updated game state.
   */
  handlePlayerAction(playerId, actionType, amount = 0) {
    const player = this.players[this.currentPlayerIndex];
    if (player.id !== playerId) {
      throw new Error("It's not this player's turn.");
    }

    switch (actionType) {
      case PLAYER_ACTIONS.FOLD:
        player.hasFolded = true;
        break;
      case PLAYER_ACTIONS.CALL:
        const callAmount = this.lastBet - player.currentBet;
        player.balance -= callAmount;
        player.currentBet += callAmount;
        this.pot += callAmount;
        break;
      case PLAYER_ACTIONS.RAISE:
      case PLAYER_ACTIONS.BET:
        const betAmount = amount - player.currentBet;
        player.balance -= betAmount;
        player.currentBet += betAmount;
        this.pot += betAmount;
        this.lastBet = player.currentBet;
        break;
    }

    player.lastAction = actionType;
    this._advanceToNextPlayer();
    
    return this.getState();
  }

  /**
   * Moves the turn to the next active player.
   * @private
   */
  _advanceToNextPlayer() {
    const activePlayers = this.players.filter(p => !p.hasFolded);
    if (activePlayers.length <= 1) {
      this._endRound();
      return;
    }
    
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].hasFolded);
    
    // Check if the betting round is over
    const activeBets = activePlayers.map(p => p.currentBet);
    const allCalled = activeBets.every(bet => bet === this.lastBet);
    
    if (allCalled) {
      this._endRound();
    }
  }

  /**
   * Ends the current betting round and determines the winner.
   * @private
   */
  _endRound() {
    this.phase = GAME_PHASES.SHOWDOWN;
    const activePlayers = this.players.filter(p => !p.hasFolded);

    if (activePlayers.length === 1) {
      this.roundWinner = activePlayers[0];
    } else {
      this.roundWinner = activePlayers.reduce((bestPlayer, currentPlayer) => {
        return currentPlayer.score > bestPlayer.score ? currentPlayer : bestPlayer;
      });
    }

    // Award pot to the winner
    this.roundWinner.balance += this.pot;
    this.phase = GAME_PHASES.ROUND_OVER;
  }
  
  /**
   * Returns a snapshot of the current game state.
   * @returns {object} A serializable object representing the game state.
   */
  getState() {
    return {
      players: this.players,
      pot: this.pot,
      currentPlayerIndex: this.currentPlayerIndex,
      phase: this.phase,
      lastBet: this.lastBet,
      roundWinner: this.roundWinner
    };
  }
} 