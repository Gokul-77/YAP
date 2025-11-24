import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import Modal from '../components/Modal';
import ManageMembersModal from '../components/ManageMembersModal';
import BackButton from '../components/BackButton';
import { Trash2, Edit, Users } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    is_approved: boolean;
}

interface StreamEvent {
    id: number;
    title: string;
    is_paid: boolean;
    price: string;
}

interface ChatRoom {
    id: number;
    name: string;
    type: string;
    is_paid: boolean;
}

export default function AdminPanel() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [streams, setStreams] = useState<StreamEvent[]>([]);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'streams' | 'rooms'>('users');

    // Modal States
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingStream, setEditingStream] = useState<StreamEvent | null>(null);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [managingRoom, setManagingRoom] = useState<ChatRoom | null>(null);

    // Form States
    const [groupName, setGroupName] = useState('');
    const [groupIsPaid, setGroupIsPaid] = useState(false);
    const [groupPrice, setGroupPrice] = useState('');

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchUsers();
            fetchStreams();
            fetchRooms();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/admin/');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStreams = async () => {
        try {
            const response = await api.get('/streaming/');
            setStreams(response.data);
        } catch (error) {
            console.error('Error fetching streams:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await api.get('/chat/rooms/');
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const approveUser = async (userId: number) => {
        try {
            await api.patch(`/users/${userId}/`, { is_approved: true });
            fetchUsers();
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const changeUserRole = async (userId: number, newRole: string) => {
        try {
            await api.patch(`/users/${userId}/`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    const suspendUser = async (userId: number) => {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        try {
            await api.post(`/users/admin/${userId}/suspend/`);
            fetchUsers();
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    };

    const rejectUser = async (userId: number) => {
        if (!confirm('Are you sure you want to reject this user?')) return;
        try {
            await api.post(`/users/admin/${userId}/reject/`);
            fetchUsers();
        } catch (error) {
            console.error('Error rejecting user:', error);
        }
    };

    const activateUser = async (userId: number) => {
        try {
            await api.post(`/users/admin/${userId}/activate/`);
            fetchUsers();
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    // User CRUD
    const deleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/admin/${userId}/`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const updateUser = async (userId: number, data: Partial<User>) => {
        try {
            await api.patch(`/users/admin/${userId}/`, data);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    // Stream CRUD
    const deleteStream = async (streamId: number) => {
        if (!confirm('Are you sure you want to delete this stream?')) return;
        try {
            await api.delete(`/streaming/${streamId}/`);
            fetchStreams();
        } catch (error) {
            console.error('Error deleting stream:', error);
        }
    };

    const updateStream = async (streamId: number, data: Partial<StreamEvent>) => {
        try {
            await api.patch(`/streaming/${streamId}/`, data);
            setEditingStream(null);
            fetchStreams();
        } catch (error) {
            console.error('Error updating stream:', error);
        }
    };

    // Room CRUD
    const deleteRoom = async (roomId: number) => {
        if (!confirm('Are you sure you want to delete this room?')) return;
        try {
            await api.delete(`/chat/admin/rooms/${roomId}/`);
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const createGroup = async () => {
        try {
            await api.post('/chat/admin/rooms/', {
                name: groupName,
                type: 'GROUP',
                is_paid: groupIsPaid,
                price: groupIsPaid ? groupPrice : '0.00'
            });
            setIsCreateGroupOpen(false);
            setGroupName('');
            setGroupIsPaid(false);
            setGroupPrice('');
            fetchRooms();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You need admin privileges to access this page.</p>
                    <Link to="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                        <BackButton label="Dashboard" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-medium ${activeTab === 'users'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('streams')}
                        className={`px-4 py-2 font-medium ${activeTab === 'streams'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Streams ({streams.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-4 py-2 font-medium ${activeTab === 'rooms'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Chat Rooms ({rooms.length})
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeUserRole(u.id, e.target.value)}
                                                className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="FREE">Free</option>
                                                <option value="PAID">Paid</option>
                                                <option value="STAFF">Staff</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.status === 'ACTIVE' && (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Active</span>
                                            )}
                                            {u.status === 'SUSPENDED' && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">Suspended</span>
                                            )}
                                            {u.status === 'REJECTED' && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">Rejected</span>
                                            )}
                                            {u.status === 'PENDING' && (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2 flex-wrap">
                                                {u.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => activateUser(u.id)}
                                                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {u.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => suspendUser(u.id)}
                                                        className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {(u.status === 'SUSPENDED' || u.status === 'REJECTED') && (
                                                    <button
                                                        onClick={() => activateUser(u.id)}
                                                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                                {u.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => rejectUser(u.id)}
                                                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditingUser(u)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Streams Tab */}
                {activeTab === 'streams' && (
                    <div className="space-y-4">
                        <Link
                            to="/admin/create-stream"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Create Stream
                        </Link>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {streams.map((stream) => (
                                        <tr key={stream.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{stream.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {stream.is_paid ? (
                                                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">Paid</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Free</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {stream.is_paid ? `$${stream.price}` : 'Free'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingStream(stream)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteStream(stream.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Chat Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsCreateGroupOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Create Group
                        </button>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {rooms.map((room) => (
                                        <tr key={room.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{room.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 text-xs rounded ${room.type === 'GROUP'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}>
                                                    {room.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {room.is_paid ? 'Paid' : 'Free'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    {room.type === 'GROUP' && (
                                                        <button
                                                            onClick={() => setManagingRoom(room)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                            title="Manage Members"
                                                        >
                                                            <Users size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteRoom(room.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Edit User"
            >
                {editingUser && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                            <input
                                type="text"
                                value={editingUser.username}
                                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                            <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="FREE">Free</option>
                                <option value="PAID">Paid</option>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateUser(editingUser.id, {
                                    username: editingUser.username,
                                    email: editingUser.email,
                                    role: editingUser.role
                                })}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!editingStream}
                onClose={() => setEditingStream(null)}
                title="Edit Stream"
            >
                {editingStream && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                value={editingStream.title}
                                onChange={(e) => setEditingStream({ ...editingStream, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={editingStream.is_paid}
                                onChange={(e) => setEditingStream({ ...editingStream, is_paid: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid Stream</label>
                        </div>
                        {editingStream.is_paid && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingStream.price}
                                    onChange={(e) => setEditingStream({ ...editingStream, price: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingStream(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateStream(editingStream.id, {
                                    title: editingStream.title,
                                    is_paid: editingStream.is_paid,
                                    price: editingStream.price
                                })}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                title="Create Group"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Enter group name"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={groupIsPaid}
                            onChange={(e) => setGroupIsPaid(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid Group</label>
                    </div>
                    {groupIsPaid && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={groupPrice}
                                onChange={(e) => setGroupPrice(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="0.00"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsCreateGroupOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={createGroup}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create Group
                        </button>
                    </div>
                </div>
            </Modal>

            {managingRoom && (
                <ManageMembersModal
                    isOpen={!!managingRoom}
                    onClose={() => setManagingRoom(null)}
                    roomId={managingRoom.id}
                    roomName={managingRoom.name}
                />
            )}
        </div>
    );
}
