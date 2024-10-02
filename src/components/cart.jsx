import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CartItemsService from '../services/carts-service';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ userId, onCloseCart }) => { 
    const [cartData, setCartData] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const cartService = new CartItemsService();
    const navigate = useNavigate();

    const fetchCartData = async () => {
        const token = localStorage.getItem('token');

        if (!token || isNaN(userId)) return; // Ensure userId is valid

        try {
            const cartItems = await cartService.getCartItems(userId);
            const updatedCartData = [];
            let total = 0;

            for (const item of cartItems) {
                const product = await cartService.getProductById(item.productId);
                const totalPrice = product.price * item.quantity; // Calculate total price for the item

                updatedCartData.push({
                    ...item,
                    productName: product.productName,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    totalPrice: totalPrice
                });
                total += totalPrice; // Update total cost
            }

            setCartData(updatedCartData);
            setTotalCost(total);
        } catch (error) {
            console.error('Failed to fetch cart data:', error);
        }
    };

    useEffect(() => {
        fetchCartData(); // Fetch cart data on mount
    }, []); // Run once on mount

    const handleRemoveFromCart = async (productId) => { 
        await cartService.deleteCartItem(userId, productId); 
        fetchCartData();
    };

    const handleDecreaseQuantity = async (productId) => { 
        const product = cartData.find(item => item.productId === productId);
        const updatedQuantity = product.quantity - 1;
        const userId = parseInt(localStorage.getItem('userId'), 10);
    
        if (updatedQuantity <= 0) {
            await handleRemoveFromCart(productId);
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append('UserId', userId);
            formData.append('ProductId', productId);
            formData.append('Quantity', updatedQuantity);
    
            await cartService.updateCartItem(userId, productId, formData); 
            fetchCartData(); 
        } catch (error) {
            console.error('Failed to decrease cart quantity:', error);
        }
    };
    
    const handleIncreaseQuantity = async (productId) => {
        const product = cartData.find(item => item.productId === productId);
        const updatedQuantity = product.quantity + 1;
        const userId = parseInt(localStorage.getItem('userId'), 10);
    
        if (updatedQuantity <= 0) {
            await handleRemoveFromCart(productId);
            return;
        }
    
        try {
            // Create the data object that matches your API requirements
            const formData = new FormData();
            formData.append('UserId', userId);
            formData.append('ProductId', productId);
            formData.append('Quantity', updatedQuantity);
    
            await cartService.updateCartItem(userId, productId, formData); 
            fetchCartData(); 
        } catch (error) {
            console.error('Failed to decrease cart quantity:', error);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="cartLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="cartLabel">Your Cart</h5>
                        <button type="button" className="close" onClick={onCloseCart} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="cart-product-list-container">
                            {cartData.map((product) => (
                                <div className="row align-items-center" key={product.productId}>
                                    <div className="col-2">
                                        <img 
                                            src={product.imageUrl ? `https://localhost:7104/uploads/${product.imageUrl}` : '/path/to/placeholder-image.jpg'} 
                                            alt={product.productName}
                                            style={{ width: '50px', height: '50px' }} 
                                        />
                                    </div>
                                    <div className="col-5">
                                        <h5>{product.productName}</h5>
                                        <p>{product.price} x {product.quantity}</p>
                                    </div>
                                    <div className="col-3 d-flex align-items-center"> {/* Flex container for quantity controls */}
                                        <button className="btn btn-secondary me-2" onClick={() => handleDecreaseQuantity(product.productId)}>-</button>
                                        <span>{product.quantity}</span>
                                        <button className="btn btn-secondary ms-2" onClick={() => handleIncreaseQuantity(product.productId)}>+</button>
                                    </div>
                                    <div className="col-2 d-flex justify-content-center">
                                        <button className="btn btn-danger" onClick={() => handleRemoveFromCart(product.productId)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <h5>Total Cost: {totalCost} ฿</h5>
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={() => navigate('/checkout', { state: { cartData, totalCost } })}
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Cart.propTypes = {
    onRemoveFromCart: PropTypes.func.isRequired,
    onDecreaseQuantity: PropTypes.func.isRequired,
    onIncreaseQuantity: PropTypes.func.isRequired,
    onCloseCart: PropTypes.func.isRequired,
};

export default Cart;
