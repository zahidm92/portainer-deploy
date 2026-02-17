
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, Calendar, Eye, Image as ImageIcon } from 'lucide-react';
import ImageLibrary from '../components/ImageLibrary';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('bookings'); // 'bookings', 'services', 'users', 'settings', 'media'
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // New Service Form State
    const [newService, setNewService] = useState({ title: '', price: '', duration: '', description: '', image: null, imageURL: '' });
    const [editingService, setEditingService] = useState(null); // For Edit Mode
    const [showMediaLibrary, setShowMediaLibrary] = useState(false); // For Modal

    // New User Form State
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'admin' });

    // Settings State
    const [heroImage, setHeroImage] = useState(null);
    const [currentHeroUrl, setCurrentHeroUrl] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const storedUser = localStorage.getItem('username');
        if (!storedRole) navigate('/login');
        setRole(storedRole);
        setUsername(storedUser);
        fetchData(storedRole);
    }, [navigate]);

    const fetchData = async (currentRole) => {
        try {
            const roleToCheck = currentRole || localStorage.getItem('role');
            const promises = [
                api.get('/bookings'),
                api.get('/services'),
                api.get('/settings/hero')
            ];

            if (roleToCheck === 'root') {
                promises.push(api.get('/auth/users'));
            }

            const results = await Promise.all(promises);
            setBookings(results[0].data);
            setServices(results[1].data);
            if (results[2].data.url) setCurrentHeroUrl(results[2].data.url);
            if (results[3]) setUsers(results[3].data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            fetchData();
        } catch (error) {
            alert("Failed to update status");
        }
    };


    const handleDeleteService = async (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await api.delete(`/services/${id}`);
                fetchData();
            } catch (error) {
                alert("Failed to delete service. It might have bookings associated with it (check backend constraints).");
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Delete this user?")) {
            try {
                await api.delete(`/auth/users/${id}`);
                fetchData(role);
                alert("User deleted");
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newService.title);
            formData.append('price', newService.price);
            formData.append('duration', newService.duration);
            formData.append('description', newService.description);
            // If image file is selected, upload it
            if (newService.image) formData.append('image', newService.image);
            // If imageURL is explicitly set (from library)
            if (newService.imageURL) formData.append('imageURL', newService.imageURL);

            await api.post('/services', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewService({ title: '', price: '', duration: '', description: '', image: null, imageURL: '' });
            fetchData();
            alert("Service added!");
        } catch (error) {
            alert("Failed to add service");
        }
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', editingService.title);
            formData.append('price', editingService.price);
            formData.append('duration', editingService.duration);
            formData.append('description', editingService.description);
            if (editingService.image) formData.append('image', editingService.image);
            if (editingService.imageURL) formData.append('imageURL', editingService.imageURL);

            await api.put(`/services/${editingService.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditingService(null);
            fetchData();
            alert("Service updated!");
        } catch (error) {
            alert("Failed to update service");
        }
    };

    const handleHeroUpload = async (e) => {
        e.preventDefault();
        if (!heroImage) return;
        try {
            const formData = new FormData();
            formData.append('image', heroImage);
            await api.post('/settings/hero', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchData();
            alert("Hero image updated!");
        } catch (error) {
            alert("Failed to update hero image");
        }
    };

    const startEditing = (service) => {
        setEditingService({ ...service, image: null }); // Reset image for upload
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', newUser);
            setNewUser({ username: '', password: '', role: 'admin' });
            fetchData(role);
            alert("User created successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Failed to create user");
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600">Logged in as: <span className="font-semibold">{username}</span> ({role})</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full md:w-auto"
                >
                    Logout
                </button>
            </div>

            <div className="flex overflow-x-auto space-x-4 mb-6 border-b pb-4 no-scrollbar">
                <button
                    onClick={() => setView('bookings')}
                    className={`whitespace-nowrap px-4 py-2 rounded ${view === 'bookings' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                    Bookings
                </button>
                {role === 'root' && (
                    <>
                        <button
                            onClick={() => setView('services')}
                            className={`whitespace-nowrap px-4 py-2 rounded ${view === 'services' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            Manage Services
                        </button>
                        <button
                            onClick={() => setView('users')}
                            className={`whitespace-nowrap px-4 py-2 rounded ${view === 'users' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setView('settings')}
                            className={`whitespace-nowrap px-4 py-2 rounded ${view === 'settings' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setView('media')}
                            className={`whitespace-nowrap px-4 py-2 rounded ${view === 'media' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            Media Library
                        </button>
                    </>
                )}
            </div>

            {view === 'bookings' && (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Specialist</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{new Date(b.date).toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="font-bold">{b.customerName}</div>
                                        <div className="text-sm text-gray-500">{b.phoneNumber}</div>
                                    </td>
                                    <td className="p-4">{b.Service?.title || 'Unknown'}</td>
                                    <td className="p-4">{b.Staff?.username || 'Any'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-sm font-bold 
                      ${b.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                b.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    b.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex space-x-2">
                                        {b.status === 'Pending' && (
                                            <>
                                                <button onClick={() => updateStatus(b.id, 'Approved')} className="p-1 bg-green-500 text-white rounded" title="Approve"><Check size={16} /></button>
                                                <button onClick={() => updateStatus(b.id, 'Rejected')} className="p-1 bg-red-500 text-white rounded" title="Reject"><X size={16} /></button>
                                            </>
                                        )}
                                        {b.status === 'Approved' && (
                                            <button onClick={() => updateStatus(b.id, 'Completed')} className="p-1 bg-blue-500 text-white rounded" title="Complete"><Check size={16} /></button>
                                        )}
                                        <button onClick={() => updateStatus(b.id, 'Seen')} className="p-1 bg-gray-500 text-white rounded" title="Mark Seen"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* List Services */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Current Services</h2>
                        <ul className="space-y-2">
                            {services.map(s => (
                                <li key={s.id} className="flex justify-between items-center border-b pb-2">
                                    <div className="flex items-center gap-2">
                                        {s.imageURL && (
                                            <img
                                                src={s.imageURL.startsWith('http') ? s.imageURL : `${API_URL}${s.imageURL}`}
                                                alt={s.title}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        )}
                                        <span>{s.title} - <b>£{s.price}</b> ({s.duration} min)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEditing(s)}
                                            className="text-blue-500 hover:text-blue-700 p-1 font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(s.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Remove Service"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Add/Edit Service Form */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                        <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Service Title"
                                className="w-full p-2 border rounded"
                                value={editingService ? editingService.title : newService.title}
                                onChange={e => editingService ? setEditingService({ ...editingService, title: e.target.value }) : setNewService({ ...newService, title: e.target.value })}
                                required
                            />
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="w-1/2 p-2 border rounded"
                                    value={editingService ? editingService.price : newService.price}
                                    onChange={e => editingService ? setEditingService({ ...editingService, price: e.target.value }) : setNewService({ ...newService, price: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Duration (min)"
                                    className="w-1/2 p-2 border rounded"
                                    value={editingService ? editingService.duration : newService.duration}
                                    onChange={e => editingService ? setEditingService({ ...editingService, duration: e.target.value }) : setNewService({ ...newService, duration: e.target.value })}
                                    required
                                />
                            </div>
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 border rounded"
                                value={editingService ? editingService.description : newService.description}
                                onChange={e => editingService ? setEditingService({ ...editingService, description: e.target.value }) : setNewService({ ...newService, description: e.target.value })}
                            ></textarea>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Service Image</label>

                                {/* Preview Selected Image */}
                                {(editingService?.imageURL || newService?.imageURL) && (
                                    <div className="mb-2">
                                        <img
                                            src={(editingService?.imageURL || newService?.imageURL).startsWith('http') ? (editingService?.imageURL || newService?.imageURL) : `${API_URL}${editingService?.imageURL || newService?.imageURL}`}
                                            alt="Preview"
                                            className="w-20 h-20 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaLibrary(true)}
                                        className="bg-secondary text-primary px-3 py-2 rounded border border-gray-300 hover:bg-yellow-400 flex items-center gap-2"
                                    >
                                        <ImageIcon size={16} /> Select from Library
                                    </button>
                                    <span className="flex items-center text-gray-400">OR</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full p-2 border rounded"
                                        onChange={e => {
                                            if (editingService) setEditingService({ ...editingService, image: e.target.files[0], imageURL: '' });
                                            else setNewService({ ...newService, image: e.target.files[0], imageURL: '' });
                                        }}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary text-white py-2 rounded">
                                {editingService ? 'Update Service' : 'Add Service'}
                            </button>
                            {editingService && (
                                <button type="button" onClick={() => setEditingService(null)} className="w-full mt-2 bg-gray-500 text-white py-2 rounded">
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {view === 'users' && role === 'root' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User List */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Existing Users</h2>
                        {users.length === 0 ? <p className="text-gray-500">No other users found.</p> : (
                            <ul className="space-y-2">
                                {users.map(u => (
                                    <li key={u.id} className="flex justify-between items-center border-b pb-2">
                                        <span><b>{u.username}</b> ({u.role})</span>
                                        {u.role !== 'root' && (
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Delete User"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Create User Form */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="root">Root</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {view === 'settings' && (
                <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-4">Homepage Settings</h2>

                    <div className="mb-6">
                        <label className="block font-bold mb-2">Current Hero Image</label>
                        {currentHeroUrl ? (
                            <img
                                src={currentHeroUrl.startsWith('http') ? currentHeroUrl : `${API_URL}${currentHeroUrl}`}
                                alt="Hero"
                                className="w-full h-48 object-cover rounded border"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                                Default Hero Image
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleHeroUpload} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Upload New Hero Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setHeroImage(e.target.files[0])}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 rounded">
                            Update Hero Image
                        </button>
                    </form>
                </div>
            )}

            {view === 'media' && (
                <div className="h-[70vh]">
                    <ImageLibrary onClose={() => setView('bookings')} />
                </div>
            )}

            {/* Media Library Modal */}
            {showMediaLibrary && (
                <ImageLibrary
                    mode="select"
                    onClose={() => setShowMediaLibrary(false)}
                    onSelect={(img) => {
                        if (editingService) {
                            setEditingService({ ...editingService, imageURL: img.url, image: null });
                        } else {
                            setNewService({ ...newService, imageURL: img.url, image: null });
                        }
                        setShowMediaLibrary(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
