import { useGameStore } from '../store/gameStore'
import { useChessClock } from '../hooks/useChessClock'
import ChessBoard from './ChessBoard'
import GameSidebar from './GameSidebar'
import GameEndModal from './GameEndModal'

export default function GameView() {
    useChessClock()

    const { result } = useGameStore()

    return (
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:justify-center p-2 sm:p-4 gap-4 lg:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
            {/* Board Container - Fixed size and no shrink */}
            <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-auto py-2">
                <ChessBoard />
            </div>

            {/* Sidebar / History - Grows and scrolls independently */}
            <div className="w-full lg:w-72 flex flex-col lg:h-full lg:max-h-[var(--board-size)] flex-grow lg:flex-grow-0 min-h-[300px]">
                <GameSidebar />
            </div>

            {/* Game end modal */}
            {result && <GameEndModal result={result} />}
        </div>
    )
}
