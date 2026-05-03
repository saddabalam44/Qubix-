import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, IndianRupee, AlertTriangle, TrendingUp, PlusCircle, Receipt, Users, Clock, ArrowUpRight, ArrowDownRight, FileText, ShoppingBag, PieChart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import SupplierDashboard from './SupplierDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const [productsRes, salesRes] = await Promise.all([
                    axios.get('/api/products'),
                    axios.get('/api/sales')
                ]);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
                setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
                
                if (user?.role === 'admin') {
                    const purchasesRes = await axios.get('/api/supplier/admin/orders', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPurchases(Array.isArray(purchasesRes.data) ? purchasesRes.data : []);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.role]);

    const isAdmin = user?.role === 'admin';
    const totalProducts = products.length;
    const today = new Date().toDateString();
    

    const relevantSales = sales; // Backend already filters this for non-admins
    const salesToday = relevantSales.filter(s => new Date(s.date).toDateString() === today);
    const revenueToday = salesToday.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalRevenue = relevantSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    

    const itemsSoldToday = salesToday.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const avgOrderValue = salesToday.length > 0 ? (revenueToday / salesToday.length) : 0;

    const totalProcurement = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 5));


    const itemSales = {};
    relevantSales.forEach(sale => {
        sale.items.forEach(item => {
            if (itemSales[item.name]) {
                itemSales[item.name] += item.quantity;
            } else {
                itemSales[item.name] = item.quantity;
            }
        });
    });

    const topMovingItems = Object.entries(itemSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

    const handleExport = () => {
        if (relevantSales.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ["Order ID", "Items Count", "Status", "Total Amount", "Date"];
        const rows = relevantSales.map(s => [
            `#QBX-${s._id.toString().slice(-6).toUpperCase()}`,
            s.items.reduce((acc, i) => acc + i.quantity, 0),
            "SETTLED",
            s.totalPrice,
            new Date(s.date).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Qubix_Operational_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Synchronizing your data...</div>;

    if (user?.role === 'supplier') {
        return <SupplierDashboard />;
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
                        {isAdmin ? 'System ' : 'Terminal '}
                        <span style={{ color: 'var(--primary-color)' }}>Insights</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Welcome back, {user?.username}. Here's what's happening {isAdmin ? 'across the business' : 'at your station'} today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    {isAdmin ? (
                        <button className="btn btn-outline" style={{ background: 'white', borderRadius: '14px' }} onClick={handleExport}>
                            <FileText size={18} /> Export Analytics
                        </button>
                    ) : (
                        <Link to="/billing" className="btn btn-primary" style={{ textDecoration: 'none', background: '#10b981', borderRadius: '14px' }}>
                            <PlusCircle size={20} /> Create New Sale
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#ccfbf1', color: '#0d9488' }}>
                            <IndianRupee size={24} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '6px 12px', borderRadius: '10px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#0d9488', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowUpRight size={14} /> 12.5%
                        </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        {isAdmin ? 'TOTAL REVENUE' : 'YOUR SALES TODAY'}
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        ₹{(isAdmin ? totalRevenue : revenueToday).toLocaleString()}
                    </h2>
                </div>
                <div className="card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#f0fdfa', color: 'var(--primary-color)' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '6px 12px', borderRadius: '10px', background: '#f8fafc', color: 'var(--primary-color)' }}>
                            {isAdmin ? products.length : salesToday.length} {isAdmin ? 'SKUs' : 'Bills'}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        {isAdmin ? 'STOCK DENSITY' : 'ITEMS SOLD TODAY'}
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        {isAdmin ? products.reduce((acc, p) => acc + (p.stock || 0), 0) : itemsSoldToday}
                    </h2>
                </div>
 
                <div className="card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: '#e0f2f1', color: '#00897b' }}>
                            {isAdmin ? <PieChart size={24} /> : <TrendingUp size={24} />}
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        {isAdmin ? 'PROCUREMENT COST' : 'AVG. ORDER VALUE'}
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        {isAdmin ? `₹${totalProcurement.toLocaleString()}` : `₹${Math.round(avgOrderValue).toLocaleString()}`}
                    </h2>
                </div>

                <div className="card" style={{ padding: '28px', border: lowStockProducts.length > 0 ? '1px solid #fecaca' : '1px solid var(--border-color)', background: lowStockProducts.length > 0 ? '#fffafa' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', background: lowStockProducts.length > 0 ? '#fee2e2' : '#f8fafc', color: lowStockProducts.length > 0 ? '#dc2626' : '#94a3b8' }}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        SYSTEM ALERTS
                    </p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: lowStockProducts.length > 0 ? '#dc2626' : '#1e293b' }}>
                        {lowStockProducts.length} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>Issues</span>
                    </h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Operational Stream</h3>
                        <Link to="/history" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Full History <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fcfdfe' }}>
                                    <th style={{ paddingLeft: '32px' }}>Order Identifier</th>
                                    <th>Volume</th>
                                    <th>Financial Status</th>
                                    <th style={{ paddingRight: '32px', textAlign: 'right' }}>Aggregate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantSales.slice(0, 6).map((sale) => (
                                    <tr key={sale._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ paddingLeft: '32px', paddingBlock: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>#QBX-{sale._id.toString().slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td>{sale.items.reduce((acc, i) => acc + i.quantity, 0)} Units</td>
                                        <td>
                                            <span style={{ background: '#f0fdfa', color: '#0d9488', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                SETTLED
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '32px', textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>
                                            ₹{sale.totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Analytics/Inventory */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Top Moving Items Progress */}
                    <div className="card" style={{ background: '#0f172a', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Top Moving Items</h3>
                            <TrendingUp size={18} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {topMovingItems.length > 0 ? topMovingItems.map((item, idx) => {
                                const maxQty = Math.max(...topMovingItems.map(i => i.quantity));
                                const percentage = (item.quantity / maxQty) * 100;
                                return (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#94a3b8' }}>{item.name}</span>
                                            <span style={{ fontWeight: '700' }}>{item.quantity} Sold</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${percentage}%`, 
                                                background: idx === 0 ? 'var(--primary-color)' : (idx === 1 ? '#0d9488' : '#0f766e'), 
                                                borderRadius: '10px',
                                                transition: 'width 1s ease-out'
                                            }}></div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                                    No sales recorded yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Low Stock Side Card */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '800' }}>Priority Restock</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {lowStockProducts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    All inventory levels optimal.
                                </div>
                            ) : (
                                lowStockProducts.slice(0, 4).map(p => (
                                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{p.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>Critical: {p.stock} units left</p>
                                        </div>
                                        {isAdmin && (
                                            <Link to="/inventory" style={{ padding: '8px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                                                <PlusCircle size={16} />
                                            </Link>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


