import { useState, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    placeholder?: string;
    maxLength?: number;
}

export default function MessageInput({
    value,
    onChange,
    onSend,
    placeholder = "Type a message...",
    maxLength = 2000
}: MessageInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                onSend();
            }
        }
    };

    const characterCount = value.length;
    const isNearLimit = characterCount > maxLength * 0.8;
    const isOverLimit = characterCount > maxLength;

    return (
        <div className="relative">
            {/* Input Container */}
            <div
                className={`flex items-center gap-3 px-4 py-3 bg-[var(--deep-space)] rounded-2xl transition-all duration-300 ${isFocused
                        ? 'ring-2 ring-[var(--cosmic-purple)] shadow-2xl shadow-purple-500/20'
                        : 'ring-1 ring-white/10'
                    }`}
            >
                {/* Emoji Button */}
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-[#8696a0] hover:text-[var(--cosmic-purple)] transition-all duration-300 spring-scale p-1"
                >
                    <Smile size={22} />
                </button>

                {/* Attachment Button */}
                <button className="text-[#8696a0] hover:text-[var(--cosmic-purple)] transition-all duration-300 spring-scale p-1">
                    <Paperclip size={22} />
                </button>

                {/* Input Field */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className="w-full bg-transparent text-[#e9edef] placeholder-[#8696a0] focus:outline-none text-[15px] font-medium"
                        style={{ caretColor: 'var(--cosmic-purple)' }}
                    />

                    {/* Character Counter (shown when near limit) */}
                    {isNearLimit && (
                        <div
                            className={`absolute -top-8 right-0 text-xs px-2 py-1 rounded-lg transition-all duration-300 ${isOverLimit
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-[var(--cosmic-purple)]/20 text-[var(--cosmic-purple)]'
                                }`}
                        >
                            {characterCount}/{maxLength}
                        </div>
                    )}
                </div>

                {/* Send or Voice Button */}
                {value.trim() ? (
                    <button
                        onClick={onSend}
                        disabled={isOverLimit}
                        className={`relative p-2.5 rounded-full transition-all duration-300 spring-scale ${isOverLimit
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'holographic-gradient text-white hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/30'
                            }`}
                        style={{
                            boxShadow: isOverLimit
                                ? 'none'
                                : '0 4px 20px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3)',
                        }}
                    >
                        <Send size={18} />

                        {/* Glow effect on hover */}
                        {!isOverLimit && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--holographic-start)] to-[var(--holographic-end)] opacity-0 hover:opacity-20 transition-opacity duration-300" />
                        )}
                    </button>
                ) : (
                    <button className="text-[#8696a0] hover:text-[var(--cosmic-purple)] transition-all duration-300 spring-scale p-1">
                        <Mic size={22} />
                    </button>
                )}
            </div>

            {/* Typing Indicator Placeholder (can be replaced with actual indicator) */}
            <div className="absolute -top-12 left-0 opacity-0 transition-opacity duration-300">
                {/* This will show typing indicator from other users */}
            </div>
        </div>
    );
}
