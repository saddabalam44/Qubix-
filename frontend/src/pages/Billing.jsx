import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2, QrCode, User, Package } from 'lucide-react';
import { generatePDFReceipt } from '../utils/pdfGenerator';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            const data = Array.isArray(res.data) ? res.data : [];
            setProducts(data.filter(p => p.stock > 0));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.productId === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                alert("Cannot add more than available stock!");
                return;
            }
            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity < 1) return item;
                if (newQuantity > item.maxStock) {
                    alert(`Only ${item.maxStock} available in stock.`);
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subTotal * 0.18;
    const grandTotal = subTotal + taxAmount;

    const handleGenerateBill = () => {
        if (cart.length === 0) return;
        setShowQR(true);
        setPaymentSuccess(false);
    };

    const handleRazorpayPayment = async () => {
        setIsProcessing(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };


            const orderRes = await axios.post('/api/payment/order', {
                amount: grandTotal
            }, { headers });

            const { id: order_id, currency, amount } = orderRes.data;


            const options = {
                key: "rzp_test_SZ3nPRfCb0Nmy6",
                amount: amount,
                currency: currency,
                name: "Qubix Billing",
                description: "Transaction for Order #" + order_id,
                order_id: order_id,
                handler: async (response) => {
                    try {

                        const verifyRes = await axios.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }, { headers });

                        if (verifyRes.data.success) {

                            await axios.post('/api/billing/checkout', {
                                items: cart,
                                subTotal: subTotal,
                                taxAmount: taxAmount,
                                totalPrice: grandTotal,
                                customerName: customerName.trim() || 'Walk-in Customer'
                            }, { headers });


                            generatePDFReceipt(cart, grandTotal, customerName.trim(), subTotal, taxAmount);
                            setPaymentSuccess(true);
                            setTimeout(() => {
                                setShowQR(false);
                                setCart([]);
                                setCustomerName('');
                                setPaymentSuccess(false);
                                fetchProducts();
                                setIsProcessing(false);
                            }, 2000);
                        }
                    } catch (err) {
                        const errMsg = err.response?.data?.message || err.message;
                        alert("Verification/Checkout failed: " + errMsg);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: customerName || "Customer",
                },
                theme: {
                    color: "#6366f1",
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message;
            alert("Order creation failed: " + errMsg);
            setIsProcessing(false);
        }
    };

    const handleCashPayment = async () => {
        setIsProcessing(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };


            await axios.post('/api/billing/checkout', {
                items: cart,
                subTotal: subTotal,
                taxAmount: taxAmount,
                totalPrice: grandTotal,
                customerName: customerName.trim() || 'Walk-in Customer'
            }, { headers });


            generatePDFReceipt(cart, grandTotal, customerName.trim(), subTotal, taxAmount);
            setPaymentSuccess(true);
            setTimeout(() => {
                setShowQR(false);
                setCart([]);
                setCustomerName('');
                setPaymentSuccess(false);
                fetchProducts();
                setIsProcessing(false);
            }, 2000);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message;
            alert("Checkout failed: " + errMsg);
            setIsProcessing(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ display: 'flex', gap: '32px', height: 'calc(100vh - 64px)' }}>
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Product <span style={{ color: 'var(--primary-color)' }}>Catalog</span></h2>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{products.length} Items Available</div>
                </div>
                
                <div style={{ 
                    overflowY: 'auto', 
                    flex: 1, 
                    paddingRight: '8px', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                    gap: '24px', 
                    alignContent: 'start',
                    paddingBottom: '20px' 
                }}>
                    {products.map(p => (
                        <div key={p._id} className="card" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: '0', 
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'default',
                            height: '100%',
                            minHeight: '380px'
                        }}>
                            <div style={{ 
                                width: '100%', 
                                height: '180px', 
                                flexShrink: 0,
                                background: '#f8fafc', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: '16px',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                {p.image ? (
                                    <img 
                                        src={`http://localhost:5000${p.image}`} 
                                        alt={p.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} 
                                    />
                                ) : (
                                    <ShoppingCart size={48} style={{ color: '#cbd5e1', opacity: 0.5 }} />
                                )}
                            </div>
                            
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#6366f1' }}>₹{p.price.toLocaleString()}</p>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            fontWeight: '700', 
                                            color: p.stock <= (p.lowStockThreshold || 5) ? '#dc2626' : '#059669',
                                            background: p.stock <= (p.lowStockThreshold || 5) ? '#fef2f2' : '#ecfdf5',
                                            padding: '4px 8px',
                                            borderRadius: '6px'
                                        }}>
                                            Stock: {p.stock}
                                        </span>
                                    </div>
                                </div>
                                
                                <button
                                    className="btn btn-primary"
                                    style={{ 
                                        width: '100%', 
                                        background: '#0f172a', 
                                        color: 'white', 
                                        borderRadius: '10px',
                                        padding: '12px',
                                        fontSize: '0.9rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onClick={() => addToCart(p)}
                                >
                                    <Plus size={18} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                            <p>No products available in stock.</p>
                        </div>
                    )}
                </div>
            </div>


            <div className="glass-panel" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ margin: 0 }}>Current Bill</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {cart.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cart.map(item => (
                                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }} className="text-muted">₹{item.price.toFixed(2)}</p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            <button className="btn" style={{ padding: '6px' }} onClick={() => updateQuantity(item.productId, -1)}>
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ width: '24px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                            <button className="btn" style={{ padding: '6px' }} onClick={() => updateQuantity(item.productId, 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div style={{ width: '60px', textAlign: 'right', fontWeight: 500 }}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <button className="btn btn-danger" style={{ padding: '6px', marginLeft: '4px' }} onClick={() => removeFromCart(item.productId)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={20} />
                            <input
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.3)' }}
                                placeholder="Customer Name (Optional)"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span>₹{subTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
                        <span>CGST (9%)</span>
                        <span>₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-muted)' }}>
                        <span>SGST (9%)</span>
                        <span>₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                        disabled={cart.length === 0}
                        onClick={handleGenerateBill}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>

            {showQR && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ padding: '40px', textAlign: 'center' }}>
                        {paymentSuccess ? (
                            <div style={{ animation: 'modalFadeIn 0.5s ease' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h2>Payment Successful!</h2>
                                <p className="text-muted">Inventory updated automatically.</p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ marginBottom: '8px' }}>Pay ₹{grandTotal.toFixed(2)}</h2>
                                <p className="text-muted" style={{ marginBottom: '32px' }}>Choose your preferred payment method in the next step.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <button className="btn btn-primary" style={{ padding: '16px', fontSize: '1.1rem' }} onClick={handleRazorpayPayment} disabled={isProcessing}>
                                        {isProcessing ? 'Connecting to Razorpay...' : 'Pay with Razorpay'}
                                    </button>
                                    <button className="btn btn-success" style={{ padding: '16px', fontSize: '1.1rem', backgroundColor: '#10b981', color: 'white' }} onClick={handleCashPayment} disabled={isProcessing}>
                                        {isProcessing ? 'Processing Cash...' : 'Pay with Cash'}
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setShowQR(false)} disabled={isProcessing}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
