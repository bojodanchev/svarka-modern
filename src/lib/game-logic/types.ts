export interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  rank: '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export type PlayerActionType = 'fold' | 'call' | 'bet' | 'raise' | 'check' | null;

export interface PlayerAction {
  type: PlayerActionType;
  amount?: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  balance: number;
  currentBet: number;
  hasFolded: boolean;
  isAI: boolean;
  handScore: number;
  handRank: number; // 0: High Card, 1: Pair, 2: Triple, 3: Svarka
  handDescription: string;
  lastAction: PlayerActionType;
  isReadyForNextRound?: boolean;
}

export interface GameState {
  id: string;
  name: string;
  players: Player[];
  playersCount: number;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  currentPlayerIndex: number;
  pot: number;
  lastBet: number;
  phase: 'betting' | 'reveal' | 'round-over' | 'tie-break';
  roundWinner: { id: string; name: string; hand: Card[]; score: number, description: string } | null;
  tiedPlayerIds?: string[];
}

export interface Lobby {
  id: string;
  name: string;
  description: string;
  minBet: number;
  maxBet: number;
  maxPlayers: number;
}
