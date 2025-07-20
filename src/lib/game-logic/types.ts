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
  hasFolded: boolean;
  isAI: boolean;
  lastAction: PlayerActionType | null;
  score: number;
}

export type GamePhase =
  | 'pre-deal'
  | 'betting'
  | 'showdown'
  | 'round-over';

export interface GameState {
  players: Player[];
  deck: Deck;
  pot: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  phase: GamePhase;
  lastBet: number;
  roundWinner: Player | null;
}

export type PlayerActionType = 'fold' | 'call' | 'bet' | 'raise';

export type PlayerAction =
  | { type: 'fold' }
  | { type: 'call' }
  | { type: 'bet'; amount: number }
  | { type: 'raise'; amount: number };

export interface Deck {
  cards: Card[];
  reset: () => void;
  shuffle: () => void;
  deal: (numberOfCards: number) => Card[];
}
