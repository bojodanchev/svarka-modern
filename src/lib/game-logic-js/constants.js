/**
 * @typedef {'♠' | '♥' | '♦' | '♣'} Suit
 * @typedef {'7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'} Rank
 */

export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * The special 'Chechak' card, which acts as a wildcard.
 * As per the requirements, this is the 7 of Spades.
 */
export const CHECHAK_SUIT = '♠';
export const CHECHAK_RANK = '7';

/**
 * Defines the various phases a game round can be in.
 */
export const GAME_PHASES = {
  PRE_DEAL: 'pre-deal',
  BETTING: 'betting',
  SHOWDOWN: 'showdown',
  TIE_BREAKER: 'tie-breaker',
  ROUND_OVER: 'round-over',
};

/**
 * Defines the possible actions a player can take.
 */
export const PLAYER_ACTIONS = {
  FOLD: 'fold',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
}; 