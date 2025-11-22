import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

interface User {
    id: number;
    username: string;
    email: string;
}

export default function CreateGroup() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        is_paid: false,
        price: '0',
    });
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

    useEffect(() => {
        api.get('/users/').then((res) => setUsers(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/chat/rooms/create_group/', {
                ...formData,
                member_ids: selectedMembers
            });
            navigate(`/chat/${response.data.id}`);
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    const toggleMember = (userId: number) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Only admins can create groups.</p>
                    <Link to="/chat" className="text-blue-600 hover:underline">Go to Chat</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/chat" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Chat</Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create Community Group</h1>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group Name *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Enter group name" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Members</label>
                        <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            {users.map((u) => (
                                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                    <input type="checkbox" checked={selectedMembers.includes(u.id)} onChange={() => toggleMember(u.id)} className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{selectedMembers.length} member(s) selected</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.is_paid} onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })} className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid Group</span>
                        </label>

                        {formData.is_paid && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Price:</span>
                                <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Create Group</button>
                        <Link to="/chat" className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors">Cancel</Link>
                    </div>
                </form>
            </main>
        </div>
    );
}
