import React from 'react';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    path: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
    indent?: boolean;
}

export default function SidebarItem({
    icon,
    label,
    path,
    isActive,
    onClick,
    isCollapsed,
    indent = false
}: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-4 py-3 
                transition-all duration-200 
                ${indent ? 'pl-12' : ''}
                ${isActive
                    ? 'bg-white/10 text-[var(--holographic-start)] border-l-4 border-[var(--holographic-start)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }
                ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? label : undefined}
        >
            <span className="flex-shrink-0 w-5 h-5">
                {icon}
            </span>
            {!isCollapsed && (
                <span className="text-sm font-medium truncate">
                    {label}
                </span>
            )}
        </button>
    );
}
