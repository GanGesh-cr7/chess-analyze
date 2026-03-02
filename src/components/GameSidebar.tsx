import { useEffect, useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { engine, type MoveClassification } from '../utils/engine'
import PlayerCard from './PlayerCard'
import MoveHistory from './MoveHistory'
import CapturedPieces from './CapturedPieces'
import ConnectionStatus from './ConnectionStatus'

const QUALITY_COLORS: Record<string, string> = {
    'Brilliant': 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    'Great': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    'Best': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'Excellent': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    'Good': 'text-white/70 border-white/10 bg-white/5',
    'Book': 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    'Inaccuracy': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    'Mistake': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    'Blunder': 'text-rose-500 border-rose-500/30 bg-rose-500/10',
}

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
        fenHistory,
    } = useGameStore()

    const [evaluation, setEvaluation] = useState<string>('0.0')
    const [quality, setQuality] = useState<MoveClassification>('Normal')
    const [showAlternative, setShowAlternative] = useState(true)

    const currentTurn = chess.turn()
    const opponentColor = myColor === 'w' ? 'b' : 'w'

    const analyzePosition = useCallback(async (index: number) => {
        if (!reviewMode) return

        const fen = fenHistory[index]
        engine.stop()

        // 1. Analyze current position for Best Move and Evaluation
        const res = await engine.analyze(fen)
        setEvaluation(res.scoreText)

        if (res.bestMove && res.bestMove.length >= 4 && showAlternative) {
            const from = res.bestMove.substring(0, 2)
            const to = res.bestMove.substring(2, 4)
            setEngineSuggestion({ from, to })
        } else {
            setEngineSuggestion(null)
        }

        // 2. Classify the move that led HERE (if any)
        if (index > 0) {
            const prevFen = fenHistory[index - 1]
            const prevRes = await engine.analyze(prevFen)
            const moveColor = (index % 2 === 1) ? 'w' : 'b'
            const q = engine.classifyMove(prevRes.evaluation, res.evaluation, moveColor === 'w')
            setQuality(q)
        } else {
            setQuality('Normal')
        }
    }, [reviewMode, fenHistory, showAlternative, setEngineSuggestion])

    useEffect(() => {
        if (reviewMode && analysisIndex !== null) {
            analyzePosition(analysisIndex)
        } else {
            setEngineSuggestion(null)
            setQuality('Normal')
        }
    }, [reviewMode, analysisIndex, analyzePosition, setEngineSuggestion])

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
            {reviewMode && (
                <div className="glass-strong rounded-xl p-3 flex flex-col gap-2 animate-fade-in border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Analysis Mode</span>
                            {quality !== 'Normal' && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${QUALITY_COLORS[quality] || 'text-white/50 border-white/10'}`}>
                                    {quality}
                                </span>
                            )}
                        </div>
                        <span className={`text-sm font-mono font-bold ${evaluation.startsWith('M') ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {evaluation}
                        </span>
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={() => setAnalysisIndex(0)} className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] uppercase font-bold transition-all border border-white/5">Start</button>
                        <button onClick={handlePrev} disabled={analysisIndex === 0} className="flex-[1.5] py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 disabled:opacity-20 transition-all border border-emerald-500/30 font-bold">←</button>
                        <button onClick={handleNext} disabled={analysisIndex === fenHistory.length - 1} className="flex-[1.5] py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 disabled:opacity-20 transition-all border border-emerald-500/30 font-bold">→</button>
                        <button onClick={() => setShowAlternative(!showAlternative)} title="Toggle Engine Suggestion" className={`px-3 rounded-lg transition-all border ${showAlternative ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}>
                            💡
                        </button>
                    </div>
                </div>
            )}

            {!reviewMode && (
                <div className="flex items-center justify-between">
                    <ConnectionStatus />
                    <span className="text-xs text-white/30 font-medium uppercase tracking-wider">
                        {!result && phase === 'playing' ? (currentTurn === 'w' ? "White's turn" : "Black's turn") : ''}
                    </span>
                </div>
            )}

            <PlayerCard
                name={opponentName}
                color={topColor}
                timeMs={topColor === 'w' ? whiteTime : blackTime}
                isActive={!result && !reviewMode && currentTurn === topColor}
                isMe={false}
            />

            <div className="glass rounded-xl flex-1 min-h-0 flex flex-col overflow-hidden relative">
                <MoveHistory moves={moveHistory} />
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
