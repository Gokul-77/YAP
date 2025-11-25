import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import ChatLayout from '../components/chat/ChatLayout';
import Message from '../components/chat/Message';
import MessageInput from '../components/chat/MessageInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import InfoPanel from '../components/chat/InfoPanel';
import SkeletonLoader from '../components/chat/SkeletonLoader';
import BackButton from '../components/BackButton';

import DateSeparator from '../components/chat/DateSeparator';
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Info,
    MessageSquarePlus,
    ArrowLeft
} from 'lucide-react';

interface ReactionGroup {
    emoji: string;
    count: number;
    users: Array<{ id: number; username: string }>;
    user_reacted: boolean;
}

interface MessageType {
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
}

export default function Chat() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [activeReactionPickerMessageId, setActiveReactionPickerMessageId] = useState<number | null>(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on mobile when chat is selected
    useEffect(() => {
        if (isMobileView && roomId) {
            setSidebarOpen(false);
        } else if (!roomId) {
            setSidebarOpen(true);
        }
    }, [roomId, isMobileView]);

    // Fetch rooms and users
    useEffect(() => {
        fetchRooms();
        api.get('/users/').then((res) => setUsers(res.data)).catch(console.error);
    }, []);

    // Filter rooms by search
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

    // WebSocket connection and message handling
    useEffect(() => {
        if (!roomId) return;

        setIsLoading(true);
        api.get(`/chat/rooms/${roomId}/messages/`)
            .then((res) => {
                setMessages(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });

        const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'chat_message' || data.message) {
                setMessages((prev) => [...prev, {
                    id: Date.now(),
                    content: data.message,
                    sender: { id: data.user_id, username: data.username || 'User' },
                    timestamp: new Date().toISOString(),
                    is_read: false,
                }]);
                fetchRooms();
            }

            if (data.type === 'reaction_update' && data.message_id) {
                api.get(`/chat/rooms/${roomId}/messages/`)
                    .then((res) => setMessages(res.data))
                    .catch(console.error);
            }

            if (data.type === 'messages_read') {
                if (data.user_id !== user?.id) {
                    setMessages(prev => prev.map(msg =>
                        msg.sender.id === user?.id ? { ...msg, is_read: true } : msg
                    ));
                }
            }

            // Simulated typing indicator (extend backend for real implementation)
            if (data.type === 'typing') {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        setWs(websocket);
        return () => websocket.close();
    }, [roomId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !ws || !user) return;
        ws.send(JSON.stringify({
            message: newMessage,
            user_id: user.id
        }));
        setNewMessage('');
    };

    const handleReaction = async (messageId: number, emoji: string, isAdding: boolean) => {
        try {
            // Optimistic update
            setMessages(prev => prev.map(msg => {
                if (msg.id !== messageId) return msg;

                let newReactions = [...(msg.reactions || [])];
                const existingReactionIndex = newReactions.findIndex(r => r.emoji === emoji);
                const userReactionIndex = newReactions.findIndex(r => r.user_reacted);

                // If user clicked the same emoji they already reacted with -> remove it
                if (existingReactionIndex !== -1 && newReactions[existingReactionIndex].user_reacted) {
                    newReactions[existingReactionIndex].count--;
                    newReactions[existingReactionIndex].user_reacted = false;
                    newReactions[existingReactionIndex].users = newReactions[existingReactionIndex].users.filter(u => u.id !== user?.id);
                    if (newReactions[existingReactionIndex].count === 0) {
                        newReactions.splice(existingReactionIndex, 1);
                    }
                }
                // If user clicked a different emoji -> remove old reaction and add new one
                else {
                    // Remove old reaction if exists
                    if (userReactionIndex !== -1) {
                        newReactions[userReactionIndex].count--;
                        newReactions[userReactionIndex].user_reacted = false;
                        newReactions[userReactionIndex].users = newReactions[userReactionIndex].users.filter(u => u.id !== user?.id);
                        if (newReactions[userReactionIndex].count === 0) {
                            newReactions.splice(userReactionIndex, 1);
                        }
                    }

                    // Add new reaction
                    const targetReactionIndex = newReactions.findIndex(r => r.emoji === emoji);
                    if (targetReactionIndex !== -1) {
                        newReactions[targetReactionIndex].count++;
                        newReactions[targetReactionIndex].user_reacted = true;
                        if (user) {
                            newReactions[targetReactionIndex].users.push({ id: user.id, username: user.username });
                        }
                    } else {
                        newReactions.push({
                            emoji,
                            count: 1,
                            user_reacted: true,
                            users: user ? [{ id: user.id, username: user.username }] : []
                        });
                    }
                }

                return { ...msg, reactions: newReactions };
            }));

            // API Call with correct URL (with trailing slash for Django)
            if (isAdding) {
                await api.post(`/chat/rooms/${roomId}/messages/${messageId}/react/`, { emoji });
            } else {
                await api.delete(`/chat/rooms/${roomId}/messages/${messageId}/react/`, { data: { emoji } });
            }
        } catch (error) {
            console.error('Error updating reaction:', error);
            // Revert on error (optional, but good practice)
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

    // Format time helper
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Group messages by date with separators
    const groupedMessages = useMemo(() => {
        const groups: (MessageType | { type: 'separator'; date: Date; id: string })[] = [];
        let lastDate: Date | null = null;

        messages.forEach((msg) => {
            const msgDate = new Date(msg.timestamp);
            // Reset time to compare dates only
            const msgDateOnly = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

            if (!lastDate || msgDateOnly.getTime() !== lastDate.getTime()) {
                groups.push({
                    type: 'separator',
                    date: msgDate,
                    id: `sep-${msgDate.getTime()}`
                });
                lastDate = msgDateOnly;
            }
            groups.push(msg);
        });

        return groups;
    }, [messages]);

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="h-16 px-4 flex items-center justify-between shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3">
                    {/* Mobile Close Button */}
                    {isMobileView && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="mr-1 text-[#8696a0] hover:text-white mobile-only touch-target"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    {!isMobileView && <BackButton label="Back" />}
                    <div className="w-10 h-10 rounded-full holographic-gradient flex items-center justify-center overflow-hidden shadow-lg avatar-responsive">
                        <span className="text-lg font-bold text-white">{user?.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="font-semibold text-sm text-[#e9edef] hidden sm:block">{user?.username}</span>
                </div>
                <div className="flex items-center gap-3 text-[#8696a0]">
                    <button
                        className="p-2 hover:bg-[var(--cosmic-purple)]/20 rounded-full spring-scale transition-colors touch-target"
                        title="New Chat"
                        onClick={() => setShowUserList(!showUserList)}
                    >
                        <MessageSquarePlus size={20} />
                    </button>
                    <button className="p-2 hover:bg-[var(--cosmic-purple)]/20 rounded-full spring-scale transition-colors touch-target" title="Menu">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 py-3">
                <div className="relative flex items-center bg-[var(--deep-space)] rounded-xl h-10 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-[var(--cosmic-purple)] transition-all">
                    <div className="pl-3 pr-2 text-[#8696a0]">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none pr-3"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* New Chat User List */}
            {showUserList && (
                <div className="bg-[var(--obsidian-base)] border-b border-white/5 max-h-60 overflow-y-auto momentum-scroll">
                    <div className="p-3 text-[var(--cosmic-purple)] text-xs font-bold uppercase tracking-wide">Start a New Chat</div>
                    {users.map((u) => (
                        <button
                            key={u.id}
                            onClick={() => startChatWithUser(u.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-[var(--cosmic-purple)]/10 transition-all spring-scale"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--holographic-start)] to-[var(--holographic-end)] flex items-center justify-center text-white font-bold shadow-lg">
                                {u.username[0].toUpperCase()}
                            </div>
                            <div className="text-left">
                                <p className="text-[#e9edef] font-medium text-sm">{u.username}</p>
                                <p className="text-xs text-[#8696a0]">{u.role}</p>
                            </div>
                        </button>
                    ))}
                    {user?.role === 'ADMIN' && (
                        <Link to="/chat/create-group" className="w-full flex items-center gap-3 p-3 hover:bg-[var(--cosmic-purple)]/10 transition-all spring-scale">
                            <div className="w-10 h-10 rounded-full holographic-gradient flex items-center justify-center text-white shadow-lg">
                                <MessageSquarePlus size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[#e9edef] font-medium text-sm">Create New Group</p>
                            </div>
                        </Link>
                    )}
                </div>
            )}


            {/* Chat List */}
            <div className="flex-1 overflow-y-auto momentum-scroll">
                {filteredRooms.map((room) => (
                    <Link
                        key={room.id}
                        to={`/chat/${room.id}`}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--cosmic-purple)]/10 transition-all border-b border-white/5 ${roomId === String(room.id) ? 'bg-[var(--cosmic-purple)]/20 border-l-4 border-l-[var(--cosmic-purple)]' : ''
                            }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--holographic-start)] to-[var(--holographic-end)] flex-shrink-0 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                            {(room.display_name || room.name)[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-[#e9edef] font-semibold truncate">{room.display_name || room.name}</h3>
                                {room.last_message_time && (
                                    <span className="text-xs text-[#8696a0]">{formatTime(room.last_message_time)}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-[#8696a0] truncate flex-1">
                                    {room.last_message || "No messages yet"}
                                </p>
                                {room.unread_count && room.unread_count > 0 ? (
                                    <span className="holographic-gradient text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center notification-pill shadow-lg">
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
    );

    // Chat Area Content
    const chatAreaContent = roomId ? (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="frosted-glass h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3 sm:gap-4">
                    {isMobileView && (
                        <button
                            onClick={() => navigate('/chat')}
                            className="text-[#8696a0] hover:text-white active:text-[var(--cosmic-purple)] spring-scale touch-target p-2 -ml-2"
                            aria-label="Back to chats"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="w-11 h-11 rounded-full holographic-gradient flex items-center justify-center text-white font-bold text-lg shadow-xl">
                        {(currentRoom?.display_name || currentRoom?.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[#e9edef] font-bold text-base sm:text-lg">{currentRoom?.display_name || currentRoom?.name}</h2>
                        <p className="text-xs text-[var(--cosmic-purple)]">Click for info</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-[#8696a0]">
                    <button className="p-2 hover:bg-[var(--cosmic-purple)]/20 rounded-full spring-scale"><Video size={20} /></button>
                    <button className="p-2 hover:bg-[var(--cosmic-purple)]/20 rounded-full spring-scale"><Phone size={20} /></button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button className="p-2 hover:bg-[var(--cosmic-purple)]/20 rounded-full spring-scale"><Search size={20} /></button>
                    <button
                        className="p-2 hover:bg-[var(--cosmic-purple)]/20 rounded-full spring-scale"
                        onClick={() => setShowInfoPanel(!showInfoPanel)}
                    >
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 pb-8 momentum-scroll">
                {isLoading ? (
                    <SkeletonLoader />
                ) : (
                    <>
                        {groupedMessages.map((item) => {
                            if ('type' in item && item.type === 'separator') {
                                return <DateSeparator key={item.id} date={item.date} />;
                            }
                            const msg = item as MessageType;
                            return (
                                <Message
                                    key={msg.id}
                                    id={msg.id}
                                    content={msg.content}
                                    sender={msg.sender}
                                    timestamp={msg.timestamp}
                                    isMe={msg.sender.id === user?.id}
                                    isRead={msg.is_read}
                                    reactions={msg.reactions?.map(r => ({
                                        emoji: r.emoji,
                                        count: r.count,
                                        userReacted: r.user_reacted,
                                        users: r.users
                                    }))}
                                    onReaction={(emoji, isAdding) => handleReaction(msg.id, emoji, isAdding)}
                                    isGroupChat={currentRoom?.type === 'GROUP'}
                                    showReactionPicker={activeReactionPickerMessageId === msg.id}
                                    onToggleReactionPicker={() => {
                                        setActiveReactionPickerMessageId(
                                            activeReactionPickerMessageId === msg.id ? null : msg.id
                                        );
                                    }}
                                />
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start mb-4">
                                <TypingIndicator />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="px-6 pb-6 shrink-0">
                <MessageInput
                    value={newMessage}
                    onChange={setNewMessage}
                    onSend={sendMessage}
                />
            </div>
        </div>
    ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-full text-center px-10 relative">
            {/* Back button for mobile in empty state */}
            {isMobileView && (
                <Link
                    to="/dashboard"
                    className="absolute top-4 left-4 text-[#8696a0] hover:text-white active:text-[var(--cosmic-purple)] spring-scale touch-target p-2"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeft size={24} />
                </Link>
            )}
            <div className="mb-6">
                <div className="w-28 h-28 rounded-full holographic-gradient flex items-center justify-center shadow-2xl">
                    <MessageSquarePlus size={56} className="text-white" />
                </div>
            </div>
            <h1 className="text-[#e9edef] text-4xl font-bold mb-4">Welcome to YAP</h1>
            <p className="text-[#8696a0] text-base leading-7 max-w-md">
                Experience next-generation messaging with holographic bubbles,<br />
                radial reactions, and smooth animations.
            </p>
            <div className="mt-10 flex items-center gap-2 text-[var(--cosmic-purple)] text-sm font-medium">
                <span className="text-lg">🔒</span> End-to-end encrypted
            </div>
        </div>
    );

    // Info Panel Content
    const infoPanelContent = (
        <InfoPanel
            roomName={currentRoom?.display_name || currentRoom?.name}
            roomType={currentRoom?.type}
            onClose={() => setShowInfoPanel(false)}
        />
    );

    // Top Bar Content
    const topBarContent = (
        <div className="flex items-center justify-between w-full">
            <h1 className="text-[#e9edef] text-xl font-bold gradient-text">YAP Chat</h1>
            <div className="text-[#8696a0] text-sm">
                <span className="text-[var(--cosmic-purple)] font-semibold">{rooms.length}</span> conversations
            </div>
        </div>
    );

    return (
        <ChatLayout
            sidebar={sidebarContent}
            chatArea={chatAreaContent}
            infoPanel={infoPanelContent}
            topBar={topBarContent}
            showInfoPanel={showInfoPanel}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
    );
}
