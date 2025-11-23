import { useEffect, useState } from 'react';
import { MessageSquare, Video, User, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GettingStartedPanel() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay entrance slightly to appear after widgets
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const steps = [
        {
            icon: <MessageSquare size={20} />,
            title: 'Start a Conversation',
            description: 'Connect with friends or join a group chat.',
            link: '/chat',
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        },
        {
            icon: <Video size={20} />,
            title: 'Watch a Stream',
            description: 'Discover live content from creators.',
            link: '/streaming',
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
        },
        {
            icon: <User size={20} />,
            title: 'Complete Profile',
            description: 'Add an avatar and bio to stand out.',
            link: '/profile',
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
        }
    ];

    return (
        <div
            className={`mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-700 dark:bg-gray-800 dark:border-gray-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
        >
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete these steps to get the most out of YAP.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <Link
                            key={index}
                            to={step.link}
                            className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-800"
                        >
                            <div className={`mb-3 inline-flex rounded-lg p-2 ${step.color}`}>
                                {step.icon}
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {step.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {step.description}
                            </p>

                            <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                                <ArrowRight size={16} className="text-blue-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
