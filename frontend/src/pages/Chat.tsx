import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

interface ReactionGroup {
    emoji: string;
    count: number;
    users: Array<{ id: number; username: string }>;
    user_reacted: boolean;
}

interface Message {
    id: number;
    content: string;
    sender: { id: number; username: string };
    timestamp: string;
    reactions?: ReactionGroup[];
}

interface ChatRoom {
    id: number;
    name: string;
    display_name?: string;
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
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉'];

    useEffect(() => {
        api.get('/chat/rooms/').then((res) => setRooms(res.data)).catch(console.error);
        api.get('/users/').then((res) => setUsers(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!roomId) return;
        api.get(`/chat/rooms/${roomId}/messages/`).then((res) => setMessages(res.data)).catch(console.error);

        const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'chat_message' || data.message) {
                setMessages((prev) => [...prev, {
                    id: Date.now(),
                    content: data.message,
                    sender: { id: data.user_id, username: data.username || 'User' },
                    timestamp: new Date().toISOString(),
                }]);
            }

            if (data.type === 'reaction_update' && data.message_id) {
                api.get(`/chat/rooms/${roomId}/messages/`).then((res) => {
                    setMessages(res.data);
                }).catch(console.error);
            }
        };
        setWs(websocket);
        return () => websocket.close();
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !ws || !user) return;
        ws.send(JSON.stringify({ message: newMessage, user_id: user.id, username: user.username }));
        setNewMessage('');
    };

    const handleReaction = async (messageId: number, emoji: string, isRemoving: boolean) => {
        if (!roomId || !user) return;

        setShowEmojiPicker(null);

        setMessages(prev => prev.map(msg => {
            if (msg.id !== messageId) return msg;
            let reactions = msg.reactions || [];

            if (!isRemoving) {
                reactions = reactions.map(r => ({
                    ...r,
                    count: r.user_reacted ? r.count - 1 : r.count,
                    user_reacted: false,
                    users: r.users.filter(u => u.id !== user.id)
                })).filter(r => r.count > 0);
            }

            const existingIdx = reactions.findIndex(r => r.emoji === emoji);

            if (isRemoving) {
                if (existingIdx >= 0) {
                    const updated = [...reactions];
                    updated[existingIdx] = {
                        ...updated[existingIdx],
                        count: updated[existingIdx].count - 1,
                        user_reacted: false,
                        users: updated[existingIdx].users.filter(u => u.id !== user.id)
                    };
                    return { ...msg, reactions: updated.filter(r => r.count > 0) };
                }
            } else {
                if (existingIdx >= 0) {
                    const updated = [...reactions];
                    updated[existingIdx] = {
                        ...updated[existingIdx],
                        count: updated[existingIdx].count + 1,
                        user_reacted: true,
                        users: [...updated[existingIdx].users, { id: user.id, username: user.username }]
                    };
                    return { ...msg, reactions: updated };
                } else {
                    return {
                        ...msg,
                        reactions: [...reactions, {
                            emoji,
                            count: 1,
                            user_reacted: true,
                            users: [{ id: user.id, username: user.username }]
                        }]
                    };
                }
            }
            return msg;
        }));

        try {
            const method = isRemoving ? 'delete' : 'post';
            await api({ method, url: `/chat/rooms/${roomId}/messages/${messageId}/react/`, data: { emoji } });

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'reaction_update',
                    message_id: messageId,
                    emoji,
                    user_id: user.id,
                    action: isRemoving ? 'remove' : 'add'
                }));
            }

            const response = await api.get(`/chat/rooms/${roomId}/messages/`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error reacting:', error);
            api.get(`/chat/rooms/${roomId}/messages/`).then((res) => setMessages(res.data)).catch(console.error);
        }
    };

    const startChatWithUser = async (userId: number) => {
        try {
            const response = await api.post('/chat/rooms/create_direct/', { user_id: userId });
            setShowUserList(false);
            navigate(`/chat/${response.data.id}`);
            const roomsRes = await api.get('/chat/rooms/');
            setRooms(roomsRes.data);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">← Back to Dashboard</Link>
                    <div className="flex items-center justify-between mt-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setShowUserList(!showUserList)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">+ New Chat</button>
                            {user?.role === 'ADMIN' && <Link to="/chat/create-group" className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">+ Group</Link>}
                        </div>
                    </div>
                </div>

                {showUserList && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start a conversation</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {users.map((u) => (
                                <button key={u.id} onClick={() => startChatWithUser(u.id)} className="w-full text-left p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                    <p className="font-medium text-gray-900 dark:text-white">{u.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="overflow-y-auto flex-1">
                    {rooms.map((room) => (
                        <Link key={room.id} to={`/chat/${room.id}`} className={`block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${roomId === String(room.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{room.display_name || room.name}</h3>
                                {room.is_paid && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">Paid</span>}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{room.type === 'DIRECT' ? '1-on-1' : 'Group'}</p>
                        </Link>
                    ))}
                    {rooms.length === 0 && !showUserList && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <p className="mb-2">No chats yet</p>
                            <p className="text-sm">Click "+ New Chat" to start</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {roomId ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    <div className="max-w-xs lg:max-w-md relative">
                                        <div className={`px-4 py-2 rounded-2xl ${msg.sender.id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                                            {msg.sender.id !== user?.id && <p className="text-xs opacity-70 mb-1">{msg.sender.username}</p>}
                                            <p className="text-sm">{msg.content}</p>
                                            <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                        </div>

                                        {hoveredMessageId === msg.id && (
                                            <div className={`absolute -top-10 ${msg.sender.id === user?.id ? 'right-0' : 'left-0'} bg-white dark:bg-gray-800 shadow-xl rounded-lg px-2 py-1.5 flex gap-1 border border-gray-200 dark:border-gray-600 z-10`}>
                                                {QUICK_EMOJIS.map((emoji) => {
                                                    const hasReacted = msg.reactions?.find(r => r.emoji === emoji && r.user_reacted);
                                                    return (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReaction(msg.id, emoji, !!hasReacted)}
                                                            className={`text-lg hover:scale-125 transition-transform p-1 rounded ${hasReacted ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setShowEmojiPicker(msg.id)}
                                                    className="text-sm px-2 hover:scale-125 transition-transform hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-bold"
                                                >
                                                    ➕
                                                </button>
                                            </div>
                                        )}

                                        {showEmojiPicker === msg.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(null)} />
                                                <div className={`absolute ${msg.sender.id === user?.id ? 'right-0' : 'left-0'} top-full mt-2 z-50`}>
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData: EmojiClickData) => {
                                                            handleReaction(msg.id, emojiData.emoji, false);
                                                        }}
                                                        width={350}
                                                        height={400}
                                                        searchPlaceHolder="Search emoji..."
                                                        previewConfig={{ showPreview: false }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                {msg.reactions.map((reaction, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleReaction(msg.id, reaction.emoji, reaction.user_reacted)}
                                                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all hover:scale-110 ${reaction.user_reacted
                                                            ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
                                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                            }`}
                                                        title={reaction.users.map(u => u.username).join(', ')}
                                                    >
                                                        <span>{reaction.emoji}</span>
                                                        <span className="text-gray-600 dark:text-gray-400 font-medium">{reaction.count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                                <button onClick={sendMessage} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Send</button>
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
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">or click "+ New Chat"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
