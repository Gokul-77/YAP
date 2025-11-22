import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

interface Message {
    id: number;
    content: string;
    sender: { id: number; username: string };
    timestamp: string;
}

interface ChatRoom {
    id: number;
    name: string;
    type: 'DIRECT' | 'GROUP';
    is_paid: boolean;
}

export default function Chat() {
    const { roomId } = useParams();
    const { user } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch chat rooms
        api.get('/chat/rooms/').then((res) => setRooms(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!roomId) return;

        // Fetch message history
        api.get(`/chat/rooms/${roomId}/messages/`).then((res) => setMessages(res.data)).catch(console.error);

        // Connect WebSocket
        const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, {
                id: Date.now(),
                content: data.message,
                sender: { id: data.user_id, username: 'User' },
                timestamp: new Date().toISOString(),
            }]);
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !ws || !user) return;

        ws.send(JSON.stringify({
            message: newMessage,
            user_id: user.id,
        }));

        setNewMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar - Chat Rooms */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        ← Back to Dashboard
                    </Link>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">Chats</h2>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-80px)]">
                    {rooms.map((room) => (
                        <Link
                            key={room.id}
                            to={`/chat/${room.id}`}
                            className={`block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${roomId === String(room.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{room.name || `Chat ${room.id}`}</h3>
                                {room.is_paid && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">Paid</span>}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{room.type}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {roomId ? (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender.id === user?.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
