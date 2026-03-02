import { useGameStore } from '../store/gameStore'
import { useChessClock } from '../hooks/useChessClock'
import ChessBoard from './ChessBoard'
import GameSidebar from './GameSidebar'
import GameEndModal from './GameEndModal'

export default function GameView() {
    useChessClock()

    const { result } = useGameStore()

    return (
        <div className="flex-1 flex items-center justify-center p-4 gap-6 min-h-0">
            {/* Board */}
            <div className="flex items-center justify-center shrink-0">
                <ChessBoard />
            </div>

            {/* Sidebar */}
            <div className="w-72 h-full flex flex-col" style={{ maxHeight: 'var(--board-size)' }}>
                <GameSidebar />
            </div>

            {/* Game end modal */}
            {result && <GameEndModal result={result} />}
        </div>
    )
}

