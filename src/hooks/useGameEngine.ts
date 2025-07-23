'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, Player, PlayerAction, Card } from '@/lib/game-logic/types';
import { shuffleDeck, createDeck } from '@/lib/game-logic/deck';
import { calculateScore } from '@/lib/game-logic/scoring';

const aiNames = ["Мария", "Петър", "Георги", "Иван", "Елена", "Димитър", "София", "Никола"];

const makeAIMove = (player: Player, gameState: GameState): PlayerAction => {
    const score = player.score;

    if (score > 20 && Math.random() > 0.4) {
        const raiseAmount = Math.min(player.balance, gameState.lastBet + 20 + Math.floor(Math.random() * 30));
        if (raiseAmount > gameState.lastBet) return { type: 'raise', amount: raiseAmount };
    }
    
    if (score > 14 && Math.random() > 0.3) {
        if (gameState.lastBet > 0) return { type: 'call' };
        return { type: 'bet', amount: Math.min(player.balance, 10) };
    }

    if (gameState.lastBet > player.balance * 0.3 && Math.random() > 0.5) {
        return { type: 'fold' };
    }

    return { type: 'call' };
};


export const useGameEngine = (initialState: GameState, user: any) => {
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [isProcessing, setIsProcessing] = useState(false);

    const processPlayerMove = (player: Player, move: PlayerAction, state: GameState): GameState => {
        const newState = { ...state };
        player.lastAction = move.type;

        switch (move.type) {
            case 'fold':
                player.hasFolded = true;
                break;
            case 'call':
                const callAmount = newState.lastBet - player.currentBet;
                const amountToCall = Math.min(callAmount, player.balance);
                player.balance -= amountToCall;
                player.currentBet += amountToCall;
                newState.pot += amountToCall;
                break;
            case 'bet':
            case 'raise':
                const totalBet = move.amount || 0;
                const requiredAmount = totalBet - player.currentBet;
                
                if (requiredAmount > 0 && totalBet >= newState.lastBet) {
                    const amountToBet = Math.min(requiredAmount, player.balance);
                    player.balance -= amountToBet;
                    player.currentBet += amountToBet;
                    newState.pot += amountToBet;
                    newState.lastBet = player.currentBet;
                }
                break;
        }
        return newState;
    }

    const checkAndFinalizeRound = (state: GameState): GameState => {
        if (state.phase === 'round-over') return state;

        const activePlayers = state.players.filter(p => !p.hasFolded && p.balance > 0);
        
        const allPlayersActed = activePlayers.every(p => p.lastAction !== null);
        const allBetsEqual = activePlayers.every(p => p.currentBet === state.lastBet);

        if (activePlayers.length <= 1 || (allPlayersActed && allBetsEqual)) {
            state.phase = 'round-over';
            const winner = activePlayers.length > 0 ? activePlayers.reduce((best, current) => current.score > best.score ? current : best, activePlayers[0]) : null;
            
            if (winner) {
                state.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.score };
                const winnerInState = state.players.find(p => p.id === winner.id);
                if (winnerInState) {
                    winnerInState.balance += state.pot;
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
        currentState.currentPlayerIndex = (playerIndex + 1) % currentState.players.length;

        let turn = 0;
        const maxTurns = currentState.players.length * 2; 

        while (turn < maxTurns && currentState.players[currentState.currentPlayerIndex].isAI && currentState.phase === 'betting') {
            const aiPlayer = currentState.players[currentState.currentPlayerIndex];
            if (!aiPlayer.hasFolded) {
                const aiAction = makeAIMove(aiPlayer, currentState);
                currentState = processPlayerMove(aiPlayer, aiAction, currentState);
            }
            currentState = checkAndFinalizeRound(currentState);
            if (currentState.phase === 'round-over') break;
            currentState.currentPlayerIndex = (currentState.currentPlayerIndex + 1) % currentState.players.length;
            turn++;
        }
        
        currentState = checkAndFinalizeRound(currentState);
        setGameState(currentState);
        setIsProcessing(false);
    }, [gameState, user, isProcessing]);

    const startNewRound = () => {
        setGameState(prev => {
            const newState = { ...prev };
            const deck = shuffleDeck(createDeck());
            newState.players.forEach(p => {
                p.hand = [];
                p.currentBet = 0;
                p.hasFolded = false;
                p.score = 0;
                p.lastAction = null;
                 if (p.balance > 0) {
                    p.hand = deck.splice(0, 3);
                    p.score = calculateScore(p.hand);
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
    
    return { gameState, handlePlayerAction, startNewRound, isProcessing };
}; 