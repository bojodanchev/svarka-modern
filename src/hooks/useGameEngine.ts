'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, PlayerAction } from '@/lib/game-logic/types';
import { shuffleDeck, createDeck } from '@/lib/game-logic/deck';
import { evaluateHand } from '@/lib/game-logic/scoring'; // Updated import

const makeAIMove = (player: Player, gameState: GameState): PlayerAction => {
    const { handScore, handRank, balance, currentBet } = player;
    const { lastBet, minBet } = gameState;
    const costToCall = lastBet - currentBet;

    // --- Strong Hand (Svarka or Triple) ---
    if (handRank > 1) { // Rank 2 (Triple) or 3 (Svarka)
        if (Math.random() < 0.8) { // 80% chance to be aggressive
            const raiseAmount = lastBet + (minBet || 10) * (Math.random() > 0.5 ? 2 : 1);
            if (balance >= (raiseAmount - currentBet)) {
                return { type: 'raise', amount: raiseAmount };
            }
        }
        if (costToCall > 0 && balance >= costToCall) return { type: 'call' };
        return { type: 'check' };
    }

    // --- Medium Hand (Pair > 16) ---
    if (handRank === 1 && handScore > 16) {
        if (costToCall > 0 && Math.random() < 0.6) { // 60% chance to call
            if (balance >= costToCall) return { type: 'call' };
        }
        if (costToCall > 0) return { type: 'fold' };
        return { type: 'check' };
    }

    // --- Weak Hand ---
    // 10% chance to bluff on a weak hand
    if (Math.random() < 0.10 && lastBet === 0) {
        const betAmount = minBet || 10;
        if (balance >= betAmount) {
            return { type: 'bet', amount: betAmount };
        }
    }
    // High probability to fold if there is a bet
    if (costToCall > 0) {
        return { type: 'fold' };
    }
    // Otherwise, just check
    return { type: 'check' };
};


export const useGameEngine = (initialState: GameState, user: any) => {
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [isProcessing, setIsProcessing] = useState(false);

    const processPlayerMove = (player: Player, move: PlayerAction, state: GameState): GameState => {
        const newState = JSON.parse(JSON.stringify(state));
        const playerInState = newState.players.find((p: Player) => p.id === player.id);
        if (!playerInState) return newState;
        
        playerInState.lastAction = move.type;

        switch (move.type) {
            case 'fold':
                playerInState.hasFolded = true;
                break;
            case 'call':
                const callAmount = newState.lastBet - playerInState.currentBet;
                if (callAmount > 0) {
                    const amountToCall = Math.min(callAmount, playerInState.balance);
                    playerInState.balance -= amountToCall;
                    playerInState.currentBet += amountToCall;
                    newState.pot += amountToCall;
                }
                break;
            case 'bet':
            case 'raise':
                const totalBet = move.amount || 0;
                const requiredAmount = totalBet - playerInState.currentBet;
                
                if (requiredAmount > 0 && totalBet >= newState.lastBet && playerInState.balance >= requiredAmount) {
                    playerInState.balance -= requiredAmount;
                    playerInState.currentBet += requiredAmount;
                    newState.pot += requiredAmount;
                    newState.lastBet = playerInState.currentBet;
                }
                break;
            case 'check':
                // No change in balance or pot
                break;
        }
        return newState;
    }

    const checkAndFinalizeRound = (state: GameState): GameState => {
        const activePlayers = state.players.filter(p => !p.hasFolded);
        
        // Round ends if only one player hasn't folded
        if (activePlayers.length <= 1) {
            state.phase = 'round-over';
            const winner = activePlayers[0]; // The last one standing
            if (winner) {
                const winnerInState = state.players.find(p => p.id === winner.id)!;
                winnerInState.balance += state.pot;
                state.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.handScore, description: "Всички други се отказаха" };
            }
            return state;
        }

        const allPlayersCalledOrChecked = activePlayers.every(p => p.lastAction && ['call', 'check', 'bet', 'raise'].includes(p.lastAction));
        const allBetsEqual = new Set(activePlayers.map(p => p.currentBet)).size === 1;

        if (allPlayersCalledOrChecked && allBetsEqual) {
            
            // Failsafe: Re-evaluate hands right before showdown to ensure data is correct.
            activePlayers.forEach(p => {
                const evaluation = evaluateHand(p.hand);
                p.handScore = evaluation.score;
                p.handRank = evaluation.rank;
                p.handDescription = evaluation.description;
            });

            const sortedPlayers = [...activePlayers].sort((a, b) => {
                if (b.handRank !== a.handRank) return b.handRank - a.handRank;
                return b.handScore - a.handScore;
            });
            
            const winner = sortedPlayers[0];
            const tiedPlayers = sortedPlayers.filter(p => p.handRank === winner.handRank && p.handScore === winner.handScore);

            if (tiedPlayers.length > 1) {
                state.phase = 'tie-break';
                state.tiedPlayerIds = tiedPlayers.map(p => p.id);
                state.roundWinner = null;
            } else {
                state.phase = 'round-over';
                if (winner) {
                    const winnerInState = state.players.find(p => p.id === winner.id)!;
                    winnerInState.balance += state.pot;
                    state.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.handScore, description: winner.handDescription };
                }
            }
        }
        return state;
    };
    
    const handlePlayerAction = useCallback(async (action: PlayerAction) => {
        if (isProcessing || gameState.phase !== 'betting') return;
        
        setIsProcessing(true);
        
        let currentState = { ...gameState };
        const playerIndex = currentState.players.findIndex(p => p.id === user.uid);
        if (playerIndex === -1 || currentState.currentPlayerIndex !== playerIndex) {
            setIsProcessing(false);
            return;
        }

        currentState = processPlayerMove(currentState.players[playerIndex], action, currentState);
        
        // Check for round end after player move
        let finalState = checkAndFinalizeRound(currentState);
        if (finalState.phase === 'round-over') {
            setGameState(finalState);
            setIsProcessing(false);
            return;
        }

        finalState.currentPlayerIndex = (playerIndex + 1) % finalState.players.length;
        setGameState(finalState); // Update state to show player's move
        
        // AI moves
        setTimeout(() => {
            let aiState = JSON.parse(JSON.stringify(finalState));
            let turn = 0;
            const maxTurns = aiState.players.length;

            while (turn < maxTurns && aiState.players[aiState.currentPlayerIndex].isAI) {
                const aiPlayer = aiState.players[aiState.currentPlayerIndex];
                if (!aiPlayer.hasFolded) {
                    const aiAction = makeAIMove(aiPlayer, aiState);
                    aiState = processPlayerMove(aiPlayer, aiAction, aiState);
                }
                
                aiState = checkAndFinalizeRound(aiState);
                if (aiState.phase === 'round-over') break;

                aiState.currentPlayerIndex = (aiState.currentPlayerIndex + 1) % aiState.players.length;
                turn++;
            }
            setGameState(aiState);
            setIsProcessing(false);
        }, 1000);
        
    }, [gameState, user, isProcessing]);

    const handleRejoinTieBreak = () => {
        setGameState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const player = newState.players.find((p: Player) => p.id === user.uid);
            if (player && player.balance >= newState.minBet) {
                player.balance -= newState.minBet;
                newState.pot += newState.minBet;
                player.isReadyForNextRound = true;
            }

            // If all living players are ready, start the next round
            const livingPlayers = newState.players.filter((p: Player) => p.balance + p.currentBet > 0);
            const allReady = livingPlayers.every((p: Player) => p.isReadyForNextRound);
            if(allReady) {
               return startNewRound(newState, true);
            }
            
            return newState;
        });
    };

    const startNewRound = (currentState?: GameState, isTieBreaker = false) => {
        const roundStarter = (prev: GameState) => {
            let stateToStartFrom = currentState || prev;
            let newState = JSON.parse(JSON.stringify(stateToStartFrom));
            
            if (!isTieBreaker) {
                newState.pot = 0; // Reset pot only if it's not a tie-breaker
            }

            const deck = shuffleDeck(createDeck());
            newState.players.forEach((p: Player) => {
                // In a tie-breaker, only deal to tied players or those who rejoined
                const canPlay = !isTieBreaker || (newState.tiedPlayerIds && newState.tiedPlayerIds.includes(p.id)) || p.isReadyForNextRound;

                if (p.balance > 0 && canPlay) {
                    p.hand = deck.splice(0, 3);
                    const evaluation = evaluateHand(p.hand);
                    p.handScore = evaluation.score;
                    p.handRank = evaluation.rank;
                    p.handDescription = evaluation.description;
                    p.hasFolded = false;
                } else {
                    p.hasFolded = true;
                    p.hand = [];
                }
                p.currentBet = 0;
                p.lastAction = null;
                p.isReadyForNextRound = false;
            });

            newState.phase = 'betting';
            newState.currentPlayerIndex = 0;
            newState.lastBet = 0;
            newState.roundWinner = null;
            newState.tiedPlayerIds = [];
            return newState;
        }

        if(currentState) {
            return roundStarter(currentState);
        } else {
            setGameState(roundStarter);
        }
    };

    // Initial hand evaluation on component mount
    useEffect(() => {
        if (initialState) {
            setGameState(initialState);
        }
    }, [initialState]);
    
    return { gameState, handlePlayerAction, startNewRound, isProcessing, handleRejoinTieBreak };
}; 