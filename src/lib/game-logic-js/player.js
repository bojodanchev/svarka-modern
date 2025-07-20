/**
 * Represents a player in the game.
 */
export class Player {
  /**
   * @param {string} id - A unique identifier for the player.
   * @param {string} name - The player's display name.
   * @param {boolean} [isAI=false] - Whether the player is controlled by AI.
   * @param {number} [startingBalance=1000] - The initial chip balance.
   */
  constructor(id, name, isAI = false, startingBalance = 1000) {
    this.id = id;
    this.name = name;
    this.isAI = isAI;
    this.balance = startingBalance;
    this.hand = [];
    this.score = 0;
    this.currentBet = 0;
    this.hasFolded = false;
    this.lastAction = null;
  }

  /**
   * Resets a player's state for the start of a new round.
   */
  resetForNewRound() {
    this.hand = [];
    this.score = 0;
    this.currentBet = 0;
    this.hasFolded = false;
    this.lastAction = null;
  }
} 