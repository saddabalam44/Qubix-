import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Package, Truck, IndianRupee, PlusCircle, Filter, Search, Box, CreditCard, ArrowUpRight, BarChart3, AlertTriangle, FileText, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SupplierDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalProducts: 0, pendingOrders: 0, completedOrders: 0, totalEarnings: 0, pendingBalance: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerFormData, setRegisterFormData] = useState({ name: '', price: '', stock: '', lowStockThreshold: '5' });
    const [imageFile, setImageFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSupplierData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const [statsRes, productsRes, ordersRes] = await Promise.all([
                axios.get('/api/supplier/stats', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/supplier/products', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/supplier/orders', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Error fetching supplier data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplierData();
    }, []);



    const handleUpdateStatus = async (orderId, status) => {
        try {
            await axios.put(`/api/supplier/order/${orderId}/delivery`, { status }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            alert(`Order status updated to ${status}`);
            fetchSupplierData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const handleApproveDemand = async (orderId) => {
        try {
            await axios.put(`/api/supplier/demand/${orderId}/approve`, {}, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            alert("Demand approved! Requested 30% advance from Admin.");
            fetchSupplierData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving demand');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', registerFormData.name);
        data.append('price', registerFormData.price);
        data.append('stock', registerFormData.stock);
        data.append('lowStockThreshold', registerFormData.lowStockThreshold);
        data.append('supplierId', user._id); // Auto-assign to current supplier
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const token = sessionStorage.getItem('token');
            await axios.post('/api/products', data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setShowRegisterModal(false);
            setRegisterFormData({ name: '', price: '', stock: '', lowStockThreshold: '5' });
            setImageFile(null);
            alert("New SKU registered successfully!");
            fetchSupplierData();
        } catch (err) {
            alert('Error registering SKU: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
                        Supplier <span style={{ color: 'var(--primary-color)' }}>Portal</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Manage your products and orders. Welcome back, {user?.username}.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn btn-outline" style={{ background: 'white', borderRadius: '14px', borderColor: '#e2e8f0' }} onClick={() => document.getElementById('supplierSearch').focus()}>
                        <Filter size={18} /> Filter Catalog
                    </button>
                    <button className="btn btn-primary" style={{ background: '#0f172a', color: 'white', borderRadius: '14px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }} onClick={() => setShowRegisterModal(true)}>
                        <PlusCircle size={20} /> Register New SKU
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="card" style={{ padding: '28px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#fffbeb', color: '#b45309' }}>
                            <IndianRupee size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        TOTAL EARNINGS
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        ₹{stats.totalEarnings?.toLocaleString() || '0'}
                    </h2>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#f0f9ff', color: '#0369a1' }}>
                            <Box size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        TOTAL SKUs
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        {stats.totalProducts || 0}
                    </h2>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#ecfdf5', color: '#047857' }}>
                            <Truck size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        FULFILLED ORDERS
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        {stats.completedOrders || 0}
                    </h2>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#fef2f2', color: '#b91c1c' }}>
                            <IndianRupee size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        PENDING BALANCE
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#b91c1c' }}>
                        ₹{stats.pendingBalance?.toLocaleString() || '0'}
                    </h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>My <span style={{ color: 'var(--primary-color)' }}>Products</span></h3>
                        <div style={{ position: 'relative', width: '240px' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                            <input 
                                id="supplierSearch"
                                type="text" 
                                placeholder="Search inventory..." 
                                style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem' }} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fcfdfe' }}>
                                    <th style={{ paddingLeft: '32px' }}>Product Details</th>
                                    <th>Unit Price</th>
                                    <th>Stock</th>
                                    <th style={{ paddingRight: '32px', textAlign: 'right' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ paddingLeft: '32px', paddingBlock: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f1f5f9', overflow: 'hidden' }}>
                                                    {p.image ? <img src={`${import.meta.env.VITE_API_URL || ''}${p.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} style={{ margin: '12px', color: '#94a3b8' }} />}
                                                </div>
                                                <span style={{ fontWeight: '700', color: '#1e293b' }}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>₹{p.price.toLocaleString()}</td>
                                        <td>
                                            <span style={{ fontWeight: '600', color: p.stock <= (p.lowStockThreshold || 5) ? '#dc2626' : '#475569' }}>
                                                {p.stock} Units
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: '700', 
                                                color: '#059669',
                                                background: '#ecfdf5',
                                                padding: '6px 12px',
                                                borderRadius: '8px'
                                            }}>
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Orders Queue */}
                <div className="card" style={{ padding: '28px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: '800' }}>Recent Orders</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
                                <p>No pending orders.</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order._id} style={{ 
                                    padding: '20px', 
                                    background: order.status === 'Demand' ? 'rgba(245, 158, 11, 0.05)' : '#f8fafc', 
                                    borderRadius: '16px', 
                                    border: `1px solid ${order.status === 'Demand' ? '#f59e0b' : '#e2e8f0'}`,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            fontWeight: '700', 
                                            color: order.status === 'Completed' ? '#059669' : (order.status === 'Demand' ? '#b45309' : '#6366f1') 
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800' }}>{order.productName}</h4>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#64748b' }}>Paid:</span>
                                        <span style={{ fontWeight: '700', color: '#059669' }}>₹{order.paidAmount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '16px' }}>
                                        <span style={{ color: '#64748b' }}>Remaining:</span>
                                        <span style={{ fontWeight: '700', color: '#b91c1c' }}>₹{order.balanceAmount.toLocaleString()}</span>
                                    </div>
                                    
                                    {order.status === 'Demand' && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => handleApproveDemand(order._id)}
                                            style={{ width: '100%', borderRadius: '10px', background: '#f59e0b', padding: '10px', fontWeight: '800', border: 'none', color: 'white' }}
                                        >
                                            Approve & Request 30%
                                        </button>
                                    )}

                                    {order.status === 'Processing' && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => handleUpdateStatus(order._id, 'In Transit')}
                                            style={{ width: '100%', borderRadius: '10px', background: '#6366f1', padding: '10px', fontWeight: '800', border: 'none', color: 'white' }}
                                        >
                                            Mark as In-Transit
                                        </button>
                                    )}

                                    {order.status === 'In Transit' && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                            style={{ width: '100%', borderRadius: '10px', background: '#10b981', padding: '10px', fontWeight: '800', border: 'none', color: 'white' }}
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}

                                    {order.status === 'Awaiting Advance' && (
                                        <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                                            Waiting for 30% Advance...
                                        </div>
                                    )}

                                    {order.status === 'Delivered' && (
                                        <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                                            Waiting for 40% Mid-Payment...
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Register New SKU Modal */}
            {showRegisterModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>Register <span style={{ color: 'var(--primary-color)' }}>New SKU</span></h2>
                        
                        <form onSubmit={handleRegisterSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>Product Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g. Dell Latitude 5420"
                                    value={registerFormData.name}
                                    onChange={e => setRegisterFormData({...registerFormData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>Unit Price (₹)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={registerFormData.price}
                                        onChange={e => setRegisterFormData({...registerFormData, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>Initial Stock</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={registerFormData.stock}
                                        onChange={e => setRegisterFormData({...registerFormData, stock: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>Product Image</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    onChange={e => setImageFile(e.target.files[0])}
                                    accept="image/*"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Product</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRegisterModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDashboard;
