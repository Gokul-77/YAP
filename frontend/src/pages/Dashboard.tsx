import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<string>('/dashboard');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        setCurrentView(path);
        navigate(path);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-30 md:hidden p-2 bg-gray-800 text-white rounded-lg shadow-lg"
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
                currentPath={currentView}
                onNavigate={handleNavigation}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                {/* Theme Toggle - Top Right */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 md:p-8 mt-12 md:mt-0">
                    {/* Approval Warning */}
                    {!user?.is_approved && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-yellow-800 dark:text-yellow-200">
                                ⚠️ Your account is pending admin approval. Some features may be restricted.
                            </p>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome back, {user?.username}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Choose an option from the sidebar to get started.
                        </p>
                    </div>

                    {/* Motivational Messages */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
                            <h3 className="text-lg font-semibold mb-2">💬 Stay Connected</h3>
                            <p className="text-blue-100">
                                Connect with your friends and communities through our real-time chat system. Start a conversation today!
                            </p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white">
                            <h3 className="text-lg font-semibold mb-2">🎥 Go Live</h3>
                            <p className="text-purple-100">
                                Share your moments with the world. Upload or stream live content to engage with your audience.
                            </p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white">
                            <h3 className="text-lg font-semibold mb-2">✨ Today's Thought</h3>
                            <p className="text-green-100">
                                "{['Success is not final, failure is not fatal: it is the courage to continue that counts.',
                                    'The only way to do great work is to love what you do.',
                                    'Believe you can and you\'re halfway there.',
                                    'Your time is limited, don\'t waste it living someone else\'s life.',
                                    'Innovation distinguishes between a leader and a follower.'][Math.floor(Math.random() * 5)]}"
                            </p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white">
                            <h3 className="text-lg font-semibold mb-2">🚀 Quick Tip</h3>
                            <p className="text-orange-100">
                                {user?.role === 'ADMIN'
                                    ? 'Use the Admin Panel to manage users, streams, and chat rooms efficiently.'
                                    : 'Explore groups to find communities that match your interests!'}
                            </p>
                        </div>
                    </div>

                    {/* Additional Info Section */}
                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Getting Started
                        </h2>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li>• Use the sidebar to navigate between Chat, Streaming, and Profile sections</li>
                            <li>• Click on sub-items to access specific features like Groups or Upload Stream</li>
                            <li>• On mobile, tap the menu icon to open the sidebar</li>
                            {user?.role === 'ADMIN' && <li>• Access the Admin Panel to manage users, streams, and chat rooms</li>}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
