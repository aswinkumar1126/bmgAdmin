import React, { useState, useEffect } from 'react';
import { useOrderHistory } from '../../../hook/order/useOrderHistoryQuery';
import './OrdersTab.css';

const OrdersTab = () => {
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [status, setStatus] = useState('');

    const { data, isLoading, isError, refetch } = useOrderHistory({ page, size, status });

    const handleStatusFilterChange = (e) => {
        setStatus(e.target.value);
    };

    const orders = Array.isArray(data) ? data : [];

    return (
        <section className="profile-section">
            <div className="section-header">
                <h2>Order History</h2>
                <div className="filter-control">
                    <select className="filter-select" value={status} onChange={handleStatusFilterChange}>
                        <option value="">All</option>
                        <option value="PLACED">Placed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <p>Loading orders...</p>
            ) : isError ? (
                <div className="error-message">
                    <p>Failed to load orders.</p>
                    <button onClick={() => refetch()}>Retry</button>
                </div>
            ) : orders.length > 0 ? (
                <div className="order-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order.orderId}>
                            <div className="order-header">
                                <span><strong>Order ID:</strong> {order.orderId}</span>
                                <span className={`status ${order.status?.toLowerCase()}`}>{order.status}</span>
                            </div>
                            <div className="order-details">
                                <p><strong>Name:</strong> {order.customerName}</p>
                                <p><strong>Contact:</strong> {order.contact}</p>
                                <p><strong>Email:</strong> {order.email}</p>
                                <p><strong>Items:</strong> {order.orderItems?.length}</p>
                                <p><strong>Total:</strong> ₹{Number(order.totalAmount).toFixed(2)}</p>
                                <p><strong>Date:</strong> {new Date(order.orderTime).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <img src="/images/no-orders.svg" alt="No orders" />
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders with us yet.</p>
                    <button className="primary-button">Browse Products</button>
                </div>
            )}
        </section>
    );
};

export default OrdersTab;
