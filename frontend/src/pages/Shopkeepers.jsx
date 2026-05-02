import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users, Trash2, Search } from 'lucide-react';

const Shopkeepers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/auth/users?role=shopkeeper&status=active', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('/api/auth/add-shopkeeper', formData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setShowModal(false);
            setFormData({ username: '', email: '', password: '' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding shopkeeper');
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`Are you sure you want to remove shopkeeper "${username}"?`)) {
            try {
                await axios.delete(`/api/auth/${id}`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting shopkeeper');
            }
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading shopkeeper data...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Shopkeeper <span style={{ color: 'var(--primary-color)' }}>Base</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your shopkeeper staff and their access credentials.</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({ username: '', email: '', password: '' });
                    setError('');
                    setShowModal(true);
                }}>
                    <UserPlus size={20} /> Add Shopkeeper
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input type="text" placeholder="Search shopkeepers..." className="form-control" style={{ paddingLeft: '40px', background: '#f8fafc' }} />
                    </div>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold' }}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: '600' }}>{u.username}</span>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className="badge badge-success">Active</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '8px', color: '#ef4444', borderColor: '#fee2e2' }}
                                            onClick={() => handleDelete(u._id, u.username)}
                                            title="Remove Shopkeeper"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                        <Users size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                        <div>No shopkeepers registered yet.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
                        <h2 style={{ marginBottom: '32px' }}>Add New Shopkeeper</h2>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#ef4444', fontSize: '0.9rem' }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>Username</label>
                                <input className="form-control" name="username" value={formData.username} onChange={handleInputChange} required autoComplete="off" />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>Email Address</label>
                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required autoComplete="off" />
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>Password</label>
                                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} required autoComplete="new-password" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }}>Add Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shopkeepers;

