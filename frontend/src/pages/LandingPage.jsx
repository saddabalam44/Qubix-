import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingBag, Truck, ArrowRight, Zap, Globe, Lock, User, LogOut, Mail, Key, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();


    React.useEffect(() => {
        if (user) {
            navigate(getDashboardPath(user.role), { replace: true });
        }
    }, [user, navigate]);

    const portals = [
        {
            title: "Executive Admin",
            desc: "Full system control, financial auditing, and staff management.",
            icon: <ShieldCheck size={32} />,
            color: "#0f172a",
            path: "/login",
            role: "admin"
        },
        {
            title: "Retail Associate",
            desc: "Terminal operations, quick billing, and customer management.",
            icon: <ShoppingBag size={32} />,
            color: "#0d9488",
            path: "/login",
            role: "shopkeeper"
        },
        {
            title: "Merchant Partner",
            desc: "Inventory fulfillment, supply chain tracking, and SKU management.",
            icon: <Truck size={32} />,
            color: "#0891b2",
            path: "/login",
            role: "supplier"
        }
    ];

    const getDashboardPath = (role) => {
        switch (role) {
            case 'admin': return '/dashboard';
            case 'shopkeeper': return '/billing';
            case 'supplier': return '/supplier-dashboard';
            default: return '/login';
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#f8fafc', 
            display: 'flex', 
            flexDirection: 'column',
            overflowX: 'hidden'
        }}>
            <nav style={{ 
                height: '80px', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0 5%',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#00c9b1', color: 'white', padding: '10px', borderRadius: '14px' }}>
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.025em', color: '#0f172a' }}>
                        QUBIX <span style={{ color: '#00c9b1' }}>ADVANCE</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginRight: '12px' }}>
                                <User size={18} /> {user.username}
                            </div>
                            <Link to={getDashboardPath(user.role)} className="btn btn-primary" style={{ borderRadius: '12px', padding: '10px 24px' }}>Go to Dashboard</Link>
                            <button onClick={logout} className="btn btn-outline" style={{ border: 'none', color: '#ef4444', fontWeight: '600' }}>
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline" style={{ border: 'none', fontWeight: '600' }}>Login</Link>
                            <Link to="/signup" className="btn btn-primary" style={{ borderRadius: '12px', padding: '10px 24px' }}>Register Merchant</Link>
                        </>
                    )}
                </div>
            </nav>

            <main style={{ 
                flex: 1, paddingTop: '140px', paddingBottom: '80px' }}>
                <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: '#e0f2f1', 
                        color: '#00897b', 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        fontSize: '0.875rem', 
                        fontWeight: '700',
                        marginBottom: '24px'
                    }}>
                        <Globe size={16} /> Enterprise Grade Billing Infrastructure
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.05em' }}>
                        Advance <span style={{ color: '#00c9b1' }}>Billing</span> & <br />
                        <span style={{ color: '#00c9b1' }}>Inventory</span> Management.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: '1.6', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
                        Experience the next generation of Advance Billing and Inventory Management. A unified ecosystem designed for administrators, retail associates, and merchant partners.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {portals.map((portal, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => navigate('/login', { state: { role: portal.role } })}
                                style={{ textDecoration: 'none', textAlign: 'left', cursor: 'pointer' }}
                                className="role-card-wrapper"
                            >
                                <div className="card" style={{ 
                                    padding: '40px', 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'white',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        width: '64px', 
                                        height: '64px', 
                                        background: portal.color, 
                                        color: 'white', 
                                        borderRadius: '20px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        marginBottom: '32px',
                                        boxShadow: `0 10px 20px ${portal.color}33`
                                    }}>
                                        {portal.icon}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#0f172a' }}>{portal.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5', flex: 1, marginBottom: '24px' }}>{portal.desc}</p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: portal.color, fontWeight: '700', fontSize: '0.95rem' }}>
                                        {user?.role === portal.role ? 'Enter Dashboard' : 'Access Portal'} <ArrowRight size={18} />
                                    </div>

                                    {/* Decorative background element */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: '-20px', 
                                        right: '-20px', 
                                        opacity: 0.03, 
                                        transform: 'rotate(-15deg)'
                                    }}>
                                        {portal.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ 
                padding: '40px 5%', 
                background: 'white', 
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>
                    &copy; 2026 Qubix Advance Billing System. Developed for Enterprise Scalability.
                </div>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                        <Lock size={14} /> 256-bit AES Encryption
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                .role-card-wrapper:hover .card {
                    transform: translateY(-12px);
                    border-color: #00c9b1;
                    box-shadow: 0 20px 40px rgba(0, 201, 177, 0.1);
                }
                .role-card-wrapper:active .card {
                    transform: translateY(-4px);
                }
            `}} />
        </div>
    );
};

export default LandingPage;
