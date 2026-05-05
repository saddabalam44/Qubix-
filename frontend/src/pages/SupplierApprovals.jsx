import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Clock, Building2, Mail, Search, ShieldCheck } from 'lucide-react';

const SupplierApprovals = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const res = await axios.get('/api/auth/pending-suppliers', {
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
        fetchPending();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            if (status === 'active') {
                const res = await axios.put(`/api/auth/approve-supplier/${id}`, {}, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                alert(`Supplier approved! Auto-generated Password: ${res.data.sharedPassword}\nPlease share this with: ${res.data.email}`);
            } else {
                await axios.put(`/api/auth/supplier-status/${id}`, { status }, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
            }
            fetchPending();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating supplier status');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading requests...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
                        Supplier <span style={{ color: 'var(--primary-color)' }}>Approvals</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Review and approve new supplier partner registrations.
                    </p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfdfe' }}>
                                <th style={{ paddingLeft: '32px' }}>New Supplier</th>
                                <th>Enterprise / Company</th>
                                <th>Status</th>
                                <th style={{ paddingRight: '32px', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ paddingLeft: '32px', paddingBlock: '20px' }}>
                                        <div style={{ fontWeight: '800', color: '#1e293b' }}>{u.username}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                            <Mail size={12} /> {u.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '600' }}>
                                            <Building2 size={16} style={{ color: '#94a3b8' }} />
                                            {u.companyName || 'Unknown Entity'}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ background: '#fffbeb', color: '#b45309', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                                            <Clock size={12} /> PENDING
                                        </span>
                                    </td>
                                    <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ padding: '8px 16px', borderRadius: '10px', background: '#059669', borderColor: '#059669' }}
                                                onClick={() => handleStatusUpdate(u._id, 'active')}
                                            >
                                                <UserCheck size={18} /> Approve
                                            </button>
                                            <button 
                                                className="btn btn-outline" 
                                                style={{ padding: '8px 16px', borderRadius: '10px', color: '#ef4444', borderColor: '#fee2e2' }}
                                                onClick={() => handleStatusUpdate(u._id, 'rejected')}
                                            >
                                                <UserX size={18} /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                                        <ShieldCheck size={64} style={{ margin: '0 auto 20px', opacity: 0.1 }} />
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No pending requests.</div>
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

export default SupplierApprovals;

