import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarGroupProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    isCollapsed: boolean;
}

export default function SidebarGroup({
    title,
    icon,
    children,
    defaultOpen = false,
    isCollapsed
}: SidebarGroupProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = () => {
        if (!isCollapsed) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="mb-2">
            {/* Group Header */}
            <button
                onClick={toggleOpen}
                className={`
                    w-full flex items-center gap-3 px-4 py-3
                    text-gray-300 hover:bg-gray-700 hover:text-white
                    transition-all duration-200
                    ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}
                title={isCollapsed ? title : undefined}
            >
                <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-5 h-5">
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <span className="text-sm font-semibold uppercase tracking-wider">
                            {title}
                        </span>
                    )}
                </div>
                {!isCollapsed && (
                    <span className="flex-shrink-0">
                        {isOpen ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </span>
                )}
            </button>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <div
                    className={`
                        overflow-hidden transition-all duration-300
                        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
