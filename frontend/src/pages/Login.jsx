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
                        width: '70px', 
                        height: '70px', 
                        background: 'white', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 20px',
                        boxShadow: '0 10px 25px rgba(0, 201, 177, 0.2)'
                    }}>
                        <ShieldCheck size={36} color="#00c9b1" />
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

                    {selectedRole !== 'admin' && (
                        <div style={{ textAlign: 'right', marginBottom: '32px' }}>
                            {(selectedRole === 'shopkeeper' || selectedRole === 'supplier') ? (
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Please contact to admin</span>
                            ) : (
                                <a href="#" style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
                            )}
                        </div>
                    )}

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

                {(selectedRole === 'supplier' || !selectedRole) && (
                    <div style={{ marginTop: '32px', color: '#64748b', fontSize: '0.95rem' }}>
                        {selectedRole === 'supplier' ? 'New Supplier?' : 'New Merchant?'} <Link to="/signup" style={{ color: '#00c9b1', fontWeight: '700', textDecoration: 'none' }}>Register here</Link>
                    </div>
                )}
            </div>

            {/* Footer Style (Matching User Screenshot) */}
            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                &copy; 2026 Qubix Billing System. Enterprise Edition.
            </div>
        </div>
    );
};

export default Login;
