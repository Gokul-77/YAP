import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    is_approved: boolean;
}

interface StreamEvent {
    id: number;
    title: string;
    is_paid: boolean;
    price: string;
}

interface ChatRoom {
    id: number;
    name: string;
    type: string;
    is_paid: boolean;
}

export default function AdminPanel() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [streams, setStreams] = useState<StreamEvent[]>([]);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'streams' | 'rooms'>('users');

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchUsers();
            fetchStreams();
            fetchRooms();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStreams = async () => {
        try {
            const response = await api.get('/streaming/');
            setStreams(response.data);
        } catch (error) {
            console.error('Error fetching streams:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await api.get('/chat/rooms/');
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const approveUser = async (userId: number) => {
        try {
            await api.patch(`/users/${userId}/`, { is_approved: true });
            fetchUsers();
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const changeUserRole = async (userId: number, newRole: string) => {
        try {
            await api.patch(`/users/${userId}/`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You need admin privileges to access this page.</p>
                    <Link to="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-medium ${activeTab === 'users'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('streams')}
                        className={`px-4 py-2 font-medium ${activeTab === 'streams'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Streams ({streams.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-4 py-2 font-medium ${activeTab === 'rooms'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Chat Rooms ({rooms.length})
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeUserRole(u.id, e.target.value)}
                                                className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="FREE">Free</option>
                                                <option value="PAID">Paid</option>
                                                <option value="STAFF">Staff</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.is_approved ? (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Approved</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {!u.is_approved && (
                                                <button
                                                    onClick={() => approveUser(u.id)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Streams Tab */}
                {activeTab === 'streams' && (
                    <div className="space-y-4">
                        <Link
                            to="/admin/create-stream"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Create Stream
                        </Link>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {streams.map((stream) => (
                                        <tr key={stream.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{stream.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {stream.is_paid ? (
                                                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">Paid</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Free</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {stream.is_paid ? `$${stream.price}` : 'Free'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Chat Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Access</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {rooms.map((room) => (
                                    <tr key={room.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{room.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{room.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {room.is_paid ? (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">Paid</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Free</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
