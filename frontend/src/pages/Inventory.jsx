import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus, ShoppingBag, Search, Filter, Image as ImageIcon, Package, IndianRupee, CreditCard } from 'lucide-react';
import { generateSupplierInvoice } from '../utils/supplierPdfGenerator';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', lowStockThreshold: '', supplierId: '' });
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    const [orderModal, setOrderModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);

    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin';

    // Fetch products and active purchase orders

    const fetchProducts = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(Array.isArray(res.data) ? res.data : []);

            if (isAdmin) {
                const ordersRes = await axios.get('/api/supplier/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPurchaseOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('/api/auth/users?role=supplier', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setSuppliers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching suppliers:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
    }, []);

    // Form handlers

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('lowStockThreshold', formData.lowStockThreshold);
        if (formData.supplierId) {
            data.append('supplierId', formData.supplierId);
        }
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingId) {
                await axios.put(`/api/products/${editingId}`, data);
            } else {
                await axios.post('/api/products', data);
            }
            setShowModal(false);
            setFormData({ name: '', price: '', stock: '', lowStockThreshold: '', supplierId: '' });
            setImageFile(null);
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            alert('Error saving product: ' + (err.response?.data?.message || err.message));
        }
    };

    const openEditModal = (product) => {
        setFormData({ name: product.name, price: product.price, stock: product.stock, lowStockThreshold: product.lowStockThreshold, supplierId: product.supplierId || '' });
        setImageFile(null);
        setEditingId(product._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/api/products/${id}`);
                fetchProducts();
            } catch (err) {
                alert('Error deleting product: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const getStatusBadge = (stock, threshold) => {
        const t = threshold || 5;
        if (stock === 0) return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>OUT OF STOCK</span>;
        if (stock <= t) return <span style={{ background: '#fffbeb', color: '#d97706', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>LOW STOCK ({stock})</span>;
        return <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>OPTIMAL ({stock})</span>;
    };

    const handleOrderStock = (product) => {
        setSelectedProduct(product);
        setOrderQuantity(1);
        setOrderModal(true);
    };

    const handlePayStage = async (order, isCash = false) => {
        let stageAmount = 0;
        let stageLabel = "";

        if (order.status === 'Awaiting Advance') {
            stageAmount = order.totalAmount * 0.3;
            stageLabel = "30% Advance";
        } else if (order.status === 'Delivered') {
            stageAmount = order.totalAmount * 0.4;
            stageLabel = "40% Mid-Payment";
        } else if (order.status === 'Partially Paid') {
            stageAmount = order.balanceAmount;
            stageLabel = "Final 30% Payment";
        }

        if (isCash) {
            if (!window.confirm(`Confirm cash payment of ₹${stageAmount.toLocaleString()} for ${stageLabel}?`)) return;
            setIsProcessingPayment(true);
            try {
                const token = sessionStorage.getItem('token');
                await axios.post('/api/supplier/purchase/pay-stage', {
                    orderId: order._id,
                    isCash: true
                }, { headers: { Authorization: `Bearer ${token}` } });
                alert(`${stageLabel} confirmed!`);
                fetchProducts();
            } catch (err) {
                alert("Payment failed: " + (err.response?.data?.message || err.message));
            } finally {
                setIsProcessingPayment(false);
            }
        } else {
            setIsProcessingPayment(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const orderRes = await axios.post('/api/payment/order', { amount: stageAmount }, { headers });
                const { id: rzp_order_id, currency, amount } = orderRes.data;

                const options = {
                    key: "rzp_test_SZ3nPRfCb0Nmy6",
                    amount: amount,
                    currency: currency,
                    name: "Supplier Staged Payment",
                    description: `${stageLabel} for ${order.productName}`,
                    order_id: rzp_order_id,
                    handler: async (response) => {
                        try {
                            await axios.post('/api/supplier/purchase/pay-stage', {
                                orderId: order._id,
                                razorpayPaymentId: response.razorpay_payment_id
                            }, { headers });

                            alert(`${stageLabel} successful!`);
                            fetchProducts();
                        } catch (err) {
                            alert("Verification failed: " + (err.response?.data?.message || err.message));
                        } finally {
                            setIsProcessingPayment(false);
                        }
                    },
                    prefill: { name: currentUser.username || "Admin" },
                    theme: { color: "#6366f1" },
                    modal: { ondismiss: () => setIsProcessingPayment(false) }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                alert("Payment failed: " + (err.response?.data?.message || err.message));
                setIsProcessingPayment(false);
            }
        }
    };

    const handleClearPipeline = async () => {
        if (!window.confirm("Danger: This will delete ALL active replenishment requests. Proceed?")) return;
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete('/api/supplier/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Replenishment Pipeline cleared.");
            fetchProducts();
        } catch (err) {
            alert("Failed to clear pipeline: " + (err.response?.data?.message || err.message));
        }
    };

    const sendDemandToSupplier = async () => {
        if (!selectedProduct || orderQuantity <= 0) return;
        setIsProcessingPayment(true);

        try {
            const token = sessionStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await axios.post('/api/supplier/demand', {
                productId: selectedProduct._id,
                quantity: orderQuantity
            }, { headers });

            alert("Demand sent to supplier! They will review and approve it shortly.");
            setOrderModal(false);
            fetchProducts();
        } catch (err) {
            alert("Failed to send demand: " + (err.response?.data?.message || err.message));
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Auditing inventory...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
                        Inventory <span style={{ color: 'var(--primary-color)' }}>Core</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Manage your global SKU catalog, tracking levels and replenishment streams.
                    </p>
                </div>
                <button className="btn btn-primary" style={{ borderRadius: '14px', background: '#0f172a' }} onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', price: '', stock: '', lowStockThreshold: 5, supplierId: '' });
                    setImageFile(null);
                    setShowModal(true);
                }}>
                    <Plus size={20} /> Register New Product
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Find specific SKU..."
                            style={{ width: '100%', padding: '12px 14px 12px 46px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-outline" style={{ borderRadius: '10px', fontSize: '0.85rem' }}>
                            <Filter size={16} /> All Categories
                        </button>
                    </div>
                </div>

                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfdfe' }}>
                                <th style={{ paddingLeft: '32px' }}>SKU Definition</th>
                                <th>Unit Price</th>
                                <th>Logistics Status</th>
                                <th style={{ paddingRight: '32px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ paddingLeft: '32px', paddingBlock: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '12px',
                                                background: '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #f1f5f9',
                                                overflow: 'hidden'
                                            }}>
                                                {p.image ? (
                                                    <img src={`${import.meta.env.VITE_API_URL || ''}${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                                ) : (
                                                    <ImageIcon size={24} style={{ color: '#cbd5e1' }} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>#{p._id.slice(-8).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '700', color: '#1e293b' }}>₹{p.price.toLocaleString()}</td>
                                    <td>{getStatusBadge(p.stock, p.lowStockThreshold)}</td>
                                    <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-outline" style={{ padding: '8px', borderRadius: '10px' }} onClick={() => openEditModal(p)} title="Edit Definition">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-outline" style={{ padding: '8px', borderRadius: '10px', color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => handleDelete(p._id)} title="Purge Record">
                                                <Trash2 size={16} />
                                            </button>
                                            {isAdmin && p.supplierId && (
                                                <button className="btn btn-primary" style={{ padding: '8px', borderRadius: '10px', background: '#6366f1' }} onClick={() => handleOrderStock(p)} title="Initiate Replenishment">
                                                    <ShoppingBag size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                                        <Package size={64} style={{ margin: '0 auto 20px', opacity: 0.1 }} />
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No products found in system records.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAdmin && purchaseOrders.some(o => o.status !== 'Completed' && o.status !== 'Cancelled') && (
                <div style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Replenishment <span style={{ color: '#6366f1' }}>Pipeline</span></h2>
                        <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#fee2e2', borderRadius: '10px', fontSize: '0.75rem', padding: '6px 12px' }} onClick={handleClearPipeline}>
                            <Trash2 size={14} /> Clear All
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                        {purchaseOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map(order => (
                            <div key={order._id} style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        background: ['Processing', 'In Transit', 'Delivered'].includes(order.status) ? '#ecfdf5' : '#fffbeb',
                                        color: ['Processing', 'In Transit', 'Delivered'].includes(order.status) ? '#059669' : '#d97706'
                                    }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                </div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '800' }}>{order.productName}</h3>
                                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>Supplier: {order.supplierId?.companyName || order.supplierId?.username}</p>

                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Settlement:</span>
                                        <span style={{ fontWeight: '700' }}>₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>Paid:</span>
                                        <span style={{ fontWeight: '700', color: '#059669' }}>₹{order.paidAmount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '600' }}>Balance:</span>
                                        <span style={{ fontWeight: '800', color: '#dc2626' }}>₹{order.balanceAmount.toLocaleString()}</span>
                                    </div>
                                    {order.dueDate && (
                                        <div style={{ marginTop: '12px', padding: '8px', background: '#fff5f5', borderRadius: '8px', fontSize: '0.75rem', color: '#b91c1c', fontWeight: '700', textAlign: 'center' }}>
                                            Final Payment Due: {new Date(order.dueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {(['Awaiting Advance', 'Delivered', 'Partially Paid'].includes(order.status)) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handlePayStage(order)}
                                            disabled={isProcessingPayment}
                                            style={{ width: '100%', borderRadius: '12px', background: '#6366f1', padding: '12px', fontWeight: '800' }}
                                        >
                                            <CreditCard size={18} />
                                            {order.status === 'Awaiting Advance' ? ' Pay 30% Advance' :
                                                order.status === 'Delivered' ? ' Pay 40% Delivery' : ' Pay Final 30%'}
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => handlePayStage(order, true)}
                                            disabled={isProcessingPayment}
                                            style={{ width: '100%', borderRadius: '12px', padding: '12px', fontWeight: '800', borderColor: '#cbd5e1' }}
                                        >
                                            <IndianRupee size={18} /> Pay with Cash
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                                        {order.status === 'Demand' ? 'Awaiting Supplier Approval...' :
                                            order.status === 'Processing' ? 'Supplier is preparing stock...' :
                                                order.status === 'In Transit' ? 'Stock is out for delivery...' : 'Fulfillment Complete'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '40px' }}>
                        <h2 style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: '800' }}>{editingId ? 'Modify ' : 'Register '} SKU</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>Product Name</label>
                                <input className="form-control" name="name" value={formData.name} onChange={handleInputChange} required style={{ borderRadius: '10px' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>Media Representation</label>
                                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} style={{ borderRadius: '10px', padding: '10px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>Retail Price (₹)</label>
                                    <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleInputChange} required min="0" style={{ borderRadius: '10px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>In-Hand Units</label>
                                    <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" style={{ borderRadius: '10px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>Critical Threshold</label>
                                    <input type="number" className="form-control" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleInputChange} required min="0" style={{ borderRadius: '10px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>Assign Supplier</label>
                                    <select className="form-control" name="supplierId" value={formData.supplierId} onChange={handleInputChange} style={{ borderRadius: '10px' }}>
                                        <option value="">Internal Asset</option>
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s._id}>{s.username}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ borderRadius: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px', background: '#0f172a', paddingInline: '24px' }}>{editingId ? 'Update Record' : 'Create Record'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {orderModal && selectedProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
                        <h2 style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: '800' }}>Replenish Asset</h2>

                        <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                    <Package size={24} color="#6366f1" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '800', fontSize: '1rem' }}>{selectedProduct.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Current Density: {selectedProduct.stock} units</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.875rem', color: '#475569' }}>Replenishment Quantity</label>
                            <input
                                type="number"
                                className="form-control"
                                value={orderQuantity}
                                onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                disabled={isProcessingPayment}
                                style={{ borderRadius: '10px', padding: '14px' }}
                            />
                        </div>

                        {(() => {
                            const pricePerUnit = selectedProduct.wholesalePrice > 0 ? selectedProduct.wholesalePrice : selectedProduct.price;
                            const subTotal = pricePerUnit * orderQuantity;
                            const gstAmount = (subTotal * (selectedProduct.gstPercentage || 18)) / 100;
                            const grandTotal = subTotal + gstAmount;

                            return (
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748b' }}>Unit Value:</span>
                                        <span style={{ fontWeight: '700' }}>₹{pricePerUnit.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748b' }}>Cumulative Base:</span>
                                        <span style={{ fontWeight: '700' }}>₹{subTotal.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px', fontSize: '1.1rem', color: '#0f172a' }}>
                                        <span>Total Settlement:</span>
                                        <span>₹{grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })()}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={sendDemandToSupplier}
                                disabled={isProcessingPayment}
                                style={{ padding: '16px', borderRadius: '12px', background: '#0f172a', fontWeight: '800' }}
                            >
                                {isProcessingPayment ? 'Sending Demand...' : 'Send Demand Request'}
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setOrderModal(false)}
                                disabled={isProcessingPayment}
                                style={{ borderRadius: '12px', padding: '14px' }}
                            >
                                Abort Replenishment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;

