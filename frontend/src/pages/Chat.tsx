import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Smile,
    Paperclip,
    Mic,
    Send,
    ArrowLeft,
    MessageSquarePlus,
    Check,
    CheckCheck,
    Menu,
    X
} from 'lucide-react';

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
    is_read: boolean;
    reactions?: ReactionGroup[];
}

interface ChatRoom {
    id: number;
    name: string;
    display_name?: string;
    type: 'DIRECT' | 'GROUP';
    is_paid: boolean;
    last_message?: string;
    last_message_time?: string;
    unread_count?: number;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar?: string; // Placeholder for future avatar
}

export default function Chat() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉'];

    // Handle window resize for responsive layout
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchRooms();
        api.get('/users/').then((res) => setUsers(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredRooms(rooms);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredRooms(rooms.filter(room =>
                (room.display_name || room.name).toLowerCase().includes(lowerQuery)
            ));
        }
    }, [searchQuery, rooms]);

    const fetchRooms = () => {
        api.get('/chat/rooms/').then((res) => {
            setRooms(res.data);
            setFilteredRooms(res.data);
        }).catch(console.error);
    };

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
                // Refresh room list to update last message preview (optional optimization: update locally)
                fetchRooms();
            }

            if (data.type === 'reaction_update' && data.message_id) {
                api.get(`/chat/rooms/${roomId}/messages/`).then((res) => {
                    setMessages(res.data);
                }).catch(console.error);
            }

            if (data.type === 'messages_read') {
                if (data.user_id !== user?.id) {
                    setMessages(prev => prev.map(msg =>
                        msg.sender.id === user?.id ? { ...msg, is_read: true } : msg
                    ));
                }
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
            fetchRooms();
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const currentRoom = rooms.find(r => String(r.id) === roomId);

    // Helper to format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-screen bg-[#111b21] text-[#e9edef] overflow-hidden">
            {/* Left Sidebar - Chat List */}
            <div className={`${roomId && isMobileView ? 'hidden' : 'flex'} flex-col w-full md:w-[400px] border-r border-[#202c33] bg-[#111b21]`}>
                {/* Sidebar Header */}
                <div className="h-[60px] px-4 bg-[#202c33] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                            {/* User Avatar Placeholder */}
                            <span className="text-lg font-medium text-white">{user?.username?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-semibold text-sm hidden sm:block">{user?.username}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#aebac1]">
                        <button className="p-2 hover:bg-[#37404a] rounded-full" title="New Chat" onClick={() => setShowUserList(!showUserList)}>
                            <MessageSquarePlus size={20} />
                        </button>
                        <button className="p-2 hover:bg-[#37404a] rounded-full" title="Menu">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-3 py-2 bg-[#111b21] border-b border-[#202c33]">
                    <div className="relative flex items-center bg-[#202c33] rounded-lg h-[35px]">
                        <div className="pl-3 pr-2 text-[#aebac1]">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search or start a new chat"
                            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#aebac1] focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* New Chat User List (Overlay) */}
                {showUserList && (
                    <div className="bg-[#111b21] border-b border-[#202c33] max-h-60 overflow-y-auto">
                        <div className="p-3 text-[#00a884] text-sm font-medium">START A NEW CHAT</div>
                        {users.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => startChatWithUser(u.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-[#202c33] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="text-[#e9edef] font-medium">{u.username}</p>
                                    <p className="text-xs text-[#8696a0]">{u.role}</p>
                                </div>
                            </button>
                        ))}
                        {user?.role === 'ADMIN' && (
                            <Link to="/chat/create-group" className="w-full flex items-center gap-3 p-3 hover:bg-[#202c33] transition-colors">
                                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                                    <MessageSquarePlus size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[#e9edef] font-medium">Create New Group</p>
                                </div>
                            </Link>
                        )}
                    </div>
                )}

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredRooms.map((room) => (
                        <Link
                            key={room.id}
                            to={`/chat/${room.id}`}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-[#202c33] ${roomId === String(room.id) ? 'bg-[#2a3942]' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-xl font-medium text-white">
                                {(room.display_name || room.name)[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-[#e9edef] font-medium truncate">{room.display_name || room.name}</h3>
                                    {room.last_message_time && (
                                        <span className="text-xs text-[#8696a0]">{formatTime(room.last_message_time)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-sm text-[#8696a0] truncate flex-1">
                                        {room.last_message || "No messages yet"}
                                    </p>
                                    {room.unread_count && room.unread_count > 0 ? (
                                        <span className="bg-[#00a884] text-[#111b21] text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                            {room.unread_count}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </Link>
                    ))}
                    {filteredRooms.length === 0 && !showUserList && (
                        <div className="p-8 text-center text-[#8696a0]">
                            <p>No chats found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Chat Area */}
            {roomId ? (
                <div className={`${!isMobileView ? 'flex' : (roomId ? 'flex' : 'hidden')} flex-col flex-1 bg-background relative w-full`}>
                    {/* Chat Header */}
                    <div className="h-[60px] px-4 bg-card flex items-center justify-between shrink-0 border-b border-border">
                        <div className="flex items-center gap-3">
                            {isMobileView && (
                                <button onClick={() => navigate('/chat')} className="mr-1 text-muted-foreground">
                                    <ArrowLeft size={24} />
                                </button>
                            )}
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-medium">
                                {(currentRoom?.display_name || currentRoom?.name || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-foreground font-medium leading-tight">{currentRoom?.display_name || currentRoom?.name}</h2>
                                <p className="text-xs text-muted-foreground truncate">click here for contact info</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <button className="p-2 hover:bg-secondary rounded-full"><Video size={20} /></button>
                            <button className="p-2 hover:bg-secondary rounded-full"><Phone size={20} /></button>
                            <div className="w-[1px] h-6 bg-border mx-1"></div>
                            <button className="p-2 hover:bg-secondary rounded-full"><Search size={20} /></button>
                            <button className="p-2 hover:bg-secondary rounded-full"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 custom-scrollbar bg-background"
                    >
                        {messages.map((msg) => {
                            const isMe = msg.sender.id === user?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-4`}
                                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    <div className={`relative max-w-[85%] sm:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                                        }`}>
                                        {/* Sender Name in Group Chat */}
                                        {!isMe && currentRoom?.type === 'GROUP' && (
                                            <p className="text-xs font-bold text-primary mb-1">{msg.sender.username}</p>
                                        )}

                                        {/* Message Content */}
                                        <div className="pr-16 pb-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                                            {msg.content}
                                        </div>

                                        {/* Timestamp & Status */}
                                        <div className={`absolute bottom-1 right-3 flex items-center gap-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                                            {isMe && (
                                                msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />
                                            )}
                                        </div>

                                        {/* Hover Reaction Button */}
                                        {hoveredMessageId === msg.id && (
                                            <button
                                                onClick={() => setShowEmojiPicker(msg.id)}
                                                className="absolute -top-3 -right-2 bg-secondary rounded-full p-1.5 shadow-md border border-border text-muted-foreground hover:text-foreground hover:scale-110 transition-transform z-10"
                                            >
                                                <Smile size={16} />
                                            </button>
                                        )}

                                        {/* Emoji Picker Modal */}
                                        {showEmojiPicker === msg.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(null)} />
                                                <div className={`absolute bottom-full mb-2 ${isMe ? 'right-0' : 'left-0'} z-50`}>
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData: EmojiClickData) => {
                                                            handleReaction(msg.id, emojiData.emoji, false);
                                                        }}
                                                        theme="dark"
                                                        width={300}
                                                        height={350}
                                                        searchPlaceHolder="Search emoji..."
                                                        previewConfig={{ showPreview: false }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Reactions Display */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className="absolute -bottom-3 left-2 flex gap-1 z-10">
                                                {msg.reactions.map((reaction, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleReaction(msg.id, reaction.emoji, reaction.user_reacted)}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-border transition-transform hover:scale-110 ${reaction.user_reacted
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-secondary text-secondary-foreground'
                                                            }`}
                                                        title={reaction.users.map(u => u.username).join(', ')}
                                                    >
                                                        <span>{reaction.emoji}</span>
                                                        {reaction.count > 1 && <span>{reaction.count}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-card px-4 py-3 flex items-center gap-3 shrink-0 border-t border-border">
                        <button className="text-muted-foreground hover:text-foreground p-1">
                            <Smile size={24} />
                        </button>
                        <button className="text-muted-foreground hover:text-foreground p-1">
                            <Paperclip size={24} />
                        </button>

                        <div className="flex-1 bg-secondary rounded-full flex items-center px-4 py-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message"
                                className="w-full bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-[15px]"
                            />
                        </div>

                        {newMessage.trim() ? (
                            <button onClick={sendMessage} className="text-primary hover:text-primary/90 p-1">
                                <Send size={24} />
                            </button>
                        ) : (
                            <button className="text-muted-foreground hover:text-foreground p-1">
                                <Mic size={24} />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="hidden md:flex flex-col flex-1 bg-background items-center justify-center border-b-[6px] border-primary text-center px-10">
                    <div className="mb-6">
                        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                            <MessageSquarePlus size={48} className="text-muted-foreground" />
                        </div>
                    </div>
                    <h1 className="text-foreground text-3xl font-light mb-4">Welcome to YAP Web</h1>
                    <p className="text-muted-foreground text-sm leading-6 max-w-md">
                        Send and receive messages without keeping your phone online.<br />
                        Connect with your friends and groups instantly.
                    </p>
                    <div className="mt-10 flex items-center gap-2 text-muted-foreground text-xs">
                        <span className="text-[10px]">🔒</span> End-to-end encrypted
                    </div>
                </div>
            )}
        </div>
    );
}
