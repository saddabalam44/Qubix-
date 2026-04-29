import React, { useContext } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { AuthContext } from '../context/AuthContext';
import { Bell, User } from 'lucide-react';

const Layout = ({ children }) => {
    const { user } = useContext(AuthContext);

    return (
        <div className="app-container">
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                <header style={{ 
                    height: '80px', 
                    background: 'white', 
                    borderBottom: '1px solid var(--border-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0 40px',
                    zIndex: 10
                }}>
                    <div></div> {/* Spacer to keep right-side items aligned */}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <NotificationBell />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                    {user?.username || 'Administrator'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '800', textTransform: 'uppercase' }}>
                                    {user?.role === 'admin' ? 'SUPER ADMIN' : user?.role?.toUpperCase()}
                                </p>
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dbeafe' }}>
                                <User size={24} color="var(--primary-color)" />
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ padding: '40px', flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

