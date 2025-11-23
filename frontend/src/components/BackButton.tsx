import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
}

export default function BackButton({ label = 'Back to Dashboard' }: BackButtonProps) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
            <ArrowLeft size={18} />
            <span>{label}</span>
        </button>
    );
}
