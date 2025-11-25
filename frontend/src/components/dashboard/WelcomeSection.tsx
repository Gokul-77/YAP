import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeSectionProps {
    username: string;
}

export default function WelcomeSection({ username }: WelcomeSectionProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--holographic-start)] to-[var(--holographic-end)] p-8 text-white shadow-lg shadow-purple-500/20 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-3xl animate-pulse delay-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        }`}>
                        <Sparkles size={14} className="mr-1 text-yellow-300" />
                        Welcome Back
                    </span>
                </div>

                <h1 className={`text-3xl font-bold mb-2 transition-all duration-700 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    }`}>
                    Hello, {username}!
                </h1>

                <p className={`text-purple-100 max-w-xl transition-all duration-700 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    }`}>
                    Here's what's happening in your community today. Check out the latest streams or start a new conversation.
                </p>
            </div>
        </div>
    );
}
