import { useState } from 'react';

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    position?: 'above' | 'below';
    alignment?: 'left' | 'right';
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ReactionPicker({ onSelect, onClose, position = 'above', alignment = 'left' }: ReactionPickerProps) {
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

    const handleSelect = (emoji: string) => {
        setSelectedEmoji(emoji);
        setTimeout(() => {
            onSelect(emoji);
            onClose();
        }, 150);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* WhatsApp-style horizontal picker */}
            <div
                className={`absolute ${position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } ${alignment === 'left' ? 'left-0' : 'right-0'} z-50 animate-in`}
            >
                <div className="bg-[var(--deep-space)] rounded-full px-3 py-2 shadow-2xl border-2 border-white/20 backdrop-blur-xl flex gap-2">
                    {REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleSelect(emoji)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-125 active:scale-95 ${selectedEmoji === emoji
                                ? 'holographic-gradient scale-125'
                                : 'hover:bg-[var(--cosmic-purple)]/20'
                                }`}
                            style={{
                                boxShadow: selectedEmoji === emoji
                                    ? '0 0 20px rgba(147, 51, 234, 0.6)'
                                    : 'none'
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* Arrow pointer */}
                <div
                    className={`absolute ${position === 'above' ? 'top-full -mt-1' : 'bottom-full -mb-1'
                        } ${alignment === 'left' ? 'left-4' : 'right-4'} w-3 h-3 bg-[var(--deep-space)] border-r-2 border-b-2 border-white/20 transform rotate-45`}
                />
            </div>
        </>
    );
}
