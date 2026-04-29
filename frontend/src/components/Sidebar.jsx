import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, History, LogOut, Users, Settings, HelpCircle, Bell, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const getDashboardPath = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/dashboard';
            case 'shopkeeper': return '/dashboard';
            case 'supplier': return '/supplier-dashboard';
            default: return '/dashboard';
        }
    };

    const allLinks = [
        { to: getDashboardPath(), icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'shopkeeper', 'supplier'] },
        { to: '/inventory', icon: <Package size={20} />, label: 'Inventory', roles: ['admin'] },
        { to: '/billing', icon: <Receipt size={20} />, label: 'Billing', roles: ['admin', 'shopkeeper'] },
        { to: '/history', icon: <History size={20} />, label: 'Sales History', roles: ['admin'] },
        { to: '/shopkeepers', icon: <Users size={20} />, label: 'Shopkeepers', roles: ['admin'] },
        { to: '/suppliers', icon: <Users size={20} />, label: 'Suppliers', roles: ['admin'] },
        { to: '/supplier-approvals', icon: <Users size={20} />, label: 'Supplier Approvals', roles: ['admin'] },
    ];

    const links = allLinks.filter(link => !link.roles || link.roles.includes(user?.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div style={{ padding: '32px 24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem' }}>
                    <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                        <Package size={24} />
                    </div>
                    <span>QUBIX <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.9rem' }}>MANAGEMENT</span></span>
                </h2>
            </div>

            <nav style={{ flex: 1, paddingTop: '8px' }}>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', margin: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>NEED HELP?</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>Check our documentation for advanced features.</p>
                <button className="btn btn-outline" style={{ width: '100%', background: 'white' }}>
                    View Guide
                </button>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', margin: 0, borderRadius: '12px' }}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

