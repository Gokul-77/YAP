export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--slate-message)] rounded-2xl rounded-tl-sm w-fit neon-glow">
            <span className="text-xs text-[#8b5cf6]">Typing</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--cosmic-purple)] typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-[var(--cosmic-purple)] typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-[var(--cosmic-purple)] typing-dot"></div>
            </div>
        </div>
    );
}
