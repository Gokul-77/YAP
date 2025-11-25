import { useState } from 'react';

interface RadialReactionPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const REACTIONS = ['🔥', '💯', '⚡', '🎯', '💜'];

export default function RadialReactionPicker({ onSelect, onClose }: RadialReactionPickerProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleSelect = (emoji: string, index: number) => {
        setSelectedIndex(index);
        // Trigger particle burst animation
        const burstElements = document.querySelectorAll('.particle-burst-trigger');
        burstElements.forEach((el) => el.classList.add('particle-burst'));

        setTimeout(() => {
            onSelect(emoji);
        }, 300); // Delay to show animation
    };

    const radius = 80;
    const angleStep = (Math.PI * 2) / REACTIONS.length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Radial Menu */}
            <div className="absolute z-50 radial-menu">
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--cosmic-purple)]" />

                {/* Reaction buttons */}
                {REACTIONS.map((emoji, index) => {
                    const angle = angleStep * index - Math.PI / 2; // Start from top
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                        <button
                            key={emoji}
                            onClick={() => handleSelect(emoji, index)}
                            className={`absolute top-0 left-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 spring-scale ${selectedIndex === index
                                    ? 'bg-gradient-to-r from-[var(--holographic-start)] to-[var(--holographic-end)] scale-125'
                                    : 'bg-[var(--deep-space)] hover:bg-[var(--cosmic-purple)] hover:scale-110'
                                }`}
                            style={{
                                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) ${selectedIndex === index ? 'scale(1.25)' : 'scale(1)'}`,
                                boxShadow: '0 4px 20px rgba(147, 51, 234, 0.3)'
                            }}
                        >
                            {emoji}

                            {/* Particle burst trigger elements */}
                            {selectedIndex === index && (
                                <>
                                    {[...Array(8)].map((_, i) => {
                                        const burstAngle = (Math.PI * 2 * i) / 8;
                                        const burstX = Math.cos(burstAngle) * 30;
                                        const burstY = Math.sin(burstAngle) * 30;
                                        return (
                                            <div
                                                key={i}
                                                className="particle-burst-trigger absolute w-2 h-2 rounded-full bg-[var(--cosmic-purple)]"
                                                style={{
                                                    '--burst-x': `${burstX}px`,
                                                    '--burst-y': `${burstY}px`,
                                                } as React.CSSProperties}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}
