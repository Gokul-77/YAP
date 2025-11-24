import { useEffect, useState } from 'react';

export function useCursorPosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const updatePosition = (e: MouseEvent) => {
            // Debounce to improve performance
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setPosition({ x: e.clientX, y: e.clientY });
            }, 10);
        };

        window.addEventListener('mousemove', updatePosition);

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            clearTimeout(timeoutId);
        };
    }, []);

    return position;
}
