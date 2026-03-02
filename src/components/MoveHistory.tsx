import { useRef, useEffect } from 'react'
import type { Move } from 'chess.js'

interface MoveHistoryProps {
    moves: Move[]
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
    const pairs: [Move, Move | undefined][] = []
    for (let i = 0; i < moves.length; i += 2) {
        pairs.push([moves[i], moves[i + 1]])
    }

    const endRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [moves.length])

    return (
        <div className="flex-1 overflow-y-auto min-h-0">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-widest px-3 pt-3 pb-2">
                Move History
            </div>
            {pairs.length === 0 ? (
                <div className="text-sm text-white/25 px-3 py-2 italic">No moves yet…</div>
            ) : (
                <table className="w-full text-sm">
                    <tbody>
                        {pairs.map(([w, b], idx) => (
                            <tr
                                key={idx}
                                className={`${idx % 2 === 0 ? 'bg-white/[0.02]' : ''} hover:bg-white/5 transition-colors`}
                            >
                                <td className="px-3 py-1.5 text-white/30 w-8 select-none">{idx + 1}.</td>
                                <td className="px-2 py-1.5 font-mono text-white/80 font-medium">{w.san}</td>
                                <td className="px-2 py-1.5 font-mono text-white/60">{b?.san ?? ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div ref={endRef} />
        </div>
    )
}

