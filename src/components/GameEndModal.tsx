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
    const {
        myColor,
        opponentName,
        rematchOfferPending,
        rematchOfferFrom,
        setRematchOfferPending,
        resetGame,
        setReviewMode,
        setAnalysisIndex,
        fenHistory
    } = useGameStore()

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

    const handleReview = () => {
        setReviewMode(true)
        setAnalysisIndex(fenHistory.length - 1)
        // We don't close the "modal" here because it's now just a summary in the sidebar or overlay
        // but for now, we'll keep it as a small floating card
    }

    const handleRematchOffer = () => {
        peerNetwork.send({ type: 'rematch_offer' })
        setRematchOfferPending(true, myColor!)
    }

    const handleAcceptRematch = () => {
        peerNetwork.send({ type: 'rematch_accept' })
        resetGame()
    }

    const handleDeclineRematch = () => {
        peerNetwork.send({ type: 'rematch_decline' })
        setRematchOfferPending(false)
    }

    const isOutgoingRematch = rematchOfferPending && rematchOfferFrom === myColor
    const isIncomingRematch = rematchOfferPending && rematchOfferFrom !== myColor

    return (
        <div className="absolute top-4 right-4 z-40 animate-slide-up pointer-events-auto">
            <div className="glass-strong rounded-2xl p-6 max-w-[280px] w-full shadow-2xl border border-white/10 text-center">
                <div className="text-4xl mb-3">{RESULT_ICONS[result.reason]}</div>
                <h2 className={`text-2xl font-bold mb-1 font-['Outfit'] ${headlineColor}`}>{headline}</h2>
                <p className="text-white/50 text-xs mb-6 px-2">{subline}</p>

                <div className="flex flex-col gap-2">
                    {/* Review Button */}
                    <button
                        onClick={handleReview}
                        className="w-full py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs border border-blue-500/30 transition-all"
                    >
                        🔍 Game Review
                    </button>

                    {/* Rematch Flow */}
                    {isIncomingRematch ? (
                        <div className="space-y-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Opponent wants rematch!</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAcceptRematch}
                                    className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-all"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={handleDeclineRematch}
                                    className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-all"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    ) : isOutgoingRematch ? (
                        <div className="py-2 px-3 rounded-xl bg-white/5 text-white/30 text-[11px] border border-white/5 animate-pulse">
                            Pending rematch...
                        </div>
                    ) : (
                        <button
                            onClick={handleRematchOffer}
                            className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-all"
                        >
                            Rematch
                        </button>
                    )}

                    <button
                        onClick={handleNewGame}
                        className="w-full py-2 text-white/40 hover:text-white/60 text-[10px] transition-all"
                    >
                        Exit to Home
                    </button>
                </div>
            </div>
        </div>
    )
}
