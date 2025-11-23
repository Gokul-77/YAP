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
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
        green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-800' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-800' },
        red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800' },
    };

    const styles = colorMap[color] || colorMap.blue;

    return (
        <div
            className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-500 hover:shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </span>
                        {subtext && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{subtext}</span>
                        )}
                    </div>
                </div>
                <div className={`rounded-lg p-2 ${styles.bg} ${styles.text}`}>
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
