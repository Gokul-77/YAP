import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function CreateStream() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        embed_code: '',
        is_paid: false,
        price: '0',
        start_time: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                end_time: null  // Optional field
            };
            await api.post('/streaming/', payload);
            navigate('/streaming');
        } catch (error) {
            console.error('Error creating stream:', error);
            alert('Failed to create stream. Check console for details.');
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Only admins can create streams.</p>
                    <Link to="/streaming" className="text-blue-600 hover:underline">Go to Streaming</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/streaming" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Streaming</Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create Live Stream</h1>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Enter stream title" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Describe your stream" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Embed Code (YouTube, Twitch, etc.) *</label>
                        <textarea required value={formData.embed_code} onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm" placeholder='<iframe src="..." />' />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paste the embed code from your streaming platform</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time *</label>
                        <input type="datetime-local" required value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.is_paid} onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })} className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid Stream</span>
                        </label>

                        {formData.is_paid && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Price:</span>
                                <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Create Stream</button>
                        <Link to="/streaming" className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors">Cancel</Link>
                    </div>
                </form>
            </main>
        </div>
    );
}
