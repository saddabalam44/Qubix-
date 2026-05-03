import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { IndianRupee, Trash2, Eraser, Search, Calendar, Filter, FileText, ArrowDownLeft, Receipt } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SalesHistory = () => {
    const { user } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

    const fetchSales = async () => {
        try {
            const res = await axios.get('/api/sales');
            setSales(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching sales history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sale record? This action cannot be undone.")) {
            return;
        }
        try {
            await axios.delete(`/api/sales/${id}`);
            setSales(sales.filter(s => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete sale record");
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("CRITICAL WARNING: This will PERMANENTLY delete ALL sales records. Continue?")) {
            return;
        }
        try {
            await axios.delete('/api/sales');
            setSales([]);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to clear sales history");
        }
    };

    const handleExportCSV = () => {
        if (sales.length === 0) return alert("No data to export");
        
        const headers = ["Date", "Order ID", "Customer", "Seller", "Items", "Total Price"];
        const csvRows = [
            headers.join(','),
            ...filteredSales.map(sale => [
                new Date(sale.date).toLocaleDateString(),
                sale._id,
                sale.customerName || 'Walk-in',
                sale.user?.username || 'System',
                sale.items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
                sale.totalPrice
            ].map(val => `"${val}"`).join(','))
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Qubix_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Filtering logic for search and date ranges
    
    const filteredSales = sales.filter(s => {
        const matchesSearch = (s.customerName || 'Walk-in').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             s._id.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        const saleDate = new Date(s.date);
        const today = new Date();
        
        if (dateFilter === 'today') {
            return saleDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return saleDate >= weekAgo;
        } else if (dateFilter === 'month') {
            return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
        }
        
        return true;
    });

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading transaction ledger...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
                        Financial <span style={{ color: 'var(--primary-color)' }}>Ledger</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {user?.role === 'admin' ? 'Auditing global transactions and revenue streams.' : 'Reviewing your personal sales performance.'}
                    </p>
                </div>

                <div className="card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '14px', color: '#059669' }}>
                        <IndianRupee size={28} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {user?.role === 'admin' ? 'Global Revenue' : 'Total Sales'}
                        </p>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>₹{totalRevenue.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ position: 'relative', width: '360px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Customer or Transaction ID..." 
                        style={{ width: '100%', padding: '12px 14px 12px 46px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {user?.role === 'admin' && sales.length > 0 && (
                        <button 
                            onClick={handleClearHistory}
                            className="btn btn-outline"
                            style={{ color: '#ef4444', borderColor: '#fee2e2', borderRadius: '10px' }}
                        >
                            <Eraser size={18} /> Purge All Records
                        </button>
                    )}
                    <button className="btn btn-outline" style={{ borderRadius: '10px', position: 'relative' }}>
                        <Calendar size={18} /> 
                        <select 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">This Month</option>
                        </select>
                    </button>
                    <button className="btn btn-primary" style={{ background: '#0f172a', borderRadius: '10px' }} onClick={handleExportCSV}>
                        <FileText size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfdfe' }}>
                                <th style={{ paddingLeft: '32px' }}>Timestamp & Order ID</th>
                                <th>Customer / Sales Associate</th>
                                <th>Transaction Manifest</th>
                                <th>Settlement</th>
                                <th style={{ paddingRight: '32px', textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ paddingLeft: '32px', paddingBlock: '20px' }}>
                                        <div style={{ fontWeight: '800', color: '#1e293b' }}>{new Date(sale.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>#{sale._id.slice(-8).toUpperCase()} • {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>
                                                {(sale.customerName || 'W').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{sale.customerName || 'Walk-in Customer'}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: '800' }}>
                                                    By: {sale.user?.username || 'Associate'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {sale.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                                                    <span style={{ color: '#94a3b8' }}>{item.quantity}x</span> {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#0f172a' }}>₹{sale.totalPrice.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '800' }}>SUCCESSFUL</div>
                                    </td>
                                    <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-outline" style={{ padding: '8px', borderRadius: '8px' }} title="View Receipt">
                                                <Receipt size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(sale._id)}
                                                className="btn btn-outline"
                                                style={{ padding: '8px', borderRadius: '8px', color: '#ef4444', borderColor: '#fee2e2' }}
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                                        <Receipt size={64} style={{ margin: '0 auto 20px', opacity: 0.1 }} />
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No transaction records found.</div>
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

export default SalesHistory;

