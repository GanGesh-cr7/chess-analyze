
interface PlayerCardProps {
    name: string
    color: 'w' | 'b'
    timeMs: number
    isActive: boolean
    isMe: boolean
}

function formatTime(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlayerCard({ name, color, timeMs, isActive, isMe }: PlayerCardProps) {
    const isLow = timeMs < 30_000 && timeMs > 0
    const avatar = color === 'w' ? '♔' : '♚'

    return (
        <div
            className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-300 ${isActive
                ? 'glass-strong border border-emerald-500/30 glow-green'
                : 'glass border border-transparent'
                }`}
        >
            {/* Avatar */}
            <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-base sm:text-lg font-bold select-none ${color === 'w'
                    ? 'bg-white/90 text-gray-900'
                    : 'bg-gray-800 text-white border border-white/10'
                    }`}
            >
                {avatar}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate text-white/90">
                    {name}
                    {isMe && (
                        <span className="ml-1 sm:ml-2 text-[9px] sm:text-[10px] font-medium text-emerald-400/80 bg-emerald-400/10 px-1 sm:px-1.5 py-0.5 rounded-full">
                            You
                        </span>
                    )}
                </p>
                <p className="text-[10px] sm:text-[11px] text-white/30">{color === 'w' ? 'White' : 'Black'}</p>
            </div>

            {/* Clock */}
            <div
                className={`font-mono text-base sm:text-lg font-bold tabular-nums px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors ${isLow
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : isActive
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-white/5 text-white/50'
                    }`}
            >
                {formatTime(timeMs)}
            </div>
        </div>
    )
}

