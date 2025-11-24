import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    breakpoint: Breakpoint;
    width: number;
}

export function useResponsive(): ResponsiveState {
    const [state, setState] = useState<ResponsiveState>(() => {
        const width = window.innerWidth;
        return {
            isMobile: width < 768,
            isTablet: width >= 768 && width < 1024,
            isDesktop: width >= 1024,
            breakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
            width
        };
    });

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleResize = () => {
            // Debounce resize events
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const width = window.innerWidth;
                setState({
                    isMobile: width < 768,
                    isTablet: width >= 768 && width < 1024,
                    isDesktop: width >= 1024,
                    breakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
                    width
                });
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    return state;
}
