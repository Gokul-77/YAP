import { useEffect, useRef } from 'react';

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    position?: 'above' | 'below';
}

const REACTIONS = ['✨', '❤️', '😂', '🔥', '👍', '🎯', '💯', '⚡'];

export default function ReactionPicker({ onSelect, onClose, position = 'above' }: ReactionPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSelect = (emoji: string) => {
        onSelect(emoji);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Picker */}
            <div
                ref={pickerRef}
                className={`absolute z-50 ${position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } right-0 p-2 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200`}
                style={{
                    background: 'rgba(14, 17, 24, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    transformOrigin: position === 'above' ? 'bottom right' : 'top right'
                }}
            >
                <div className="flex gap-1">
                    {REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleSelect(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-2xl rounded-xl hover:bg-[var(--cosmic-purple)]/20 transition-all duration-200 hover:scale-125 active:scale-95 touch-target"
                            aria-label={`React with ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
