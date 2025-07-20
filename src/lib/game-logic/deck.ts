import { Card, Suit, Rank, Deck as IDeck } from './types';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Deck implements IDeck {
  cards: Card[];

  constructor() {
    this.cards = [];
    this.reset();
    this.shuffle();
  }

  reset() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({ suit, rank });
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(numberOfCards: number): Card[] {
    if (this.cards.length < numberOfCards) {
      console.warn('Not enough cards in the deck to deal.');
      return [];
    }
    return this.cards.splice(0, numberOfCards);
  }
} 