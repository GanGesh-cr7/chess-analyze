import { useGameStore } from '../store/gameStore'
import { useChessClock } from '../hooks/useChessClock'
import ChessBoard from './ChessBoard'
import GameSidebar from './GameSidebar'
import GameEndModal from './GameEndModal'

export default function GameView() {
    useChessClock()

    const { result } = useGameStore()

    return (
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-2 sm:p-4 gap-4 lg:gap-6 min-h-0 overflow-auto lg:overflow-hidden">
            {/* Board */}
            <div className="flex items-center justify-center shrink-0 w-full lg:w-auto">
                <ChessBoard />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-72 flex flex-col lg:h-full lg:max-h-[var(--board-size)]">
                <GameSidebar />
            </div>

            {/* Game end modal */}
            {result && <GameEndModal result={result} />}
        </div>
    )
}

