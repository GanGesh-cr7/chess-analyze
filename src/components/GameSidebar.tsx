import React from 'react'
import { useGameStore } from '../store/gameStore'
import { peerNetwork } from '../network/peer'
import PlayerCard from './PlayerCard'
import MoveHistory from './MoveHistory'
import CapturedPieces from './CapturedPieces'
import ConnectionStatus from './ConnectionStatus'

export default function GameSidebar() {
    const {
        myColor,
        myName,
        opponentName,
        whiteTime,
        blackTime,
        chess,
        moveHistory,
        capturedPieces,
        result,
        drawOfferPending,
        drawOfferFrom,
        setDrawOfferPending,
        setResult,
        phase,
    } = useGameStore()

    const currentTurn = chess.turn()
    const opponentColor = myColor === 'w' ? 'b' : 'w'

    const handleResign = () => {
        if (result) return
        peerNetwork.send({ type: 'resign' })
        setResult({ winner: opponentColor!, reason: 'resignation' })
    }

    const handleDrawOffer = () => {
        if (result) return
        peerNetwork.send({ type: 'draw_offer' })
    }

    const handleAcceptDraw = () => {
        peerNetwork.send({ type: 'draw_accept' })
        setResult({ winner: 'draw', reason: 'draw_agreed' })
        setDrawOfferPending(false)
    }

    const handleDeclineDraw = () => {
        peerNetwork.send({ type: 'draw_decline' })
        setDrawOfferPending(false)
    }

    // Which player is on top (opponent) and bottom (me)
    const topColor = opponentColor ?? 'b'
    const bottomColor = myColor ?? 'w'

    return (
        <div className="flex flex-col h-full gap-3">
            {/* Connection status */}
            <div className="flex items-center justify-between">
                <ConnectionStatus />
                <span className="text-xs text-white/30">
                    {phase === 'playing' && !result
                        ? currentTurn === 'w'
                            ? "White's turn"
                            : "Black's turn"
                        : ''}
                </span>
            </div>

            {/* Opponent */}
            <PlayerCard
                name={opponentName}
                color={topColor}
                timeMs={topColor === 'w' ? whiteTime : blackTime}
                isActive={!result && currentTurn === topColor}
                isMe={false}
            />

            {/* Move history */}
            <div className="glass rounded-xl flex-1 min-h-0 flex flex-col overflow-hidden">
                <MoveHistory moves={moveHistory} />
            </div>

            {/* Captured pieces */}
            <CapturedPieces
                capturedByWhite={capturedPieces.b}
                capturedByBlack={capturedPieces.w}
            />

            {/* Me */}
            <PlayerCard
                name={myName}
                color={bottomColor}
                timeMs={bottomColor === 'w' ? whiteTime : blackTime}
                isActive={!result && currentTurn === bottomColor}
                isMe
            />

            {/* Draw offer banner */}
            {drawOfferPending && drawOfferFrom !== myColor && (
                <div className="glass rounded-xl px-4 py-3 border border-amber-500/30 animate-fade-in">
                    <p className="text-sm text-amber-300 font-medium mb-2">
                        🤝 Opponent offers a draw
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAcceptDraw}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleDeclineDraw}
                            className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-sm font-medium transition-colors"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {!result && phase === 'playing' && (
                <div className="flex gap-2">
                    <button
                        onClick={handleDrawOffer}
                        className="flex-1 py-2 rounded-xl glass hover:bg-white/10 text-white/60 hover:text-amber-300 text-sm font-medium transition-all border border-white/5 hover:border-amber-500/30"
                    >
                        ½ Draw
                    </button>
                    <button
                        onClick={handleResign}
                        className="flex-1 py-2 rounded-xl glass hover:bg-rose-500/10 text-white/60 hover:text-rose-400 text-sm font-medium transition-all border border-white/5 hover:border-rose-500/30"
                    >
                        🏳 Resign
                    </button>
                </div>
            )}
        </div>
    )
}
