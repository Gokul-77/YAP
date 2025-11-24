import { useEffect, useRef } from 'react';
import { useCursorPosition } from '../../hooks/useCursorPosition';

interface SpotlightEffectProps {
    children: React.ReactNode;
}

export default function SpotlightEffect({ children }: SpotlightEffectProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorPos = useCursorPosition();

    useEffect(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((cursorPos.x - rect.left) / rect.width) * 100;
        const y = ((cursorPos.y - rect.top) / rect.height) * 100;

        containerRef.current.style.setProperty('--spotlight-x', `${x}%`);
        containerRef.current.style.setProperty('--spotlight-y', `${y}%`);
    }, [cursorPos]);

    return (
        <div ref={containerRef} className="spotlight">
            {children}
        </div>
    );
}
