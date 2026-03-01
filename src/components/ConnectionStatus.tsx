import React from 'react'
import { useGameStore } from '../store/gameStore'

const statuses = {
    idle: { label: 'Offline', color: 'bg-white/20', pulse: false },
    connecting: { label: 'Connecting…', color: 'bg-amber-400', pulse: true },
    connected: { label: 'Connected', color: 'bg-emerald-400', pulse: false },
    disconnected: { label: 'Disconnected', color: 'bg-rose-400', pulse: false },
}

export default function ConnectionStatus() {
    const { connectionStatus } = useGameStore()
    const s = statuses[connectionStatus]

    return (
        <div className="flex items-center gap-2 text-xs text-white/60">
            <span className={`relative flex h-2 w-2`}>
                {s.pulse && (
                    <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.color}`}
                    />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${s.color}`} />
            </span>
            <span>{s.label}</span>
        </div>
    )
}
