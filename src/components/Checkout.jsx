import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrdersService from '../services/orders-service';
import CartItemsService from '../services/carts-service';
import RewardsService from '../services/rewards-service';
import Swal from 'sweetalert2';
import ProfilesService from '../services/profiles-service';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartData: initialCartData, totalCost: initialTotalCost } = location.state || { cartData: [], totalCost: 0 };
    const orderService = new OrdersService();
    const cartService = new CartItemsService();
    const profilesService = new ProfilesService();
    const rewardsService = new RewardsService();

    const [cartData, setCartData] = useState(initialCartData);
    const [totalCost, setTotalCost] = useState(initialTotalCost);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const fetchCartData = async () => {
        const userId = parseInt(localStorage.getItem('userId'), 10);
        const token = localStorage.getItem('token');

        if (!token || isNaN(userId)) return;

        try {
            const cartItems = await cartService.getCartItems(userId);
            const updatedCartData = [];
            let total = 0;

            for (const item of cartItems) {
                const product = await cartService.getProductById(item.productId);
                const totalPrice = product.price * item.quantity;

                updatedCartData.push({
                    ...item,
                    productName: product.productName,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    totalPrice: totalPrice,
                });
                total += totalPrice;
            }

            setCartData(updatedCartData);
            setTotalCost(total);
        } catch (error) {
            console.error('Failed to fetch cart data:', error);
        }
    };

    const checkSubscriptionStatus = async () => {
        const userId = parseInt(localStorage.getItem('userId'), 10);
        const userProfile = await profilesService.getUserById(userId);
        setIsSubscribed(userProfile.isSubscribed); // Assuming `isSubscribed` is a property of the user profile
    };

    useEffect(() => {
        fetchCartData();
        checkSubscriptionStatus();
    }, []);

    const handleCheckout = async (e) => {
        e.preventDefault();
        const userId = parseInt(localStorage.getItem('userId'), 10);

        try {
            const fullLocation = `${address}, ${city}, ${zipCode}`;

            const orderFormData = new FormData();
            orderFormData.append('UserId', userId);
            orderFormData.append('OrderDate', new Date().toISOString());
            orderFormData.append('TotalAmount', totalCost);
            orderFormData.append('Status', 'Processing');
            orderFormData.append('Location', fullLocation);
            orderFormData.append('FirstName', firstName);
            orderFormData.append('LastName', lastName);

            // Create the order
            const createdOrder = await orderService.createOrder(orderFormData);

            // Create order details for each item in the cart
            for (const item of cartData) {
                const orderDetailData = new FormData();
                orderDetailData.append('OrderId', createdOrder.orderId);
                orderDetailData.append('ProductId', item.productId);
                orderDetailData.append('Quantity', item.quantity);
                orderDetailData.append('Price', item.price);

                await orderService.createOrderDetail(orderDetailData);
                
            }

            // Clear the cart
            await cartService.deleteAllCartItem(userId);

            // Calculate points
            const pointInc = Math.floor(totalCost / 100);
            const pointFormData = new FormData();
            pointFormData.append('Point', pointInc);
            await profilesService.increasePoint(userId, pointFormData);

            // Get the updated user profile and current points
            const userProfile = await profilesService.getUserById(userId);
            const currentPoints = userProfile.point;

            // Get rewards and claimed rewards
            const rewards = await rewardsService.getRewards();
            const claimedRewards = await rewardsService.getClaimedRewardsByUserId(userId);
            const claimedRewardIds = new Set(claimedRewards.map(reward => reward.rewardId));

            await Swal.fire({
                title: 'Purchased Successfully!',
                text: 'Thank You!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false 
            });

            // Claim eligible rewards based on subscription status
            const eligibleRewards = rewards.filter(reward => 
                (isSubscribed || !reward.isExtraReward) &&
                currentPoints >= reward.pointsRequired &&
                !claimedRewardIds.has(reward.rewardId)
            );

            const congratulationsPromises = eligibleRewards.map(async (reward) => {
                const rewardForm = new FormData();
                rewardForm.append('UserId', userId);
                rewardForm.append('RewardId', reward.rewardId);

                await rewardsService.createClaimedReward(rewardForm);

                // Delay the alert to ensure purchase success message shows first
                return new Promise((resolve) => {
                    setTimeout(() => {
                        Swal.fire({
                            title: 'Congratulations!',
                            text: `You got ${reward.rewardName} as reward!`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        resolve();
                    }, 2000); // Adjust the delay as needed
                });
            });

            // Wait for all congratulations messages to be shown
            await Promise.all(congratulationsPromises);

            fetchCartData();

            // Navigate to order page after all alerts are done
            navigate(`/order/${userId}`);

        } catch (error) {
            console.error('Failed to checkout:', error);
            Swal.fire({
                title: 'Checkout Failed',
                text: 'An error occurred during the checkout process. Please try again.',
                icon: 'error'
            });
        }
    };

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-md-7">
                    <h3>Getting your order</h3>
                    <form onSubmit={handleCheckout}>
                        <div className="mb-3">
                            <h5>Shipping Information</h5>
                            <div className="form-group mb-3">
                                <label htmlFor="firstName">First Name</label>
                                <input 
                                    type="text" 
                                    id="firstName"
                                    className="form-control" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="lastName">Last Name</label>
                                <input 
                                    type="text" 
                                    id="lastName"
                                    className="form-control" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="address">Address</label>
                                <input 
                                    type="text" 
                                    id="address"
                                    className="form-control" 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)} 
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="city">City</label>
                                <input 
                                    type="text" 
                                    id="city"
                                    className="form-control" 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)} 
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="zipCode">Zip Code</label>
                                <input 
                                    type="text" 
                                    id="zipCode"
                                    className="form-control" 
                                    value={zipCode} 
                                    onChange={(e) => setZipCode(e.target.value)} 
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100">Place Order</button>
                    </form>
                </div>

                <div className="col-md-5">
                    <div className="card">
                        <div className="card-header">
                            <h5>Order Summary</h5>
                        </div>
                        <div className="card-body">
                            {cartData.map((item, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                    <img 
                                        src={item.imageUrl ? `https://localhost:7104/uploads/${item.imageUrl}` : '/path/to/placeholder-image.jpg'} 
                                        alt={item.productName}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                    />
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span>${item.totalPrice.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="d-flex justify-content-between mt-3">
                                <strong>Total Cost:</strong>
                                <span>${totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
