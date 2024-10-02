import React, { useEffect, useState } from 'react';
import OrdersService from '../services/orders-service';
import AdminSidebar from '../components/AdminSidebar';
import { Table } from 'react-bootstrap'; // Import Table from react-bootstrap
import withAdminAuth from './withAdminAuth';

const OrderManagementADMIN = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const orderService = new OrdersService();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersData = await orderService.getOrders(); // Fetch all orders
                // Sort orders by orderId in descending order
                const sortedOrders = ordersData.sort((a, b) => b.orderId - a.orderId);
                setOrders(sortedOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders(); // Fetch orders on component mount
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const formData = new FormData();
        formData.append('OrderId', orderId);
        formData.append('Status', newStatus);

        try {
            await orderService.updateOrder(orderId, formData); // Update order status
            setOrders(prevOrders => prevOrders.map(order => 
                order.orderId === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ display: 'flex', height: 'auto', overflow: 'hidden' }}>
            <AdminSidebar />
            <div className="container-fluid my-5" style={{ flex: 1, overflowY: 'auto' }}>
                <h3>Order Management</h3>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Order Date</th>
                            <th>Location</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order.orderId}>
                                    <td>{order.orderId}</td>
                                    <td>{order.firstName} {order.lastName}</td>
                                    <td>{formatDate(order.orderDate)}</td>
                                    <td>{order.location}</td>
                                    <td>{order.totalAmount} ฿</td>
                                    <td>{order.status}</td>
                                    <td>
                                        {order.status === 'Processing' && (
                                            <>
                                                <button className="btn btn-info" onClick={() => handleStatusChange(order.orderId, 'Shipped')}>
                                                    Set to Shipped
                                                </button>
                                                
                                            </>
                                        )}
                                        {order.status === 'Shipped' && (
                                            <>
                                                <button className="btn btn-success" onClick={() => handleStatusChange(order.orderId, 'Delivered')}>
                                                Set to Delivered
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default withAdminAuth(OrderManagementADMIN);
