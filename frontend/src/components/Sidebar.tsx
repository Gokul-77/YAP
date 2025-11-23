import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SidebarGroup from './SidebarGroup';
import SidebarItem from './SidebarItem';
import {
    MessageCircle,
    Users,
    UserPlus,
    Video,
    Play,
    Upload,
    User,
    Settings,
    LogOut,
    X,
    Menu
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    currentPath: string;
    onNavigate: (path: string) => void;
}

export default function Sidebar({ isOpen, onToggle, currentPath, onNavigate }: SidebarProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        onNavigate(path);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768) {
            onToggle();
        }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static top-0 left-0 h-screen
                    bg-gray-800 border-r border-gray-700
                    transition-all duration-300 z-50
                    flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Header */}
                <div className={`p-4 border-b border-gray-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <h1 className="text-2xl font-bold text-blue-500">YAP</h1>
                    )}
                    {isCollapsed && (
                        <h1 className="text-xl font-bold text-blue-500">Y</h1>
                    )}

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:block text-gray-400 hover:text-white"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onToggle}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {/* Chat Section */}
                    <SidebarGroup
                        title="Chat"
                        icon={<MessageCircle size={20} />}
                        defaultOpen={currentPath.startsWith('/chat')}
                        isCollapsed={isCollapsed}
                    >
                        <SidebarItem
                            icon={<MessageCircle size={18} />}
                            label="All Chats"
                            path="/chat"
                            isActive={currentPath === '/chat'}
                            onClick={() => handleNavigation('/chat')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                        <SidebarItem
                            icon={<Users size={18} />}
                            label="Groups"
                            path="/chat?filter=groups"
                            isActive={currentPath === '/chat?filter=groups'}
                            onClick={() => handleNavigation('/chat?filter=groups')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                        <SidebarItem
                            icon={<UserPlus size={18} />}
                            label="Requests"
                            path="/chat?filter=requests"
                            isActive={currentPath === '/chat?filter=requests'}
                            onClick={() => handleNavigation('/chat?filter=requests')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                    </SidebarGroup>

                    {/* Streaming Section */}
                    <SidebarGroup
                        title="Streaming"
                        icon={<Video size={20} />}
                        defaultOpen={currentPath.startsWith('/streaming')}
                        isCollapsed={isCollapsed}
                    >
                        <SidebarItem
                            icon={<Play size={18} />}
                            label="Live Streams"
                            path="/streaming"
                            isActive={currentPath === '/streaming'}
                            onClick={() => handleNavigation('/streaming')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                        <SidebarItem
                            icon={<Video size={18} />}
                            label="My Streams"
                            path="/streaming/my-streams"
                            isActive={currentPath === '/streaming/my-streams'}
                            onClick={() => handleNavigation('/streaming/my-streams')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                        <SidebarItem
                            icon={<Upload size={18} />}
                            label="Upload Stream"
                            path="/streaming/upload"
                            isActive={currentPath === '/streaming/upload'}
                            onClick={() => handleNavigation('/streaming/upload')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                    </SidebarGroup>

                    {/* Profile Section */}
                    <SidebarGroup
                        title="Profile"
                        icon={<User size={20} />}
                        defaultOpen={currentPath.startsWith('/profile')}
                        isCollapsed={isCollapsed}
                    >
                        <SidebarItem
                            icon={<Settings size={18} />}
                            label="Account Settings"
                            path="/profile"
                            isActive={currentPath === '/profile'}
                            onClick={() => handleNavigation('/profile')}
                            isCollapsed={isCollapsed}
                            indent
                        />
                    </SidebarGroup>

                    {/* Admin Panel (if admin) */}
                    {user?.role === 'ADMIN' && (
                        <div className="mt-4 border-t border-gray-700 pt-4">
                            <SidebarItem
                                icon={<Settings size={18} />}
                                label="Admin Panel"
                                path="/admin"
                                isActive={currentPath === '/admin'}
                                onClick={() => handleNavigation('/admin')}
                                isCollapsed={isCollapsed}
                            />
                        </div>
                    )}
                </nav>

                {/* User Info & Logout */}
                <div className="border-t border-gray-700 p-4">
                    {!isCollapsed ? (
                        <>
                            <div className="mb-3">
                                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full flex justify-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
