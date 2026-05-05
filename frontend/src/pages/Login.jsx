import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogIn, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = ({ role: propRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRole = propRole || location.state?.role || null;

    const redirectUser = (userData) => {
        if (!userData) return;
        switch (userData.role) {
            case 'admin':
                navigate('/dashboard', { replace: true });
                break;
            case 'shopkeeper':
                navigate('/billing', { replace: true });
                break;
            case 'supplier':
                navigate('/supplier-dashboard', { replace: true });
                break;
            default:
                navigate('/', { replace: true });
        }
    };


    useEffect(() => {
        if (user) {
            redirectUser(user);
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (result.success) {
            const userData = JSON.parse(sessionStorage.getItem('user'));


            if (selectedRole && userData.role !== selectedRole) {
                logout();
                setError(`This account does not have ${selectedRole} privileges. Please use the correct credentials.`);
                setLoading(false);
                return;
            }

            redirectUser(userData);
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#e0f7f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px'
        }}>
            <div style={{ position: 'fixed', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,201,177,0.15) 0%, rgba(0,201,177,0) 70%)', borderRadius: '50%', zIndex: 0 }}></div>

            <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(0, 201, 177, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 201, 177, 0.15)' }}>
                <Link to="/" style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '700'
                }}>
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Portal
                </Link>

                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'white',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 15px 35px rgba(0, 201, 177, 0.15)',
                        padding: '10px'
                    }}>
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
                    <h1 style={{ margin: 0, fontSize: '2.25rem', color: '#0f172a' }}>
                        {selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login` : 'Sign In'}
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem', fontWeight: 500 }}>
                        {selectedRole ? `Access the ${selectedRole} portal` : 'Access your Qubix account'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        border: '1px solid #fee2e2'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: '48px', height: '56px', background: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: '48px', height: '56px', background: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '32px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                            Forgot your password? Please contact to admin
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', height: '56px', fontSize: '1.1rem', borderRadius: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Login <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {selectedRole === 'supplier' && (
                    <div style={{ marginTop: '32px', color: '#64748b', fontSize: '0.95rem' }}>
                        New Supplier? <Link to="/signup" style={{ color: '#00c9b1', fontWeight: '700', textDecoration: 'none' }}>Register here</Link>
                    </div>
                )}
            </div>

            {/* Footer Style (Matching User Screenshot) */}
            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                &copy; 2026 Qubix Advance. Smart Billing for Modern Growth.
            </div>
        </div>
    );
};

export default Login;
