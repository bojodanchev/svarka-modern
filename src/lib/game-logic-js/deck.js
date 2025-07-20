import { SUITS, RANKS } from './constants.js';

/**
 * Represents a standard 32-card deck for Svarka.
 */
export class Deck {
  constructor() {
    this.cards = [];
    this.reset();
    this.shuffle();
  }

  /**
   * Resets the deck to a standard, unshuffled 32-card set.
   */
  reset() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({ suit, rank });
      }
    }
  }

  /**
   * Shuffles the deck in place using the Fisher-Yates algorithm.
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Deals a specified number of cards from the top of the deck.
   * @param {number} numberOfCards The number of cards to deal.
   * @returns {Array<object>} An array of card objects. Returns an empty array if not enough cards.
   */
  deal(numberOfCards) {
    if (this.cards.length < numberOfCards) {
      console.warn("Not enough cards in the deck to deal.");
      return [];
    }
    return this.cards.splice(0, numberOfCards);
  }
} 