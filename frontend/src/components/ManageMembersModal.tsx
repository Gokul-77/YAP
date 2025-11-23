import { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../lib/api';
import { Trash2, UserPlus } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string;
}

interface ManageMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: number;
    roomName: string;
}

export default function ManageMembersModal({ isOpen, onClose, roomId, roomName }: ManageMembersModalProps) {
    const [members, setMembers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            fetchAllUsers();
        }
    }, [isOpen, roomId]);

    const fetchMembers = async () => {
        try {
            const response = await api.get(`/chat/admin/rooms/${roomId}/members/`);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await api.get('/users/admin/');
            setAllUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const addMember = async () => {
        if (!selectedUserId) return;

        setLoading(true);
        try {
            await api.post(`/chat/admin/rooms/${roomId}/add_member/`, {
                user_id: selectedUserId
            });
            await fetchMembers();
            setSelectedUserId('');
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (userId: number) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        setLoading(true);
        try {
            await api.post(`/chat/admin/rooms/${roomId}/remove_member/`, {
                user_id: userId
            });
            await fetchMembers();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Members - ${roomName}`}>
            <div className="space-y-4">
                {/* Add Member */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add Member
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={loading}
                        >
                            <option value="">Select a user...</option>
                            {availableUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={addMember}
                            disabled={!selectedUserId || loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <UserPlus size={16} />
                            Add
                        </button>
                    </div>
                </div>

                {/* Members List */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Members ({members.length})
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                        {members.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No members yet</p>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {members.map((member) => (
                                    <li key={member.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {member.username}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {member.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            disabled={loading}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 disabled:opacity-50"
                                            title="Remove member"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
