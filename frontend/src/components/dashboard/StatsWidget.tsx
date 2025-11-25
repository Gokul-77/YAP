import { useEffect, useState } from 'react';

interface StatsWidgetProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    color: string;
    animate?: boolean;
    delay?: number;
}

export default function StatsWidget({
    icon,
    label,
    value,
    subtext,
    color,
    animate = false,
    delay = 0
}: StatsWidgetProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    // Map color names to Tailwind classes
    const colorMap: Record<string, { bg: string, text: string, border: string }> = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
        green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
        red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    };

    const styles = colorMap[color] || colorMap.blue;

    return (
        <div
            className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/10 bg-white/5 backdrop-blur-sm border-white/10 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-400 truncate">{label}</p>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        <span className="text-2xl font-bold text-white">
                            {value}
                        </span>
                        {subtext && (
                            <span className="text-xs text-gray-500 truncate">{subtext}</span>
                        )}
                    </div>
                </div>
                <div className={`rounded-lg p-2 shrink-0 ${styles.bg} ${styles.text} border ${styles.border}`}>
                    {icon}
                </div>
            </div>

            {/* Pulse Animation for Active States */}
            {animate && (
                <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${styles.bg}`}></span>
                    <span className={`relative inline-flex h-3 w-3 rounded-full ${styles.bg}`}></span>
                </span>
            )}
        </div>
    );
}
