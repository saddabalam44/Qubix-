import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users, Trash2, Mail, Building2, Search, Filter } from 'lucide-react';

const Suppliers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/users?role=supplier', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleDelete = async (id, username) => {
        if (window.confirm(`Are you sure you want to remove supplier "${username}"?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/${id}`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                fetchSuppliers();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting supplier');
            }
        }
    };

    const filteredSuppliers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Consulting merchant registry...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
                        Merchant <span style={{ color: 'var(--primary-color)' }}>Network</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Oversee and manage active enterprise partners supplying your catalog.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input 
                            type="text" 
                            placeholder="Find merchant..." 
                            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Merchant Table Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfdfe' }}>
                                <th style={{ paddingLeft: '32px' }}>Merchant Identity</th>
                                <th>Enterprise / Company</th>
                                <th>Communication Channel</th>
                                <th style={{ paddingRight: '32px', textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ paddingLeft: '32px', paddingBlock: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '12px', 
                                                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: 'white', 
                                                fontSize: '1rem', 
                                                fontWeight: '800',
                                                boxShadow: '0 4px 10px rgba(0, 201, 177, 0.2)'
                                            }}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{u.username}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--primary-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Supplier</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                                            <div style={{ background: '#f0fdfa', padding: '6px', borderRadius: '8px', color: 'var(--primary-color)' }}>
                                                <Building2 size={16} />
                                            </div>
                                            {u.companyName || 'Not Disclosed'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                                            <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px', color: '#64748b' }}>
                                                <Mail size={16} />
                                            </div>
                                            {u.email}
                                        </div>
                                    </td>
                                    <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '8px', borderRadius: '10px', color: '#ef4444', borderColor: '#fee2e2' }}
                                            onClick={() => handleDelete(u._id, u.username)}
                                            title="Revoke Merchant Access"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                                        <Users size={64} style={{ margin: '0 auto 20px', opacity: 0.1 }} />
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No active merchant partners found.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;

