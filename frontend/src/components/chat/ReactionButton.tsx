import { Plus } from 'lucide-react';

interface ReactionButtonProps {
    onClick: () => void;
    isVisible: boolean;
    isMobile: boolean;
}

export default function ReactionButton({ onClick, isVisible, isMobile }: ReactionButtonProps) {
    // Always show on mobile, show on hover for desktop
    const shouldShow = isMobile || isVisible;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`absolute bottom-0 right-0 translate-y-1/2 translate-x-1/4 w-6 h-6 rounded-full bg-[#6b7280] hover:bg-[var(--cosmic-purple)] text-white flex items-center justify-center shadow-lg transition-all duration-300 spring-scale z-20 ${shouldShow ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
            aria-label="Add reaction"
        >
            <Plus size={14} strokeWidth={3} />
        </button>
    );
}
