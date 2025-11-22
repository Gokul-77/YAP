import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

export default function Chat() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch chat rooms
        api.get('/chat/rooms/').then((res) => setRooms(res.data)).catch(console.error);

        // Fetch users for starting new chats
        api.get('/users/').then((res) => setUsers(res.data)).catch(console.error);
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
                sender: { id: data.user_id, username: data.username || 'User' },
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
            username: user.username,
        }));

        setNewMessage('');
    };

    const startChatWithUser = async (userId: number) => {
        try {
            const response = await api.post('/chat/rooms/create_direct/', { user_id: userId });
            setShowUserList(false);
            navigate(`/chat/${response.data.id}`);
            // Refresh rooms list
            const roomsRes = await api.get('/chat/rooms/');
            setRooms(roomsRes.data);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar - Chat Rooms */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        ← Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
                        <button
                            onClick={() => setShowUserList(!showUserList)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                            + New Chat
                        </button>
                    </div>
                </div>

                {/* User List for New Chats */}
                {showUserList && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start a conversation</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {users.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => startChatWithUser(u.id)}
                                    className="w-full text-left p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <p className="font-medium text-gray-900 dark:text-white">{u.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rooms List */}
                <div className="overflow-y-auto flex-1">
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
                    {rooms.length === 0 && !showUserList && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <p className="mb-2">No chats yet</p>
                            <p className="text-sm">Click "+ New Chat" to start a conversation</p>
                        </div>
                    )}
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
                                        {msg.sender.id !== user?.id && (
                                            <p className="text-xs opacity-70 mb-1">{msg.sender.username}</p>
                                        )}
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
                        <div className="text-center">
                            <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Select a chat to start messaging</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">or click "+ New Chat" to start a conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
