export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  balance: number;
  currentBet: number;
  isDealer: boolean;
  hasFolded: boolean;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  pot: number;
  currentPlayerIndex: number;
  currentPhase: 'pre-deal' | 'betting' | 'showdown';
} 