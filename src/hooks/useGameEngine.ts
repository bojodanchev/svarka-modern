'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, PlayerAction } from '@/lib/game-logic/types';
import { shuffleDeck, createDeck } from '@/lib/game-logic/deck';
import { evaluateHand } from '@/lib/game-logic/scoring'; // Updated import

const makeAIMove = (player: Player, gameState: GameState): PlayerAction => {
    const { handScore, balance, currentBet } = player;
    const { lastBet, minBet } = gameState;
    const costToCall = lastBet - currentBet;

    // --- Strong Hand (> 25 points) ---
    if (handScore > 25) {
        // 70% chance to raise
        if (Math.random() < 0.70) {
            const raiseAmount = lastBet + (minBet || 10) * (Math.random() > 0.5 ? 2 : 1);
            if (balance >= (raiseAmount - currentBet)) {
                return { type: 'raise', amount: raiseAmount };
            }
        }
        // Fallback: Call if possible, otherwise check
        if (costToCall > 0 && balance >= costToCall) return { type: 'call' };
        return { type: 'check' };
    }

    // --- Medium Hand (15-25 points) ---
    if (handScore >= 15 && handScore <= 25) {
        // 50% chance to call
        if (costToCall > 0 && Math.random() < 0.50) {
            if (balance >= costToCall) {
                return { type: 'call' };
            }
        }
        // Fallback: Check if possible, otherwise fold
        if (costToCall > 0) return { type: 'fold' };
        return { type: 'check' };
    }

    // --- Weak Hand (< 15 points) ---
    if (handScore < 15) {
        // 10% chance to bluff
        if (Math.random() < 0.10) {
            const raiseAmount = lastBet + (minBet || 10);
            if (balance >= (raiseAmount - currentBet)) {
                return { type: 'raise', amount: raiseAmount };
            }
        }
        // 80% chance to fold
        if (costToCall > 0 && Math.random() < 0.80) {
            return { type: 'fold' };
        }
        // Fallback: check if possible, otherwise fold
        if (costToCall > 0) {
            if (balance >= costToCall && costToCall < balance * 0.1) { // only call if it's super cheap
                return { type: 'call' };
            }
            return { type: 'fold' };
        }
        return { type: 'check' };
    }

    // Default fallback
    if (costToCall > 0 && balance >= costToCall) return { type: 'call' };
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
            state.phase = 'round-over';
            
            const sortedPlayers = [...activePlayers].sort((a, b) => {
                if (b.handRank !== a.handRank) return b.handRank - a.handRank;
                return b.handScore - a.handScore;
            });

            const winner = sortedPlayers[0];
            
            if (winner) {
                const winnerInState = state.players.find(p => p.id === winner.id)!;
                winnerInState.balance += state.pot;
                state.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.handScore, description: winner.handDescription };
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
        }, 1000); // Delay for AI "thinking" time
        
    }, [gameState, user, isProcessing]);

    const startNewRound = () => {
        setGameState(prev => {
            let newState = JSON.parse(JSON.stringify(prev));
            const deck = shuffleDeck(createDeck());
            newState.players.forEach((p: Player) => {
                p.hand = [];
                p.currentBet = 0;
                p.hasFolded = false;
                p.lastAction = null;
                 if (p.balance > 0) { // Only deal to players with money
                    p.hand = deck.splice(0, 3);
                    const evaluation = evaluateHand(p.hand);
                    p.handScore = evaluation.score;
                    p.handRank = evaluation.rank;
                    p.handDescription = evaluation.description;
                } else {
                    p.hasFolded = true; // Fold players with no money
                }
            });
            newState.phase = 'betting';
            newState.currentPlayerIndex = 0;
            newState.pot = 0;
            newState.lastBet = 0;
            newState.roundWinner = null;
            return newState;
        });
    };

    // Initial hand evaluation on component mount
    useEffect(() => {
        if (initialState) {
            setGameState(initialState);
        }
    }, [initialState]);
    
    return { gameState, handlePlayerAction, startNewRound, isProcessing };
}; 