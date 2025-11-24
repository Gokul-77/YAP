import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ReactionBadgeProps {
    emoji: string;
    count: number;
    users: string[];
    userReacted: boolean;
    onRemove: () => void;
    index: number;
}

export default function ReactionBadge({
    emoji,
    count,
    users,
    userReacted,
    onRemove,
    index
}: ReactionBadgeProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Trigger scale animation when count changes
    if (count !== undefined) { // simple check to ensure we have a count
        // We can't use useEffect with a dependency on count easily inside the conditional render if we want to be strict, 
        // but let's use a useEffect to trigger a class.
    }

    // Better approach:
    useEffect(() => {
        setIsUpdating(true);
        const timer = setTimeout(() => setIsUpdating(false), 300);
        return () => clearTimeout(timer);
    }, [count]);

    const handleClick = () => {
        if (userReacted) {
            setIsRemoving(true);
            setTimeout(() => onRemove(), 300);
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                onClick={handleClick}
                className={`relative inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium shadow-md border transition-all duration-300 touch-target ${isRemoving ? 'animate-shake' : 'hover:scale-110 active:scale-95'
                    } ${isUpdating ? 'scale-125' : ''} ${userReacted
                        ? 'holographic-gradient text-white border-[var(--cosmic-purple)] scale-105 shadow-lg shadow-purple-500/30'
                        : 'bg-[var(--deep-space)] text-[#e9edef] border-white/20 hover:bg-[var(--cosmic-purple)]/20 hover:border-[var(--cosmic-purple)]/60'
                    }`}
                style={{
                    transform: `translateX(${index * -4}px)`,
                    zIndex: 10 - index,
                    minWidth: '32px',
                    minHeight: '32px'
                }}
                aria-label={`${users.join(', ')} reacted with ${emoji}`}
            >
                <span className="text-base">{emoji}</span>
                {count > 1 && (
                    <span className="text-xs font-bold">{count}</span>
                )}

                {/* Remove indicator for user's own reaction */}
                {userReacted && (
                    <X size={10} className="absolute -top-1 -right-1 bg-[var(--cosmic-purple)] rounded-full p-0.5" />
                )}
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-[var(--obsidian-base)] text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 animate-in">
                    {users.join(', ')}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--obsidian-base)]" />
                </div>
            )}
        </div>
    );
}
