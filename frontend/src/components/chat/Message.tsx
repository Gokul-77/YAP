import { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import ReactionButton from './ReactionButton';
import ReactionPicker from './ReactionPicker';
import ReactionBadge from './ReactionBadge';
import { useResponsive } from '../../hooks/useResponsive';
import { useLongPress } from '../../hooks/useLongPress';

interface MessageProps {
    id: number;
    content: string;
    sender: { id: number; username: string; role?: string };
    timestamp: string;
    isMe: boolean;
    isRead: boolean;
    reactions?: { emoji: string; count: number; userReacted: boolean; users: { username: string }[] }[];
    onReaction?: (emoji: string, isAdding: boolean) => void;
    isGroupChat?: boolean;
}

export default function Message({
    content,
    sender,
    timestamp,
    isMe,
    isRead,
    reactions = [],
    onReaction,
    isGroupChat
}: MessageProps) {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { isMobile } = useResponsive();
    const longPressHandlers = useLongPress(() => {
        if (isMobile) {
            setShowReactionPicker(true);
        }
    });

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleReaction = (emoji: string) => {
        const existingReaction = reactions.find(r => r.emoji === emoji);
        onReaction?.(emoji, !existingReaction?.userReacted);
        setShowReactionPicker(false);
    };

    const handleRemoveReaction = (emoji: string) => {
        onReaction?.(emoji, false);
    };

    return (
        <div
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-8 message-enter px-1`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`relative message-bubble rounded-3xl px-5 py-3.5 shadow-2xl transition-all duration-500 ${isMe
                    ? 'holographic-gradient text-white rounded-tr-md shadow-purple-500/30'
                    : 'bg-[var(--slate-message)] text-[#e9edef] rounded-tl-md neon-glow'
                    } hover:scale-[1.02] ambient-glow`}
                style={{
                    willChange: 'transform',
                }}
                {...longPressHandlers}
            >
                {/* Sender name for group chats */}
                {!isMe && isGroupChat && (
                    <p className="text-xs font-bold text-[var(--cosmic-purple)] mb-1.5 tracking-wide">
                        {sender.username}
                    </p>
                )}

                {/* Message content */}
                <div className="pr-16 pb-1 whitespace-pre-wrap break-words text-responsive-base leading-relaxed font-medium">
                    {content}
                </div>

                {/* Timestamp & Status */}
                <div className={`absolute bottom-2 right-4 flex items-center gap-1.5 ${isMe ? 'text-white/70' : 'text-[#8696a0]'
                    }`}>
                    <span className="text-[10px] font-medium">{formatTime(timestamp)}</span>
                    {isMe && (
                        <div className="transition-transform duration-300">
                            {isRead ? (
                                <CheckCheck size={14} className="text-[#06b6d4]" />
                            ) : (
                                <Check size={14} />
                            )}
                        </div>
                    )}
                </div>

                {/* Reaction Button (+ button) */}
                <ReactionButton
                    onClick={() => setShowReactionPicker(true)}
                    isVisible={isHovered}
                    isMobile={isMobile}
                />

                {/* Reaction Picker */}
                {showReactionPicker && (
                    <div className="absolute -bottom-2 right-0 z-50">
                        <ReactionPicker
                            onSelect={handleReaction}
                            onClose={() => setShowReactionPicker(false)}
                            position="above"
                        />
                    </div>
                )}

                {/* Reactions Display */}
                {reactions.length > 0 && (
                    <div className={`absolute -bottom-6 ${isMe ? 'right-10' : 'left-2'} flex gap-1.5 z-20`}>
                        {reactions.map((reaction, idx) => (
                            <ReactionBadge
                                key={`${reaction.emoji}-${idx}`}
                                emoji={reaction.emoji}
                                count={reaction.count}
                                users={reaction.users.map(u => u.username)}
                                userReacted={reaction.userReacted}
                                onRemove={() => handleRemoveReaction(reaction.emoji)}
                                index={idx}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
