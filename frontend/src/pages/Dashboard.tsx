import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import StatsWidget from '../components/dashboard/StatsWidget';
import GettingStartedPanel from '../components/dashboard/GettingStartedPanel';
import { Menu, Users, MessageSquare, Video, Activity } from 'lucide-react';
import api from '../lib/api';

interface DashboardStats {
    online_users: number;
    messages_today: number;
    active_streams: number;
    system_health: string;
}

export default function Dashboard() {
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<string>('/dashboard');
    const [stats, setStats] = useState<DashboardStats>({
        online_users: 0,
        messages_today: 0,
        active_streams: 0,
        system_health: 'Checking...',
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/users/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                setStats(prev => ({ ...prev, system_health: 'Error' }));
            }
        };

        fetchStats();
        // Poll every 30 seconds for real-time updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleNavigation = (path: string) => {
        setCurrentView(path);
        navigate(path);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--deep-space)] text-white">
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
            <main className="flex-1 overflow-auto relative">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                {/* Theme Toggle - Top Right */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-md backdrop-blur-sm"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 md:p-8 mt-12 md:mt-0 relative z-10">
                    {/* Approval Warning */}
                    {!user?.is_approved && (
                        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
                            <p className="text-yellow-200">
                                ⚠️ Your account is pending admin approval. Some features may be restricted.
                            </p>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="animate-fade-in-up">
                        <WelcomeSection username={user?.username || 'User'} />
                    </div>

                    {/* Real-Time Stats Row */}
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <StatsWidget
                                icon={<Users size={24} />}
                                label="Online Users"
                                value={stats.online_users.toLocaleString()}
                                subtext="Active community members"
                                color="blue"
                                animate={true}
                                delay={100}
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <StatsWidget
                                icon={<MessageSquare size={24} />}
                                label="Messages Today"
                                value={stats.messages_today.toLocaleString()}
                                subtext="Conversations happening"
                                color="green"
                                delay={200}
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <StatsWidget
                                icon={<Video size={24} />}
                                label="Active Streams"
                                value={stats.active_streams}
                                subtext="Live right now"
                                color="purple"
                                animate={stats.active_streams > 0}
                                delay={300}
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <StatsWidget
                                icon={<Activity size={24} />}
                                label="System Health"
                                value={stats.system_health}
                                subtext="All systems operational"
                                color={stats.system_health === 'Error' ? 'red' : 'green'}
                                delay={400}
                            />
                        </div>
                    </div>

                    {/* Getting Started Panel */}
                    <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                        <GettingStartedPanel />
                    </div>
                </div>
            </main>
        </div>
    );
}
