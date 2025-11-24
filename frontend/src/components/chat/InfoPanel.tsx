import { X, User, Bell, Hash } from 'lucide-react';

interface InfoPanelProps {
    roomName?: string;
    roomType?: 'DIRECT' | 'GROUP';
    onClose?: () => void;
}

export default function InfoPanel({ roomName, roomType, onClose }: InfoPanelProps) {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-[#e9edef] font-semibold">Chat Info</h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-[#8696a0] hover:text-[var(--cosmic-purple)] transition-colors spring-scale p-1"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto momentum-scroll p-4 space-y-6">
                {/* Room Avatar */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--holographic-start)] to-[var(--holographic-end)] flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-2xl">
                        {roomName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2 className="text-[#e9edef] text-xl font-bold">{roomName || 'Unknown'}</h2>
                    <p className="text-[#8696a0] text-sm flex items-center gap-1 mt-1">
                        {roomType === 'GROUP' ? <Hash size={14} /> : <User size={14} />}
                        {roomType === 'GROUP' ? 'Group Chat' : 'Direct Message'}
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                    <button className="w-full p-3 rounded-xl bg-[var(--obsidian-base)] hover:bg-[var(--cosmic-purple)]/20 text-[#e9edef] text-left flex items-center gap-3 transition-all duration-300 spring-scale">
                        <Bell size={18} className="text-[var(--cosmic-purple)]" />
                        <span className="text-sm">Mute notifications</span>
                    </button>
                </div>

                {/* Media Section */}
                <div>
                    <h4 className="text-[#8696a0] text-xs font-semibold uppercase mb-3">Media & Files</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-lg bg-[var(--obsidian-base)] skeleton"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
