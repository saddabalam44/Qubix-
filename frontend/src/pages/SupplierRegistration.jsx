import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Building2, Send, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const SupplierRegistration = () => {
    const [formData, setFormData] = useState({ username: '', email: '', companyName: '' });
    const [status, setStatus] = useState({ type: '', message: '' }); // type: 'success' | 'error'
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await axios.post('/api/auth/register-supplier', formData);
            setStatus({ type: 'success', message: res.data.message });
            setFormData({ username: '', email: '', companyName: '' });
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Error submitting registration' });
        } finally {
            setIsLoading(false);
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
            padding: '40px 20px'
        }}>
            <div className="animate-float" style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'linear-gradient(135deg, #00c9b1, #009688)', borderRadius: '50%', opacity: 0.8, filter: 'blur(2px)' }}></div>
            <div className="animate-float" style={{ position: 'absolute', top: '60%', right: '5%', width: '250px', height: '250px', background: 'linear-gradient(135deg, #00c9b1, #00bfa5)', borderRadius: '50%', opacity: 0.7, filter: 'blur(1px)', animationDelay: '1s' }}></div>
            <div className="animate-float" style={{ position: 'absolute', bottom: '-10%', left: '30%', width: '400px', height: '400px', background: 'linear-gradient(135deg, #00c9b1, #1de9b6)', borderRadius: '50%', opacity: 0.6, animationDelay: '2s' }}></div>
            <div className="animate-float" style={{ position: 'absolute', top: '5%', right: '25%', width: '180px', height: '180px', background: 'linear-gradient(135deg, #00c9b1, #00b29c)', borderRadius: '50%', opacity: 0.9, animationDelay: '0.5s' }}></div>

            <div className="glass-card" style={{ 
                width: '100%', 
                maxWidth: '540px', 
                padding: '50px 40px', 
                position: 'relative', 
                zIndex: 10,
                textAlign: 'center'
            }}>
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
                        Merchant <span style={{ color: '#00c9b1' }}>Onboarding</span>
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem', fontWeight: 500 }}>Join the Qubix Enterprise Network</p>
                </div>

                {status.message && (
                    <div style={{
                        background: status.type === 'success' ? '#f0fdfa' : '#fef2f2',
                        borderLeft: `4px solid ${status.type === 'success' ? '#00c9b1' : '#dc2626'}`,
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'left'
                    }}>
                        {status.type === 'success' ? <CheckCircle2 color="#00c9b1" size={20} /> : <AlertCircle color="#dc2626" size={20} />}
                        <span style={{ color: status.type === 'success' ? '#0f766e' : '#991b1b', fontWeight: '700', fontSize: '0.9rem' }}>
                            {status.message}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                placeholder="Representative Name"
                                style={{ paddingLeft: '48px', height: '56px', background: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <div style={{ position: 'relative' }}>
                            <Building2 style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="text"
                                className="form-control"
                                name="companyName"
                                placeholder="Enterprise / Company Name"
                                style={{ paddingLeft: '48px', height: '56px', background: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="Corporate Email Address"
                                style={{ paddingLeft: '48px', height: '56px', background: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ 
                        background: 'rgba(0, 201, 177, 0.05)', 
                        borderLeft: '4px solid #00c9b1', 
                        padding: '16px', 
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: '#0f766e',
                        lineHeight: '1.5',
                        textAlign: 'left',
                        fontWeight: '500'
                    }}>
                        <strong>Security Note:</strong> Credentials will be generated and shared upon administrative verification.
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', height: '56px', fontSize: '1.1rem', borderRadius: '16px', gap: '10px' }} 
                        disabled={isLoading || status.type === 'success'}
                    >
                        {isLoading ? 'Processing Request...' : <><Send size={20} /> Submit Application</>}
                    </button>
                </form>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(0, 201, 177, 0.1)' }}>
                    <Link to="/login" style={{ 
                        color: '#64748b', 
                        textDecoration: 'none', 
                        fontWeight: '700', 
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <ArrowLeft size={18} /> Already have credentials? <span style={{ color: '#00c9b1' }}>Login here</span>
                    </Link>
                </div>
            </div>
            
            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                &copy; 2026 Qubix Billing System. Enterprise Network.
            </div>
        </div>
    );
};

export default SupplierRegistration;

