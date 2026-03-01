import React from 'react'

interface CapturedPiecesDisplayProps {
    capturedByWhite: string[]  // pieces captured by white (opponent's black pieces)
    capturedByBlack: string[]  // pieces captured by black (opponent's white pieces)
}

const PIECE_UNICODE: Record<string, string> = {
    wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
}

const PIECE_VALUES: Record<string, number> = {
    q: 9, r: 5, b: 3, n: 3, p: 1,
}

function calcAdvantage(pieces: string[]): number {
    return pieces.reduce((sum, p) => sum + (PIECE_VALUES[p[1]] || 0), 0)
}

function PieceRow({ pieces, label }: { pieces: string[]; label: string }) {
    if (pieces.length === 0) return null
    return (
        <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/30 w-12 shrink-0">{label}</span>
            <div className="flex flex-wrap gap-0.5">
                {pieces.map((p, i) => (
                    <span key={i} className="text-base leading-none opacity-80">
                        {PIECE_UNICODE[p] || ''}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function CapturedPiecesDisplay({ capturedByWhite, capturedByBlack }: CapturedPiecesDisplayProps) {
    const wAdv = calcAdvantage(capturedByWhite) - calcAdvantage(capturedByBlack)

    return (
        <div className="glass rounded-xl px-4 py-3 space-y-1.5">
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                Captured Pieces
            </div>
            <PieceRow pieces={capturedByWhite} label="White +" />
            <PieceRow pieces={capturedByBlack} label="Black +" />
            {wAdv !== 0 && (
                <div className="text-xs text-white/40 pt-1">
                    {wAdv > 0 ? 'White' : 'Black'} +{Math.abs(wAdv)}
                </div>
            )}
            {capturedByWhite.length === 0 && capturedByBlack.length === 0 && (
                <div className="text-xs text-white/25 italic">No captures yet</div>
            )}
        </div>
    )
}
