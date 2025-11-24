import { memo } from 'react';

interface DateSeparatorProps {
    date: Date;
}

const DateSeparator = memo(({ date }: DateSeparatorProps) => {
    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'TODAY';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'YESTERDAY';
        } else if (date.getFullYear() === today.getFullYear()) {
            return date.toLocaleDateString([], { month: 'long', day: 'numeric' }).toUpperCase();
        } else {
            return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
        }
    };

    return (
        <div className="flex items-center justify-center my-6">
            <div className="h-px bg-white/10 w-full max-w-[100px] sm:max-w-[150px]"></div>
            <span className="mx-4 text-[10px] sm:text-xs font-bold text-[#8696a0] tracking-widest uppercase bg-[var(--obsidian-base)] px-2">
                {formatDate(date)}
            </span>
            <div className="h-px bg-white/10 w-full max-w-[100px] sm:max-w-[150px]"></div>
        </div>
    );
});

export default DateSeparator;
