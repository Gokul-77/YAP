import { type ReactNode } from 'react';
import AnimatedBackground from './AnimatedBackground';
import SpotlightEffect from './SpotlightEffect';
import { useResponsive } from '../../hooks/useResponsive';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

interface ChatLayoutProps {
    sidebar: ReactNode;
    chatArea: ReactNode;
    infoPanel?: ReactNode;
    topBar?: ReactNode;
    showInfoPanel?: boolean;
    sidebarOpen?: boolean;
    onSidebarToggle?: () => void;
}

export default function ChatLayout({
    sidebar,
    chatArea,
    infoPanel,
    topBar,
    showInfoPanel = false,
    sidebarOpen = true,
    onSidebarToggle
}: ChatLayoutProps) {
    const { isMobile, isTablet } = useResponsive();
    const swipeHandlers = useSwipeGesture({
        onSwipeLeft: () => {
            if (isMobile && sidebarOpen && onSidebarToggle) {
                onSidebarToggle();
            }
        }
    });

    return (
        <div className="flex flex-col h-screen bg-[var(--obsidian-base)] overflow-hidden">
            {/* Frosted Glass Top Navigation Bar */}
            {topBar && (
                <div className="frosted-glass header-responsive flex items-center px-4 md:px-6 z-30 border-b border-white/5">
                    {topBar}
                </div>
            )}

            {/* Three-Panel Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Mobile Backdrop */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={onSidebarToggle}
                        {...swipeHandlers}
                    />
                )}

                {/* Left Panel - Contacts Sidebar */}
                <div
                    className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
            ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            ${isMobile ? 'w-[280px]' : isTablet ? 'w-[280px]' : 'w-[340px]'}
            bg-[var(--contacts-sidebar)] overflow-hidden flex-shrink-0 shadow-2xl
            transition-transform duration-300 ease-in-out
            ${isMobile ? '' : 'rounded-l-2xl md:rounded-l-none'}
          `}
                    {...swipeHandlers}
                >
                    <SpotlightEffect>
                        {sidebar}
                    </SpotlightEffect>
                </div>

                {/* Center Panel - Chat Canvas */}
                <div className={`flex-1 relative overflow-hidden ${isMobile ? '' : 'rounded-2xl'} shadow-2xl`}>
                    {/* Animated Background with Particles */}
                    <AnimatedBackground />

                    {/* Chat Content */}
                    <div className="relative z-10 h-full">
                        {chatArea}
                    </div>
                </div>

                {/* Right Panel - Info Panel (Desktop & Tablet only) */}
                {!isMobile && showInfoPanel && infoPanel && (
                    <div className={`
            ${isTablet ? 'w-[280px]' : 'w-[320px]'}
            bg-[var(--deep-space)] rounded-r-2xl overflow-hidden flex-shrink-0 shadow-2xl frosted-glass
            transition-all duration-500
          `}>
                        {infoPanel}
                    </div>
                )}
            </div>
        </div>
    );
}
