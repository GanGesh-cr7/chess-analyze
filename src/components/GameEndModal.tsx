import React from 'react'
import { useGameStore } from '../store/gameStore'
import type { GameResult } from '../store/gameStore'
import { peerNetwork } from '../network/peer'

const RESULT_ICONS: Record<string, string> = {
    checkmate: '♟',
    stalemate: '🤝',
    repetition: '🔁',
    timeout: '⏰',
    resignation: '🏳',
    draw_agreed: '🤝',
    insufficient: '⚖️',
}

const RESULT_LABELS: Record<string, string> = {
    checkmate: 'Checkmate',
    stalemate: 'Stalemate',
    repetition: 'Draw by Repetition',
    timeout: 'Time Out',
    resignation: 'Resignation',
    draw_agreed: 'Draw Agreed',
    insufficient: 'Insufficient Material',
}

interface GameEndModalProps {
    result: GameResult
}

export default function GameEndModal({ result }: GameEndModalProps) {
    const { myColor, myName, opponentName, setPhase } = useGameStore()

    let headline = ''
    let subline = ''
    let headlineColor = 'text-white'

    if (result.winner === 'draw') {
        headline = 'Draw!'
        subline = RESULT_LABELS[result.reason]
        headlineColor = 'text-amber-300'
    } else if (result.winner === myColor) {
        headline = 'You Win! 🎉'
        subline = `${opponentName} — ${RESULT_LABELS[result.reason]}`
        headlineColor = 'text-emerald-400'
    } else {
        headline = 'You Lose'
        subline = RESULT_LABELS[result.reason]
        headlineColor = 'text-rose-400'
    }

    const handleNewGame = () => {
        peerNetwork.disconnect()
        useGameStore.getState().setPhase('home')
        useGameStore.getState().resetGame()
        useGameStore.setState({
            myColor: null,
            roomId: null,
            result: null,
            connectionStatus: 'idle',
            moveHistory: [],
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl p-8 max-w-sm w-full mx-4 animate-slide-up text-center shadow-2xl border border-white/10">
                <div className="text-5xl mb-4">{RESULT_ICONS[result.reason]}</div>
                <h2 className={`text-3xl font-bold mb-2 font-['Outfit'] ${headlineColor}`}>{headline}</h2>
                <p className="text-white/50 text-sm mb-8">{subline}</p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleNewGame}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all active:scale-95"
                    >
                        New Game
                    </button>
                </div>
            </div>
        </div>
    )
}
