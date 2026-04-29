import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, CreditCard, Package, X } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/supplier/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/supplier/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const clearAll = async () => {
        try {
            await axios.delete('http://localhost:5000/api/supplier/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
        } catch (err) {
            console.error("Error clearing notifications:", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type) => {
        switch (type) {
            case 'Demand': return <Package size={16} color="#6366f1" />;
            case 'Approval': return <Check size={16} color="#10b981" />;
            case 'Payment': return <CreditCard size={16} color="#f59e0b" />;
            default: return <Bell size={16} color="#64748b" />;
        }
    };

    const handleNotificationClick = (n) => {
        markAsRead(n._id);
        setShowDropdown(false);
        
        if (n.type === 'Approval' && user.role === 'admin') {
            navigate('/inventory');
        } else if (n.type === 'Demand' && user.role === 'supplier') {
            navigate('/supplier-dashboard');
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span style={{ 
                        position: 'absolute', 
                        top: '-4px', 
                        right: '-4px', 
                        background: '#ef4444', 
                        color: 'white', 
                        fontSize: '10px', 
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>
 
            {showDropdown && (
                <div style={{ 
                    position: 'absolute', 
                    top: '40px', 
                    right: '0', 
                    width: '320px', 
                    background: 'white', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 100,
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>Notifications</h3>
                            {unreadCount > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '700' }}>{unreadCount} UNREAD</span>}
                        </div>
                        {notifications.length > 0 && (
                            <button 
                                onClick={clearAll}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
                                onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                onMouseLeave={(e) => e.target.style.background = 'none'}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                <Clock size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                                <p style={{ fontSize: '0.85rem' }}>No recent alerts</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n._id} 
                                    onClick={() => handleNotificationClick(n)}
                                    style={{ 
                                        padding: '16px', 
                                        borderBottom: '1px solid #f8fafc', 
                                        cursor: 'pointer', 
                                        background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)'}
                                >
                                    <div style={{ 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '10px', 
                                        background: '#f1f5f9', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', fontWeight: n.isRead ? '500' : '700', lineHeight: '1.4' }}>
                                            {n.message}
                                        </p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', marginTop: '6px' }}></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
