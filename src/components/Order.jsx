import React, { useEffect, useState } from 'react';
import OrdersService from '../services/orders-service';
import ProfilesService from '../services/profiles-service'; 
import RewardsService from '../services/rewards-service';
import Swal from 'sweetalert2';

const Order = () => {
    const [orders, setOrders] = useState([]); // Store array of orders
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = parseInt(localStorage.getItem('userId'), 10);
    const orderService = new OrdersService();
    const profilesService = new ProfilesService(); // Create an instance of ProfilesService
    const rewardsService = new RewardsService();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersData = await orderService.getOrderById(userId); // Fetch orders
                // Sort orders in descending order based on orderDate
                const sortedOrders = ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrders(sortedOrders); // Set the fetched orders data (sorted array)
                console.log(sortedOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch order data');
            } finally {
                setLoading(false);
            }
        };

        if (!isNaN(userId)) {
            fetchOrders(); // Fetch orders if userId is valid
        } else {
            setError('Invalid user ID');
            setLoading(false);
        }
    }, [userId]);

    const handleCancelOrder = async (orderId) => {
        Swal.fire({
            title: `Are you sure you want to cancel Order #${orderId}?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Get the order to find the total amount for point deduction
                    const orderToCancel = orders.find(order => order.orderId === orderId);
                    const totalAmount = orderToCancel.totalAmount; // Total amount of the order
    
                    await orderService.deleteOrder(orderId); // Cancel the order
    
                    // Prepare formData to decrease points based on the order total
                    const pointFormData = new FormData();
                    pointFormData.append('Point', Math.floor(totalAmount / 100)); // Assuming 1 point per 100 currency units
                    
                    await profilesService.decreasePoint(userId, pointFormData); // Decrease points
    
                    // Update the orders state by filtering out the canceled order
                    setOrders(orders.filter(order => order.orderId !== orderId));
    
                    Swal.fire({
                        title: 'Canceled!',
                        text: 'Order has been canceled and points deducted.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
    
                    const claimedRewards = await rewardsService.getClaimedRewardsByUserId(userId);
                    console.log(claimedRewards);

                    const userProfile = await profilesService.getUserById(userId);
                    const userPoints = userProfile.point;
    
                    const lostRewards = [];
    
                    for (const reward of claimedRewards) {
                        // Fetch the reward details to get pointsRequired and rewardName
                        const rewardDetails = await rewardsService.getRewardById(reward.rewardId);
                    
                        if (userPoints < rewardDetails.pointsRequired) {
                            await rewardsService.deleteClaimedReward(userId, reward.rewardId);
                            lostRewards.push(rewardDetails.rewardName); // Collect lost reward names
                        }
                    }
                    
                    console.log(lostRewards);
                    // If user lost rewards, show Swal alerts for each lost reward
                    if (lostRewards.length > 0) {
                        const lostRewardPromises = lostRewards.map(async (rewardName) => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    Swal.fire({
                                        title: 'Reward Lost!',
                                        text: `You lost the reward: ${rewardName}.`,
                                        icon: 'warning',
                                        timer: 2000,
                                        showConfirmButton: false
                                    });
                                    resolve();
                                }, 2000); // Adjust delay as needed
                            });
                        });
    
                        // Wait for all alerts to show
                        await Promise.all(lostRewardPromises);
                    }
    
                    console.log('Order canceled and rewards lost shown if necessary.');
                } catch (error) {
                    console.error('Error canceling order:', error);
                    setError('Failed to cancel order');
                }
            }
        });
    };
    

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container my-5">
            <h3>Order Details</h3>
            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order.orderId} className="card my-3">
                        <div className="card-header">
                            <h5>Order #{order.orderId}</h5>
                        </div>
                        <div className="card-body">
                            <p><strong>Customer Name:</strong> {order.firstName} {order.lastName}</p>
                            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                            <p><strong>Location:</strong> {order.location}</p>
                            <p><strong>Total Amount:</strong> {order.totalAmount} ฿</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            {/* Conditionally render the Cancel Order button based on the order status */}
                            {order.status === 'Processing' && (
                                <button 
                                    className="btn btn-danger"
                                    onClick={() => handleCancelOrder(order.orderId)}
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default Order;
