import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartItemsService from '../services/carts-service'; 
import Swal from 'sweetalert2';

const Header = ({ onCartClick }) => {
    const [totalItems, setTotalItems] = useState(0);
    const [userRole, setUserRole] = useState(null); 
    const cartService = new CartItemsService();
    const userId = localStorage.getItem('userId'); 
    const navigate = useNavigate();
    const location = useLocation(); // Get current location

    useEffect(() => {
        const fetchCartItems = async () => {
            const token = localStorage.getItem('token');
            const userId = parseInt(localStorage.getItem('userId'), 10); 

            if (!token || isNaN(userId)) return;

            try {
                const cartItems = await cartService.getCartItems(userId);
                const total = cartItems.reduce((sum, item) => sum + item.quantity, 0); 
                setTotalItems(total);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        // Check the user's role
        const fetchUserRole = () => {
            const role = localStorage.getItem('role');
            setUserRole(role);
        };

        fetchCartItems();
        fetchUserRole();
    }, [location.pathname]); // Run effect when the path changes

    const handleLogout = () => {
        localStorage.clear();
        Swal.fire({
            title: 'Logout successfully',
            text: 'Goodbye!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false 
        }).then(() => {
            navigate('/');          
        });
    };

    return (
        <header className="container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
                <Link className="navbar-brand" to="/">TCG</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item active">
                            <Link className="nav-link" to="/">Home<span className="sr-only">(current)</span></Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/tournaments">Tournaments</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/rewards">Rewards</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">Contacts</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center ms-auto">
                        <a className="nav-link openCartLink" onClick={onCartClick}>
                            <i className="fas fa-shopping-cart"></i>
                            Cart<span id="cart-badge" className="badge bg-dark">{totalItems > 0 ? totalItems : ''}</span>
                        </a>
                        <div className="dropdown ms-3">
                            <a 
                                className="nav-link dropdown-toggle" 
                                href="#" 
                                id="userDropdown" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                <i className="fas fa-user"></i>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                {userId ? (
                                    <>
                                        <li>
                                            <Link className="dropdown-item" to={`/profile/${userId}`}>
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to={`/order/${userId}`}>
                                                Your Orders
                                            </Link>
                                        </li>
                                        {userRole === 'ADMIN' && (
                                            <li>
                                                <Link className="dropdown-item" to="/admin/admindashboard">
                                                    Admin Control Panel
                                                </Link>
                                            </li>
                                        )}
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <a className="dropdown-item" href="#" onClick={handleLogout}>
                                                Logout
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <li>
                                        <Link className="dropdown-item" to="/login">
                                            Login
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

Header.propTypes = {
    onCartClick: PropTypes.func.isRequired,
};

export default Header;
