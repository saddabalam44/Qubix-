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
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <div style={{ width: '40px', height: '40px' }}>
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                            <path d="M165 145C150 175 100 185 65 170C30 155 15 110 30 75C45 40 90 25 125 40C155 52 170 85 165 115" stroke="#0f172a" strokeWidth="18" strokeLinecap="round"/>
                            <path d="M150 160L180 190" stroke="#0f172a" strokeWidth="18" strokeLinecap="round"/>
                            <rect x="60" y="110" width="12" height="35" rx="4" fill="#00c9b1" />
                            <rect x="85" y="95" width="12" height="50" rx="4" fill="#00c9b1" />
                            <rect x="110" y="80" width="12" height="65" rx="4" fill="#00c9b1" />
                            <path d="M50 135L100 85L130 105L180 40" stroke="#00c9b1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M180 40L155 42M180 40L178 65" stroke="#00c9b1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="155" cy="145" r="22" fill="#0f172a" stroke="white" strokeWidth="4"/>
                            <path d="M145 145C145 139.477 149.477 135 155 135C160.523 135 165 139.477 165 145C165 150.523 160.523 155 155 155" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                            <path d="M140 145L145 140M140 145L145 150" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.02em' }}>QUBIX</span>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#00c9b1', letterSpacing: '-0.02em' }}>ADVANCE</span>
                    </div>
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

            {/* Help section removed as requested */}

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

