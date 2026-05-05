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
            title: "Supplier Partner",
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
                height: '90px', 
                background: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(20px)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0 8%',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                            {/* The Q Shape */}
                            <path d="M165 145C150 175 100 185 65 170C30 155 15 110 30 75C45 40 90 25 125 40C155 52 170 85 165 115" stroke="#0f172a" strokeWidth="18" strokeLinecap="round"/>
                            <path d="M150 160L180 190" stroke="#0f172a" strokeWidth="18" strokeLinecap="round"/>
                            
                            {/* The Growth Bars */}
                            <rect x="60" y="110" width="12" height="35" rx="4" fill="#00c9b1" />
                            <rect x="85" y="95" width="12" height="50" rx="4" fill="#00c9b1" />
                            <rect x="110" y="80" width="12" height="65" rx="4" fill="#00c9b1" />
                            
                            {/* The Rising Arrow */}
                            <path d="M50 135L100 85L130 105L180 40" stroke="#00c9b1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M180 40L155 42M180 40L178 65" stroke="#00c9b1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                            
                            {/* Sync Circle Icon */}
                            <circle cx="155" cy="145" r="22" fill="#0f172a" stroke="white" strokeWidth="4"/>
                            <path d="M145 145C145 139.477 149.477 135 155 135C160.523 135 165 139.477 165 145C165 150.523 160.523 155 155 155" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                            <path d="M140 145L145 140M140 145L145 150" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.04em' }}>QUBIX</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: '950', color: '#00c9b1', letterSpacing: '-0.04em' }}>ADVANCE</span>
                    </div>
                </div>
                {/* Header buttons removed as requested for a clean design */}
            </nav>

            <main style={{
                flex: 1,
                paddingTop: '160px',
                paddingBottom: '100px',
                background: 'radial-gradient(circle at top right, #f0fdfa 0%, #ffffff 50%, #f8fafc 100%)'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
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
                        <ShieldCheck size={16} /> Reliable Billing & Smart Inventory
                    </div>
                    <h1 style={{
                        fontSize: '4.5rem',
                        fontWeight: '900',
                        color: '#0f172a',
                        lineHeight: '1.1',
                        marginBottom: '24px',
                        letterSpacing: '-0.05em'
                    }}>
                        Advance <span style={{ background: 'linear-gradient(135deg, #00c9b1 0%, #00897b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Billing</span> & <br />
                        <span style={{ background: 'linear-gradient(135deg, #00c9b1 0%, #00897b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Inventory</span> Management.
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', lineHeight: '1.6', marginBottom: '60px', maxWidth: '750px', margin: '0 auto 60px', fontWeight: '500' }}>
                        The complete ecosystem for modern commerce. Unified tools for administrators, retail teams, and supplier partners.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
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
                                    border: '1px solid rgba(226, 232, 240, 0.8)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '32px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 20px -10px rgba(0, 201, 177, 0.05)'
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
                    &copy; 2026 Qubix Advance. Smart Billing for Modern Growth.
                </div>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    {/* Security note removed as requested */}
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .role-card-wrapper:hover .card {
                    transform: translateY(-16px);
                    border-color: #00c9b1;
                    box-shadow: 0 40px 80px -20px rgba(0, 201, 177, 0.2), 0 20px 40px -15px rgba(0, 0, 0, 0.1);
                }
                .role-card-wrapper:active .card {
                    transform: translateY(-4px);
                }
            `}} />
        </div>
    );
};

export default LandingPage;
