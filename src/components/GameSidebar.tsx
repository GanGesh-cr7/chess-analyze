import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { engine } from '../utils/engine'
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
        phase,
        reviewMode,
        analysisIndex,
        setAnalysisIndex,
        setEngineSuggestion,
        fenHistory
    } = useGameStore()

    const [evaluation, setEvaluation] = useState<string>('0.0')

    const currentTurn = chess.turn()
    const opponentColor = myColor === 'w' ? 'b' : 'w'

    // Engine Analysis Logic
    useEffect(() => {
        if (reviewMode && analysisIndex !== null) {
            const fen = fenHistory[analysisIndex]
            engine.stop()
            engine.analyze(fen).then((res) => {
                setEvaluation(res.evaluation)
                // Convert uci bestmove to squares
                if (res.bestMove && res.bestMove.length >= 4) {
                    const from = res.bestMove.substring(0, 2)
                    const to = res.bestMove.substring(2, 4)
                    setEngineSuggestion({ from, to })
                }
            })
        } else {
            setEngineSuggestion(null)
        }
    }, [reviewMode, analysisIndex, fenHistory, setEngineSuggestion])

    const handlePrev = () => {
        if (analysisIndex !== null && analysisIndex > 0) {
            setAnalysisIndex(analysisIndex - 1)
        }
    }

    const handleNext = () => {
        if (analysisIndex !== null && analysisIndex < fenHistory.length - 1) {
            setAnalysisIndex(analysisIndex + 1)
        }
    }

    const topColor = opponentColor ?? 'b'
    const bottomColor = myColor ?? 'w'

    return (
        <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
                <ConnectionStatus />
                <span className="text-xs text-white/30 font-medium uppercase tracking-wider">
                    {reviewMode ? 'Analysis Mode' : !result && phase === 'playing' ? (currentTurn === 'w' ? "White's turn" : "Black's turn") : ''}
                </span>
            </div>

            <PlayerCard
                name={opponentName}
                color={topColor}
                timeMs={topColor === 'w' ? whiteTime : blackTime}
                isActive={!result && !reviewMode && currentTurn === topColor}
                isMe={false}
            />

            <div className="glass rounded-xl flex-1 min-h-0 flex flex-col overflow-hidden relative">
                <MoveHistory moves={moveHistory} />

                {/* Analysis Controls Overlay */}
                {reviewMode && (
                    <div className="absolute bottom-0 inset-x-0 glass-strong border-t border-white/10 p-3 animate-slide-up">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Engine Depth 12</span>
                            <span className={`text-xs font-mono font-bold ${evaluation.startsWith('M') ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {evaluation}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={analysisIndex === 0}
                                className="flex-1 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 transition-all font-bold"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setAnalysisIndex(0)}
                                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] uppercase font-bold"
                            >
                                Start
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={analysisIndex === fenHistory.length - 1}
                                className="flex-1 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 transition-all font-bold"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CapturedPieces
                capturedByWhite={capturedPieces.b}
                capturedByBlack={capturedPieces.w}
            />

            <PlayerCard
                name={myName}
                color={bottomColor}
                timeMs={bottomColor === 'w' ? whiteTime : blackTime}
                isActive={!result && !reviewMode && currentTurn === bottomColor}
                isMe
            />
        </div>
    )
}
