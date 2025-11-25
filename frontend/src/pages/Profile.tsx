import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../lib/api';
import BackButton from '../components/BackButton';

export default function Profile() {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
            });
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSave = async () => {
        try {
            await api.patch('/users/profile/', formData);
            setEditing(false);
            // Refresh user data
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <BackButton label="Dashboard" />
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!user?.is_approved && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-200">
                            ⚠️ Your account is pending admin approval. Some features may be restricted.
                        </p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center shrink-0">
                                <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-4 mb-2 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Username
                                        </label>
                                        {editing ? (
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-lg text-gray-900 dark:text-white">{user?.username}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        {editing ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-lg text-gray-900 dark:text-white">{user?.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role
                                        </label>
                                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                            {user?.role}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Account Status
                                        </label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user?.is_approved
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                            }`}>
                                            {user?.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {editing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditing(false)}
                                            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        to="/chat"
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center"
                    >
                        <div className="text-4xl mb-2">💬</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Messages</h3>
                    </Link>
                    <Link
                        to="/streaming"
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center"
                    >
                        <div className="text-4xl mb-2">📺</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Streaming</h3>
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/admin"
                            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center"
                        >
                            <div className="text-4xl mb-2">⚙️</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Admin Panel</h3>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
