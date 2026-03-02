
const KnightIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.1 0 2 .45 2.7 1.17l.8.83H17v2h-1l-3 6H9.5l1.5-3H9l-3-2V9h2V7l4-1z" />
    </svg>
)

export default function Navbar() {
    return (
        <header className="px-4 py-2 sm:px-6 sm:py-4 flex items-center justify-between border-b border-white/5 bg-[#0f0f13]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-emerald-400">
                <KnightIcon />
                <span className="font-bold text-xl tracking-tight font-['Outfit']">
                    Peer<span className="text-white">Chess</span>
                </span>
            </div>
            <div className="flex-1" />
            <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
                P2P • No Server
            </a>
        </header>
    )
}

