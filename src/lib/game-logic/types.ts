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
  id: string;
  name: string;
  players: Player[];
  currentPlayerIndex: number;
  dealerIndex: number;
  pot: number;
  lastBet: number;
  phase: 'betting' | 'showdown' | 'round-over' | 'waiting' | 'pre-deal';
  roundWinner?: Player | null;
  playersCount?: number;
  createdBy?: string;
}

export type PlayerActionType = 'fold' | 'call' | 'bet' | 'raise' | 'start_new_round';

export interface PlayerAction {
  type: PlayerActionType;
  amount?: number;
}
