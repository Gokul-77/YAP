import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import BackButton from '../components/BackButton';

interface StreamEvent {
    id: number;
    title: string;
    description: string;
    embed_code: string;
    is_paid: boolean;
    price: string;
    scheduled_at: string;
}

export default function Streaming() {
    const { user } = useAuthStore();
    const [streams, setStreams] = useState<StreamEvent[]>([]);
    const [selectedStream, setSelectedStream] = useState<StreamEvent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/streaming/')
            .then((res) => {
                setStreams(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const canAccessStream = (stream: StreamEvent) => {
        if (!stream.is_paid) return true;
        return user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.role === 'PAID';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        import BackButton from '../components/BackButton';

                        // ... (imports)

                        // ... (inside component)
                        <div>
                            <div className="mb-2">
                                <BackButton />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Live Streaming</h1>
                        </div>
                        {user?.role === 'ADMIN' && (
                            <Link to="/streaming/create" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                + Create Stream
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Loading streams...</p>
                    </div>
                ) : selectedStream ? (
                    <div className="space-y-6">
                        <button onClick={() => setSelectedStream(null)} className="text-blue-600 dark:text-blue-400 hover:underline">
                            ← Back to streams
                        </button>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="aspect-video bg-black">
                                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedStream.embed_code }} />
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStream.title}</h2>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">{selectedStream.description}</p>
                                    </div>
                                    {selectedStream.is_paid && (
                                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                                            ${selectedStream.price}
                                        </span>
                                    )}
                                </div>
                                {selectedStream.scheduled_at && (
                                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>🕐 Scheduled: {new Date(selectedStream.scheduled_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {streams.map((stream) => {
                            const hasAccess = canAccessStream(stream);
                            return (
                                <div key={stream.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                        </svg>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stream.title}</h3>
                                            {stream.is_paid && (
                                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium">
                                                    ${stream.price}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{stream.description}</p>
                                        {stream.scheduled_at && (
                                            <p className="text-xs text-gray-500 mb-4">{new Date(stream.scheduled_at).toLocaleString()}</p>
                                        )}
                                        {hasAccess ? (
                                            <button onClick={() => setSelectedStream(stream)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                                Watch Now
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">
                                                🔒 Paid Access Required
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && streams.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No streaming events available</p>
                    </div>
                )}
            </main>
        </div>
    );
}
